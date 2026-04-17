import { readFileSync } from "fs";
import { getAccessToken } from "./google-auth.js";
import type {
  DateRange,
  Ga4PageMetrics,
  Ga4PageMetricsWithTrend,
  Ga4Scorecard,
  TrendDirection,
} from "./types.js";

const GA4_API_BASE = "https://analyticsdata.googleapis.com/v1beta";
const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const CONFIG_PATH = `${process.env.HOME}/.config/audiocontrol/analytics-config.json`;

/** Load GA4 property ID from config */
function loadPropertyId(): string {
  const raw = readFileSync(CONFIG_PATH, "utf-8");
  const parsed = JSON.parse(raw.replace(/(\w+):/g, '"$1":')) as {
    propertyID: number;
  };
  if (!parsed.propertyID) {
    throw new Error(`Missing propertyID in ${CONFIG_PATH}`);
  }
  return String(parsed.propertyID);
}

/** Compute the comparison date range (same length, immediately prior) */
function computeComparisonRange(range: DateRange): DateRange {
  const start = new Date(range.startDate);
  const end = new Date(range.endDate);
  const days = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const compEnd = new Date(start);
  compEnd.setDate(compEnd.getDate() - 1);
  const compStart = new Date(compEnd);
  compStart.setDate(compStart.getDate() - days);
  return {
    startDate: compStart.toISOString().split("T")[0],
    endDate: compEnd.toISOString().split("T")[0],
  };
}

/** GA4 API response types */
interface Ga4RunReportResponse {
  rows?: Ga4Row[];
  rowCount?: number;
}

interface Ga4Row {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
}

/** Fetch page metrics from GA4 Data API */
async function fetchPageMetrics(
  accessToken: string,
  propertyId: string,
  range: DateRange
): Promise<Ga4PageMetrics[]> {
  const url = `${GA4_API_BASE}/properties/${propertyId}:runReport`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "engagementRate" },
      ],
      orderBys: [
        { metric: { metricName: "screenPageViews" }, desc: true },
      ],
      limit: 50,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GA4 API error ${response.status}: ${response.statusText}\n${body}`
    );
  }

  const data = (await response.json()) as Ga4RunReportResponse;
  const rows = data.rows ?? [];

  return rows.map((row) => {
    const dims = row.dimensionValues ?? [];
    const mets = row.metricValues ?? [];
    return {
      pagePath: dims[0]?.value ?? "",
      pageTitle: dims[1]?.value ?? "",
      screenPageViews: Number(mets[0]?.value ?? 0),
      activeUsers: Number(mets[1]?.value ?? 0),
      averageSessionDuration: Number(mets[2]?.value ?? 0),
      bounceRate: Number(mets[3]?.value ?? 0),
      engagementRate: Number(mets[4]?.value ?? 0),
    };
  });
}

/** Determine trend direction from percentage change */
function getTrend(current: number, previous: number): TrendDirection {
  if (previous === 0) return current > 0 ? "up" : "flat";
  const change = ((current - previous) / previous) * 100;
  if (change > 5) return "up";
  if (change < -5) return "down";
  return "flat";
}

/** Compute percentage change */
function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/** Merge current and previous period data into trended metrics */
function mergeWithTrends(
  current: Ga4PageMetrics[],
  previous: Ga4PageMetrics[]
): Ga4PageMetricsWithTrend[] {
  const previousByPath = new Map(previous.map((p) => [p.pagePath, p]));

  return current.map((page) => {
    const prev = previousByPath.get(page.pagePath) ?? {
      pagePath: page.pagePath,
      pageTitle: page.pageTitle,
      screenPageViews: 0,
      activeUsers: 0,
      averageSessionDuration: 0,
      bounceRate: 0,
      engagementRate: 0,
    };

    return {
      current: page,
      previous: prev,
      trend: {
        screenPageViews: getTrend(page.screenPageViews, prev.screenPageViews),
        activeUsers: getTrend(page.activeUsers, prev.activeUsers),
        screenPageViewsChange: percentChange(
          page.screenPageViews,
          prev.screenPageViews
        ),
      },
    };
  });
}

/** One (page, referrer source) row from GA4 with per-row traffic metrics. */
export interface Ga4PageReferralRow {
  pagePath: string;
  sessionSource: string;
  sessions: number;
  screenPageViews: number;
}

/**
 * Fetch traffic broken down by pagePath + sessionSource.
 *
 * This is what enables per-post social referral attribution — GA4 attributes
 * sessions to the source that brought the user to the page, which remains
 * reliable even when the Referer header is stripped (unlike Umami's
 * referrer metric).
 */
export async function fetchPageReferrals(
  range: DateRange,
  serviceAccountPath?: string,
): Promise<Ga4PageReferralRow[]> {
  const propertyId = loadPropertyId();
  const accessToken = await getAccessToken([GA4_SCOPE], serviceAccountPath);
  const url = `${GA4_API_BASE}/properties/${propertyId}:runReport`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
      dimensions: [{ name: "pagePath" }, { name: "sessionSource" }],
      metrics: [{ name: "sessions" }, { name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 1000,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GA4 API error ${response.status}: ${response.statusText}\n${body}`,
    );
  }

  const data = (await response.json()) as Ga4RunReportResponse;
  const rows = data.rows ?? [];

  return rows.map((row) => {
    const dims = row.dimensionValues ?? [];
    const mets = row.metricValues ?? [];
    return {
      pagePath: dims[0]?.value ?? "",
      sessionSource: dims[1]?.value ?? "",
      sessions: Number(mets[0]?.value ?? 0),
      screenPageViews: Number(mets[1]?.value ?? 0),
    };
  });
}

/** Build a GA4 content scorecard with trends */
export async function buildGa4Scorecard(
  dateRange: DateRange,
  serviceAccountPath?: string
): Promise<Ga4Scorecard> {
  const propertyId = loadPropertyId();
  const comparisonRange = computeComparisonRange(dateRange);
  const accessToken = await getAccessToken([GA4_SCOPE], serviceAccountPath);

  const [currentPages, previousPages] = await Promise.all([
    fetchPageMetrics(accessToken, propertyId, dateRange),
    fetchPageMetrics(accessToken, propertyId, comparisonRange),
  ]);

  const pages = mergeWithTrends(currentPages, previousPages);

  const totalPageViews = pages.reduce(
    (sum, p) => sum + p.current.screenPageViews,
    0
  );
  const totalActiveUsers = pages.reduce(
    (sum, p) => sum + p.current.activeUsers,
    0
  );

  return {
    dateRange,
    comparisonDateRange: comparisonRange,
    pages,
    totalPageViews,
    totalActiveUsers,
  };
}

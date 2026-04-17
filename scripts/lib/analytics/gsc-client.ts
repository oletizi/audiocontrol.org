import { getAccessToken } from "./google-auth.js";
import type {
  DateRange,
  GscQueryRow,
  CtrOpportunity,
  StrikingDistanceQuery,
  SearchPerformance,
} from "./types.js";

const GSC_API_BASE = "https://www.googleapis.com/webmasters/v3";
const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const SITE_URL = "sc-domain:audiocontrol.org";

/** Minimum impressions to flag a CTR opportunity */
const MIN_IMPRESSIONS_FOR_CTR = 50;
/** CTR threshold below which to flag as opportunity */
const LOW_CTR_THRESHOLD = 0.05;
/** Position range for striking distance queries */
const STRIKING_MIN_POSITION = 5;
const STRIKING_MAX_POSITION = 20;

/** Raw GSC API response row */
interface GscApiRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

/** Fetch search analytics data from GSC */
async function fetchSearchAnalytics(
  accessToken: string,
  range: DateRange
): Promise<GscQueryRow[]> {
  const url = `${GSC_API_BASE}/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: range.startDate,
      endDate: range.endDate,
      dimensions: ["query", "page"],
      rowLimit: 500,
      dataState: "all",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GSC API error ${response.status}: ${response.statusText}\n${body}`);
  }

  const data = (await response.json()) as { rows?: GscApiRow[] };
  const rows = data.rows ?? [];

  return rows.map((row) => ({
    query: row.keys[0],
    page: row.keys[1],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}

/** Identify high-impression/low-CTR queries */
function findCtrOpportunities(rows: GscQueryRow[]): CtrOpportunity[] {
  return rows
    .filter(
      (r) =>
        r.impressions >= MIN_IMPRESSIONS_FOR_CTR && r.ctr < LOW_CTR_THRESHOLD
    )
    .sort((a, b) => b.impressions - a.impressions)
    .map((r) => ({
      query: r.query,
      page: r.page,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    }));
}

/** Identify striking-distance queries (position 5-20) */
function findStrikingDistance(rows: GscQueryRow[]): StrikingDistanceQuery[] {
  return rows
    .filter(
      (r) =>
        r.position >= STRIKING_MIN_POSITION &&
        r.position <= STRIKING_MAX_POSITION
    )
    .sort((a, b) => b.impressions - a.impressions)
    .map((r) => ({
      query: r.query,
      page: r.page,
      impressions: r.impressions,
      clicks: r.clicks,
      position: r.position,
    }));
}

/** Build search performance report */
export async function buildSearchPerformance(
  dateRange: DateRange,
  serviceAccountPath?: string
): Promise<SearchPerformance> {
  const accessToken = await getAccessToken([GSC_SCOPE], serviceAccountPath);
  const rows = await fetchSearchAnalytics(accessToken, dateRange);

  const topQueries = rows
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20);

  return {
    dateRange,
    topQueries,
    ctrOpportunities: findCtrOpportunities(rows),
    strikingDistance: findStrikingDistance(rows),
  };
}

import type {
  DateRange,
  UmamiStats,
  UmamiExpandedMetric,
  PageMetrics,
  ContentScorecard,
  TrendDirection,
} from "./types.js";

interface UmamiClientConfig {
  apiKey: string;
  baseUrl: string;
  websiteId: string;
}

/** Convert a YYYY-MM-DD date string to millisecond timestamp (start of day) */
function toStartOfDay(dateStr: string): number {
  return new Date(dateStr).getTime();
}

/** Convert a YYYY-MM-DD date string to millisecond timestamp (end of day) */
function toEndOfDay(dateStr: string): number {
  return new Date(dateStr).getTime() + 24 * 60 * 60 * 1000 - 1;
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

/** Make an authenticated GET request to the Umami API */
async function umamiGet<T>(
  config: UmamiClientConfig,
  path: string,
  params: Record<string, string | number>
): Promise<T> {
  const url = new URL(
    `${config.baseUrl}/websites/${config.websiteId}${path}`
  );
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "x-umami-api-key": config.apiKey,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Umami API error ${response.status}: ${response.statusText}\n${body}`
    );
  }

  return response.json() as Promise<T>;
}

/** Fetch site-level summary stats with comparison */
async function fetchStats(
  config: UmamiClientConfig,
  range: DateRange
): Promise<UmamiStats> {
  const compRange = computeComparisonRange(range);
  return umamiGet<UmamiStats>(config, "/stats", {
    startAt: toStartOfDay(range.startDate),
    endAt: toEndOfDay(range.endDate),
    compare: "prev",
  });
}

/** Fetch per-page expanded metrics */
async function fetchPageMetrics(
  config: UmamiClientConfig,
  range: DateRange
): Promise<UmamiExpandedMetric[]> {
  return umamiGet<UmamiExpandedMetric[]>(config, "/metrics/expanded", {
    startAt: toStartOfDay(range.startDate),
    endAt: toEndOfDay(range.endDate),
    type: "path",
    limit: 50,
  });
}

/** Convert expanded metrics to PageMetrics with computed rates */
function toPageMetrics(metrics: UmamiExpandedMetric[]): PageMetrics[] {
  return metrics.map((m) => ({
    pagePath: m.name,
    pageviews: m.pageviews,
    visitors: m.visitors,
    visits: m.visits,
    bounces: m.bounces,
    totaltime: m.totaltime,
    bounceRate: m.visits > 0 ? m.bounces / m.visits : 0,
    avgTimeOnPage: m.pageviews > 0 ? m.totaltime / m.pageviews : 0, // seconds
  }));
}

/** Build a complete content scorecard */
export async function buildContentScorecard(
  apiKey: string,
  baseUrl: string,
  websiteId: string,
  dateRange: DateRange
): Promise<ContentScorecard> {
  const config: UmamiClientConfig = { apiKey, baseUrl, websiteId };
  const comparisonRange = computeComparisonRange(dateRange);

  const [stats, expandedMetrics] = await Promise.all([
    fetchStats(config, dateRange),
    fetchPageMetrics(config, dateRange),
  ]);

  const pages = toPageMetrics(expandedMetrics);

  return {
    dateRange,
    comparisonDateRange: comparisonRange,
    summary: {
      pageviews: stats.pageviews,
      visitors: stats.visitors,
      visits: stats.visits,
      bounces: stats.bounces,
      pageviewsTrend: getTrend(stats.pageviews, stats.comparison.pageviews),
      pageviewsChange: percentChange(stats.pageviews, stats.comparison.pageviews),
      visitorsTrend: getTrend(stats.visitors, stats.comparison.visitors),
      visitorsChange: percentChange(stats.visitors, stats.comparison.visitors),
    },
    pages,
  };
}

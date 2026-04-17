/** Date range for analytics queries */
export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

/** Umami API key loaded from ~/.config/audiocontrol/umami-key.json */
export interface UmamiKeyConfig {
  apiKey: string;
}

/** Umami website stats response */
export interface UmamiStatsValues {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

export interface UmamiStats extends UmamiStatsValues {
  comparison: UmamiStatsValues;
}

/** Umami expanded metrics response item */
export interface UmamiExpandedMetric {
  name: string;
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

/** Trend direction comparing current vs previous period */
export type TrendDirection = "up" | "down" | "flat";

/** Per-page metrics with computed values */
export interface PageMetrics {
  pagePath: string;
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
  bounceRate: number; // 0-1
  avgTimeOnPage: number; // seconds
}

/** Content scorecard: site summary + ranked pages */
export interface ContentScorecard {
  dateRange: DateRange;
  comparisonDateRange: DateRange;
  summary: {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    pageviewsTrend: TrendDirection;
    pageviewsChange: number;
    visitorsTrend: TrendDirection;
    visitorsChange: number;
  };
  pages: PageMetrics[];
}

/** Raw per-page metrics from GA4 */
export interface Ga4PageMetrics {
  pagePath: string;
  pageTitle: string;
  screenPageViews: number;
  activeUsers: number;
  averageSessionDuration: number; // seconds
  bounceRate: number; // 0-1
  engagementRate: number; // 0-1
}

/** Per-page GA4 metrics with trend comparison */
export interface Ga4PageMetricsWithTrend {
  current: Ga4PageMetrics;
  previous: Ga4PageMetrics;
  trend: {
    screenPageViews: TrendDirection;
    activeUsers: TrendDirection;
    screenPageViewsChange: number; // percentage
  };
}

/** GA4 content scorecard */
export interface Ga4Scorecard {
  dateRange: DateRange;
  comparisonDateRange: DateRange;
  pages: Ga4PageMetricsWithTrend[];
  totalPageViews: number;
  totalActiveUsers: number;
}

/** Google Search Console query row */
export interface GscQueryRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number; // 0-1
  position: number;
}

/** High-impression/low-CTR opportunity */
export interface CtrOpportunity {
  query: string;
  page: string;
  impressions: number;
  ctr: number;
  position: number;
}

/** Striking-distance query (position 5-20) */
export interface StrikingDistanceQuery {
  query: string;
  page: string;
  impressions: number;
  clicks: number;
  position: number;
}

/** Search performance section of the report */
export interface SearchPerformance {
  dateRange: DateRange;
  topQueries: GscQueryRow[];
  ctrOpportunities: CtrOpportunity[];
  strikingDistance: StrikingDistanceQuery[];
}

/** Content-to-editor funnel metrics */
export interface ContentFunnel {
  blogPageviews: number;
  editorPageviews: number;
  conversionRate: number; // 0-1, editor / blog
  topBlogPages: Array<{ path: string; pageviews: number }>;
  editorPages: Array<{ path: string; pageviews: number }>;
  source: "ga4" | "umami";
}

/** Recommendation types */
export type RecommendationType =
  | "rewrite-title"
  | "improve-content"
  | "add-cta"
  | "boost-ranking"
  | "investigate-bounce"
  | "capitalize-engagement";

/** A specific, actionable recommendation */
export interface Recommendation {
  type: RecommendationType;
  priority: number; // higher = more impactful
  page: string;
  summary: string;
  detail: string;
}

/** Full analytics report combining Umami + GA4 + GSC */
export interface AnalyticsReport {
  scorecard: ContentScorecard;
  ga4Scorecard: Ga4Scorecard | null;
  search: SearchPerformance;
  funnel: ContentFunnel;
  recommendations: Recommendation[];
}

/** CLI arguments for the analytics report */
export interface CliArgs {
  days: number;
}

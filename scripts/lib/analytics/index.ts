export { loadApiKey, getBaseUrl, getWebsiteId } from "./auth.js";
export {
  buildContentScorecard,
  fetchReferrers,
  type UmamiReferrerMetric,
} from "./umami-client.js";
export { buildGa4Scorecard } from "./ga4-client.js";
export { buildSearchPerformance } from "./gsc-client.js";
export { buildContentFunnel } from "./funnel.js";
export { generateRecommendations } from "./recommendations.js";
export { formatReport } from "./report.js";
export type {
  AnalyticsReport,
  CliArgs,
  ContentFunnel,
  ContentScorecard,
  CtrOpportunity,
  DateRange,
  Ga4PageMetrics,
  Ga4PageMetricsWithTrend,
  Ga4Scorecard,
  GscQueryRow,
  PageMetrics,
  Recommendation,
  RecommendationType,
  SearchPerformance,
  StrikingDistanceQuery,
  TrendDirection,
  UmamiExpandedMetric,
  UmamiKeyConfig,
  UmamiStats,
  UmamiStatsValues,
} from "./types.js";

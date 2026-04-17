import {
  loadApiKey,
  getBaseUrl,
  getWebsiteId,
  buildContentScorecard,
  buildGa4Scorecard,
  buildSearchPerformance,
  buildContentFunnel,
  generateRecommendations,
  formatReport,
} from "./lib/analytics/index.js";
import type { AnalyticsReport, DateRange } from "./lib/analytics/index.js";

function parseArgs(args: string[]): { days: number; json: boolean } {
  let days = 30;
  let json = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--days" || arg === "-d") {
      const val = args[++i];
      if (!val) throw new Error("--days requires a number");
      days = parseInt(val, 10);
      if (isNaN(days) || days < 1)
        throw new Error("--days must be a positive integer");
    } else if (arg === "--json") {
      json = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: tsx scripts/analytics-report.ts [options]

Options:
  --days, -d <number>  Number of days to report on (default: 30)
  --json               Output as JSON instead of markdown
  --help, -h           Show this help message`);
      process.exit(0);
    }
  }

  return { days, json };
}

function computeDateRange(days: number): DateRange {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

async function main() {
  const { days, json } = parseArgs(process.argv.slice(2));

  const apiKey = loadApiKey();
  const baseUrl = getBaseUrl();
  const websiteId = getWebsiteId();
  const dateRange = computeDateRange(days);

  if (!json) {
    console.log(
      `Fetching analytics data (${dateRange.startDate} to ${dateRange.endDate})...\n`
    );
  }

  // Fetch all three data sources in parallel
  const [scorecard, ga4Scorecard, search] = await Promise.all([
    buildContentScorecard(apiKey, baseUrl, websiteId, dateRange),
    buildGa4Scorecard(dateRange).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (!json) console.error(`[GA4] Skipped: ${msg}\n`);
      return null;
    }),
    buildSearchPerformance(dateRange),
  ]);

  const funnel = buildContentFunnel(scorecard, ga4Scorecard);

  const report: AnalyticsReport = {
    scorecard,
    ga4Scorecard,
    search,
    funnel,
    recommendations: [],
  };

  report.recommendations = generateRecommendations(report);

  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReport(report));
  }
}

main().catch((err: unknown) => {
  console.error("Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});

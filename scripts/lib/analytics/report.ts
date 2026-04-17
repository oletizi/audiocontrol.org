import type {
  AnalyticsReport,
  ContentFunnel,
  ContentScorecard,
  Ga4Scorecard,
  Recommendation,
  SearchPerformance,
  TrendDirection,
} from "./types.js";

const TREND_ICONS: Record<TrendDirection, string> = {
  up: "^",
  down: "v",
  flat: "=",
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}

function formatScorecard(scorecard: ContentScorecard): string {
  const lines: string[] = [];

  lines.push("# Content Scorecard");
  lines.push("");
  lines.push(
    `**Period:** ${scorecard.dateRange.startDate} to ${scorecard.dateRange.endDate}`
  );
  lines.push(
    `**Comparison:** ${scorecard.comparisonDateRange.startDate} to ${scorecard.comparisonDateRange.endDate}`
  );
  lines.push("");

  lines.push("## Summary");
  lines.push("");
  const s = scorecard.summary;
  lines.push(
    `- **Pageviews:** ${s.pageviews.toLocaleString()} (${TREND_ICONS[s.pageviewsTrend]} ${formatChange(s.pageviewsChange)})`
  );
  lines.push(
    `- **Visitors:** ${s.visitors.toLocaleString()} (${TREND_ICONS[s.visitorsTrend]} ${formatChange(s.visitorsChange)})`
  );
  lines.push(`- **Visits:** ${s.visits.toLocaleString()}`);
  lines.push(`- **Bounces:** ${s.bounces.toLocaleString()}`);
  lines.push("");

  lines.push("## Pages by Traffic");
  lines.push("");
  lines.push(
    "| Page | Views | Visitors | Bounce Rate | Avg Time |"
  );
  lines.push(
    "|------|------:|---------:|------------:|---------:|"
  );

  for (const page of scorecard.pages) {
    const path = truncate(page.pagePath, 40);
    lines.push(
      `| ${path} | ${page.pageviews} | ${page.visitors} | ${formatPercent(page.bounceRate)} | ${formatDuration(page.avgTimeOnPage)} |`
    );
  }

  lines.push("");
  return lines.join("\n");
}

function formatGa4Scorecard(ga4: Ga4Scorecard): string {
  const lines: string[] = [];

  lines.push("# GA4 Scorecard");
  lines.push("");
  lines.push(
    `**Period:** ${ga4.dateRange.startDate} to ${ga4.dateRange.endDate}`
  );
  lines.push(
    `**Comparison:** ${ga4.comparisonDateRange.startDate} to ${ga4.comparisonDateRange.endDate}`
  );
  lines.push("");

  lines.push("## Summary");
  lines.push("");
  lines.push(
    `- **Total Page Views:** ${ga4.totalPageViews.toLocaleString()}`
  );
  lines.push(
    `- **Total Active Users:** ${ga4.totalActiveUsers.toLocaleString()}`
  );
  lines.push("");

  lines.push("## Pages by Traffic");
  lines.push("");
  lines.push(
    "| Page | Views | Trend | Change | Users | Bounce | Engage | Avg Duration |"
  );
  lines.push(
    "|------|------:|:-----:|-------:|------:|-------:|-------:|-------------:|"
  );

  for (const page of ga4.pages) {
    const { current, trend } = page;
    const icon = TREND_ICONS[trend.screenPageViews];
    const change = formatChange(trend.screenPageViewsChange);
    const path = truncate(current.pagePath, 35);

    lines.push(
      `| ${path} | ${current.screenPageViews} | ${icon} | ${change} | ${current.activeUsers} | ${formatPercent(current.bounceRate)} | ${formatPercent(current.engagementRate)} | ${formatDuration(current.averageSessionDuration)} |`
    );
  }

  lines.push("");
  return lines.join("\n");
}

function formatSearchPerformance(search: SearchPerformance): string {
  const lines: string[] = [];

  lines.push("# Search Performance");
  lines.push("");
  lines.push(
    `**Period:** ${search.dateRange.startDate} to ${search.dateRange.endDate}`
  );
  lines.push("");

  // Top queries
  lines.push("## Top Queries by Clicks");
  lines.push("");
  if (search.topQueries.length === 0) {
    lines.push("No search data available for this period.");
  } else {
    lines.push(
      "| Query | Page | Clicks | Impressions | CTR | Position |"
    );
    lines.push(
      "|-------|------|-------:|------------:|----:|---------:|"
    );
    for (const q of search.topQueries) {
      const pagePath = truncate(
        q.page.replace("https://audiocontrol.org", ""),
        30
      );
      lines.push(
        `| ${truncate(q.query, 30)} | ${pagePath} | ${q.clicks} | ${q.impressions} | ${formatPercent(q.ctr)} | ${q.position.toFixed(1)} |`
      );
    }
  }
  lines.push("");

  // CTR opportunities
  lines.push("## CTR Opportunities");
  lines.push("*High impressions but low CTR — consider rewriting title/meta description*");
  lines.push("");
  if (search.ctrOpportunities.length === 0) {
    lines.push("No CTR opportunities found (need queries with 50+ impressions and < 5% CTR).");
  } else {
    lines.push(
      "| Query | Page | Impressions | CTR | Position |"
    );
    lines.push(
      "|-------|------|------------:|----:|---------:|"
    );
    for (const o of search.ctrOpportunities) {
      const pagePath = truncate(
        o.page.replace("https://audiocontrol.org", ""),
        30
      );
      lines.push(
        `| ${truncate(o.query, 30)} | ${pagePath} | ${o.impressions} | ${formatPercent(o.ctr)} | ${o.position.toFixed(1)} |`
      );
    }
  }
  lines.push("");

  // Striking distance
  lines.push("## Striking Distance (Position 5-20)");
  lines.push("*Close to page 1 — content improvements could boost ranking*");
  lines.push("");
  if (search.strikingDistance.length === 0) {
    lines.push("No striking-distance queries found.");
  } else {
    lines.push(
      "| Query | Page | Impressions | Clicks | Position |"
    );
    lines.push(
      "|-------|------|------------:|-------:|---------:|"
    );
    for (const q of search.strikingDistance) {
      const pagePath = truncate(
        q.page.replace("https://audiocontrol.org", ""),
        30
      );
      lines.push(
        `| ${truncate(q.query, 30)} | ${pagePath} | ${q.impressions} | ${q.clicks} | ${q.position.toFixed(1)} |`
      );
    }
  }
  lines.push("");

  return lines.join("\n");
}

function formatFunnel(funnel: ContentFunnel): string {
  const lines: string[] = [];

  lines.push("# Content-to-Editor Funnel");
  lines.push(`*Source: ${funnel.source === "ga4" ? "Google Analytics" : "Umami"}*`);
  lines.push("");
  lines.push(`- **Blog Pageviews:** ${funnel.blogPageviews.toLocaleString()}`);
  lines.push(
    `- **Editor Pageviews:** ${funnel.editorPageviews.toLocaleString()}`
  );
  lines.push(
    `- **Conversion Rate:** ${formatPercent(funnel.conversionRate)}`
  );
  lines.push("");

  if (funnel.topBlogPages.length > 0) {
    lines.push("## Top Blog Pages");
    lines.push("");
    lines.push("| Page | Views |");
    lines.push("|------|------:|");
    for (const p of funnel.topBlogPages) {
      lines.push(`| ${truncate(p.path, 50)} | ${p.pageviews} |`);
    }
    lines.push("");
  }

  if (funnel.editorPages.length > 0) {
    lines.push("## Editor Pages");
    lines.push("");
    lines.push("| Page | Views |");
    lines.push("|------|------:|");
    for (const p of funnel.editorPages) {
      lines.push(`| ${truncate(p.path, 50)} | ${p.pageviews} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function formatRecommendations(recs: Recommendation[]): string {
  const lines: string[] = [];

  lines.push("# Recommendations");
  lines.push("");

  if (recs.length === 0) {
    lines.push("No actionable recommendations at this time.");
    lines.push("");
    return lines.join("\n");
  }

  for (let i = 0; i < recs.length; i++) {
    const rec = recs[i];
    lines.push(`${i + 1}. **${rec.summary}**`);
    lines.push(`   ${rec.detail}`);
    lines.push("");
  }

  return lines.join("\n");
}

/** Format the full analytics report as markdown */
export function formatReport(report: AnalyticsReport): string {
  const sections = [formatScorecard(report.scorecard)];

  if (report.ga4Scorecard) {
    sections.push(formatGa4Scorecard(report.ga4Scorecard));
  }

  sections.push(formatSearchPerformance(report.search));
  sections.push(formatFunnel(report.funnel));
  sections.push(formatRecommendations(report.recommendations));

  return sections.join("\n");
}

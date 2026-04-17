import type {
  AnalyticsReport,
  Recommendation,
} from "./types.js";

/** Generate actionable recommendations from the full report data */
export function generateRecommendations(
  report: Pick<AnalyticsReport, "scorecard" | "ga4Scorecard" | "search" | "funnel">
): Recommendation[] {
  const recs: Recommendation[] = [];

  addCtrRecommendations(report, recs);
  addStrikingDistanceRecommendations(report, recs);
  addBounceRecommendations(report, recs);
  addEngagementRecommendations(report, recs);
  addFunnelRecommendations(report, recs);

  // Sort by priority (highest first)
  recs.sort((a, b) => b.priority - a.priority);

  return recs;
}

function addCtrRecommendations(
  report: Pick<AnalyticsReport, "search">,
  recs: Recommendation[]
) {
  for (const opp of report.search.ctrOpportunities) {
    const pagePath = opp.page.replace("https://audiocontrol.org", "");
    recs.push({
      type: "rewrite-title",
      priority: opp.impressions * (0.05 - opp.ctr), // impressions x CTR gap
      page: pagePath,
      summary: `Rewrite title/meta for "${pagePath}"`,
      detail: `${opp.impressions} impressions but ${(opp.ctr * 100).toFixed(1)}% CTR for query "${opp.query}" at position ${opp.position.toFixed(1)}. Improving title and meta description could capture more clicks.`,
    });
  }
}

function addStrikingDistanceRecommendations(
  report: Pick<AnalyticsReport, "search">,
  recs: Recommendation[]
) {
  for (const q of report.search.strikingDistance) {
    const pagePath = q.page.replace("https://audiocontrol.org", "");
    recs.push({
      type: "boost-ranking",
      priority: q.impressions * (1 / q.position), // more impressions + closer to #1 = higher priority
      page: pagePath,
      summary: `Boost ranking for "${q.query}"`,
      detail: `"${pagePath}" ranks at position ${q.position.toFixed(1)} for "${q.query}" (${q.impressions} impressions). Expanding content depth, adding internal links, or updating could push it to page 1.`,
    });
  }
}

function addBounceRecommendations(
  report: Pick<AnalyticsReport, "ga4Scorecard">,
  recs: Recommendation[]
) {
  if (!report.ga4Scorecard) return;

  for (const page of report.ga4Scorecard.pages) {
    const { current } = page;
    // Flag pages with high traffic AND high bounce rate
    if (current.screenPageViews >= 10 && current.bounceRate > 0.7) {
      recs.push({
        type: "investigate-bounce",
        priority: current.screenPageViews * current.bounceRate,
        page: current.pagePath,
        summary: `Investigate high bounce on "${current.pagePath}"`,
        detail: `${current.screenPageViews} views but ${(current.bounceRate * 100).toFixed(0)}% bounce rate. Consider adding internal links, clearer CTAs, or related content to keep visitors engaged.`,
      });
    }
  }
}

function addEngagementRecommendations(
  report: Pick<AnalyticsReport, "ga4Scorecard">,
  recs: Recommendation[]
) {
  if (!report.ga4Scorecard) return;

  for (const page of report.ga4Scorecard.pages) {
    const { current } = page;
    // Flag pages with high engagement but low traffic — promote them
    if (
      current.screenPageViews >= 5 &&
      current.engagementRate > 0.6 &&
      current.averageSessionDuration > 120
    ) {
      recs.push({
        type: "capitalize-engagement",
        priority: current.engagementRate * current.averageSessionDuration * 0.1,
        page: current.pagePath,
        summary: `Promote high-engagement page "${current.pagePath}"`,
        detail: `${(current.engagementRate * 100).toFixed(0)}% engagement rate with ${Math.round(current.averageSessionDuration / 60)}m avg duration. This content resonates — consider promoting it via blog links, social, or homepage features.`,
      });
    }
  }
}

function addFunnelRecommendations(
  report: Pick<AnalyticsReport, "funnel">,
  recs: Recommendation[]
) {
  const { funnel } = report;

  if (funnel.blogPageviews > 0 && funnel.editorPageviews === 0) {
    recs.push({
      type: "add-cta",
      priority: funnel.blogPageviews * 0.5,
      page: "/blog/",
      summary: "Add editor CTAs to blog posts",
      detail: `${funnel.blogPageviews} blog pageviews but 0 editor pageviews. Blog posts are not driving editor usage. Add clear calls-to-action linking to the S-330 editor from relevant blog posts.`,
    });
  } else if (funnel.blogPageviews > 0 && funnel.conversionRate < 0.02) {
    recs.push({
      type: "add-cta",
      priority: funnel.blogPageviews * (0.02 - funnel.conversionRate),
      page: "/blog/",
      summary: "Improve blog-to-editor conversion",
      detail: `Blog-to-editor conversion rate is ${(funnel.conversionRate * 100).toFixed(1)}%. Consider adding more prominent editor links and inline demos in blog posts.`,
    });
  }
}

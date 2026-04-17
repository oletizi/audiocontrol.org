/**
 * Analytics integration for the editorial calendar.
 *
 * Bridges the editorial calendar with the automated-analytics pipeline
 * to surface content opportunities and track published post performance.
 */

import {
  loadApiKey,
  getBaseUrl,
  getWebsiteId,
  buildContentScorecard,
  buildGa4Scorecard,
  buildSearchPerformance,
  buildContentFunnel,
  generateRecommendations,
  fetchReferrers,
} from '../analytics/index.js';
import type {
  AnalyticsReport,
  DateRange,
  Recommendation,
} from '../analytics/index.js';
import { PLATFORMS, type CalendarEntry, type Platform } from './types.js';

/** A content opportunity identified from analytics data. */
export interface ContentSuggestion {
  /** Suggested topic or query to target */
  topic: string;
  /** Why this is an opportunity */
  rationale: string;
  /** Source data backing the suggestion */
  evidence: {
    query?: string;
    impressions?: number;
    position?: number;
    ctr?: number;
  };
}

/** Performance metrics for a published post. */
export interface PostPerformance {
  slug: string;
  title: string;
  metrics: {
    pageviews?: number;
    sessions?: number;
    avgPosition?: number;
    impressions?: number;
    clicks?: number;
    ctr?: number;
  };
  /** Whether the post is underperforming and should be updated */
  needsUpdate: boolean;
  /** Specific improvement recommendations */
  recommendations: string[];
}

function computeDateRange(days: number): DateRange {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

/** Fetch the full analytics report. */
async function fetchReport(days: number): Promise<AnalyticsReport> {
  const apiKey = loadApiKey();
  const baseUrl = getBaseUrl();
  const websiteId = getWebsiteId();
  const dateRange = computeDateRange(days);

  const [scorecard, ga4Scorecard, search] = await Promise.all([
    buildContentScorecard(apiKey, baseUrl, websiteId, dateRange),
    buildGa4Scorecard(dateRange).catch(() => null),
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

  return report;
}

/**
 * Get content suggestions from analytics data.
 *
 * Identifies:
 * - Striking-distance queries (positions 5-20) that could rank higher with new/updated content
 * - High-impression/low-CTR queries that need better targeting
 * - Queries with no matching calendar entry (content gaps)
 */
export async function getContentSuggestions(
  existingEntries: CalendarEntry[],
  days: number = 30,
): Promise<ContentSuggestion[]> {
  const report = await fetchReport(days);
  const suggestions: ContentSuggestion[] = [];
  const existingSlugs = new Set(existingEntries.map((e) => e.slug));

  // Striking-distance queries — new content opportunities
  for (const q of report.search.strikingDistance) {
    const pagePath = q.page.replace('https://audiocontrol.org', '');
    const slug = pagePath.replace(/^\/blog\//, '').replace(/\/$/, '');

    // Skip if this slug is already tracked in the calendar
    if (existingSlugs.has(slug)) continue;

    suggestions.push({
      topic: q.query,
      rationale: `Striking distance — position ${q.position.toFixed(1)} with ${q.impressions} impressions. New or expanded content could push this to page 1.`,
      evidence: {
        query: q.query,
        impressions: q.impressions,
        position: q.position,
      },
    });
  }

  // CTR opportunities — existing pages that need title/description improvement
  for (const opp of report.search.ctrOpportunities) {
    suggestions.push({
      topic: opp.query,
      rationale: `Low CTR — ${opp.impressions} impressions but only ${(opp.ctr * 100).toFixed(1)}% CTR at position ${opp.position.toFixed(1)}. Title/description may need rewriting.`,
      evidence: {
        query: opp.query,
        impressions: opp.impressions,
        position: opp.position,
        ctr: opp.ctr,
      },
    });
  }

  // Deduplicate by query
  const seen = new Set<string>();
  return suggestions.filter((s) => {
    if (!s.evidence.query) return true;
    if (seen.has(s.evidence.query)) return false;
    seen.add(s.evidence.query);
    return true;
  });
}

/**
 * Get performance metrics for published posts.
 *
 * Matches published calendar entries to analytics data and flags
 * underperformers with specific recommendations.
 */
export async function getPostPerformance(
  publishedEntries: CalendarEntry[],
  days: number = 30,
): Promise<PostPerformance[]> {
  const report = await fetchReport(days);
  const results: PostPerformance[] = [];

  // Index recommendations by page path for lookup
  const recsByPage = new Map<string, Recommendation[]>();
  for (const rec of report.recommendations) {
    const existing = recsByPage.get(rec.page) ?? [];
    existing.push(rec);
    recsByPage.set(rec.page, existing);
  }

  for (const entry of publishedEntries) {
    const blogPath = `/blog/${entry.slug}/`;

    // Find Umami metrics
    const umamiPage = report.scorecard.pages.find(
      (p) => p.pagePath === blogPath,
    );

    // Find GA4 metrics
    const ga4Page = report.ga4Scorecard?.pages.find(
      (p) => p.current.pagePath === blogPath,
    );

    // Find search metrics (aggregate across queries for this page)
    const searchRows = report.search.topQueries.filter((q) =>
      q.page.endsWith(blogPath) || q.page.endsWith(entry.slug),
    );
    const totalImpressions = searchRows.reduce((s, r) => s + r.impressions, 0);
    const totalClicks = searchRows.reduce((s, r) => s + r.clicks, 0);
    const avgPosition = searchRows.length > 0
      ? searchRows.reduce((s, r) => s + r.position, 0) / searchRows.length
      : undefined;

    // Collect recommendations for this page
    const pageRecs = recsByPage.get(blogPath) ?? [];
    const needsUpdate = pageRecs.length > 0;

    results.push({
      slug: entry.slug,
      title: entry.title,
      metrics: {
        pageviews: umamiPage?.pageviews ?? ga4Page?.current.screenPageViews,
        sessions: umamiPage?.visits,
        avgPosition,
        impressions: totalImpressions || undefined,
        clicks: totalClicks || undefined,
        ctr: totalImpressions > 0 ? totalClicks / totalImpressions : undefined,
      },
      needsUpdate,
      recommendations: pageRecs.map((r) => r.detail),
    });
  }

  // Sort: posts needing update first, then by pageviews descending
  results.sort((a, b) => {
    if (a.needsUpdate !== b.needsUpdate) return a.needsUpdate ? -1 : 1;
    return (b.metrics.pageviews ?? 0) - (a.metrics.pageviews ?? 0);
  });

  return results;
}

// ---------------------------------------------------------------------------
// Social referrals (site-wide, via Umami)
// ---------------------------------------------------------------------------

/**
 * Site-wide traffic to the site from one social platform over the reporting
 * window. Per-post attribution is not available from this data source — see
 * the note on fetchReferrers() in umami-client.
 */
export interface SocialReferralSummary {
  platform: Platform;
  pageviews: number;
}

/** Hostname patterns mapping Umami referrer values to our tracked platforms. */
const PLATFORM_HOST_PATTERNS: Record<Platform, RegExp[]> = {
  reddit: [/(^|\.)reddit\.com$/i, /(^|\.)redd\.it$/i, /^out\.reddit\.com$/i],
  youtube: [/(^|\.)youtube\.com$/i, /(^|\.)youtu\.be$/i],
  linkedin: [/(^|\.)linkedin\.com$/i, /(^|\.)lnkd\.in$/i],
  instagram: [/(^|\.)instagram\.com$/i, /^l\.instagram\.com$/i],
};

function extractHost(referrerValue: string): string {
  const value = (referrerValue ?? '').trim();
  if (!value) return '';
  try {
    const u = new URL(value.startsWith('http') ? value : `https://${value}`);
    return u.hostname.toLowerCase();
  } catch {
    return value.toLowerCase();
  }
}

function classifyReferrer(host: string): Platform | null {
  for (const platform of PLATFORMS) {
    if (PLATFORM_HOST_PATTERNS[platform].some((p) => p.test(host))) {
      return platform;
    }
  }
  return null;
}

/**
 * Return site-wide pageviews from each tracked social platform.
 *
 * This is site-level, not per-post — Umami's `/metrics?type=referrer`
 * endpoint does not honor the `url` filter on our instance. Only platforms
 * that produced at least one referrer pageview in the window appear in the
 * result.
 *
 * Per-post attribution will move to GA4 in a follow-up.
 */
export async function getSocialReferrals(
  days: number = 30,
): Promise<SocialReferralSummary[]> {
  const apiKey = loadApiKey();
  const baseUrl = getBaseUrl();
  const websiteId = getWebsiteId();
  const dateRange = computeDateRange(days);

  const referrers = await fetchReferrers(apiKey, baseUrl, websiteId, dateRange);

  const byPlatform = new Map<Platform, number>();
  for (const r of referrers) {
    const host = extractHost(r.x);
    const platform = classifyReferrer(host);
    if (!platform) continue;
    byPlatform.set(platform, (byPlatform.get(platform) ?? 0) + r.y);
  }

  return [...byPlatform].map(([platform, pageviews]) => ({
    platform,
    pageviews,
  }));
}

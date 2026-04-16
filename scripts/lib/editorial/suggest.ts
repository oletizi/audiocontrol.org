/**
 * Analytics integration for the editorial calendar.
 *
 * This module bridges the editorial calendar with the automated-analytics
 * feature (oletizi/audiocontrol.org#30). It parses analytics reports to
 * surface content opportunities and track published post performance.
 *
 * ## Dependency
 *
 * Requires the automated-analytics feature to be implemented. Until then,
 * functions throw descriptive errors pointing to the missing dependency.
 * See: https://github.com/oletizi/audiocontrol.org/issues/30
 */

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

/**
 * Parse analytics data and return content suggestions.
 *
 * Identifies:
 * - High-impression queries with no matching content
 * - Striking-distance queries (positions 8-20) that could rank higher
 * - Content gaps where competitors rank but we don't
 */
export function getContentSuggestions(): ContentSuggestion[] {
  throw new Error(
    'Analytics integration not yet available. ' +
      'The automated-analytics feature (oletizi/audiocontrol.org#30) must be implemented first. ' +
      'See Phase 1 (GA4 pipeline) and Phase 2 (Search Console) issues: #36, #37.',
  );
}

/**
 * Get performance metrics for published posts.
 *
 * Flags underperformers based on:
 * - Declining traffic trend
 * - High impressions but low CTR (title/description needs improvement)
 * - Dropping average position (content freshness issue)
 */
export function getPostPerformance(): PostPerformance[] {
  throw new Error(
    'Analytics integration not yet available. ' +
      'The automated-analytics feature (oletizi/audiocontrol.org#30) must be implemented first. ' +
      'See Phase 3 (Actionable Report) issue: #38.',
  );
}

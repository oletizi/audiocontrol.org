/**
 * Editorial calendar types and stage definitions.
 *
 * The calendar tracks content through its lifecycle from idea to publication.
 * Each stage represents a discrete step in the editorial workflow.
 */

/** Ordered editorial stages — content moves forward through these. */
export const STAGES = [
  'Ideas',
  'Planned',
  'Drafting',
  'Review',
  'Published',
] as const;

export type Stage = (typeof STAGES)[number];

/** A single entry in the editorial calendar. */
export interface CalendarEntry {
  /** URL-safe identifier, e.g. "scsi-over-wifi-raspberry-pi-bridge" */
  slug: string;
  /** Human-readable title */
  title: string;
  /** One-line description for SEO / calendar overview */
  description: string;
  /** Current editorial stage */
  stage: Stage;
  /** Target SEO keywords (set when moving to Planned) */
  targetKeywords: string[];
  /**
   * Coarse topic tags used for cross-posting opportunity lookup.
   * Distinct from targetKeywords — these map to channels in
   * `editorial-channels.json`, not to SEO targets.
   */
  topics?: string[];
  /** ISO date string (YYYY-MM-DD) when published, if applicable */
  datePublished?: string;
  /** GitHub issue number, if one has been created */
  issueNumber?: number;
  /** How this entry was sourced */
  source: 'manual' | 'analytics';
}

/** Social platforms we track distribution to. */
export const PLATFORMS = ['reddit', 'youtube', 'linkedin', 'instagram'] as const;

export type Platform = (typeof PLATFORMS)[number];

/** A single social share of a published post. */
export interface DistributionRecord {
  /** Slug of the published CalendarEntry this share refers to */
  slug: string;
  /** Which platform the post was shared on */
  platform: Platform;
  /**
   * Sub-channel within the platform — e.g. subreddit (`r/synthdiy`),
   * YouTube channel handle, LinkedIn page. Normalized on comparison.
   */
  channel?: string;
  /** URL of the share (e.g. the Reddit thread, YouTube video) */
  url: string;
  /** ISO date string (YYYY-MM-DD) when the share was made */
  dateShared: string;
  /** Optional free-form context */
  notes?: string;
}

/** The full editorial calendar — entries grouped by stage, plus social distributions. */
export interface EditorialCalendar {
  entries: CalendarEntry[];
  distributions: DistributionRecord[];
}

/** Return entries for a given stage. */
export function entriesByStage(
  calendar: EditorialCalendar,
  stage: Stage,
): CalendarEntry[] {
  return calendar.entries.filter((e) => e.stage === stage);
}

/** Return distribution records for a given slug. */
export function distributionsBySlug(
  calendar: EditorialCalendar,
  slug: string,
): DistributionRecord[] {
  return calendar.distributions.filter((d) => d.slug === slug);
}

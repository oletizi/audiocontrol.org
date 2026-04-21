/**
 * Editorial calendar types and stage definitions.
 *
 * The calendar tracks content through its lifecycle from idea to publication.
 * Each stage represents a discrete step in the editorial workflow.
 */

/**
 * Known sites that host editorial content in this repo. Each site has its
 * own calendar, channels file, and `src/sites/<site>/` subtree.
 */
export const SITES = ['audiocontrol', 'editorialcontrol'] as const;

export type Site = (typeof SITES)[number];

/** Default site used when a skill or script is invoked without --site. */
export const DEFAULT_SITE: Site = 'audiocontrol';

/** True if a value is a recognized site slug. */
export function isSite(value: string): value is Site {
  return (SITES as readonly string[]).includes(value);
}

/** Public hostname for a site (the bare domain, no protocol). */
export function siteHost(site: Site): string {
  return `${site}.org`;
}

/** Canonical base URL for a site, with trailing slash. */
export function siteBaseUrl(site: Site): string {
  return `https://${siteHost(site)}/`;
}

/**
 * Resolve a user-supplied site argument to a Site. Undefined or empty
 * falls back to DEFAULT_SITE; an unknown value throws with the list of
 * valid sites so the caller sees what went wrong.
 */
export function assertSite(value: string | undefined | null): Site {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_SITE;
  }
  if (!isSite(value)) {
    throw new Error(
      `Unknown --site "${value}". Valid sites: ${SITES.join(', ')}. ` +
        `Default when omitted: ${DEFAULT_SITE}.`,
    );
  }
  return value;
}

/** Ordered editorial stages — content moves forward through these. */
export const STAGES = [
  'Ideas',
  'Planned',
  'Drafting',
  'Review',
  'Published',
] as const;

export type Stage = (typeof STAGES)[number];

/** What kind of content a calendar entry represents.
 *
 * - `blog`    — content lives in this repo under `src/sites/<site>/content/blog/<slug>.md`
 * - `youtube` — video hosted on YouTube; `contentUrl` is the video URL
 * - `tool`    — standalone tool or app on audiocontrol.org (e.g. an editor page);
 *               `contentUrl` is the canonical page URL
 */
export const CONTENT_TYPES = ['blog', 'youtube', 'tool'] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

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
  /**
   * What kind of content this entry represents. Optional in storage —
   * entries without an explicit type default to `'blog'` on parse, so
   * pre-Phase-6 calendars remain valid.
   */
  contentType?: ContentType;
  /**
   * Canonical URL for content that doesn't live at `/blog/<slug>/`.
   * Required for `youtube` entries once published. Omitted for `blog`
   * entries (URL is derived from slug).
   */
  contentUrl?: string;
  /** Target SEO keywords (set when moving to Planned) */
  targetKeywords: string[];
  /**
   * Coarse topic tags used for cross-posting opportunity lookup.
   * Distinct from targetKeywords — these map to channels in
   * `editorial-channels-<site>.json`, not to SEO targets.
   */
  topics?: string[];
  /** ISO date string (YYYY-MM-DD) when published, if applicable */
  datePublished?: string;
  /** GitHub issue number, if one has been created */
  issueNumber?: number;
  /** How this entry was sourced */
  source: 'manual' | 'analytics';
}

/** True if a value is a recognized content type. */
export function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value);
}

/**
 * Return the effective content type for an entry — `'blog'` when unset.
 * Use this everywhere that needs to branch on type, so legacy entries
 * (no contentType) keep behaving like blog posts.
 */
export function effectiveContentType(entry: CalendarEntry): ContentType {
  return entry.contentType ?? 'blog';
}

/**
 * True if this content type has a source file in the repo that
 * `/editorial-draft` should scaffold. Only blog posts live in the repo;
 * youtube videos and tools live externally.
 */
export function hasRepoContent(contentType: ContentType): boolean {
  return contentType === 'blog';
}

/**
 * True if this content type requires `contentUrl` to be set before publishing.
 * Blog entries derive their URL from the slug; everything else needs an
 * explicit URL.
 */
export function requiresContentUrl(contentType: ContentType): boolean {
  return contentType !== 'blog';
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
  /**
   * Approved short-form copy for this (slug, platform, channel) tuple,
   * produced by the editorial-review shortform pipeline. Written by
   * `/editorial-approve` when the workflow's contentKind is `shortform`.
   * For Reddit, conventionally stores `title: ...\n\n<body>`; for others,
   * a single blob. May be empty when the distribution hasn't been drafted
   * through the pipeline.
   */
  shortform?: string;
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

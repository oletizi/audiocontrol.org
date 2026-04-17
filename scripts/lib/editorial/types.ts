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
  /** ISO date string (YYYY-MM-DD) when published, if applicable */
  datePublished?: string;
  /** GitHub issue number, if one has been created */
  issueNumber?: number;
  /** How this entry was sourced */
  source: 'manual' | 'analytics';
}

/** The full editorial calendar — entries grouped by stage. */
export interface EditorialCalendar {
  entries: CalendarEntry[];
}

/** Return entries for a given stage. */
export function entriesByStage(
  calendar: EditorialCalendar,
  stage: Stage,
): CalendarEntry[] {
  return calendar.entries.filter((e) => e.stage === stage);
}

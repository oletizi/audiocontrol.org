/**
 * Request/response shapes for the editorial-calendar mechanical actions
 * (scaffold draft, mark published) that the Editorial Studio calls into.
 *
 * Cognitive work (drafting, revising, approving prose) stays in Claude
 * Code. These handlers only drive calendar state transitions.
 *
 * GitHub issue integration is intentionally out of scope. Phase 14 used
 * to shell out to `gh issue create|close` from here; that coupling has
 * been dropped. Legacy entries still carry `issueNumber` from before —
 * the calendar writer will keep rendering the field when present — but
 * nothing in this module creates or closes issues.
 */

import type { CalendarEntry, Site } from '../editorial/types.js';

export interface DraftStartRequest {
  site: Site;
  slug: string;
}

export interface DraftStartResponse {
  entry: CalendarEntry;
  /** Absolute path to the scaffolded blog post index.md */
  filePath: string;
  /** Path relative to the project root */
  relativePath: string;
}

export interface PublishRequest {
  site: Site;
  slug: string;
  /** ISO YYYY-MM-DD. Defaults to today's date when omitted. */
  datePublished?: string;
}

export interface PublishResponse {
  entry: CalendarEntry;
}

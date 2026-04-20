/**
 * Request/response shapes for the editorial-calendar mechanical actions
 * (scaffold draft, mark published) that the Editorial Studio calls into.
 *
 * Cognitive work (drafting, revising, approving prose) stays in Claude
 * Code. These handlers only drive state transitions and issue bookkeeping.
 */

import type { CalendarEntry, Site } from '../editorial/types.js';

export interface DraftStartRequest {
  site: Site;
  slug: string;
  /**
   * When true, skip the `gh issue create` shell-out. The calendar still
   * advances to Drafting with issueNumber=0 as a sentinel so the operator
   * can recognize the issue was not minted automatically.
   */
  skipGhIssue?: boolean;
}

export interface DraftStartResponse {
  entry: CalendarEntry;
  /** Absolute path to the scaffolded blog post index.md */
  filePath: string;
  /** Path relative to the project root */
  relativePath: string;
  /** GH issue number minted by `gh issue create`, or 0 when skipped */
  issueNumber?: number;
}

export interface PublishRequest {
  site: Site;
  slug: string;
  /** When true, skip the `gh issue close` shell-out. */
  skipGhIssue?: boolean;
  /** ISO YYYY-MM-DD. Defaults to today's date when omitted. */
  datePublished?: string;
}

export interface PublishResponse {
  entry: CalendarEntry;
  /** Issue number that was closed, or undefined when nothing to close. */
  closedIssue?: number;
}

/*
 * journal-mappers.ts — adapt `DraftHistoryEntry` variants to the shared
 * journal storage contract (one file per record, each with `id` +
 * `timestamp`).
 *
 * The history event union doesn't carry a uniform id/timestamp shape
 * (variants are discriminated by `kind`). To route each event into its
 * own journal file we wrap it in a small envelope keyed by a
 * deterministic id synthesized from the event's payload. The envelope
 * stays internal to the editorial-review module — readers unwrap it
 * before returning `DraftHistoryEntry[]` to the rest of the codebase.
 */

import { normalizeTimestamp } from '../journal/index.js';
import type { DraftHistoryEntry } from './types.js';

/**
 * Storage wrapper for history events. `id` + `timestamp` satisfy the
 * journal module's shape requirements; `entry` carries the original
 * discriminated-union event unchanged.
 */
export interface JournaledHistoryEntry {
  id: string;
  timestamp: string;
  entry: DraftHistoryEntry;
}

/**
 * Synthesize a deterministic id for a history event. The same event
 * maps to the same filename every time, so re-running the migration or
 * re-emitting an equivalent event overwrites in place rather than
 * duplicating.
 *
 * Rules:
 *   - `workflow-created`: `created-<workflowId>` (one per workflow)
 *   - `workflow-state`: `state-<workflowId>-<normalizedTimestamp>`
 *     (transitions can repeat on the same workflow, timestamp disambiguates)
 *   - `version`: `version-<workflowId>-v<n>` (version numbers are unique per workflow)
 *   - `annotation`: the annotation's own id (already unique)
 */
export function synthesizeHistoryId(entry: DraftHistoryEntry): string {
  switch (entry.kind) {
    case 'workflow-created':
      return `created-${entry.workflow.id}`;
    case 'workflow-state':
      return `state-${entry.workflowId}-${normalizeTimestamp(entry.at)}`;
    case 'version':
      return `version-${entry.workflowId}-v${entry.version.version}`;
    case 'annotation':
      return entry.annotation.id;
  }
}

/** Wrap a history event in its journal envelope. */
export function envelopeFor(entry: DraftHistoryEntry): JournaledHistoryEntry {
  return {
    id: synthesizeHistoryId(entry),
    timestamp: entry.at,
    entry,
  };
}

/** Unwrap an envelope back to the original history event. */
export function unwrap(env: JournaledHistoryEntry): DraftHistoryEntry {
  return env.entry;
}

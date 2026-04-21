/*
 * journal.ts — re-export of the shared journal module.
 *
 * The implementation moved to `scripts/lib/journal/` in Phase 14c so the
 * editorial-review store can reuse it. This file stays as a thin
 * re-export so existing feature-image callers (log.ts, workflow.ts,
 * threads.ts, migrate-journal.ts) keep their imports working with no
 * source change required.
 */

export {
  normalizeTimestamp,
  readJournal,
  appendJournal,
  updateJournal,
  deleteJournal,
} from '../lib/journal/index.js';

export type {
  ReadJournalOptions,
  AppendJournalOptions,
} from '../lib/journal/index.js';

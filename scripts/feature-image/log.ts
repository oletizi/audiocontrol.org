import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const LOG_PATH = join(rootDir, '.feature-image-history.jsonl');

export type LogStatus = 'generated' | 'approved' | 'rejected';

export interface LogEntry {
  id: string;
  timestamp: string;
  prompt?: string;
  backgroundPath?: string;
  provider?: string;
  preset?: string;
  filters?: string;
  title?: string;
  subtitle?: string;
  formats?: string;
  outputDir: string;
  outputs: {
    raw: string[];
    filtered: string[];
    composited: Array<{ provider: string | null; format: string; path: string }>;
  };
  durationMs: number;
  status: LogStatus;
  notes?: string;
  error?: string;
  /** 1-5 user rating; absence means unrated. */
  rating?: number;
  /** Slug of the prompt template used to seed this generation (if any). */
  templateSlug?: string;
  /** ID of the entry this was iterated from — anchors lineage for threads. */
  parentEntryId?: string;
  /**
   * Site this image was generated for. Drives brand tokens at bake time
   * and routing at apply time. Pre-Phase-14 entries lack this field;
   * consumers should treat absence as DEFAULT_SITE (`audiocontrol`).
   */
  site?: 'audiocontrol' | 'editorialcontrol';
  /**
   * Target post this approved entry was applied to (source path like
   * `src/sites/<site>/pages/blog/<slug>/index.md`). Set by
   * `/feature-image-apply` when the files are copied into the post.
   * Absence means the entry hasn't been applied yet (even if status=approved).
   */
  appliedTo?: string;
  /**
   * Soft-delete flag. Archived entries stay in the log (so lineage, thread
   * references, template examples, and fitness data are preserved) but are
   * hidden from the default gallery view. Toggleable from the gallery.
   */
  archived?: boolean;
  /**
   * Where the text panel sits on this entry. Pre-Phase-15 entries lack this
   * field; consumers should treat absence as 'bottom' (the historical
   * default). Baked into composited outputs, so it's also what
   * /feature-image-apply would re-bake against if the user reopens the
   * entry for another pass.
   */
  overlayPosition?:
    | 'bottom'
    | 'middle'
    | 'top'
    | 'left'
    | 'right'
    | 'left-one-third'
    | 'left-two-thirds'
    | 'right-one-third'
    | 'right-two-thirds'
    | 'full';
}

/** Read all log entries, oldest first. Empty array if the file doesn't exist. */
export function readLog(): LogEntry[] {
  if (!existsSync(LOG_PATH)) return [];
  const content = readFileSync(LOG_PATH, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const entries: LogEntry[] = [];
  for (const line of lines) {
    try {
      entries.push(JSON.parse(line) as LogEntry);
    } catch {
      // skip malformed lines rather than crash
    }
  }
  return entries;
}

/** Append a new entry to the log. */
export function appendLog(entry: LogEntry): void {
  appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n', 'utf-8');
}

/** Update an existing entry by id (rewrites the whole file). */
export function updateLog(
  id: string,
  patch: Partial<Pick<LogEntry, 'status' | 'notes' | 'rating' | 'templateSlug' | 'appliedTo' | 'archived'>>,
): LogEntry | null {
  const entries = readLog();
  const idx = entries.findIndex(e => e.id === id);
  if (idx === -1) return null;
  entries[idx] = { ...entries[idx], ...patch };
  writeFileSync(
    LOG_PATH,
    entries.map(e => JSON.stringify(e)).join('\n') + '\n',
    'utf-8',
  );
  return entries[idx];
}

export function getLogPath(): string {
  return LOG_PATH;
}

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { readLog, type LogEntry } from './log.js';
import { appendJournal, readJournal } from './journal.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const THREADS_DIR = join(rootDir, 'journal', 'threads');

export type ThreadRole = 'user' | 'assistant';

export interface ThreadSnapshot {
  title?: string;
  subtitle?: string;
  prompt?: string;
  preset?: string;
  filters?: Record<string, string>;
  overlay?: boolean;
}

export interface ThreadMessage {
  /**
   * Unique id for this message. Synthesized on append if the caller
   * doesn't provide one — thread messages didn't carry an id in the
   * JSONL era; the journal layer needs one for filename routing.
   */
  messageId?: string;
  threadId: string;
  timestamp: string;
  role: ThreadRole;
  text: string;
  /** For assistant messages: the log entry generated in response (if any). */
  logEntryId?: string;
  /** For user messages: the current preview state at send time. */
  snapshot?: ThreadSnapshot;
}

/** Directory where thread messages are stored (one JSON file per message). */
export function getThreadsPath(): string {
  return THREADS_DIR;
}

/** Read all thread messages, oldest first. Empty array if nothing has been logged yet. */
export function readAllMessages(): ThreadMessage[] {
  return readJournal<ThreadMessage>(THREADS_DIR);
}

/**
 * Resolve the root entry id of a lineage by walking parentEntryId back to its
 * origin. If the entry doesn't exist or has no parent, returns the id itself.
 */
export function resolveRootEntryId(entryId: string, log?: LogEntry[]): string {
  const entries = log ?? readLog();
  const byId = new Map(entries.map(e => [e.id, e]));
  let current: string | undefined = entryId;
  const seen = new Set<string>();
  while (current && !seen.has(current)) {
    seen.add(current);
    const entry = byId.get(current);
    if (!entry || !entry.parentEntryId) return current;
    current = entry.parentEntryId;
  }
  return entryId;
}

/** Read messages for a specific thread (by root entry id of the lineage). */
export function readThread(threadId: string): ThreadMessage[] {
  return readAllMessages()
    .filter(m => m.threadId === threadId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/** Append a single message to the thread journal. Synthesizes a messageId if missing. */
export function appendMessage(message: ThreadMessage): void {
  const withId: ThreadMessage = message.messageId
    ? message
    : { ...message, messageId: randomUUID() };
  appendJournal(THREADS_DIR, withId, { idField: 'messageId' });
}

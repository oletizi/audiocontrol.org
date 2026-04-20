import { readFileSync, existsSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readLog, type LogEntry } from './log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const THREADS_PATH = join(rootDir, '.feature-image-threads.jsonl');

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
  threadId: string;
  timestamp: string;
  role: ThreadRole;
  text: string;
  /** For assistant messages: the log entry generated in response (if any). */
  logEntryId?: string;
  /** For user messages: the current preview state at send time. */
  snapshot?: ThreadSnapshot;
}

export function getThreadsPath(): string {
  return THREADS_PATH;
}

/** Read all thread messages, oldest first. Empty array if the file doesn't exist. */
export function readAllMessages(): ThreadMessage[] {
  if (!existsSync(THREADS_PATH)) return [];
  const content = readFileSync(THREADS_PATH, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const messages: ThreadMessage[] = [];
  for (const line of lines) {
    try {
      messages.push(JSON.parse(line) as ThreadMessage);
    } catch {
      // skip malformed
    }
  }
  return messages;
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

/** Append a single message to the thread JSONL. */
export function appendMessage(message: ThreadMessage): void {
  appendFileSync(THREADS_PATH, JSON.stringify(message) + '\n', 'utf-8');
}

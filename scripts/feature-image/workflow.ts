import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { appendJournal, readJournal, updateJournal } from './journal.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const PIPELINE_DIR = join(rootDir, 'journal', 'pipeline');

export type WorkflowType = 'feature-image-blog' | 'feature-image-iterate';
export type WorkflowState = 'open' | 'decided' | 'applied' | 'cancelled';

export interface WorkflowContext {
  /** Path to the target blog post markdown file */
  postPath?: string;
  /** Slug derived from the post path */
  slug?: string;
  /** Post title (for overlay text) */
  title?: string;
  /** Post description (for overlay text) */
  description?: string;
  /** Prompt proposed by the agent for the user to start from */
  suggestedPrompt?: string;
  /** Suggested preset (agent can set; user can override in gallery) */
  suggestedPreset?: string;
  /** Any additional agent notes for the user */
  notes?: string;
  // ── feature-image-iterate fields ────────────────────────────────────────
  /** Root entry id of the thread (= lineage root) */
  threadId?: string;
  /** Source entry the user was viewing when they sent the iterate message */
  sourceEntryId?: string;
  /** The user's feedback text (also appended to the thread as a message) */
  userFeedback?: string;
  /** Snapshot of current preview state at send time */
  snapshot?: {
    title?: string;
    subtitle?: string;
    prompt?: string;
    preset?: string;
    filters?: Record<string, string>;
    overlay?: boolean;
  };
}

export interface WorkflowDecision {
  /** When the user submitted the decision */
  decidedAt: string;
  /** The log entry (from journal/history/) the user approved */
  logEntryId: string;
  /** Optional user notes captured at decision time */
  userNotes?: string;
}

export interface WorkflowApplication {
  /** When the agent applied the decision */
  appliedAt: string;
  /** Files written/modified during application */
  changedFiles: string[];
  /** Error message if application failed */
  error?: string;
}

export interface WorkflowItem {
  id: string;
  type: WorkflowType;
  createdAt: string;
  createdBy: 'agent' | 'user';
  state: WorkflowState;
  context: WorkflowContext;
  decision?: WorkflowDecision;
  application?: WorkflowApplication;
}

/** Directory where workflow items are stored (one JSON file per item). */
export function getPipelinePath(): string {
  return PIPELINE_DIR;
}

/** Read all workflow items, oldest first. Empty array if nothing has been logged yet. */
export function readWorkflow(): WorkflowItem[] {
  return readJournal<WorkflowItem>(PIPELINE_DIR, { timestampField: 'createdAt' });
}

/** Append a new workflow item. Writes one file, never conflicts. */
export function appendWorkflow(item: WorkflowItem): void {
  appendJournal(PIPELINE_DIR, item, { timestampField: 'createdAt' });
}

/** Update an existing workflow item by id. Touches exactly one file. */
export function updateWorkflow(
  id: string,
  patch: Partial<Pick<WorkflowItem, 'state' | 'decision' | 'application'>>,
): WorkflowItem | null {
  return updateJournal<WorkflowItem>(PIPELINE_DIR, id, patch);
}

/** Create a new `open` workflow item. */
export function createWorkflow(params: {
  type: WorkflowType;
  createdBy?: 'agent' | 'user';
  context: WorkflowContext;
}): WorkflowItem {
  const item: WorkflowItem = {
    id: randomUUID(),
    type: params.type,
    createdAt: new Date().toISOString(),
    createdBy: params.createdBy ?? 'agent',
    state: 'open',
    context: params.context,
  };
  appendWorkflow(item);
  return item;
}

/** Filter workflow items by state. */
export function filterByState(state: WorkflowState): WorkflowItem[] {
  return readWorkflow().filter(i => i.state === state);
}

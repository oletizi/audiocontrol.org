import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const PIPELINE_PATH = join(rootDir, '.feature-image-pipeline.jsonl');

export type WorkflowType = 'feature-image-blog';
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
}

export interface WorkflowDecision {
  /** When the user submitted the decision */
  decidedAt: string;
  /** The log entry (from .feature-image-history.jsonl) the user approved */
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

export function getPipelinePath(): string {
  return PIPELINE_PATH;
}

/** Read all workflow items, oldest first. Empty array if the file doesn't exist. */
export function readWorkflow(): WorkflowItem[] {
  if (!existsSync(PIPELINE_PATH)) return [];
  const content = readFileSync(PIPELINE_PATH, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const items: WorkflowItem[] = [];
  for (const line of lines) {
    try {
      items.push(JSON.parse(line) as WorkflowItem);
    } catch {
      // skip malformed lines
    }
  }
  return items;
}

/** Append a new workflow item to the pipeline. */
export function appendWorkflow(item: WorkflowItem): void {
  appendFileSync(PIPELINE_PATH, JSON.stringify(item) + '\n', 'utf-8');
}

/** Update an existing workflow item by id. Rewrites the whole file. */
export function updateWorkflow(
  id: string,
  patch: Partial<Pick<WorkflowItem, 'state' | 'decision' | 'application'>>,
): WorkflowItem | null {
  const items = readWorkflow();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  writeFileSync(
    PIPELINE_PATH,
    items.map(i => JSON.stringify(i)).join('\n') + '\n',
    'utf-8',
  );
  return items[idx];
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

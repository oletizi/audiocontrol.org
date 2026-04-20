import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { Platform, Site } from '../editorial/types.js';
import {
  isValidTransition,
  type ContentKind,
  type DraftAnnotation,
  type DraftHistoryEntry,
  type DraftVersion,
  type DraftWorkflowItem,
  type DraftWorkflowState,
  type OriginatedBy,
} from './types.js';

export const PIPELINE_FILENAME = '.editorial-draft-pipeline.jsonl';
export const HISTORY_FILENAME = '.editorial-draft-history.jsonl';

export function pipelinePath(rootDir: string): string {
  return join(rootDir, PIPELINE_FILENAME);
}

export function historyPath(rootDir: string): string {
  return join(rootDir, HISTORY_FILENAME);
}

function readJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  const content = readFileSync(path, 'utf-8');
  const entries: T[] = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;
    try {
      entries.push(JSON.parse(trimmed) as T);
    } catch {
      // malformed line — skip, don't abort the whole read
    }
  }
  return entries;
}

function appendJsonl(path: string, entry: unknown): void {
  appendFileSync(path, JSON.stringify(entry) + '\n', 'utf-8');
}

/**
 * Read the pipeline file. Each line is a `DraftWorkflowItem` snapshot;
 * later snapshots for the same id supersede earlier ones. Returns the
 * latest snapshot per workflow id.
 */
export function readWorkflows(rootDir: string): DraftWorkflowItem[] {
  const snapshots = readJsonl<DraftWorkflowItem>(pipelinePath(rootDir));
  const latest = new Map<string, DraftWorkflowItem>();
  for (const snap of snapshots) {
    latest.set(snap.id, snap);
  }
  return [...latest.values()];
}

export function readHistory(rootDir: string): DraftHistoryEntry[] {
  return readJsonl<DraftHistoryEntry>(historyPath(rootDir));
}

export function readWorkflow(rootDir: string, id: string): DraftWorkflowItem | null {
  return readWorkflows(rootDir).find(w => w.id === id) ?? null;
}

export interface CreateWorkflowParams {
  site: Site;
  slug: string;
  contentKind: ContentKind;
  platform?: Platform;
  channel?: string;
  initialMarkdown: string;
  initialOriginatedBy?: OriginatedBy;
}

function matchesKey(w: DraftWorkflowItem, k: CreateWorkflowParams): boolean {
  return (
    w.site === k.site &&
    w.slug === k.slug &&
    w.contentKind === k.contentKind &&
    (w.platform ?? null) === (k.platform ?? null) &&
    (w.channel ?? null) === (k.channel ?? null)
  );
}

function findOpenByKey(
  rootDir: string,
  params: CreateWorkflowParams,
): DraftWorkflowItem | null {
  return (
    readWorkflows(rootDir).find(
      w => matchesKey(w, params) && w.state !== 'applied' && w.state !== 'cancelled',
    ) ?? null
  );
}

/**
 * Create a new workflow plus its v1. Idempotent on the natural key
 * (site, slug, contentKind, platform?, channel?) — if a non-terminal
 * workflow already exists for that tuple, returns it unchanged.
 */
export function createWorkflow(
  rootDir: string,
  params: CreateWorkflowParams,
): DraftWorkflowItem {
  const existing = findOpenByKey(rootDir, params);
  if (existing) return existing;

  const now = new Date().toISOString();
  const item: DraftWorkflowItem = {
    id: randomUUID(),
    site: params.site,
    slug: params.slug,
    contentKind: params.contentKind,
    platform: params.platform,
    channel: params.channel,
    state: 'open',
    currentVersion: 1,
    createdAt: now,
    updatedAt: now,
  };

  appendJsonl(pipelinePath(rootDir), item);
  appendJsonl(historyPath(rootDir), {
    kind: 'workflow-created',
    at: now,
    workflow: item,
  } satisfies DraftHistoryEntry);

  const v1: DraftVersion = {
    version: 1,
    markdown: params.initialMarkdown,
    createdAt: now,
    originatedBy: params.initialOriginatedBy ?? 'agent',
  };
  appendJsonl(historyPath(rootDir), {
    kind: 'version',
    at: now,
    workflowId: item.id,
    version: v1,
  } satisfies DraftHistoryEntry);

  return item;
}

/** List workflows in non-terminal states; optionally scoped to a site. */
export function listOpen(rootDir: string, site?: Site): DraftWorkflowItem[] {
  return readWorkflows(rootDir).filter(
    w => w.state !== 'applied' && w.state !== 'cancelled' && (!site || w.site === site),
  );
}

/**
 * Transition a workflow to a new state. Validates against VALID_TRANSITIONS
 * and appends both a pipeline snapshot and a history event. Throws on
 * invalid transitions or unknown ids.
 */
export function transitionState(
  rootDir: string,
  workflowId: string,
  to: DraftWorkflowState,
): DraftWorkflowItem {
  const current = readWorkflow(rootDir, workflowId);
  if (!current) throw new Error(`Unknown workflow: ${workflowId}`);
  if (!isValidTransition(current.state, to)) {
    throw new Error(
      `Invalid transition for workflow ${workflowId}: ${current.state} → ${to}`,
    );
  }
  const now = new Date().toISOString();
  const updated: DraftWorkflowItem = { ...current, state: to, updatedAt: now };
  appendJsonl(pipelinePath(rootDir), updated);
  appendJsonl(historyPath(rootDir), {
    kind: 'workflow-state',
    at: now,
    workflowId,
    from: current.state,
    to,
  } satisfies DraftHistoryEntry);
  return updated;
}

/**
 * Append a new version. Increments currentVersion on the workflow.
 * Does not transition state — callers combine with transitionState() when
 * the version maps to a state change.
 */
export function appendVersion(
  rootDir: string,
  workflowId: string,
  markdown: string,
  originatedBy: OriginatedBy,
): DraftVersion {
  const current = readWorkflow(rootDir, workflowId);
  if (!current) throw new Error(`Unknown workflow: ${workflowId}`);
  const now = new Date().toISOString();
  const version: DraftVersion = {
    version: current.currentVersion + 1,
    markdown,
    createdAt: now,
    originatedBy,
  };
  appendJsonl(historyPath(rootDir), {
    kind: 'version',
    at: now,
    workflowId,
    version,
  } satisfies DraftHistoryEntry);
  const updated: DraftWorkflowItem = {
    ...current,
    currentVersion: version.version,
    updatedAt: now,
  };
  appendJsonl(pipelinePath(rootDir), updated);
  return version;
}

/** Append an annotation to history. Does not transition state. */
export function appendAnnotation(rootDir: string, annotation: DraftAnnotation): void {
  appendJsonl(historyPath(rootDir), {
    kind: 'annotation',
    at: annotation.createdAt,
    annotation,
  } satisfies DraftHistoryEntry);
}

export function readVersions(rootDir: string, workflowId: string): DraftVersion[] {
  const versions: DraftVersion[] = [];
  for (const entry of readHistory(rootDir)) {
    if (entry.kind === 'version' && entry.workflowId === workflowId) {
      versions.push(entry.version);
    }
  }
  return versions.sort((a, b) => a.version - b.version);
}

/**
 * Annotations for a workflow, optionally filtered to a specific version.
 * `comment`/`approve`/`reject` match by `version`; `edit` matches by
 * `beforeVersion`.
 */
export function readAnnotations(
  rootDir: string,
  workflowId: string,
  version?: number,
): DraftAnnotation[] {
  const anns: DraftAnnotation[] = [];
  for (const entry of readHistory(rootDir)) {
    if (entry.kind !== 'annotation') continue;
    const a = entry.annotation;
    if (a.workflowId !== workflowId) continue;
    if (version === undefined) {
      anns.push(a);
      continue;
    }
    const matchesVersion =
      (a.type === 'comment' && a.version === version) ||
      (a.type === 'approve' && a.version === version) ||
      (a.type === 'reject' && a.version === version) ||
      (a.type === 'edit' && a.beforeVersion === version);
    if (matchesVersion) anns.push(a);
  }
  return anns;
}

/**
 * Rewrite the pipeline file with a de-duplicated, latest-wins list.
 * Cosmetic compaction; correctness doesn't depend on it.
 */
export function compactPipeline(rootDir: string): void {
  const latest = readWorkflows(rootDir);
  const lines = latest.map(w => JSON.stringify(w)).join('\n');
  writeFileSync(pipelinePath(rootDir), latest.length > 0 ? lines + '\n' : '', 'utf-8');
}

/** Mint an annotation with a server-assigned id and timestamp. */
export function mintAnnotation<
  T extends Omit<DraftAnnotation, 'id' | 'createdAt'>,
>(partial: T): T & { id: string; createdAt: string } {
  return {
    ...partial,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
}

import { join } from 'path';
import { randomUUID } from 'crypto';
import { appendJournal, readJournal } from '../journal/index.js';
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
import {
  envelopeFor,
  unwrap,
  type JournaledHistoryEntry,
} from './journal-mappers.js';

/*
 * Storage: two journal directories under `journal/editorial/`. Each
 * workflow snapshot and each history event lives in its own file; the
 * shared `scripts/lib/journal/` module handles filename routing and
 * in-place updates. This replaces the pre-Phase-14c monolithic
 * `.editorial-draft-{history,pipeline}.jsonl` files at the repo root
 * which produced merge conflicts whenever two branches appended in
 * parallel.
 *
 * The public API here is unchanged: `readWorkflows`, `readHistory`,
 * `createWorkflow`, `transitionState`, `appendVersion`, and friends all
 * still accept a `rootDir` and return the same shapes. Callers (the
 * handlers, report builder, Astro route frontmatter, skills, 60 tests)
 * are unaware the storage changed.
 */

export const PIPELINE_DIR = 'journal/editorial/pipeline';
export const HISTORY_DIR = 'journal/editorial/history';

/**
 * Path to the pipeline journal directory for `rootDir`.
 *
 * Pre-Phase-14c this returned a JSONL file path; callers that wrote to
 * it directly (one malformed-input test) now need to manipulate files
 * *inside* this directory. The export name stays the same to keep the
 * public API stable.
 */
export function pipelinePath(rootDir: string): string {
  return join(rootDir, PIPELINE_DIR);
}

/** Path to the history journal directory for `rootDir`. */
export function historyPath(rootDir: string): string {
  return join(rootDir, HISTORY_DIR);
}

/**
 * Read the pipeline directory. Under the journal scheme each workflow
 * lives in its own file, so there is no "latest wins over earlier
 * snapshots" semantic — readers get one record per id by construction.
 * State transitions overwrite the existing file in place.
 */
export function readWorkflows(rootDir: string): DraftWorkflowItem[] {
  return readJournal<DraftWorkflowItem>(pipelinePath(rootDir), {
    timestampField: 'createdAt',
  });
}

/** Read the full history log, oldest first. */
export function readHistory(rootDir: string): DraftHistoryEntry[] {
  const envelopes = readJournal<JournaledHistoryEntry>(historyPath(rootDir));
  return envelopes.map(unwrap);
}

export function readWorkflow(rootDir: string, id: string): DraftWorkflowItem | null {
  return readWorkflows(rootDir).find(w => w.id === id) ?? null;
}

function writeWorkflow(rootDir: string, workflow: DraftWorkflowItem): void {
  appendJournal(pipelinePath(rootDir), workflow, {
    idField: 'id',
    timestampField: 'createdAt',
  });
}

function writeHistory(rootDir: string, entry: DraftHistoryEntry): void {
  appendJournal(historyPath(rootDir), envelopeFor(entry), {
    idField: 'id',
    timestampField: 'timestamp',
  });
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

  writeWorkflow(rootDir, item);
  writeHistory(rootDir, {
    kind: 'workflow-created',
    at: now,
    workflow: item,
  });

  const v1: DraftVersion = {
    version: 1,
    markdown: params.initialMarkdown,
    createdAt: now,
    originatedBy: params.initialOriginatedBy ?? 'agent',
  };
  writeHistory(rootDir, {
    kind: 'version',
    at: now,
    workflowId: item.id,
    version: v1,
  });

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
 * and appends a history event. Under the journal scheme the workflow's
 * file is overwritten in place (one file per workflow) rather than
 * appending a new snapshot to a JSONL.
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
  writeWorkflow(rootDir, updated);
  writeHistory(rootDir, {
    kind: 'workflow-state',
    at: now,
    workflowId,
    from: current.state,
    to,
  });
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
  writeHistory(rootDir, {
    kind: 'version',
    at: now,
    workflowId,
    version,
  });
  const updated: DraftWorkflowItem = {
    ...current,
    currentVersion: version.version,
    updatedAt: now,
  };
  writeWorkflow(rootDir, updated);
  return version;
}

/** Append an annotation to history. Does not transition state. */
export function appendAnnotation(rootDir: string, annotation: DraftAnnotation): void {
  writeHistory(rootDir, {
    kind: 'annotation',
    at: annotation.createdAt,
    annotation,
  });
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
 * No-op under the journal scheme. Retained for API stability: a few
 * scripts and documentation references still invoke it. Pre-Phase-14c
 * this rewrote the JSONL file with de-duplicated latest-wins snapshots;
 * now each workflow lives in its own file so `readWorkflows` already
 * returns one record per id and there is nothing to compact.
 */
export function compactPipeline(_rootDir: string): void {
  // intentionally empty — journal storage de-duplicates by construction
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

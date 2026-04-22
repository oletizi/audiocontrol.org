import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { DraftAnnotation, DraftWorkflowState } from './types.js';
import { SITES, type Site } from '../editorial/types.js';
import {
  appendAnnotation,
  appendVersion,
  createWorkflow,
  mintAnnotation,
  readAnnotations,
  readVersions,
  readWorkflow,
  readWorkflows,
  transitionState,
} from './pipeline.js';

export interface HandlerResult {
  status: number;
  body: unknown;
}

function err(status: number, message: string): HandlerResult {
  return { status, body: { error: message } };
}

function ok(body: unknown): HandlerResult {
  return { status: 200, body };
}

type AnnotationDraft = Omit<DraftAnnotation, 'id' | 'createdAt'>;

export function handleAnnotate(rootDir: string, body: unknown): HandlerResult {
  if (!body || typeof body !== 'object') return err(400, 'expected JSON object body');
  const draft = body as Partial<AnnotationDraft>;

  if (!draft.type) return err(400, 'type is required');
  if (!draft.workflowId) return err(400, 'workflowId is required');

  const workflow = readWorkflow(rootDir, draft.workflowId);
  if (!workflow) return err(404, `unknown workflow: ${draft.workflowId}`);

  switch (draft.type) {
    case 'comment': {
      const d = draft as Partial<Extract<AnnotationDraft, { type: 'comment' }>>;
      if (typeof d.version !== 'number') return err(400, 'comment.version is required');
      if (!d.range || typeof d.range.start !== 'number' || typeof d.range.end !== 'number') {
        return err(400, 'comment.range with numeric start/end is required');
      }
      if (typeof d.text !== 'string') return err(400, 'comment.text is required');
      const annotation = mintAnnotation({
        type: 'comment',
        workflowId: draft.workflowId,
        version: d.version,
        range: d.range,
        text: d.text,
        category: d.category,
        ...(typeof d.anchor === 'string' ? { anchor: d.anchor } : {}),
      });
      appendAnnotation(rootDir, annotation);
      return ok({ annotation });
    }
    case 'edit': {
      const d = draft as Partial<Extract<AnnotationDraft, { type: 'edit' }>>;
      if (typeof d.beforeVersion !== 'number') return err(400, 'edit.beforeVersion is required');
      if (typeof d.afterMarkdown !== 'string') return err(400, 'edit.afterMarkdown is required');
      if (typeof d.diff !== 'string') return err(400, 'edit.diff is required');
      const annotation = mintAnnotation({
        type: 'edit',
        workflowId: draft.workflowId,
        beforeVersion: d.beforeVersion,
        afterMarkdown: d.afterMarkdown,
        diff: d.diff,
      });
      appendAnnotation(rootDir, annotation);
      return ok({ annotation });
    }
    case 'approve':
    case 'reject': {
      const d = draft as Partial<Extract<AnnotationDraft, { type: 'approve' | 'reject' }>>;
      if (typeof d.version !== 'number') return err(400, `${draft.type}.version is required`);
      const annotation = mintAnnotation({
        type: draft.type,
        workflowId: draft.workflowId,
        version: d.version,
        ...(draft.type === 'reject' && 'reason' in d ? { reason: d.reason } : {}),
      } as AnnotationDraft);
      appendAnnotation(rootDir, annotation);
      return ok({ annotation });
    }
    case 'resolve': {
      const d = draft as Partial<Extract<AnnotationDraft, { type: 'resolve' }>>;
      if (typeof d.commentId !== 'string' || d.commentId.length === 0) {
        return err(400, 'resolve.commentId is required');
      }
      // Accept `resolved` either way; default to true (resolve).
      const resolved = typeof d.resolved === 'boolean' ? d.resolved : true;
      const annotation = mintAnnotation({
        type: 'resolve',
        workflowId: draft.workflowId,
        commentId: d.commentId,
        resolved,
      });
      appendAnnotation(rootDir, annotation);
      return ok({ annotation });
    }
    case 'address': {
      const d = draft as Partial<Extract<AnnotationDraft, { type: 'address' }>>;
      if (typeof d.commentId !== 'string' || d.commentId.length === 0) {
        return err(400, 'address.commentId is required');
      }
      if (typeof d.version !== 'number') return err(400, 'address.version is required');
      if (d.disposition !== 'addressed' && d.disposition !== 'deferred' && d.disposition !== 'wontfix') {
        return err(400, "address.disposition must be 'addressed' | 'deferred' | 'wontfix'");
      }
      const annotation = mintAnnotation({
        type: 'address',
        workflowId: draft.workflowId,
        commentId: d.commentId,
        version: d.version,
        disposition: d.disposition,
        ...(typeof d.reason === 'string' ? { reason: d.reason } : {}),
      });
      appendAnnotation(rootDir, annotation);
      return ok({ annotation });
    }
    default:
      return err(400, `unknown annotation type: ${String(draft.type)}`);
  }
}

export function handleListAnnotations(
  rootDir: string,
  query: { workflowId: string | null; version: string | null },
): HandlerResult {
  if (!query.workflowId) return err(400, 'workflowId query param is required');
  const version =
    query.version !== null && query.version !== undefined
      ? parseInt(query.version, 10)
      : undefined;
  if (version !== undefined && Number.isNaN(version)) {
    return err(400, 'version must be a number');
  }
  const annotations = readAnnotations(rootDir, query.workflowId, version);
  return ok({ annotations });
}

interface DecisionBody {
  workflowId: string;
  to: DraftWorkflowState;
}

export function handleDecision(rootDir: string, body: unknown): HandlerResult {
  if (!body || typeof body !== 'object') return err(400, 'expected JSON object body');
  const d = body as Partial<DecisionBody>;
  if (!d.workflowId) return err(400, 'workflowId is required');
  if (!d.to) return err(400, 'to is required');
  try {
    const updated = transitionState(rootDir, d.workflowId, d.to);
    return ok({ workflow: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const status = message.startsWith('Unknown workflow') ? 404 : 409;
    return err(status, message);
  }
}

/**
 * Return a workflow plus its full version history. The client looks up
 * either by workflow id or by (site, slug, contentKind, platform?, channel?).
 * For the longform route, (site, slug) is the most natural lookup because
 * that's the URL.
 */
export function handleGetWorkflow(
  rootDir: string,
  query: {
    id: string | null;
    site: string | null;
    slug: string | null;
    contentKind: string | null;
    platform: string | null;
    channel: string | null;
  },
): HandlerResult {
  if (query.id) {
    const workflow = readWorkflow(rootDir, query.id);
    if (!workflow) return err(404, `unknown workflow id: ${query.id}`);
    return ok({ workflow, versions: readVersions(rootDir, workflow.id) });
  }
  if (!query.site || !query.slug) {
    return err(400, 'either id or (site & slug) query params are required');
  }
  const contentKind = (query.contentKind ?? 'longform') as 'longform' | 'shortform' | 'outline';
  const candidates = readWorkflows(rootDir).filter(
    w =>
      w.site === (query.site as Site) &&
      w.slug === query.slug &&
      w.contentKind === contentKind &&
      (w.platform ?? null) === (query.platform ?? null) &&
      (w.channel ?? null) === (query.channel ?? null),
  );
  if (candidates.length === 0) {
    return err(404, `no workflow for ${query.site}/${query.slug} (${contentKind})`);
  }
  // When multiple workflows match — most commonly because an earlier
  // longform was cancelled and a fresh one was enqueued — prefer
  // active over terminal, and within each tier prefer the most
  // recently created. Previous behavior picked journal read-order,
  // which reliably landed the operator on the stale cancelled
  // workflow for the evolution dispatch.
  const isTerminal = (s: DraftWorkflowState) => s === 'applied' || s === 'cancelled';
  const match = [...candidates].sort((a, b) => {
    const aTerm = isTerminal(a.state) ? 1 : 0;
    const bTerm = isTerminal(b.state) ? 1 : 0;
    if (aTerm !== bTerm) return aTerm - bTerm;
    return b.createdAt.localeCompare(a.createdAt);
  })[0];
  return ok({ workflow: match, versions: readVersions(rootDir, match.id) });
}

interface VersionBody {
  workflowId: string;
  beforeVersion: number;
  afterMarkdown: string;
}

/**
 * Operator edit-mode submission. Appends a new DraftVersion with
 * originatedBy='operator' and records an edit annotation that carries
 * the diff against the before-version. Computes the diff server-side
 * so clients don't need a diff library.
 */
export function handleCreateVersion(rootDir: string, body: unknown): HandlerResult {
  if (!body || typeof body !== 'object') return err(400, 'expected JSON object body');
  const d = body as Partial<VersionBody>;
  if (!d.workflowId) return err(400, 'workflowId is required');
  if (typeof d.beforeVersion !== 'number') return err(400, 'beforeVersion is required');
  if (typeof d.afterMarkdown !== 'string') return err(400, 'afterMarkdown is required');

  const workflow = readWorkflow(rootDir, d.workflowId);
  if (!workflow) return err(404, `unknown workflow: ${d.workflowId}`);

  const versions = readVersions(rootDir, d.workflowId);
  const before = versions.find(v => v.version === d.beforeVersion);
  if (!before) return err(404, `unknown beforeVersion: ${d.beforeVersion}`);

  if (before.markdown === d.afterMarkdown) {
    return err(400, 'afterMarkdown is identical to beforeVersion — no edit to record');
  }

  const diff = lineDiff(before.markdown, d.afterMarkdown);

  // Single-source-of-truth invariant: the markdown file on disk IS the
  // article. The journal stores versioned snapshots for history; disk
  // is canonical. Every path that creates a new version must write
  // disk first, then snapshot to the journal. For longform, that's
  // the content-collection file at `src/sites/<site>/content/blog/<slug>.md`.
  // For shortform there is no separate file — the workflow's
  // currentVersion markdown IS the working copy. See
  // `/editorial-approve` for the apply step.
  if (workflow.contentKind === 'longform' || workflow.contentKind === 'outline') {
    const blogFile = join(
      rootDir,
      'src',
      'sites',
      workflow.site,
      'content',
      'blog',
      `${workflow.slug}.md`,
    );
    if (!existsSync(blogFile)) {
      return err(
        500,
        `cannot save: blog file missing at ${blogFile}. ` +
        `Scaffold the post with /editorial-outline or /editorial-draft before saving edits.`,
      );
    }
    writeFileSync(blogFile, d.afterMarkdown, 'utf-8');
  }

  const version = appendVersion(rootDir, d.workflowId, d.afterMarkdown, 'operator');
  const annotation = mintAnnotation({
    type: 'edit',
    workflowId: d.workflowId,
    beforeVersion: d.beforeVersion,
    afterMarkdown: d.afterMarkdown,
    diff,
  });
  appendAnnotation(rootDir, annotation);
  return ok({ version, annotation });
}

interface StartLongformBody {
  site: Site;
  slug: string;
}

/**
 * Blog-post slugs are restricted to the URL-safe kebab-case shape
 * also used by `/editorial-add` / `/editorial-plan`. This rejects
 * path-traversal attempts (`../foo`, `foo/bar`) and other characters
 * that would escape the expected `src/sites/<site>/content/blog/<slug>.md`
 * scope.
 */
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Enqueue a longform draft review directly from the editorial-studio
 * dashboard. Reads the blog post markdown from disk and calls
 * createWorkflow. Idempotent on (site, slug, 'longform') — returning the
 * existing workflow with `existing: true` when one is already in flight.
 */
export function handleStartLongform(rootDir: string, body: unknown): HandlerResult {
  if (!body || typeof body !== 'object') return err(400, 'expected JSON object body');
  const b = body as Partial<StartLongformBody>;
  if (!b.site) return err(400, 'site is required');
  if (!SITES.includes(b.site as Site)) {
    return err(400, `unknown site: ${b.site}. Must be one of ${SITES.join(', ')}`);
  }
  if (!b.slug || typeof b.slug !== 'string') return err(400, 'slug is required');
  if (!SLUG_RE.test(b.slug)) {
    return err(400, `invalid slug: ${b.slug}. Must match ${SLUG_RE}`);
  }

  const path = join(rootDir, 'src', 'sites', b.site, 'content', 'blog', `${b.slug}.md`);
  if (!existsSync(path)) {
    return err(404, `blog draft not found at ${path}`);
  }

  const markdown = readFileSync(path, 'utf-8');
  const before = readWorkflows(rootDir).find(
    w =>
      w.site === b.site &&
      w.slug === b.slug &&
      w.contentKind === 'longform' &&
      w.state !== 'applied' &&
      w.state !== 'cancelled',
  );
  const workflow = createWorkflow(rootDir, {
    site: b.site as Site,
    slug: b.slug,
    contentKind: 'longform',
    initialMarkdown: markdown,
    initialOriginatedBy: 'agent',
  });
  return ok({ workflow, existing: !!before && before.id === workflow.id });
}

/**
 * Minimal line-level diff. Produces `-` / `+` prefixed lines for
 * removed/added content, `=` for unchanged. Paired with `applyLineDiff`
 * the operation is reversible — applying the diff against the before-text
 * reconstructs the after-text.
 */
export function lineDiff(a: string, b: string): string {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const out: string[] = [];
  const n = Math.max(aLines.length, bLines.length);
  for (let i = 0; i < n; i++) {
    const aLine = aLines[i];
    const bLine = bLines[i];
    if (aLine === bLine) {
      if (aLine !== undefined) out.push(`= ${aLine}`);
    } else {
      if (aLine !== undefined) out.push(`- ${aLine}`);
      if (bLine !== undefined) out.push(`+ ${bLine}`);
    }
  }
  return out.join('\n');
}

/** Apply a line-diff (as produced by `lineDiff`) to reconstruct the after-text. */
export function applyLineDiff(diff: string): string {
  const out: string[] = [];
  for (const line of diff.split('\n')) {
    if (line.startsWith('= ')) out.push(line.slice(2));
    else if (line.startsWith('+ ')) out.push(line.slice(2));
    else if (line === '=' || line === '+') out.push('');
    // '-' lines are discarded; unprefixed lines are ignored
  }
  return out.join('\n');
}

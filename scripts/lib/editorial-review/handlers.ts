import type { DraftAnnotation, DraftWorkflowState } from './types.js';
import {
  appendAnnotation,
  mintAnnotation,
  readAnnotations,
  readWorkflow,
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

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createWorkflow } from '../../scripts/lib/editorial-review/pipeline.js';
import {
  handleAnnotate,
  handleDecision,
  handleListAnnotations,
} from '../../scripts/lib/editorial-review/handlers.js';

let root: string;
let workflowId: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'editorial-review-handlers-'));
  const w = createWorkflow(root, {
    site: 'editorialcontrol',
    slug: 'test-post',
    contentKind: 'longform',
    initialMarkdown: 'hello world',
  });
  workflowId = w.id;
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('handleAnnotate', () => {
  it('records a comment and returns 200', () => {
    const result = handleAnnotate(root, {
      type: 'comment',
      workflowId,
      version: 1,
      range: { start: 0, end: 5 },
      text: 'tighten',
      category: 'voice-drift',
    });
    expect(result.status).toBe(200);
  });

  it('records an edit with diff', () => {
    const result = handleAnnotate(root, {
      type: 'edit',
      workflowId,
      beforeVersion: 1,
      afterMarkdown: 'hello earth',
      diff: '-world\n+earth',
    });
    expect(result.status).toBe(200);
  });

  it('records an approve', () => {
    const result = handleAnnotate(root, {
      type: 'approve',
      workflowId,
      version: 1,
    });
    expect(result.status).toBe(200);
  });

  it('returns 400 for missing type', () => {
    const result = handleAnnotate(root, { workflowId, version: 1 });
    expect(result.status).toBe(400);
  });

  it('returns 400 for unknown annotation type', () => {
    const result = handleAnnotate(root, {
      type: 'bogus',
      workflowId,
      version: 1,
    });
    expect(result.status).toBe(400);
  });

  it('returns 404 for unknown workflow', () => {
    const result = handleAnnotate(root, {
      type: 'comment',
      workflowId: 'bogus',
      version: 1,
      range: { start: 0, end: 5 },
      text: 'x',
    });
    expect(result.status).toBe(404);
  });

  it('returns 400 for malformed comment range', () => {
    const result = handleAnnotate(root, {
      type: 'comment',
      workflowId,
      version: 1,
      range: { start: 'nope' },
      text: 'x',
    });
    expect(result.status).toBe(400);
  });
});

describe('handleListAnnotations', () => {
  it('returns empty list when no annotations exist', () => {
    const result = handleListAnnotations(root, { workflowId, version: null });
    expect(result.status).toBe(200);
    expect((result.body as { annotations: unknown[] }).annotations).toEqual([]);
  });

  it('filters by version', () => {
    handleAnnotate(root, {
      type: 'comment',
      workflowId,
      version: 1,
      range: { start: 0, end: 5 },
      text: 'a',
    });
    handleAnnotate(root, {
      type: 'comment',
      workflowId,
      version: 2,
      range: { start: 0, end: 5 },
      text: 'b',
    });
    const v1 = handleListAnnotations(root, { workflowId, version: '1' });
    const v2 = handleListAnnotations(root, { workflowId, version: '2' });
    expect((v1.body as { annotations: unknown[] }).annotations).toHaveLength(1);
    expect((v2.body as { annotations: unknown[] }).annotations).toHaveLength(1);
  });

  it('returns 400 for missing workflowId', () => {
    const result = handleListAnnotations(root, { workflowId: null, version: null });
    expect(result.status).toBe(400);
  });

  it('returns 400 for non-numeric version', () => {
    const result = handleListAnnotations(root, { workflowId, version: 'abc' });
    expect(result.status).toBe(400);
  });
});

describe('handleDecision', () => {
  it('transitions state and returns updated workflow', () => {
    const result = handleDecision(root, { workflowId, to: 'in-review' });
    expect(result.status).toBe(200);
    const updated = (result.body as { workflow: { state: string } }).workflow;
    expect(updated.state).toBe('in-review');
  });

  it('returns 404 for unknown workflow', () => {
    const result = handleDecision(root, { workflowId: 'bogus', to: 'in-review' });
    expect(result.status).toBe(404);
  });

  it('returns 409 for invalid transition', () => {
    const result = handleDecision(root, { workflowId, to: 'applied' });
    expect(result.status).toBe(409);
  });

  it('returns 400 for missing fields', () => {
    expect(handleDecision(root, { workflowId }).status).toBe(400);
    expect(handleDecision(root, { to: 'in-review' }).status).toBe(400);
  });
});

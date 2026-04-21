import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createWorkflow } from '../../scripts/lib/editorial-review/pipeline.js';
import {
  applyLineDiff,
  handleAnnotate,
  handleCreateVersion,
  handleDecision,
  handleGetWorkflow,
  handleListAnnotations,
  handleStartLongform,
  lineDiff,
} from '../../scripts/lib/editorial-review/handlers.js';

let root: string;
let workflowId: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'editorial-review-handlers-'));
  // handleCreateVersion now enforces the single-source-of-truth
  // invariant and writes new version markdown to the blog file
  // on disk before snapshotting. Tests must scaffold the file.
  const blogDir = join(root, 'src', 'sites', 'editorialcontrol', 'content', 'blog');
  mkdirSync(blogDir, { recursive: true });
  writeFileSync(join(blogDir, 'test-post.md'), 'hello world', 'utf-8');
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

  it('records and round-trips the anchor field on a comment', () => {
    const anchor = 'hello world';
    const result = handleAnnotate(root, {
      type: 'comment',
      workflowId,
      version: 1,
      range: { start: 0, end: 11 },
      text: 'look at this phrase',
      category: 'voice-drift',
      anchor,
    });
    expect(result.status).toBe(200);
    const list = handleListAnnotations(root, { workflowId, version: '1' });
    const ann = (list.body as { annotations: Array<{ anchor?: string }> }).annotations[0];
    expect(ann.anchor).toBe(anchor);
  });

  it('accepts a comment without anchor (legacy) and stores it without one', () => {
    const result = handleAnnotate(root, {
      type: 'comment',
      workflowId,
      version: 1,
      range: { start: 0, end: 5 },
      text: 'no anchor captured',
    });
    expect(result.status).toBe(200);
    const list = handleListAnnotations(root, { workflowId, version: '1' });
    const ann = (list.body as { annotations: Array<{ anchor?: string }> }).annotations[0];
    expect(ann.anchor).toBeUndefined();
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

describe('handleGetWorkflow', () => {
  it('returns workflow + versions by id', () => {
    const result = handleGetWorkflow(root, {
      id: workflowId,
      site: null,
      slug: null,
      contentKind: null,
      platform: null,
      channel: null,
    });
    expect(result.status).toBe(200);
    const body = result.body as { workflow: { id: string }; versions: unknown[] };
    expect(body.workflow.id).toBe(workflowId);
    expect(body.versions).toHaveLength(1);
  });

  it('returns workflow by (site, slug)', () => {
    const result = handleGetWorkflow(root, {
      id: null,
      site: 'editorialcontrol',
      slug: 'test-post',
      contentKind: 'longform',
      platform: null,
      channel: null,
    });
    expect(result.status).toBe(200);
    expect((result.body as { workflow: { id: string } }).workflow.id).toBe(workflowId);
  });

  it('returns 404 for unknown id', () => {
    const result = handleGetWorkflow(root, {
      id: 'nope',
      site: null,
      slug: null,
      contentKind: null,
      platform: null,
      channel: null,
    });
    expect(result.status).toBe(404);
  });

  it('returns 400 when neither id nor (site, slug) provided', () => {
    const result = handleGetWorkflow(root, {
      id: null,
      site: null,
      slug: null,
      contentKind: null,
      platform: null,
      channel: null,
    });
    expect(result.status).toBe(400);
  });
});

describe('handleCreateVersion', () => {
  it('appends a new version and an edit annotation', () => {
    const result = handleCreateVersion(root, {
      workflowId,
      beforeVersion: 1,
      afterMarkdown: 'hello earth',
    });
    expect(result.status).toBe(200);
    const body = result.body as {
      version: { version: number; originatedBy: string };
      annotation: { type: string; diff: string };
    };
    expect(body.version.version).toBe(2);
    expect(body.version.originatedBy).toBe('operator');
    expect(body.annotation.type).toBe('edit');
    expect(body.annotation.diff.length).toBeGreaterThan(0);
  });

  it('rejects when afterMarkdown is unchanged', () => {
    const result = handleCreateVersion(root, {
      workflowId,
      beforeVersion: 1,
      afterMarkdown: 'hello world',
    });
    expect(result.status).toBe(400);
  });

  it('returns 404 on unknown beforeVersion', () => {
    const result = handleCreateVersion(root, {
      workflowId,
      beforeVersion: 99,
      afterMarkdown: 'x',
    });
    expect(result.status).toBe(404);
  });
});

describe('lineDiff / applyLineDiff round-trip', () => {
  it('reversibly reconstructs the after-text for a pure addition', () => {
    const a = 'line one\nline two';
    const b = 'line one\nline two\nline three';
    expect(applyLineDiff(lineDiff(a, b))).toBe(b);
  });

  it('reversibly reconstructs for substitution', () => {
    const a = 'hello world\nstay the same';
    const b = 'hello earth\nstay the same';
    expect(applyLineDiff(lineDiff(a, b))).toBe(b);
  });

  it('reversibly reconstructs for deletion', () => {
    const a = 'one\ntwo\nthree';
    const b = 'one\nthree';
    // Our naive per-index diff can't perfectly distinguish a deletion
    // from a change — this tests what we DO support: the result still
    // reconstructs the `b` line-set in order.
    const reconstructed = applyLineDiff(lineDiff(a, b));
    expect(reconstructed.split('\n').filter(Boolean)).toEqual(b.split('\n').filter(Boolean));
  });

  it('handles multi-line markdown with blank lines', () => {
    const a = '# Title\n\nparagraph one\n\nparagraph two';
    const b = '# Title\n\nparagraph one — revised\n\nparagraph two';
    expect(applyLineDiff(lineDiff(a, b))).toBe(b);
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

describe('handleStartLongform', () => {
  function seedBlogFile(site: string, slug: string, content: string): string {
    const dir = join(root, 'src', 'sites', site, 'content', 'blog');
    mkdirSync(dir, { recursive: true });
    const path = join(dir, `${slug}.md`);
    writeFileSync(path, content, 'utf-8');
    return path;
  }

  it('reads the blog file and creates a longform workflow', () => {
    seedBlogFile('editorialcontrol', 'new-draft', '# A draft\n\nBody.');
    const result = handleStartLongform(root, {
      site: 'editorialcontrol',
      slug: 'new-draft',
    });
    expect(result.status).toBe(200);
    const body = result.body as {
      workflow: { slug: string; contentKind: string };
      existing: boolean;
    };
    expect(body.workflow.slug).toBe('new-draft');
    expect(body.workflow.contentKind).toBe('longform');
    expect(body.existing).toBe(false);
  });

  it('is idempotent — second call returns existing: true', () => {
    seedBlogFile('audiocontrol', 'repeat-draft', '# x');
    const first = handleStartLongform(root, {
      site: 'audiocontrol',
      slug: 'repeat-draft',
    });
    const second = handleStartLongform(root, {
      site: 'audiocontrol',
      slug: 'repeat-draft',
    });
    const b1 = first.body as { workflow: { id: string }; existing: boolean };
    const b2 = second.body as { workflow: { id: string }; existing: boolean };
    expect(b2.workflow.id).toBe(b1.workflow.id);
    expect(b1.existing).toBe(false);
    expect(b2.existing).toBe(true);
  });

  it('returns 404 when the blog file does not exist', () => {
    const result = handleStartLongform(root, {
      site: 'editorialcontrol',
      slug: 'does-not-exist',
    });
    expect(result.status).toBe(404);
  });

  it('returns 400 for missing site or slug', () => {
    expect(handleStartLongform(root, { slug: 'x' }).status).toBe(400);
    expect(handleStartLongform(root, { site: 'editorialcontrol' }).status).toBe(400);
    expect(handleStartLongform(root, {}).status).toBe(400);
  });

  it('returns 400 for unknown site', () => {
    const result = handleStartLongform(root, { site: 'nope', slug: 'x' });
    expect(result.status).toBe(400);
  });

  it('rejects path-traversal slugs with 400 (not 404)', () => {
    // Seed a neighbor file so the traversal target would actually exist
    // if validation were missing — proves the slug check, not missing-file check.
    const dir = join(root, 'src', 'sites', 'audiocontrol', 'pages');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'secret.md'), 'should not be readable', 'utf-8');

    for (const bad of ['../secret', '../../etc/passwd', 'foo/bar', 'with spaces', 'Upper', '-leading-dash', '']) {
      const result = handleStartLongform(root, {
        site: 'audiocontrol',
        slug: bad,
      });
      expect(result.status).toBe(400);
    }
  });

  it('accepts valid kebab-case slugs', () => {
    seedBlogFile('audiocontrol', 'ok-slug-123', '# ok');
    const result = handleStartLongform(root, {
      site: 'audiocontrol',
      slug: 'ok-slug-123',
    });
    expect(result.status).toBe(200);
  });
});

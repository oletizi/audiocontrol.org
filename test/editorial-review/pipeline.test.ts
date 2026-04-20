import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  appendAnnotation,
  appendVersion,
  compactPipeline,
  createWorkflow,
  historyPath,
  listOpen,
  mintAnnotation,
  pipelinePath,
  readAnnotations,
  readHistory,
  readVersions,
  readWorkflow,
  readWorkflows,
  transitionState,
} from '../../scripts/lib/editorial-review/pipeline.js';

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'editorial-review-test-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('pipeline — createWorkflow', () => {
  it('appends a workflow snapshot, a workflow-created event, and v1', () => {
    const w = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'first-post',
      contentKind: 'longform',
      initialMarkdown: '# Hello',
    });

    expect(w.id).toBeTruthy();
    expect(w.state).toBe('open');
    expect(w.currentVersion).toBe(1);

    const pipe = readWorkflows(root);
    expect(pipe).toHaveLength(1);
    expect(pipe[0]).toEqual(w);

    const hist = readHistory(root);
    expect(hist).toHaveLength(2);
    expect(hist[0].kind).toBe('workflow-created');
    expect(hist[1].kind).toBe('version');

    const versions = readVersions(root, w.id);
    expect(versions).toHaveLength(1);
    expect(versions[0].markdown).toBe('# Hello');
    expect(versions[0].originatedBy).toBe('agent');
  });

  it('is idempotent on the natural key', () => {
    const first = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'v1',
    });
    const second = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'different v1',
    });
    expect(second.id).toBe(first.id);
    expect(readWorkflows(root)).toHaveLength(1);
    expect(readVersions(root, first.id)).toHaveLength(1);
    expect(readVersions(root, first.id)[0].markdown).toBe('v1');
  });

  it('creates distinct workflows for distinct (slug, platform, channel) tuples', () => {
    const longform = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'lf',
    });
    const reddit = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'p',
      contentKind: 'shortform',
      platform: 'reddit',
      channel: 'r/synthdiy',
      initialMarkdown: 'rd',
    });
    const linkedin = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'p',
      contentKind: 'shortform',
      platform: 'linkedin',
      initialMarkdown: 'li',
    });
    expect(new Set([longform.id, reddit.id, linkedin.id]).size).toBe(3);
  });

  it('writes to the expected file paths', () => {
    createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'v1',
    });
    expect(existsSync(pipelinePath(root))).toBe(true);
    expect(existsSync(historyPath(root))).toBe(true);
  });
});

describe('pipeline — state transitions', () => {
  it('happy path: open → in-review → iterating → in-review → approved → applied', () => {
    const w = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'v1',
    });
    transitionState(root, w.id, 'in-review');
    transitionState(root, w.id, 'iterating');
    transitionState(root, w.id, 'in-review');
    transitionState(root, w.id, 'approved');
    const final = transitionState(root, w.id, 'applied');
    expect(final.state).toBe('applied');
    expect(readWorkflow(root, w.id)?.state).toBe('applied');
  });

  it('throws on invalid transitions', () => {
    const w = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'v1',
    });
    expect(() => transitionState(root, w.id, 'applied')).toThrow(/Invalid transition/);
    expect(() => transitionState(root, w.id, 'approved')).toThrow(/Invalid transition/);
  });

  it('throws on unknown workflow id', () => {
    expect(() => transitionState(root, 'nope', 'in-review')).toThrow(/Unknown workflow/);
  });

  it('terminal states cannot transition', () => {
    const w = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'v1',
    });
    transitionState(root, w.id, 'cancelled');
    expect(() => transitionState(root, w.id, 'in-review')).toThrow(/Invalid transition/);
  });
});

describe('pipeline — versions', () => {
  it('appendVersion increments currentVersion and records markdown', () => {
    const w = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'v1',
    });
    const v2 = appendVersion(root, w.id, 'v2', 'agent');
    const v3 = appendVersion(root, w.id, 'v3', 'operator');

    expect(v2.version).toBe(2);
    expect(v3.version).toBe(3);
    expect(v3.originatedBy).toBe('operator');

    const updated = readWorkflow(root, w.id);
    expect(updated?.currentVersion).toBe(3);

    const versions = readVersions(root, w.id);
    expect(versions.map(v => v.markdown)).toEqual(['v1', 'v2', 'v3']);
  });

  it('throws on unknown workflow id', () => {
    expect(() => appendVersion(root, 'nope', 'x', 'agent')).toThrow(/Unknown workflow/);
  });
});

describe('pipeline — annotations', () => {
  it('records and retrieves annotations, filtered by version', () => {
    const w = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'hello world',
    });

    const c1 = mintAnnotation({
      type: 'comment',
      workflowId: w.id,
      version: 1,
      range: { start: 0, end: 5 },
      text: 'tighten this',
    });
    const c2 = mintAnnotation({
      type: 'comment',
      workflowId: w.id,
      version: 1,
      range: { start: 6, end: 11 },
      text: 'fine',
    });
    const editAnn = mintAnnotation({
      type: 'edit',
      workflowId: w.id,
      beforeVersion: 1,
      afterMarkdown: 'hello earth',
      diff: '-world\n+earth',
    });
    appendAnnotation(root, c1);
    appendAnnotation(root, c2);
    appendAnnotation(root, editAnn);

    const allForV1 = readAnnotations(root, w.id, 1);
    expect(allForV1).toHaveLength(3);

    const allForV2 = readAnnotations(root, w.id, 2);
    expect(allForV2).toHaveLength(0);

    const unfiltered = readAnnotations(root, w.id);
    expect(unfiltered).toHaveLength(3);

    const approve = mintAnnotation({
      type: 'approve',
      workflowId: w.id,
      version: 2,
    });
    appendAnnotation(root, approve);
    expect(readAnnotations(root, w.id, 2)).toHaveLength(1);
  });
});

describe('pipeline — listOpen and compaction', () => {
  it('listOpen excludes applied and cancelled', () => {
    const a = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'a',
      contentKind: 'longform',
      initialMarkdown: 'a',
    });
    const b = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'b',
      contentKind: 'longform',
      initialMarkdown: 'b',
    });
    const c = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'c',
      contentKind: 'longform',
      initialMarkdown: 'c',
    });

    transitionState(root, a.id, 'in-review');
    transitionState(root, a.id, 'approved');
    transitionState(root, a.id, 'applied');
    transitionState(root, c.id, 'cancelled');

    const open = listOpen(root);
    expect(open).toHaveLength(1);
    expect(open[0].id).toBe(b.id);

    const audioOpen = listOpen(root, 'audiocontrol');
    expect(audioOpen).toHaveLength(0);
    const ecOpen = listOpen(root, 'editorialcontrol');
    expect(ecOpen).toHaveLength(1);
  });

  it('compactPipeline reduces duplicate snapshots without changing latest state', () => {
    const w = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'v1',
    });
    transitionState(root, w.id, 'in-review');
    transitionState(root, w.id, 'iterating');

    const beforeLines = readFileSync(pipelinePath(root), 'utf-8').trim().split('\n').length;
    expect(beforeLines).toBe(3);

    compactPipeline(root);
    const afterLines = readFileSync(pipelinePath(root), 'utf-8').trim().split('\n').length;
    expect(afterLines).toBe(1);

    const post = readWorkflow(root, w.id);
    expect(post?.state).toBe('iterating');
  });
});

describe('pipeline — malformed input', () => {
  it('skips malformed JSONL lines without aborting', () => {
    const path = pipelinePath(root);
    createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'v1',
    });
    const content = readFileSync(path, 'utf-8');
    const garbled = content + 'this is not json\n\n{"partial":';
    writeFileSync(path, garbled, 'utf-8');
    const read = readWorkflows(root);
    expect(read).toHaveLength(1);
  });
});

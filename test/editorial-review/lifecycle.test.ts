/**
 * End-to-end test that walks a draft through the full review lifecycle
 * using the real handler functions — create → comment → edit → approve →
 * apply. This exercises the same code paths the Astro endpoints do,
 * minus the HTTP layer, so a regression in any handler or in the state
 * machine is caught here even if the unit tests drift.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  createWorkflow,
  readWorkflow,
  readVersions,
} from '../../scripts/lib/editorial-review/pipeline.js';
import {
  handleAnnotate,
  handleCreateVersion,
  handleDecision,
  handleGetWorkflow,
  handleListAnnotations,
} from '../../scripts/lib/editorial-review/handlers.js';

let root: string;

// Scaffold a real blog file under the test root so handleCreateVersion's
// single-source-of-truth invariant (write-to-disk-then-snapshot) is
// satisfied for each fixture workflow.
function seedBlogFile(root: string, site: string, slug: string, md: string): void {
  const dir = join(root, 'src', 'sites', site, 'content', 'blog');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}.md`), md, 'utf-8');
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'editorial-review-lifecycle-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('editorial-review full lifecycle', () => {
  it('walks a draft from open → in-review → iterating → in-review → approved → applied', () => {
    seedBlogFile(root, 'editorialcontrol', 'test-dispatch', '# Test\n\nFirst paragraph.');
    // 1. Agent drafts v1
    const created = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'test-dispatch',
      contentKind: 'longform',
      initialMarkdown: '# Test\n\nFirst paragraph.',
    });
    expect(created.state).toBe('open');

    // 2. Operator opens the page — transitions open → in-review
    const r1 = handleDecision(root, { workflowId: created.id, to: 'in-review' });
    expect(r1.status).toBe(200);

    // 3. Operator comments on v1
    const c = handleAnnotate(root, {
      type: 'comment',
      workflowId: created.id,
      version: 1,
      range: { start: 0, end: 15 },
      text: 'tighten this',
      category: 'voice-drift',
    });
    expect(c.status).toBe(200);

    // 4. Operator requests iteration
    const r2 = handleDecision(root, { workflowId: created.id, to: 'iterating' });
    expect(r2.status).toBe(200);

    // 5. Agent produces v2 (simulated via handleCreateVersion which is also
    // the path for operator edits — same shape, different originatedBy)
    const v2 = handleCreateVersion(root, {
      workflowId: created.id,
      beforeVersion: 1,
      afterMarkdown: '# Test (revised)\n\nRevised first paragraph.',
    });
    expect(v2.status).toBe(200);
    const v2body = v2.body as { version: { version: number } };
    expect(v2body.version.version).toBe(2);

    // 6. Operator reviews v2 — iterating → in-review
    const r3 = handleDecision(root, { workflowId: created.id, to: 'in-review' });
    expect(r3.status).toBe(200);

    // 7. Operator approves v2 — approve annotation + in-review → approved
    const approveAnn = handleAnnotate(root, {
      type: 'approve',
      workflowId: created.id,
      version: 2,
    });
    expect(approveAnn.status).toBe(200);
    const r4 = handleDecision(root, { workflowId: created.id, to: 'approved' });
    expect(r4.status).toBe(200);

    // 8. Apply step: approved → applied
    const r5 = handleDecision(root, { workflowId: created.id, to: 'applied' });
    expect(r5.status).toBe(200);

    // 9. Final state: applied, currentVersion=2, annotations present for v1 and v2
    const finalWorkflow = readWorkflow(root, created.id);
    expect(finalWorkflow?.state).toBe('applied');
    expect(finalWorkflow?.currentVersion).toBe(2);

    const versions = readVersions(root, created.id);
    expect(versions.map(v => v.version)).toEqual([1, 2]);
    expect(versions[1].originatedBy).toBe('operator');

    const v1Anns = (
      handleListAnnotations(root, { workflowId: created.id, version: '1' }).body as {
        annotations: Array<{ type: string }>;
      }
    ).annotations;
    // v1 matches: the operator's comment (version=1) and the edit
    // annotation minted by handleCreateVersion (beforeVersion=1).
    expect(v1Anns.map(a => a.type).sort()).toEqual(['comment', 'edit']);

    const v2Anns = (
      handleListAnnotations(root, { workflowId: created.id, version: '2' }).body as {
        annotations: Array<{ type: string }>;
      }
    ).annotations;
    // v2 matches only the approve annotation (version=2). The edit
    // annotation is scoped to beforeVersion=1, not v=2.
    expect(v2Anns.map(a => a.type)).toEqual(['approve']);
  });

  it('reject from open transitions directly to cancelled', () => {
    const w = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'doomed',
      contentKind: 'longform',
      initialMarkdown: '# Draft',
    });
    const r = handleDecision(root, { workflowId: w.id, to: 'cancelled' });
    expect(r.status).toBe(200);
    expect(readWorkflow(root, w.id)?.state).toBe('cancelled');
  });

  it('rejects invalid transition with 409', () => {
    const w = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'v1',
    });
    const r = handleDecision(root, { workflowId: w.id, to: 'applied' });
    expect(r.status).toBe(409);
  });

  it('handleGetWorkflow returns the full version history for the UI', () => {
    seedBlogFile(root, 'editorialcontrol', 'p', 'v1 markdown');
    const w = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'v1 markdown',
    });
    handleCreateVersion(root, {
      workflowId: w.id,
      beforeVersion: 1,
      afterMarkdown: 'v2 markdown',
    });
    const r = handleGetWorkflow(root, {
      id: w.id,
      site: null,
      slug: null,
      contentKind: null,
      platform: null,
      channel: null,
    });
    expect(r.status).toBe(200);
    const body = r.body as {
      workflow: { currentVersion: number };
      versions: { version: number; markdown: string }[];
    };
    expect(body.workflow.currentVersion).toBe(2);
    expect(body.versions).toHaveLength(2);
    expect(body.versions[0].markdown).toBe('v1 markdown');
    expect(body.versions[1].markdown).toBe('v2 markdown');
  });

  it('comment range offsets round-trip through the pipeline', () => {
    const w = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'p',
      contentKind: 'longform',
      initialMarkdown: 'hello world',
    });
    const range = { start: 6, end: 11 };
    const annotate = handleAnnotate(root, {
      type: 'comment',
      workflowId: w.id,
      version: 1,
      range,
      text: 'check this',
    });
    expect(annotate.status).toBe(200);
    const list = handleListAnnotations(root, { workflowId: w.id, version: '1' });
    const ann = (list.body as { annotations: Array<{ range: { start: number; end: number } }> })
      .annotations[0];
    expect(ann.range).toEqual(range);
  });
});

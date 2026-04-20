import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  appendAnnotation,
  createWorkflow,
  mintAnnotation,
  transitionState,
} from '../../scripts/lib/editorial-review/pipeline.js';
import { buildReport, renderReport } from '../../scripts/lib/editorial-review/report.js';

let root: string;

function driveToApplied(id: string): void {
  transitionState(root, id, 'in-review');
  transitionState(root, id, 'approved');
  transitionState(root, id, 'applied');
}

function comment(workflowId: string, category?: 'voice-drift' | 'missing-receipt' | 'tutorial-framing' | 'saas-vocabulary' | 'fake-authority' | 'structural' | 'other'): void {
  appendAnnotation(
    root,
    mintAnnotation({
      type: 'comment',
      workflowId,
      version: 1,
      range: { start: 0, end: 4 },
      text: 'x',
      ...(category ? { category } : {}),
    }),
  );
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'editorial-review-report-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('buildReport', () => {
  it('counts only terminal-state workflows by default', () => {
    const a = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'a',
      contentKind: 'longform',
      initialMarkdown: 'x',
    });
    const b = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'b',
      contentKind: 'longform',
      initialMarkdown: 'x',
    });
    driveToApplied(a.id);
    // b is still open; its comments should NOT count
    comment(a.id, 'voice-drift');
    comment(b.id, 'voice-drift');

    const report = buildReport(root);
    expect(report.all.approvedCount).toBe(1);
    expect(report.all.totalComments).toBe(1);
    expect(report.all.commentsByCategory.voiceDrift).toBe(1);
  });

  it('opt-out of terminalOnly includes in-flight workflows', () => {
    const a = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'a',
      contentKind: 'longform',
      initialMarkdown: 'x',
    });
    comment(a.id, 'voice-drift');

    const report = buildReport(root, { terminalOnly: false });
    expect(report.all.totalComments).toBe(1);
  });

  it('counts reject annotations separately from comments', () => {
    const a = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'a',
      contentKind: 'longform',
      initialMarkdown: 'x',
    });
    transitionState(root, a.id, 'cancelled');
    appendAnnotation(
      root,
      mintAnnotation({
        type: 'reject',
        workflowId: a.id,
        version: 1,
        reason: 'scope drift',
      }),
    );
    comment(a.id, 'structural');
    const report = buildReport(root);
    expect(report.all.cancelledCount).toBe(1);
    expect(report.all.rejectCount).toBe(1);
    expect(report.all.totalComments).toBe(1);
    expect(report.all.commentsByCategory.structural).toBe(1);
  });

  it('per-site breakdown separates each site', () => {
    const a = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'a',
      contentKind: 'longform',
      initialMarkdown: 'x',
    });
    const b = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'b',
      contentKind: 'longform',
      initialMarkdown: 'x',
    });
    driveToApplied(a.id);
    driveToApplied(b.id);
    comment(a.id, 'voice-drift');
    comment(a.id, 'missing-receipt');
    comment(b.id, 'missing-receipt');

    const report = buildReport(root);
    expect(report.bySite.editorialcontrol.totalComments).toBe(2);
    expect(report.bySite.editorialcontrol.commentsByCategory.voiceDrift).toBe(1);
    expect(report.bySite.editorialcontrol.commentsByCategory.missingReceipt).toBe(1);
    expect(report.bySite.audiocontrol.totalComments).toBe(1);
    expect(report.bySite.audiocontrol.commentsByCategory.missingReceipt).toBe(1);
  });

  it('treats missing category as "other"', () => {
    const a = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'a',
      contentKind: 'longform',
      initialMarkdown: 'x',
    });
    driveToApplied(a.id);
    comment(a.id); // no category
    comment(a.id); // no category
    comment(a.id, 'voice-drift');

    const report = buildReport(root);
    expect(report.all.commentsByCategory.other).toBe(2);
    expect(report.all.commentsByCategory.voiceDrift).toBe(1);
  });

  it('topCategories sorts descending by count', () => {
    const a = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'a',
      contentKind: 'longform',
      initialMarkdown: 'x',
    });
    driveToApplied(a.id);
    comment(a.id, 'missing-receipt');
    comment(a.id, 'missing-receipt');
    comment(a.id, 'missing-receipt');
    comment(a.id, 'voice-drift');
    comment(a.id, 'voice-drift');

    const report = buildReport(root);
    expect(report.topCategories[0].category).toBe('missing-receipt');
    expect(report.topCategories[0].count).toBe(3);
    expect(report.topCategories[1].category).toBe('voice-drift');
    expect(report.topCategories[1].count).toBe(2);
  });

  it('site filter scopes to a single site', () => {
    const a = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'a',
      contentKind: 'longform',
      initialMarkdown: 'x',
    });
    const b = createWorkflow(root, {
      site: 'audiocontrol',
      slug: 'b',
      contentKind: 'longform',
      initialMarkdown: 'x',
    });
    driveToApplied(a.id);
    driveToApplied(b.id);
    comment(a.id, 'voice-drift');
    comment(b.id, 'voice-drift');

    const ecOnly = buildReport(root, { site: 'editorialcontrol' });
    expect(ecOnly.all.approvedCount).toBe(1);
    expect(ecOnly.all.totalComments).toBe(1);
  });
});

describe('renderReport', () => {
  it('renders a non-empty plain-text summary', () => {
    const a = createWorkflow(root, {
      site: 'editorialcontrol',
      slug: 'a',
      contentKind: 'longform',
      initialMarkdown: 'x',
    });
    driveToApplied(a.id);
    comment(a.id, 'voice-drift');
    const txt = renderReport(buildReport(root));
    expect(txt).toContain('voice-drift');
    expect(txt).toContain('1 approved');
  });
});

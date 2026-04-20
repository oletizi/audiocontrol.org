/**
 * Phase 12: voice-drift feedback signal.
 *
 * Aggregates comment annotation categories across the draft history —
 * once enough drafts have cycled through the review loop, the tallies
 * identify which voice-skill principles are catching the most operator
 * corrections. This is the prose analog of feature-image-generator's
 * fitness scoring: the signal surfaces; any revision to the voice
 * skills themselves stays human-driven.
 */
import type { AnnotationCategory, DraftWorkflowState } from './types.js';
import type { Site } from '../editorial/types.js';
import { readHistory, readWorkflows } from './pipeline.js';

export interface ReportOptions {
  /** Include only workflows that have reached a terminal state */
  terminalOnly?: boolean;
  /** Optional site filter */
  site?: Site;
}

export interface CategoryCounts {
  voiceDrift: number;
  missingReceipt: number;
  tutorialFraming: number;
  saasVocabulary: number;
  fakeAuthority: number;
  structural: number;
  other: number;
}

export interface ReportBreakdown {
  approvedCount: number;
  cancelledCount: number;
  totalComments: number;
  commentsByCategory: CategoryCounts;
  rejectCount: number;
}

export interface ReviewReport {
  all: ReportBreakdown;
  bySite: Record<string, ReportBreakdown>;
  /** Categories sorted by descending total count, for quick surfacing. */
  topCategories: Array<{ category: AnnotationCategory; count: number }>;
}

const CATEGORY_KEYS: AnnotationCategory[] = [
  'voice-drift',
  'missing-receipt',
  'tutorial-framing',
  'saas-vocabulary',
  'fake-authority',
  'structural',
  'other',
];

function emptyCounts(): CategoryCounts {
  return {
    voiceDrift: 0,
    missingReceipt: 0,
    tutorialFraming: 0,
    saasVocabulary: 0,
    fakeAuthority: 0,
    structural: 0,
    other: 0,
  };
}

function emptyBreakdown(): ReportBreakdown {
  return {
    approvedCount: 0,
    cancelledCount: 0,
    totalComments: 0,
    commentsByCategory: emptyCounts(),
    rejectCount: 0,
  };
}

function bump(counts: CategoryCounts, category: AnnotationCategory | undefined): void {
  const key = category ?? 'other';
  switch (key) {
    case 'voice-drift': counts.voiceDrift++; break;
    case 'missing-receipt': counts.missingReceipt++; break;
    case 'tutorial-framing': counts.tutorialFraming++; break;
    case 'saas-vocabulary': counts.saasVocabulary++; break;
    case 'fake-authority': counts.fakeAuthority++; break;
    case 'structural': counts.structural++; break;
    default: counts.other++;
  }
}

function kebabToCounts(counts: CategoryCounts, cat: AnnotationCategory): number {
  switch (cat) {
    case 'voice-drift': return counts.voiceDrift;
    case 'missing-receipt': return counts.missingReceipt;
    case 'tutorial-framing': return counts.tutorialFraming;
    case 'saas-vocabulary': return counts.saasVocabulary;
    case 'fake-authority': return counts.fakeAuthority;
    case 'structural': return counts.structural;
    case 'other': return counts.other;
  }
}

/**
 * Build a voice-drift report from the pipeline + history.
 *
 * Counts only workflows that reached a terminal state (`applied` or
 * `cancelled`) by default — in-flight workflows don't represent
 * settled signal yet. Callers can opt out of the terminal filter.
 */
export function buildReport(rootDir: string, opts: ReportOptions = {}): ReviewReport {
  const { terminalOnly = true, site } = opts;

  const workflows = readWorkflows(rootDir).filter(w => (!site || w.site === site));
  const terminalStates: DraftWorkflowState[] = ['applied', 'cancelled'];
  const scoped = terminalOnly
    ? workflows.filter(w => terminalStates.includes(w.state))
    : workflows;

  const workflowIds = new Set(scoped.map(w => w.id));
  const all = emptyBreakdown();
  const bySite: Record<string, ReportBreakdown> = {};

  for (const w of scoped) {
    if (w.state === 'applied') all.approvedCount++;
    if (w.state === 'cancelled') all.cancelledCount++;
    const b = bySite[w.site] ?? emptyBreakdown();
    if (w.state === 'applied') b.approvedCount++;
    if (w.state === 'cancelled') b.cancelledCount++;
    bySite[w.site] = b;
  }

  const workflowSiteById = new Map(scoped.map(w => [w.id, w.site]));

  for (const entry of readHistory(rootDir)) {
    if (entry.kind !== 'annotation') continue;
    const ann = entry.annotation;
    if (!workflowIds.has(ann.workflowId)) continue;
    const site = workflowSiteById.get(ann.workflowId);

    if (ann.type === 'comment') {
      all.totalComments++;
      bump(all.commentsByCategory, ann.category);
      if (site) {
        const b = bySite[site] ?? emptyBreakdown();
        b.totalComments++;
        bump(b.commentsByCategory, ann.category);
        bySite[site] = b;
      }
    } else if (ann.type === 'reject') {
      all.rejectCount++;
      if (site) {
        const b = bySite[site] ?? emptyBreakdown();
        b.rejectCount++;
        bySite[site] = b;
      }
    }
  }

  const topCategories = CATEGORY_KEYS
    .map(cat => ({ category: cat, count: kebabToCounts(all.commentsByCategory, cat) }))
    .sort((a, b) => b.count - a.count);

  return { all, bySite, topCategories };
}

export function renderReport(report: ReviewReport): string {
  const lines: string[] = [];
  lines.push('Editorial review — voice-drift signal');
  lines.push('');
  lines.push(
    `Scope: ${report.all.approvedCount} approved, ${report.all.cancelledCount} cancelled (${report.all.rejectCount} reject annotations recorded)`,
  );
  lines.push(`Total comments: ${report.all.totalComments}`);
  lines.push('');
  lines.push('Categories (most → least frequent):');
  for (const { category, count } of report.topCategories) {
    lines.push(`  ${category.padEnd(18)} ${count}`);
  }

  const siteKeys = Object.keys(report.bySite).sort();
  if (siteKeys.length > 1) {
    lines.push('');
    lines.push('Per-site breakdown:');
    for (const site of siteKeys) {
      const b = report.bySite[site];
      lines.push('');
      lines.push(`  ${site}: ${b.approvedCount} approved, ${b.cancelledCount} cancelled, ${b.totalComments} comments, ${b.rejectCount} rejects`);
      for (const cat of CATEGORY_KEYS) {
        const n = kebabToCounts(b.commentsByCategory, cat);
        if (n > 0) lines.push(`    ${cat.padEnd(18)} ${n}`);
      }
    }
  }

  return lines.join('\n');
}

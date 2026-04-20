import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  runMigration,
  HISTORY_SOURCE,
  HISTORY_TARGET,
  PIPELINE_SOURCE,
  PIPELINE_TARGET,
  JOURNAL_ROOT,
  RECEIPT_FILENAME,
} from '../../scripts/lib/editorial-review/migrate-journal.js';
import {
  readHistory,
  readWorkflows,
} from '../../scripts/lib/editorial-review/pipeline.js';
import type {
  DraftAnnotation,
  DraftHistoryEntry,
  DraftWorkflowItem,
} from '../../scripts/lib/editorial-review/types.js';

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'editorial-review-migrate-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

/** Assemble a minimal, valid fixture pair. Returns the workflow + the
 * expected history events written to the JSONL. */
function buildFixture(): {
  workflow: DraftWorkflowItem;
  history: DraftHistoryEntry[];
  annotation: DraftAnnotation;
} {
  const createdAt = '2026-04-20T15:00:00.000Z';
  const transitionAt = '2026-04-20T15:01:00.000Z';
  const annotationAt = '2026-04-20T15:02:00.000Z';

  const initialWorkflow: DraftWorkflowItem = {
    id: 'wf-1',
    site: 'audiocontrol',
    slug: 'post-a',
    contentKind: 'longform',
    state: 'open',
    currentVersion: 1,
    createdAt,
    updatedAt: createdAt,
  };
  const updatedWorkflow: DraftWorkflowItem = {
    ...initialWorkflow,
    state: 'in-review',
    updatedAt: transitionAt,
  };
  const annotation: DraftAnnotation = {
    id: 'ann-1',
    workflowId: 'wf-1',
    type: 'comment',
    version: 1,
    range: { start: 0, end: 5 },
    text: 'tighten',
    createdAt: annotationAt,
  };
  const history: DraftHistoryEntry[] = [
    { kind: 'workflow-created', at: createdAt, workflow: initialWorkflow },
    {
      kind: 'version',
      at: createdAt,
      workflowId: 'wf-1',
      version: { version: 1, markdown: '# Hi', createdAt, originatedBy: 'agent' },
    },
    {
      kind: 'workflow-state',
      at: transitionAt,
      workflowId: 'wf-1',
      from: 'open',
      to: 'in-review',
    },
    { kind: 'annotation', at: annotationAt, annotation },
  ];
  return { workflow: updatedWorkflow, history, annotation };
}

function writeJsonl(path: string, records: unknown[]): void {
  writeFileSync(path, records.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf-8');
}

function seedLegacyFiles(
  rootDir: string,
  workflows: DraftWorkflowItem[],
  history: DraftHistoryEntry[],
): void {
  writeJsonl(join(rootDir, PIPELINE_SOURCE), workflows);
  writeJsonl(join(rootDir, HISTORY_SOURCE), history);
}

describe('migrate-journal — first run', () => {
  it('fans out pipeline and history into per-entry JSON files', () => {
    const { workflow, history } = buildFixture();
    // Pipeline had two snapshots (initial + transition); dedup to latest.
    const initial: DraftWorkflowItem = { ...workflow, state: 'open', updatedAt: workflow.createdAt };
    seedLegacyFiles(root, [initial, workflow], history);

    const result = runMigration(root);

    expect(result.dryRun).toBe(false);
    expect(result.alreadyMigrated).toBe(false);
    expect(result.pipeline.recordsRead).toBe(2);
    expect(result.pipeline.recordsWritten).toBe(1); // deduped
    expect(result.history.recordsRead).toBe(history.length);
    expect(result.history.recordsWritten).toBe(history.length);

    const pipelineFiles = readdirSync(join(root, PIPELINE_TARGET));
    expect(pipelineFiles.filter(f => f.endsWith('.json'))).toHaveLength(1);

    const historyFiles = readdirSync(join(root, HISTORY_TARGET));
    expect(historyFiles.filter(f => f.endsWith('.json'))).toHaveLength(history.length);

    expect(existsSync(join(root, JOURNAL_ROOT, RECEIPT_FILENAME))).toBe(true);
  });

  it('round-trips: readWorkflows / readHistory after migration match original records', () => {
    const { workflow, history } = buildFixture();
    const initial: DraftWorkflowItem = { ...workflow, state: 'open', updatedAt: workflow.createdAt };
    seedLegacyFiles(root, [initial, workflow], history);

    runMigration(root);

    const workflows = readWorkflows(root);
    expect(workflows).toHaveLength(1);
    expect(workflows[0]).toEqual(workflow);

    const readBack = readHistory(root);
    expect(readBack).toHaveLength(history.length);
    // readHistory sorts oldest-first by envelope.timestamp = entry.at.
    expect(readBack).toEqual(history);
  });

  it('writes a receipt with byte counts and migrated counts', () => {
    const { workflow, history } = buildFixture();
    seedLegacyFiles(root, [workflow], history);
    const pipelineBytes = readFileSync(join(root, PIPELINE_SOURCE)).byteLength;
    const historyBytes = readFileSync(join(root, HISTORY_SOURCE)).byteLength;

    runMigration(root);

    const receipt = readFileSync(join(root, JOURNAL_ROOT, RECEIPT_FILENAME), 'utf-8');
    expect(receipt).toContain(`sourceBytes   ${pipelineBytes}`);
    expect(receipt).toContain(`sourceBytes   ${historyBytes}`);
  });
});

describe('migrate-journal — idempotence', () => {
  it('second run is a no-op: existing journal files untouched, counts re-verified', () => {
    const { workflow, history } = buildFixture();
    seedLegacyFiles(root, [workflow], history);

    runMigration(root);

    // Capture on-disk state after first run.
    const pipelineDir = join(root, PIPELINE_TARGET);
    const historyDir = join(root, HISTORY_TARGET);
    const firstRunFiles = new Map<string, string>();
    for (const f of readdirSync(pipelineDir)) {
      firstRunFiles.set(`p/${f}`, readFileSync(join(pipelineDir, f), 'utf-8'));
    }
    for (const f of readdirSync(historyDir)) {
      firstRunFiles.set(`h/${f}`, readFileSync(join(historyDir, f), 'utf-8'));
    }

    const second = runMigration(root);
    expect(second.alreadyMigrated).toBe(true);
    // recordsWritten stays 0 on a re-verification pass because we skipped writes.
    expect(second.pipeline.recordsWritten).toBe(0);
    expect(second.history.recordsWritten).toBe(0);
    // But we still read the sources so counts can be inspected.
    expect(second.pipeline.recordsRead).toBe(1);
    expect(second.history.recordsRead).toBe(history.length);

    // On-disk state is unchanged.
    for (const f of readdirSync(pipelineDir)) {
      expect(readFileSync(join(pipelineDir, f), 'utf-8')).toBe(firstRunFiles.get(`p/${f}`));
    }
    for (const f of readdirSync(historyDir)) {
      expect(readFileSync(join(historyDir, f), 'utf-8')).toBe(firstRunFiles.get(`h/${f}`));
    }
  });
});

describe('migrate-journal — dry run', () => {
  it('writes no files and creates no receipt', () => {
    const { workflow, history } = buildFixture();
    seedLegacyFiles(root, [workflow], history);

    const result = runMigration(root, { dryRun: true });

    expect(result.dryRun).toBe(true);
    expect(result.pipeline.recordsRead).toBe(1);
    expect(result.history.recordsRead).toBe(history.length);

    expect(existsSync(join(root, PIPELINE_TARGET))).toBe(false);
    expect(existsSync(join(root, HISTORY_TARGET))).toBe(false);
    expect(existsSync(join(root, JOURNAL_ROOT, RECEIPT_FILENAME))).toBe(false);
  });

  it('returns zero counts when legacy files are missing', () => {
    const result = runMigration(root);
    expect(result.pipeline.sourceExists).toBe(false);
    expect(result.pipeline.recordsRead).toBe(0);
    expect(result.history.sourceExists).toBe(false);
    expect(result.history.recordsRead).toBe(0);
    // A run against an empty repo still writes a receipt so subsequent
    // runs short-circuit.
    expect(existsSync(join(root, JOURNAL_ROOT, RECEIPT_FILENAME))).toBe(true);
  });

  it('skips malformed JSONL lines', () => {
    writeFileSync(
      join(root, PIPELINE_SOURCE),
      'this is not json\n{"partial":\n',
      'utf-8',
    );
    writeFileSync(join(root, HISTORY_SOURCE), '', 'utf-8');

    const result = runMigration(root);
    expect(result.pipeline.recordsRead).toBe(0);
    expect(result.pipeline.skipped).toBe(0);
  });
});

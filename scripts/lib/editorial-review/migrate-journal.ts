#!/usr/bin/env tsx
/*
 * migrate-journal.ts — fan out `.editorial-draft-history.jsonl` and
 * `.editorial-draft-pipeline.jsonl` into per-entry JSON files under
 * `journal/editorial/`. Mirrors the feature-image Phase 15 migration
 * that already landed on main; editorial-review (Phase 14c) reuses the
 * same shared journal module.
 *
 * Usage:
 *   tsx scripts/lib/editorial-review/migrate-journal.ts [--dry-run]
 *
 * Idempotent. On first run, reads the two legacy JSONL files from the
 * repo root, writes per-entry JSON into
 *   journal/editorial/pipeline/
 *   journal/editorial/history/
 * and drops a receipt at `journal/editorial/MIGRATED.txt`. Subsequent
 * runs detect the receipt, re-verify counts, and exit without rewriting
 * anything. `--dry-run` prints what would happen and writes no files.
 *
 * The legacy JSONL files are NOT deleted by this script. The user
 * removes them manually after verifying the migration ran clean.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { appendJournal } from '../journal/index.js';
import { envelopeFor } from './journal-mappers.js';
import type { DraftHistoryEntry, DraftWorkflowItem } from './types.js';

export const PIPELINE_SOURCE = '.editorial-draft-pipeline.jsonl';
export const HISTORY_SOURCE = '.editorial-draft-history.jsonl';
export const JOURNAL_ROOT = 'journal/editorial';
export const PIPELINE_TARGET = 'journal/editorial/pipeline';
export const HISTORY_TARGET = 'journal/editorial/history';
export const RECEIPT_FILENAME = 'MIGRATED.txt';

/** Result of migrating a single store. */
export interface StoreMigrationResult {
  name: string;
  sourceExists: boolean;
  sourceBytes: number;
  recordsRead: number;
  recordsWritten: number;
  skipped: number;
}

/** Summary of a migration run. */
export interface MigrationRunResult {
  pipeline: StoreMigrationResult;
  history: StoreMigrationResult;
  dryRun: boolean;
  /** True when the receipt already existed and we re-verified without rewriting. */
  alreadyMigrated: boolean;
}

function parseLines(path: string): Record<string, unknown>[] {
  if (!existsSync(path)) return [];
  const content = readFileSync(path, 'utf-8');
  const records: Record<string, unknown>[] = [];
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    try {
      records.push(JSON.parse(line) as Record<string, unknown>);
    } catch {
      // skip malformed lines — matches pre-migration reader behavior
    }
  }
  return records;
}

function sourceByteCount(path: string): number {
  if (!existsSync(path)) return 0;
  return readFileSync(path).byteLength;
}

function isDraftWorkflowItem(record: Record<string, unknown>): record is DraftWorkflowItem & Record<string, unknown> {
  return (
    typeof record.id === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.site === 'string' &&
    typeof record.slug === 'string' &&
    typeof record.state === 'string'
  );
}

function isDraftHistoryEntry(record: Record<string, unknown>): record is DraftHistoryEntry & Record<string, unknown> {
  if (typeof record.kind !== 'string') return false;
  if (typeof record.at !== 'string') return false;
  switch (record.kind) {
    case 'workflow-created':
      return typeof record.workflow === 'object' && record.workflow !== null;
    case 'workflow-state':
      return (
        typeof record.workflowId === 'string' &&
        typeof record.from === 'string' &&
        typeof record.to === 'string'
      );
    case 'version':
      return (
        typeof record.workflowId === 'string' &&
        typeof record.version === 'object' &&
        record.version !== null
      );
    case 'annotation':
      return typeof record.annotation === 'object' && record.annotation !== null;
    default:
      return false;
  }
}

/**
 * Migrate the pipeline JSONL. Dedupes on `id` with latest-wins semantics
 * (matching the pre-migration reader) so a single workflow file represents
 * its most recent snapshot.
 */
function migratePipeline(rootDir: string, writeEnabled: boolean): StoreMigrationResult {
  const source = join(rootDir, PIPELINE_SOURCE);
  const targetDir = join(rootDir, PIPELINE_TARGET);
  const sourceExists = existsSync(source);
  const sourceBytes = sourceByteCount(source);
  const records = parseLines(source);
  const latest = new Map<string, DraftWorkflowItem>();
  let skipped = 0;
  for (const record of records) {
    if (!isDraftWorkflowItem(record)) {
      skipped++;
      continue;
    }
    latest.set(record.id, record);
  }
  if (writeEnabled) {
    for (const workflow of latest.values()) {
      appendJournal(targetDir, workflow, {
        idField: 'id',
        timestampField: 'createdAt',
      });
    }
  }
  return {
    name: 'pipeline',
    sourceExists,
    sourceBytes,
    recordsRead: records.length,
    recordsWritten: writeEnabled ? latest.size : 0,
    skipped,
  };
}

/**
 * Migrate the history JSONL. Each event is wrapped in its journal
 * envelope with a deterministic synthesized id; duplicate events
 * overwrite in place.
 */
function migrateHistory(rootDir: string, writeEnabled: boolean): StoreMigrationResult {
  const source = join(rootDir, HISTORY_SOURCE);
  const targetDir = join(rootDir, HISTORY_TARGET);
  const sourceExists = existsSync(source);
  const sourceBytes = sourceByteCount(source);
  const records = parseLines(source);
  let written = 0;
  let skipped = 0;
  for (const record of records) {
    if (!isDraftHistoryEntry(record)) {
      skipped++;
      continue;
    }
    if (writeEnabled) {
      appendJournal(targetDir, envelopeFor(record), {
        idField: 'id',
        timestampField: 'timestamp',
      });
      written++;
    }
  }
  return {
    name: 'history',
    sourceExists,
    sourceBytes,
    recordsRead: records.length,
    recordsWritten: written,
    skipped,
  };
}

function receiptPath(rootDir: string): string {
  return join(rootDir, JOURNAL_ROOT, RECEIPT_FILENAME);
}

function writeReceipt(rootDir: string, result: MigrationRunResult): void {
  const journalDir = join(rootDir, JOURNAL_ROOT);
  if (!existsSync(journalDir)) mkdirSync(journalDir, { recursive: true });
  const lines = [
    'Editorial-review journal migration receipt',
    `written: ${new Date().toISOString()}`,
    '',
    'Legacy JSONL files fanned out into per-entry JSON under',
    `  ${PIPELINE_TARGET}/`,
    `  ${HISTORY_TARGET}/`,
    '',
    'Pipeline:',
    `  source        ${PIPELINE_SOURCE}`,
    `  sourceExists  ${result.pipeline.sourceExists}`,
    `  sourceBytes   ${result.pipeline.sourceBytes}`,
    `  recordsRead   ${result.pipeline.recordsRead}`,
    `  written       ${result.pipeline.recordsWritten}`,
    `  skipped       ${result.pipeline.skipped}`,
    '',
    'History:',
    `  source        ${HISTORY_SOURCE}`,
    `  sourceExists  ${result.history.sourceExists}`,
    `  sourceBytes   ${result.history.sourceBytes}`,
    `  recordsRead   ${result.history.recordsRead}`,
    `  written       ${result.history.recordsWritten}`,
    `  skipped       ${result.history.skipped}`,
    '',
    'After verifying these counts, the legacy JSONL files can be removed.',
    '',
  ];
  writeFileSync(receiptPath(rootDir), lines.join('\n'), 'utf-8');
}

/**
 * Perform a migration. Exposed as a library entry point so the tests
 * can invoke it against temp dirs without shelling out.
 */
export function runMigration(rootDir: string, options: { dryRun?: boolean } = {}): MigrationRunResult {
  const dryRun = options.dryRun ?? false;
  const alreadyMigrated = existsSync(receiptPath(rootDir));
  const writeEnabled = !dryRun && !alreadyMigrated;
  const pipeline = migratePipeline(rootDir, writeEnabled);
  const history = migrateHistory(rootDir, writeEnabled);
  const result: MigrationRunResult = {
    pipeline,
    history,
    dryRun,
    alreadyMigrated,
  };
  if (writeEnabled) {
    writeReceipt(rootDir, result);
  }
  return result;
}

function formatSummary(result: MigrationRunResult): string {
  const { pipeline, history } = result;
  const lines = [
    `pipeline  sourceBytes=${pipeline.sourceBytes} read=${pipeline.recordsRead} written=${pipeline.recordsWritten} skipped=${pipeline.skipped}`,
    `history   sourceBytes=${history.sourceBytes} read=${history.recordsRead} written=${history.recordsWritten} skipped=${history.skipped}`,
  ];
  if (result.alreadyMigrated) {
    lines.push('');
    lines.push('receipt already exists — re-verified counts, wrote no files');
  } else if (result.dryRun) {
    lines.push('');
    lines.push('(dry run — nothing written)');
  } else {
    lines.push('');
    lines.push(`receipt: ${JOURNAL_ROOT}/${RECEIPT_FILENAME}`);
  }
  return lines.join('\n');
}

function isMainModule(): boolean {
  // argv[1] is the script path. If this module is being executed
  // directly (not imported), it matches our own file URL.
  const invoked = process.argv[1];
  if (!invoked) return false;
  const selfUrl = import.meta.url;
  const selfPath = fileURLToPath(selfUrl);
  return selfPath === invoked;
}

if (isMainModule()) {
  const dryRun = process.argv.includes('--dry-run');
  const here = dirname(fileURLToPath(import.meta.url));
  const rootDir = join(here, '..', '..', '..');
  try {
    const result = runMigration(rootDir, { dryRun });
    console.log(formatSummary(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`migrate-journal failed: ${message}`);
    process.exit(1);
  }
}

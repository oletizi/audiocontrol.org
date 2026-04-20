#!/usr/bin/env tsx
/*
 * migrate-journal.ts — fan out the three JSONL logs into per-entry JSON
 * files under `journal/`. Idempotent: running twice is safe because each
 * record writes to a deterministic filename and the writer overwrites in
 * place.
 *
 * Usage:
 *   tsx scripts/feature-image/migrate-journal.ts [--dry-run]
 *
 * After a clean run, the three `.feature-image-*.jsonl` files can be
 * deleted (the rewired readers no longer consult them). The migration
 * produces `journal/MIGRATED.txt` with per-store counts as a receipt.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { appendJournal } from './journal.js';

const here = dirname(fileURLToPath(import.meta.url));
const rootDir = join(here, '..', '..');

interface StoreConfig {
  name: string;
  source: string;
  targetDir: string;
  idField: string;
  timestampField: string;
  /**
   * Some stores (thread messages) don't carry a unique id. Build one
   * synthetically from the record before appending.
   */
  synthesizeId?: (record: Record<string, unknown>) => string;
}

const stores: StoreConfig[] = [
  {
    name: 'history',
    source: join(rootDir, '.feature-image-history.jsonl'),
    targetDir: join(rootDir, 'journal', 'history'),
    idField: 'id',
    timestampField: 'timestamp',
  },
  {
    name: 'pipeline',
    source: join(rootDir, '.feature-image-pipeline.jsonl'),
    targetDir: join(rootDir, 'journal', 'pipeline'),
    idField: 'id',
    timestampField: 'createdAt',
  },
  {
    name: 'threads',
    source: join(rootDir, '.feature-image-threads.jsonl'),
    targetDir: join(rootDir, 'journal', 'threads'),
    idField: 'messageId',
    timestampField: 'timestamp',
    // Thread messages had no id in the JSONL era. Generate a uuid when
    // one's missing; subsequent migration runs preserve it via
    // overwrite-in-place (see appendJournal → findFileById).
    synthesizeId: (record) => {
      const existing = record.messageId;
      if (typeof existing === 'string' && existing) return existing;
      return randomUUID();
    },
  },
];

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
      // skip malformed
    }
  }
  return records;
}

interface MigrationResult {
  name: string;
  sourceExists: boolean;
  recordsRead: number;
  recordsWritten: number;
  skipped: number;
}

function migrateOne(store: StoreConfig, dryRun: boolean): MigrationResult {
  const sourceExists = existsSync(store.source);
  const records = parseLines(store.source);
  let written = 0;
  let skipped = 0;
  for (const record of records) {
    if (store.synthesizeId) {
      const id = store.synthesizeId(record);
      record[store.idField] = id;
    }
    if (!record[store.idField]) {
      skipped++;
      continue;
    }
    if (!record[store.timestampField]) {
      skipped++;
      continue;
    }
    if (!dryRun) {
      appendJournal(store.targetDir, record, {
        idField: store.idField,
        timestampField: store.timestampField,
      });
    }
    written++;
  }
  return {
    name: store.name,
    sourceExists,
    recordsRead: records.length,
    recordsWritten: written,
    skipped,
  };
}

function writeReceipt(results: MigrationResult[]): void {
  const receiptPath = join(rootDir, 'journal', 'MIGRATED.txt');
  const lines = [
    `# Journal migration — ${new Date().toISOString()}`,
    '',
    'Each store fanned out from its legacy JSONL into per-entry JSON files.',
    '',
    ...results.map((r) => {
      const src = r.sourceExists ? r.recordsRead : 'missing';
      return `- ${r.name.padEnd(10)} read=${src} written=${r.recordsWritten} skipped=${r.skipped}`;
    }),
    '',
    'Once every reader is rewired to the journal/ directory, the source',
    '.feature-image-*.jsonl files can be deleted.',
    '',
  ];
  writeFileSync(receiptPath, lines.join('\n'), 'utf-8');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const results = stores.map((s) => migrateOne(s, dryRun));
  for (const r of results) {
    const src = r.sourceExists ? String(r.recordsRead) : '(no source)';
    console.log(
      `${r.name.padEnd(10)} read=${src} written=${r.recordsWritten} skipped=${r.skipped}`,
    );
  }
  if (!dryRun) {
    writeReceipt(results);
    console.log(`\nreceipt: journal/MIGRATED.txt`);
  } else {
    console.log('\n(dry run — nothing written)');
  }
}

main().catch((err) => {
  console.error(`migrate-journal failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

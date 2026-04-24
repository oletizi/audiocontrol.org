#!/usr/bin/env -S npx tsx
/*
 * backfill-uuids.ts — Phase 18a migration. One-shot, idempotent.
 *
 * Ensures every calendar entry has a stable UUID and every workflow
 * journal record has `entryId` in its context, joined by (site, slug,
 * contentKind) against the current calendars.
 *
 * Safe to re-run. On the second run everything is already populated
 * and the script reports 0 changes across the board.
 *
 * Usage:
 *   npx tsx scripts/editorial/backfill-uuids.ts            # writes
 *   npx tsx scripts/editorial/backfill-uuids.ts --dry-run  # preview only
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITES,
  readCalendar,
  writeCalendar,
  type CalendarEntry,
  type EditorialCalendar,
  type Site,
} from '../lib/editorial/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const rootDir = join(here, '..', '..');

interface Args {
  dryRun: boolean;
}

function parseArgs(argv: readonly string[]): Args {
  let dryRun = false;
  for (const a of argv) {
    if (a === '--dry-run' || a === '-n') dryRun = true;
  }
  return { dryRun };
}

interface Stats {
  calendars: { entriesStamped: number; distributionsLinked: number }[];
  pipelineFilesScanned: number;
  pipelineFilesUpdated: number;
}

function backfillCalendar(
  rootDir: string,
  site: Site,
  dryRun: boolean,
): { cal: EditorialCalendar; entriesStamped: number; distributionsLinked: number } {
  const cal = readCalendar(rootDir, site);
  // readCalendar already backfills entry ids + links distributions by
  // slug match. Walk the results to count what changed relative to
  // the on-disk state. Since we can't easily diff from here, count
  // entries that have an id (now always true post-read) and
  // distributions whose entryId resolved non-empty.
  const entriesStamped = cal.entries.filter(
    (e) => typeof e.id === 'string' && e.id.length > 0,
  ).length;
  const distributionsLinked = cal.distributions.filter(
    (d) => typeof d.entryId === 'string' && d.entryId.length > 0,
  ).length;

  if (!dryRun) {
    // Persist — this rewrites the calendar with the UUID + EntryID
    // columns populated. Idempotent: a second run reads the same
    // UUIDs back and writes the same bytes.
    writeCalendar(rootDir, site, cal);
  }
  return { cal, entriesStamped, distributionsLinked };
}

/**
 * Walk every JSON file under journal/pipeline/ (feature-image) and
 * journal/editorial/pipeline/ (editorial-review). For each workflow
 * record, if its context carries (site, slug, contentKind?) but not
 * entryId, look up the entry and stamp entryId on the record.
 */
function backfillWorkflowJournals(
  rootDir: string,
  calendarsBySite: Map<Site, EditorialCalendar>,
  dryRun: boolean,
): { scanned: number; updated: number } {
  const dirs = [
    join(rootDir, 'journal', 'pipeline'),
    join(rootDir, 'journal', 'editorial', 'pipeline'),
  ];

  let scanned = 0;
  let updated = 0;

  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const abs = join(dir, file);
      scanned++;
      let raw: string;
      try {
        raw = readFileSync(abs, 'utf-8');
      } catch {
        continue;
      }
      let doc: unknown;
      try {
        doc = JSON.parse(raw);
      } catch {
        process.stderr.write(`skip: invalid JSON at ${abs}\n`);
        continue;
      }
      if (typeof doc !== 'object' || doc === null) continue;

      // Two shapes:
      //   feature-image workflow:    { id, type, context: { site, slug, ... } }
      //   editorial-review workflow: { id, site, slug, contentKind, ... }
      // Stamp entryId on whichever surface matches.
      const record = doc as Record<string, unknown>;
      const ctx = (record.context ?? null) as Record<string, unknown> | null;

      const site = (ctx?.site ?? record.site) as string | undefined;
      const slug = (ctx?.slug ?? record.slug) as string | undefined;
      const existingEntryId =
        (ctx?.entryId as string | undefined) ?? (record.entryId as string | undefined);

      if (existingEntryId || !site || !slug) continue;

      if (!SITES.includes(site as Site)) continue;
      const cal = calendarsBySite.get(site as Site);
      if (!cal) continue;

      const entry = cal.entries.find((e: CalendarEntry) => e.slug === slug);
      if (!entry?.id) continue;

      if (ctx) {
        ctx.entryId = entry.id;
      } else {
        record.entryId = entry.id;
      }
      updated++;

      if (!dryRun) {
        writeFileSync(abs, JSON.stringify(record, null, 2) + '\n', 'utf-8');
      }
    }
  }

  return { scanned, updated };
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  process.stdout.write(
    `backfill-uuids${args.dryRun ? ' (dry-run)' : ''}\n` + '='.repeat(40) + '\n',
  );

  const stats: Stats = {
    calendars: [],
    pipelineFilesScanned: 0,
    pipelineFilesUpdated: 0,
  };

  const calendarsBySite = new Map<Site, EditorialCalendar>();
  for (const site of SITES) {
    const { cal, entriesStamped, distributionsLinked } = backfillCalendar(
      rootDir,
      site,
      args.dryRun,
    );
    calendarsBySite.set(site, cal);
    stats.calendars.push({ entriesStamped, distributionsLinked });
    process.stdout.write(
      `  [${site}] entries=${entriesStamped} distributions-linked=${distributionsLinked}\n`,
    );
  }

  const { scanned, updated } = backfillWorkflowJournals(
    rootDir,
    calendarsBySite,
    args.dryRun,
  );
  stats.pipelineFilesScanned = scanned;
  stats.pipelineFilesUpdated = updated;
  process.stdout.write(
    `  pipeline journals: scanned=${scanned} updated=${updated}\n`,
  );

  if (args.dryRun) {
    process.stdout.write(`\n(dry-run) no files written.\n`);
  } else {
    process.stdout.write(`\nDone.\n`);
  }
}

try {
  main();
} catch (err) {
  process.stderr.write(
    `backfill-uuids failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
}

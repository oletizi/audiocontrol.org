/**
 * One-shot migration: legacy calendar.md tables → per-entry sidecars
 * at `.deskwork/entries/<uuid>.json` (the v0.16.0 source-of-truth).
 *
 * Workaround for deskwork#218 — the doctor rule MIGRATING.md says ships
 * with v0.16.0 isn't actually registered. This script does what
 * `deskwork doctor --fix=all` claims to do.
 *
 * Usage:
 *   tsx scripts/migrate-calendar-to-sidecars.ts            # dry-run
 *   tsx scripts/migrate-calendar-to-sidecars.ts --apply    # write sidecars
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const PROJECT_ROOT = process.cwd();
const ENTRIES_DIR = join(PROJECT_ROOT, '.deskwork', 'entries');
const CONFIG_PATH = join(PROJECT_ROOT, '.deskwork', 'config.json');

type Stage =
  | 'Ideas'
  | 'Planned'
  | 'Outlining'
  | 'Drafting'
  | 'Final'
  | 'Published'
  | 'Blocked'
  | 'Cancelled';

const LEGACY_STAGE_MAP: Record<string, Stage | null> = {
  Ideas: 'Ideas',
  Planned: 'Planned',
  Outlining: 'Outlining',
  Drafting: 'Drafting',
  Final: 'Final',
  Published: 'Published',
  Blocked: 'Blocked',
  Paused: 'Blocked',
  Cancelled: 'Cancelled',
  Review: null,
  Distribution: null,
};

interface Entry {
  uuid: string;
  slug: string;
  title: string;
  description?: string;
  keywords: string[];
  source: string;
  currentStage: Stage;
  iterationByStage: Record<string, number>;
  datePublished?: string;
  artifactPath?: string;
  createdAt: string;
  updatedAt: string;
}

interface SiteConfig {
  contentDir: string;
  calendarPath: string;
}

interface ParsedRow {
  cells: Record<string, string>;
  uuid: string;
}

function loadConfig(): Record<string, SiteConfig> {
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  return config.sites;
}

function splitSections(md: string): Array<{ name: string; body: string }> {
  const re = /^## (\w+)\s*$/gm;
  const matches = [...md.matchAll(re)];
  const out: Array<{ name: string; body: string }> = [];
  for (let i = 0; i < matches.length; i++) {
    const start = (matches[i].index ?? 0) + matches[i][0].length;
    const end = matches[i + 1]?.index ?? md.length;
    out.push({ name: matches[i][1], body: md.slice(start, end) });
  }
  return out;
}

function parseTable(body: string): ParsedRow[] {
  const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
  const headerLine = lines.find((l) => l.startsWith('| UUID'));
  if (!headerLine) return [];

  const headers = headerLine
    .split('|')
    .slice(1, -1)
    .map((h) => h.trim());

  const rows: ParsedRow[] = [];
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.startsWith('|---') || line.startsWith('| UUID')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 3) continue;
    if (!/^[0-9a-f-]{36}$/i.test(cells[0])) continue;

    const cellMap: Record<string, string> = {};
    headers.forEach((h, idx) => {
      cellMap[h] = cells[idx] ?? '';
    });
    rows.push({ cells: cellMap, uuid: cells[0] });
  }
  return rows;
}

function parseKeywords(s: string): string[] {
  return s
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

function findArtifactPath(contentDir: string, slug: string): string | undefined {
  const file = join(PROJECT_ROOT, contentDir, slug, 'index.md');
  if (existsSync(file)) return `${contentDir}/${slug}/index.md`;
  return undefined;
}

function buildEntry(
  row: ParsedRow,
  stage: Stage,
  contentDir: string,
  now: string,
): Entry {
  const cells = row.cells;
  const slug = cells.Slug ?? '';
  const title = cells.Title ?? '';
  const description = cells.Description?.trim() || undefined;
  const keywords = parseKeywords(cells.Keywords ?? '');
  const source = cells.Source?.trim() || 'manual';

  const entry: Entry = {
    uuid: row.uuid,
    slug,
    title,
    keywords,
    source,
    currentStage: stage,
    iterationByStage: {},
    createdAt: now,
    updatedAt: now,
  };

  if (description) entry.description = description;

  if (stage === 'Published' && cells.Published) {
    const date = cells.Published.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      entry.datePublished = `${date}T00:00:00.000Z`;
    }
  }

  const artifact = findArtifactPath(contentDir, slug);
  if (artifact) entry.artifactPath = artifact;

  return entry;
}

function migrate(): void {
  const { values } = parseArgs({
    options: {
      apply: { type: 'boolean', default: false },
    },
    strict: true,
  });
  const apply = values.apply ?? false;

  const sites = loadConfig();
  const now = new Date().toISOString();
  const entries: Entry[] = [];
  const droppedRows: Array<{ site: string; section: string; uuid: string; slug: string }> = [];

  for (const [siteName, site] of Object.entries(sites)) {
    const calendarPath = join(PROJECT_ROOT, site.calendarPath);
    if (!existsSync(calendarPath)) {
      console.error(`! ${siteName}: ${site.calendarPath} not found, skipping`);
      continue;
    }
    const md = readFileSync(calendarPath, 'utf-8');
    const sections = splitSections(md);

    for (const { name, body } of sections) {
      const stage = LEGACY_STAGE_MAP[name];
      const rows = parseTable(body);

      if (stage === null) {
        for (const r of rows) {
          droppedRows.push({ site: siteName, section: name, uuid: r.uuid, slug: r.cells.Slug ?? '' });
        }
        continue;
      }
      if (stage === undefined) continue;

      for (const r of rows) {
        entries.push(buildEntry(r, stage, site.contentDir, now));
      }
    }
  }

  console.log(`Found ${entries.length} entries across ${Object.keys(sites).length} site(s).`);
  console.log();

  const byStage: Record<string, Entry[]> = {};
  for (const e of entries) {
    (byStage[e.currentStage] ??= []).push(e);
  }
  for (const stage of [
    'Ideas',
    'Planned',
    'Outlining',
    'Drafting',
    'Final',
    'Published',
    'Blocked',
    'Cancelled',
  ]) {
    const list = byStage[stage] ?? [];
    if (list.length === 0) continue;
    console.log(`  ${stage} (${list.length}):`);
    for (const e of list) {
      const path = e.artifactPath ? '  [bound]' : '  [no file]';
      console.log(`    - ${e.slug}${path}`);
    }
  }

  if (droppedRows.length > 0) {
    console.log();
    console.log(`Dropped ${droppedRows.length} row(s) from sections that map to null:`);
    for (const d of droppedRows) {
      console.log(`  - [${d.site}] ${d.section} → ${d.slug} (${d.uuid})`);
    }
  }

  console.log();
  console.log(`Sidecars target: ${ENTRIES_DIR}`);
  if (existsSync(ENTRIES_DIR)) {
    const existing = readdirSync(ENTRIES_DIR).filter((f) => f.endsWith('.json'));
    console.log(`Existing sidecars in dir: ${existing.length}`);
  } else {
    console.log(`Existing sidecars in dir: 0 (dir does not exist)`);
  }

  if (!apply) {
    console.log();
    console.log('DRY RUN — no files written. Re-run with --apply to write sidecars.');
    return;
  }

  console.log();
  console.log(`Writing ${entries.length} sidecar(s)...`);
  if (!existsSync(ENTRIES_DIR)) mkdirSync(ENTRIES_DIR, { recursive: true });
  for (const e of entries) {
    const target = join(ENTRIES_DIR, `${e.uuid}.json`);
    writeFileSync(target, JSON.stringify(e, null, 2) + '\n');
  }
  console.log(`Wrote ${entries.length} sidecar(s) to ${ENTRIES_DIR}`);
}

migrate();

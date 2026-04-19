/**
 * Markdown editorial calendar parser and writer.
 *
 * Each site has its own calendar at `docs/editorial-calendar-<site>.md` — a
 * human-readable markdown file with one table per stage. This module
 * round-trips between that format and the in-memory EditorialCalendar type.
 *
 * ## Markdown format
 *
 * ```markdown
 * # Editorial Calendar
 *
 * ## Ideas
 *
 * | Slug | Title | Description | Keywords | Source |
 * |------|-------|-------------|----------|--------|
 * | my-post | My Post | A post about things | kw1, kw2 | manual |
 *
 * ## Planned
 * ...
 *
 * ## Published
 *
 * | Slug | Title | Description | Keywords | Source | Published | Issue |
 * |------|-------|-------------|----------|--------|-----------|-------|
 * ```
 *
 * Published entries have two extra columns: Published (date) and Issue (#number).
 * All other stages share the base 5-column format, plus an optional Issue column
 * for entries in Drafting/Review.
 */

import { readFileSync, writeFileSync } from 'fs';
import {
  PLATFORMS,
  STAGES,
  effectiveContentType,
  isContentType,
  type CalendarEntry,
  type ContentType,
  type DistributionRecord,
  type EditorialCalendar,
  type Platform,
  type Site,
  type Stage,
} from './types.js';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

export function calendarPath(rootDir: string, site: Site): string {
  return `${rootDir}/docs/editorial-calendar-${site}.md`;
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/** Parse a pipe-delimited table row into trimmed cell values. */
function parseRow(line: string): string[] {
  return line
    .split('|')
    .slice(1, -1) // drop leading/trailing empty segments
    .map((cell) => cell.trim());
}

/** True if the line is a markdown table separator (e.g. |---|---|). */
function isSeparator(line: string): boolean {
  return /^\|[\s:-]+\|/.test(line);
}

function isStage(name: string): name is Stage {
  return (STAGES as readonly string[]).includes(name);
}

function isPlatform(value: string): value is Platform {
  return (PLATFORMS as readonly string[]).includes(value);
}

/** Build a column-name → index map from a table header row. */
function indexColumns(headerLine: string): Map<string, number> {
  const map = new Map<string, number>();
  parseRow(headerLine).forEach((name, idx) => {
    map.set(name.trim().toLowerCase(), idx);
  });
  return map;
}

/** Get the trimmed value from a row by column name, or undefined. */
function col(
  cells: string[],
  cols: Map<string, number>,
  name: string,
): string | undefined {
  const idx = cols.get(name);
  if (idx === undefined) return undefined;
  const value = cells[idx];
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function parseEntries(lines: string[], stage: Stage): CalendarEntry[] {
  const entries: CalendarEntry[] = [];

  let i = 0;
  while (i < lines.length && !lines[i].startsWith('|')) i++;
  if (i >= lines.length) return entries;

  const cols = indexColumns(lines[i]);
  i++; // skip header
  if (i < lines.length && isSeparator(lines[i])) i++;

  while (i < lines.length && lines[i].startsWith('|')) {
    const cells = parseRow(lines[i]);
    const slug = col(cells, cols, 'slug');
    const title = col(cells, cols, 'title');
    if (slug && title) {
      const entry: CalendarEntry = {
        slug,
        title,
        description: col(cells, cols, 'description') ?? '',
        stage,
        targetKeywords: (col(cells, cols, 'keywords') ?? '')
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
        source: col(cells, cols, 'source') === 'analytics' ? 'analytics' : 'manual',
      };

      const topics = col(cells, cols, 'topics');
      if (topics) {
        entry.topics = topics.split(',').map((t) => t.trim()).filter(Boolean);
      }

      const typeValue = col(cells, cols, 'type');
      if (typeValue && isContentType(typeValue)) {
        entry.contentType = typeValue;
      }

      const url = col(cells, cols, 'url');
      if (url) entry.contentUrl = url;

      const published = col(cells, cols, 'published');
      if (published) entry.datePublished = published;

      const issue = col(cells, cols, 'issue');
      if (issue) {
        const match = issue.match(/#?(\d+)/);
        if (match) entry.issueNumber = parseInt(match[1], 10);
      }

      entries.push(entry);
    }
    i++;
  }
  return entries;
}

function parseDistributions(lines: string[]): DistributionRecord[] {
  const records: DistributionRecord[] = [];

  let i = 0;
  while (i < lines.length && !lines[i].startsWith('|')) i++;
  if (i >= lines.length) return records;

  const cols = indexColumns(lines[i]);
  i++; // skip header
  if (i < lines.length && isSeparator(lines[i])) i++;

  while (i < lines.length && lines[i].startsWith('|')) {
    const cells = parseRow(lines[i]);
    const slug = col(cells, cols, 'slug');
    const platformValue = col(cells, cols, 'platform');
    const url = col(cells, cols, 'url');
    const dateShared = col(cells, cols, 'shared');

    if (slug && platformValue && url && dateShared && isPlatform(platformValue)) {
      const rec: DistributionRecord = {
        slug,
        platform: platformValue,
        url,
        dateShared,
      };
      const channel = col(cells, cols, 'channel');
      if (channel) rec.channel = channel;
      const notes = col(cells, cols, 'notes');
      if (notes) rec.notes = notes;
      records.push(rec);
    }
    i++;
  }
  return records;
}

type SectionName = Stage | 'Distribution';

/** Parse the editorial calendar markdown file into an EditorialCalendar. */
export function parseCalendar(markdown: string): EditorialCalendar {
  const entries: CalendarEntry[] = [];
  const distributions: DistributionRecord[] = [];
  const lines = markdown.split('\n');

  let currentSection: SectionName | null = null;
  let sectionLines: string[] = [];

  function flushSection() {
    if (currentSection && sectionLines.length > 0) {
      if (currentSection === 'Distribution') {
        distributions.push(...parseDistributions(sectionLines));
      } else {
        entries.push(...parseEntries(sectionLines, currentSection));
      }
    }
    sectionLines = [];
  }

  for (const line of lines) {
    const sectionMatch = line.match(/^## (.+)$/);
    if (sectionMatch) {
      flushSection();
      const name = sectionMatch[1].trim();
      if (isStage(name)) {
        currentSection = name;
      } else if (name === 'Distribution') {
        currentSection = 'Distribution';
      } else {
        currentSection = null;
      }
    } else if (currentSection) {
      sectionLines.push(line);
    }
  }
  flushSection();

  return { entries, distributions };
}

/** Read and parse the editorial calendar from disk. */
export function readCalendar(rootDir: string, site: Site): EditorialCalendar {
  const path = calendarPath(rootDir, site);
  const content = readFileSync(path, 'utf-8');
  return parseCalendar(content);
}

// ---------------------------------------------------------------------------
// Writer
// ---------------------------------------------------------------------------

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|');
}

function renderStageTable(entries: CalendarEntry[], stage: Stage): string {
  const lines: string[] = [];
  const hasIssue = entries.some((e) => e.issueNumber !== undefined);
  const hasTopics = entries.some(
    (e) => e.topics !== undefined && e.topics.length > 0,
  );
  // Emit Type column when any entry is non-blog
  const hasType = entries.some(
    (e) => e.contentType !== undefined && e.contentType !== 'blog',
  );
  // Emit URL column when any entry has a contentUrl
  const hasUrl = entries.some(
    (e) => e.contentUrl !== undefined && e.contentUrl !== '',
  );
  const isPublished = stage === 'Published';

  const headers: string[] = ['Slug', 'Title', 'Description', 'Keywords'];
  if (hasTopics) headers.push('Topics');
  if (hasType) headers.push('Type');
  if (hasUrl) headers.push('URL');
  headers.push('Source');
  if (isPublished) headers.push('Published');
  if (hasIssue || isPublished) headers.push('Issue');

  lines.push(`| ${headers.join(' | ')} |`);
  lines.push(`|${headers.map(() => '------').join('|')}|`);

  for (const e of entries) {
    const row: string[] = [
      escapeCell(e.slug),
      escapeCell(e.title),
      escapeCell(e.description),
      escapeCell(e.targetKeywords.join(', ')),
    ];
    if (hasTopics) row.push(escapeCell((e.topics ?? []).join(', ')));
    if (hasType) row.push(effectiveContentType(e));
    if (hasUrl) row.push(escapeCell(e.contentUrl ?? ''));
    row.push(e.source);
    if (isPublished) row.push(e.datePublished ?? '');
    if (hasIssue || isPublished) row.push(e.issueNumber ? `#${e.issueNumber}` : '');
    lines.push(`| ${row.join(' | ')} |`);
  }

  return lines.join('\n');
}

function renderDistributionTable(records: DistributionRecord[]): string {
  const lines: string[] = [];
  const hasChannel = records.some(
    (r) => r.channel !== undefined && r.channel !== '',
  );

  const headers: string[] = ['Slug', 'Platform', 'URL', 'Shared'];
  if (hasChannel) headers.push('Channel');
  headers.push('Notes');

  lines.push(`| ${headers.join(' | ')} |`);
  lines.push(`|${headers.map(() => '------').join('|')}|`);

  for (const r of records) {
    const row: string[] = [
      escapeCell(r.slug),
      r.platform,
      escapeCell(r.url),
      r.dateShared,
    ];
    if (hasChannel) row.push(escapeCell(r.channel ?? ''));
    row.push(escapeCell(r.notes ?? ''));
    lines.push(`| ${row.join(' | ')} |`);
  }
  return lines.join('\n');
}

/** Render the full editorial calendar as markdown. */
export function renderCalendar(calendar: EditorialCalendar): string {
  const sections: string[] = ['# Editorial Calendar', ''];

  for (const stage of STAGES) {
    const stageEntries = calendar.entries.filter((e) => e.stage === stage);
    sections.push(`## ${stage}`, '');
    if (stageEntries.length > 0) {
      sections.push(renderStageTable(stageEntries, stage));
    } else {
      sections.push('*No entries.*');
    }
    sections.push('');
  }

  sections.push('## Distribution', '');
  if (calendar.distributions.length > 0) {
    sections.push(renderDistributionTable(calendar.distributions));
  } else {
    sections.push('*No entries.*');
  }
  sections.push('');

  return sections.join('\n');
}

/** Write the editorial calendar to disk. */
export function writeCalendar(
  rootDir: string,
  site: Site,
  calendar: EditorialCalendar,
): void {
  const path = calendarPath(rootDir, site);
  writeFileSync(path, renderCalendar(calendar), 'utf-8');
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Add a new entry to the Ideas stage. */
export function addEntry(
  calendar: EditorialCalendar,
  title: string,
  opts?: { description?: string; source?: CalendarEntry['source'] },
): CalendarEntry {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const existing = calendar.entries.find((e) => e.slug === slug);
  if (existing) {
    throw new Error(
      `Entry with slug "${slug}" already exists in stage "${existing.stage}"`,
    );
  }

  const entry: CalendarEntry = {
    slug,
    title,
    description: opts?.description ?? '',
    stage: 'Ideas',
    targetKeywords: [],
    source: opts?.source ?? 'manual',
  };

  calendar.entries.push(entry);
  return entry;
}

/** Move an entry to the Planned stage and set target keywords. */
export function planEntry(
  calendar: EditorialCalendar,
  slug: string,
  keywords: string[],
): CalendarEntry {
  const entry = calendar.entries.find((e) => e.slug === slug);
  if (!entry) {
    throw new Error(`No calendar entry found with slug: ${slug}`);
  }
  if (entry.stage !== 'Ideas') {
    throw new Error(
      `Entry "${slug}" is in stage "${entry.stage}" — must be in Ideas to plan`,
    );
  }
  entry.stage = 'Planned';
  entry.targetKeywords = keywords;
  return entry;
}

/** Move an entry to the Drafting stage and record its GitHub issue. */
export function draftEntry(
  calendar: EditorialCalendar,
  slug: string,
  issueNumber: number,
): CalendarEntry {
  const entry = calendar.entries.find((e) => e.slug === slug);
  if (!entry) {
    throw new Error(`No calendar entry found with slug: ${slug}`);
  }
  if (entry.stage !== 'Planned') {
    throw new Error(
      `Entry "${slug}" is in stage "${entry.stage}" — must be in Planned to draft`,
    );
  }
  entry.stage = 'Drafting';
  entry.issueNumber = issueNumber;
  return entry;
}

/** Mark an entry as Published with today's date. */
export function publishEntry(
  calendar: EditorialCalendar,
  slug: string,
  datePublished?: string,
): CalendarEntry {
  const entry = calendar.entries.find((e) => e.slug === slug);
  if (!entry) {
    throw new Error(`No calendar entry found with slug: ${slug}`);
  }
  entry.stage = 'Published';
  entry.datePublished =
    datePublished ?? new Date().toISOString().slice(0, 10);
  return entry;
}

/** Find an entry by slug. */
export function findEntry(
  calendar: EditorialCalendar,
  slug: string,
): CalendarEntry | undefined {
  return calendar.entries.find((e) => e.slug === slug);
}

/**
 * Append a distribution record for a published post.
 *
 * The referenced calendar entry must exist and be in the Published stage —
 * we don't record shares for posts that haven't shipped yet.
 */
export function addDistribution(
  calendar: EditorialCalendar,
  record: DistributionRecord,
): DistributionRecord {
  const entry = calendar.entries.find((e) => e.slug === record.slug);
  if (!entry) {
    throw new Error(`No calendar entry found with slug: ${record.slug}`);
  }
  if (entry.stage !== 'Published') {
    throw new Error(
      `Entry "${record.slug}" is in stage "${entry.stage}" — must be Published to record a distribution`,
    );
  }
  calendar.distributions.push(record);
  return record;
}

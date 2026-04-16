/**
 * Markdown editorial calendar parser and writer.
 *
 * The calendar lives in `docs/editorial-calendar.md` as a human-readable
 * markdown file with one table per stage. This module round-trips between
 * that format and the in-memory EditorialCalendar type.
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
  STAGES,
  type CalendarEntry,
  type EditorialCalendar,
  type Stage,
} from './types.js';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const CALENDAR_FILENAME = 'docs/editorial-calendar.md';

export function calendarPath(rootDir: string): string {
  return `${rootDir}/${CALENDAR_FILENAME}`;
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

function parseEntries(lines: string[], stage: Stage): CalendarEntry[] {
  const entries: CalendarEntry[] = [];

  // Find the header row — first table row after the stage heading
  let i = 0;
  while (i < lines.length && !lines[i].startsWith('|')) {
    i++;
  }
  if (i >= lines.length) return entries;

  // Skip header row and separator
  i++; // header
  if (i < lines.length && isSeparator(lines[i])) i++; // separator

  // Parse data rows
  while (i < lines.length && lines[i].startsWith('|')) {
    const cells = parseRow(lines[i]);
    if (cells.length >= 5) {
      const entry: CalendarEntry = {
        slug: cells[0],
        title: cells[1],
        description: cells[2],
        stage,
        targetKeywords: cells[3]
          ? cells[3].split(',').map((k) => k.trim()).filter(Boolean)
          : [],
        source: cells[4] === 'analytics' ? 'analytics' : 'manual',
      };

      // Published stage has extra columns
      if (stage === 'Published' && cells.length >= 6) {
        const dateVal = cells[5];
        if (dateVal) entry.datePublished = dateVal;
      }

      // Issue column — last column for Drafting/Review/Published
      const issueIdx = stage === 'Published' ? 6 : 5;
      if (cells.length > issueIdx && cells[issueIdx]) {
        const match = cells[issueIdx].match(/#?(\d+)/);
        if (match) entry.issueNumber = parseInt(match[1], 10);
      }

      entries.push(entry);
    }
    i++;
  }
  return entries;
}

/** Parse the editorial calendar markdown file into an EditorialCalendar. */
export function parseCalendar(markdown: string): EditorialCalendar {
  const entries: CalendarEntry[] = [];
  const lines = markdown.split('\n');

  let currentStage: Stage | null = null;
  let stageLines: string[] = [];

  function flushStage() {
    if (currentStage && stageLines.length > 0) {
      entries.push(...parseEntries(stageLines, currentStage));
    }
    stageLines = [];
  }

  for (const line of lines) {
    const stageMatch = line.match(/^## (.+)$/);
    if (stageMatch) {
      flushStage();
      const name = stageMatch[1].trim();
      currentStage = isStage(name) ? name : null;
    } else if (currentStage) {
      stageLines.push(line);
    }
  }
  flushStage();

  return { entries };
}

/** Read and parse the editorial calendar from disk. */
export function readCalendar(rootDir: string): EditorialCalendar {
  const path = calendarPath(rootDir);
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

  if (stage === 'Published') {
    lines.push('| Slug | Title | Description | Keywords | Source | Published | Issue |');
    lines.push('|------|-------|-------------|----------|--------|-----------|-------|');
    for (const e of entries) {
      const kw = e.targetKeywords.join(', ');
      const issue = e.issueNumber ? `#${e.issueNumber}` : '';
      lines.push(
        `| ${escapeCell(e.slug)} | ${escapeCell(e.title)} | ${escapeCell(e.description)} | ${escapeCell(kw)} | ${e.source} | ${e.datePublished ?? ''} | ${issue} |`,
      );
    }
  } else {
    const hasIssue = entries.some((e) => e.issueNumber !== undefined);
    if (hasIssue) {
      lines.push('| Slug | Title | Description | Keywords | Source | Issue |');
      lines.push('|------|-------|-------------|----------|--------|-------|');
    } else {
      lines.push('| Slug | Title | Description | Keywords | Source |');
      lines.push('|------|-------|-------------|----------|--------|');
    }
    for (const e of entries) {
      const kw = e.targetKeywords.join(', ');
      const issue = e.issueNumber ? `#${e.issueNumber}` : '';
      const row = `| ${escapeCell(e.slug)} | ${escapeCell(e.title)} | ${escapeCell(e.description)} | ${escapeCell(kw)} | ${e.source} |`;
      lines.push(hasIssue ? `${row} ${issue} |` : row);
    }
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

  return sections.join('\n');
}

/** Write the editorial calendar to disk. */
export function writeCalendar(
  rootDir: string,
  calendar: EditorialCalendar,
): void {
  const path = calendarPath(rootDir);
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

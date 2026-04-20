/**
 * HTTP-shaped handlers for mechanical editorial-calendar state transitions.
 *
 * Two actions:
 * - `handleDraftStart` — Planned → Drafting. Scaffolds the blog post file,
 *   mints a GH tracking issue, and flips the stage.
 * - `handlePublish` — Drafting|Review → Published. Closes the GH issue
 *   (best-effort) and flips the stage with a publication date.
 *
 * Cognitive work (drafting prose, reviewing, approving) stays in Claude
 * Code; these handlers only drive calendar + issue bookkeeping.
 */

import { execFileSync } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  calendarPath,
  draftEntry,
  findEntry,
  isSite,
  publishEntry,
  readCalendar,
  scaffoldBlogPost,
  writeCalendar,
  SITES,
  type CalendarEntry,
  type Site,
} from '../editorial/index.js';
import type {
  DraftStartRequest,
  DraftStartResponse,
  PublishRequest,
  PublishResponse,
} from './types.js';

export interface HandlerResult {
  status: number;
  body: unknown;
}

/** Slug shape shared with `/editorial-add` / `/editorial-plan` / start-longform. */
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

/** ISO YYYY-MM-DD. */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const DRAFT_AUTHOR = 'Orion Letizi';

function err(status: number, message: string): HandlerResult {
  return { status, body: { error: message } };
}

function ok(body: unknown): HandlerResult {
  return { status: 200, body };
}

interface GhResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

/**
 * Run `gh` with a fixed argv. Uses `execFileSync` (not `execSync`) so
 * entry titles, descriptions, and other user-supplied strings cannot
 * inject shell metacharacters.
 */
function readErrField(e: unknown, key: 'stdout' | 'stderr' | 'message'): string {
  if (typeof e !== 'object' || e === null) return '';
  const value: unknown = Reflect.get(e, key);
  if (typeof value === 'string') return value;
  if (value instanceof Buffer) return value.toString('utf-8');
  return '';
}

function runGh(args: string[], opts: { cwd: string }): GhResult {
  try {
    const stdout = execFileSync('gh', args, {
      cwd: opts.cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, stdout, stderr: '' };
  } catch (e) {
    // execFileSync throws with stdout/stderr props on non-zero exit.
    const stdout = readErrField(e, 'stdout');
    const stderr = readErrField(e, 'stderr') || readErrField(e, 'message') || String(e);
    return { ok: false, stdout, stderr };
  }
}

/**
 * Parse the GH issue URL that `gh issue create` prints on success —
 * format is `https://github.com/<owner>/<repo>/issues/<number>`. Returns
 * the trailing integer or null when the stdout is unexpected.
 */
function parseIssueNumber(stdout: string): number | null {
  const match = stdout.match(/\/issues\/(\d+)/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return Number.isNaN(n) ? null : n;
}

/**
 * Build the GH issue body for a new blog draft. Mirrors the template
 * documented in `.claude/skills/editorial-draft/SKILL.md`: description,
 * target keywords (when present), and a draft/review/publish checklist.
 */
function buildIssueBody(entry: CalendarEntry): string {
  const lines: string[] = [];
  lines.push(entry.description);
  lines.push('');
  if (entry.targetKeywords.length > 0) {
    lines.push(`Target keywords: ${entry.targetKeywords.join(', ')}`);
    lines.push('');
  }
  if (entry.topics && entry.topics.length > 0) {
    lines.push(`Topics: ${entry.topics.join(', ')}`);
    lines.push('');
  }
  lines.push('Acceptance criteria:');
  lines.push('- [ ] Draft written');
  lines.push('- [ ] Review complete');
  lines.push('- [ ] Published');
  return lines.join('\n');
}

/**
 * Write `body` to a temp file, invoke `gh issue create --body-file <tmp>`,
 * clean up the temp file, and return the parsed issue number.
 *
 * We pass the body via a file instead of `--body "$body"` so arbitrary
 * entry text (markdown, quotes, backticks, newlines) round-trips cleanly.
 */
function createGhIssue(
  rootDir: string,
  title: string,
  body: string,
): { issueNumber: number } | { error: string } {
  const tmpFile = join(tmpdir(), `editorial-issue-${randomUUID()}.md`);
  writeFileSync(tmpFile, body, 'utf-8');
  try {
    const result = runGh(
      ['issue', 'create', '--title', title, '--body-file', tmpFile],
      { cwd: rootDir },
    );
    if (!result.ok) {
      return { error: result.stderr.trim() || 'gh issue create failed' };
    }
    const issueNumber = parseIssueNumber(result.stdout);
    if (issueNumber === null) {
      return {
        error: `could not parse issue number from gh output: ${result.stdout}`,
      };
    }
    return { issueNumber };
  } finally {
    if (existsSync(tmpFile)) {
      try {
        unlinkSync(tmpFile);
      } catch {
        // Best effort; a stray temp file isn't a reason to fail the request.
      }
    }
  }
}

function validateSite(raw: unknown): Site | HandlerResult {
  if (raw === undefined || raw === null || raw === '') {
    return err(400, 'site is required');
  }
  if (typeof raw !== 'string' || !isSite(raw)) {
    return err(400, `unknown site: ${String(raw)}. Must be one of ${SITES.join(', ')}`);
  }
  return raw;
}

function validateSlug(raw: unknown): string | HandlerResult {
  if (raw === undefined || raw === null || raw === '') {
    return err(400, 'slug is required');
  }
  if (typeof raw !== 'string') return err(400, 'slug is required');
  if (!SLUG_RE.test(raw)) {
    return err(400, `invalid slug: ${raw}. Must match ${SLUG_RE}`);
  }
  return raw;
}

function parseDraftStartBody(body: unknown): DraftStartRequest | HandlerResult {
  if (!body || typeof body !== 'object') return err(400, 'expected JSON object body');
  const site = validateSite(Reflect.get(body, 'site'));
  if (isHandlerResult(site)) return site;
  const slug = validateSlug(Reflect.get(body, 'slug'));
  if (isHandlerResult(slug)) return slug;
  return { site, slug, skipGhIssue: Reflect.get(body, 'skipGhIssue') === true };
}

function parsePublishBody(body: unknown): PublishRequest | HandlerResult {
  if (!body || typeof body !== 'object') return err(400, 'expected JSON object body');
  const site = validateSite(Reflect.get(body, 'site'));
  if (isHandlerResult(site)) return site;
  const slug = validateSlug(Reflect.get(body, 'slug'));
  if (isHandlerResult(slug)) return slug;
  const rawDate: unknown = Reflect.get(body, 'datePublished');
  let datePublished: string | undefined;
  if (rawDate !== undefined) {
    if (typeof rawDate !== 'string' || !DATE_RE.test(rawDate)) {
      return err(
        400,
        `invalid datePublished: ${String(rawDate)}. Must match YYYY-MM-DD`,
      );
    }
    datePublished = rawDate;
  }
  return {
    site,
    slug,
    skipGhIssue: Reflect.get(body, 'skipGhIssue') === true,
    ...(datePublished ? { datePublished } : {}),
  };
}

function isHandlerResult(value: unknown): value is HandlerResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'body' in value
  );
}

/**
 * Planned → Drafting. Scaffolds the blog file, creates a tracking GH
 * issue, and advances the calendar. Returns 400/404/409/502 on the
 * appropriate failure shapes; 200 with the updated entry on success.
 */
export function handleDraftStart(rootDir: string, body: unknown): HandlerResult {
  const parsed = parseDraftStartBody(body);
  if (isHandlerResult(parsed)) return parsed;

  if (!existsSync(calendarPath(rootDir, parsed.site))) {
    return err(
      404,
      `editorial calendar not found for site "${parsed.site}" at ${calendarPath(rootDir, parsed.site)}`,
    );
  }

  const cal = readCalendar(rootDir, parsed.site);
  const entry = findEntry(cal, parsed.slug);
  if (!entry) {
    const available = cal.entries.map((e) => e.slug).join(', ') || '(none)';
    return err(404, `unknown slug "${parsed.slug}". Available: ${available}`);
  }

  if (entry.stage !== 'Planned') {
    return err(
      409,
      `entry "${parsed.slug}" is in stage "${entry.stage}" — must be Planned to scaffold a draft`,
    );
  }

  let scaffolded: { filePath: string; relativePath: string };
  try {
    scaffolded = scaffoldBlogPost(rootDir, parsed.site, entry, DRAFT_AUTHOR);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return err(409, message);
  }

  let issueNumber = 0;
  if (!parsed.skipGhIssue) {
    const ghResult = createGhIssue(
      rootDir,
      `[blog post] ${entry.title}`,
      buildIssueBody(entry),
    );
    if ('error' in ghResult) {
      return err(502, `gh issue create failed: ${ghResult.error}`);
    }
    issueNumber = ghResult.issueNumber;
  }

  const updated = draftEntry(cal, parsed.slug, issueNumber);
  writeCalendar(rootDir, parsed.site, cal);

  const response: DraftStartResponse = {
    entry: updated,
    filePath: scaffolded.filePath,
    relativePath: scaffolded.relativePath,
    issueNumber,
  };
  return ok(response);
}

/**
 * Drafting|Review → Published. Best-effort close of the tracking GH
 * issue (warns on failure but still advances) then flips the stage.
 */
export function handlePublish(rootDir: string, body: unknown): HandlerResult {
  const parsed = parsePublishBody(body);
  if (isHandlerResult(parsed)) return parsed;

  if (!existsSync(calendarPath(rootDir, parsed.site))) {
    return err(
      404,
      `editorial calendar not found for site "${parsed.site}" at ${calendarPath(rootDir, parsed.site)}`,
    );
  }

  const cal = readCalendar(rootDir, parsed.site);
  const entry = findEntry(cal, parsed.slug);
  if (!entry) {
    const available = cal.entries.map((e) => e.slug).join(', ') || '(none)';
    return err(404, `unknown slug "${parsed.slug}". Available: ${available}`);
  }

  if (entry.stage !== 'Drafting' && entry.stage !== 'Review') {
    return err(
      409,
      `entry "${parsed.slug}" is in stage "${entry.stage}" — must be Drafting or Review to publish`,
    );
  }

  const targetDate = parsed.datePublished ?? new Date().toISOString().slice(0, 10);
  const issueToClose =
    entry.issueNumber !== undefined && entry.issueNumber > 0
      ? entry.issueNumber
      : undefined;

  let closedIssue: number | undefined;
  if (issueToClose !== undefined && !parsed.skipGhIssue) {
    const result = runGh(
      [
        'issue',
        'close',
        String(issueToClose),
        '--comment',
        `Published ${targetDate}`,
      ],
      { cwd: rootDir },
    );
    if (result.ok) {
      closedIssue = issueToClose;
    } else {
      // A closed or deleted issue should not block publishing. Log and
      // continue; the operator can close manually if needed.
      console.warn(
        `[editorial-calendar-actions] gh issue close ${issueToClose} failed: ${result.stderr.trim()}`,
      );
    }
  }

  const updated = publishEntry(cal, parsed.slug, targetDate);
  writeCalendar(rootDir, parsed.site, cal);

  const response: PublishResponse = {
    entry: updated,
    ...(closedIssue !== undefined ? { closedIssue } : {}),
  };
  return ok(response);
}

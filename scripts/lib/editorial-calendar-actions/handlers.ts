/**
 * HTTP-shaped handlers for mechanical editorial-calendar state transitions.
 *
 * Two actions:
 * - `handleDraftStart` — Planned → Drafting. Scaffolds the blog post file
 *   and flips the stage.
 * - `handlePublish` — Drafting|Review → Published. Flips the stage with
 *   a publication date.
 *
 * Cognitive work (drafting prose, reviewing, approving) stays in Claude
 * Code. GitHub issue creation/closing is intentionally NOT handled here —
 * see types.ts for the rationale.
 */

import { existsSync } from 'fs';
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

function isHandlerResult(value: unknown): value is HandlerResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'body' in value
  );
}

function parseDraftStartBody(body: unknown): DraftStartRequest | HandlerResult {
  if (!body || typeof body !== 'object') return err(400, 'expected JSON object body');
  const site = validateSite(Reflect.get(body, 'site'));
  if (isHandlerResult(site)) return site;
  const slug = validateSlug(Reflect.get(body, 'slug'));
  if (isHandlerResult(slug)) return slug;
  return { site, slug };
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
    ...(datePublished ? { datePublished } : {}),
  };
}

/**
 * Planned → Drafting. Scaffolds the blog file and advances the calendar.
 * Returns 400/404/409 on the appropriate failure shapes; 200 with the
 * updated entry on success.
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
    // "Blog post already exists at …" is a conflict; any other failure
    // (missing parent dir, EACCES, disk full, …) is a server-side I/O error.
    // Callers rely on 409 to distinguish idempotent retries from real faults.
    const isExists = message.startsWith('Blog post already exists at ');
    return err(isExists ? 409 : 500, message);
  }

  const updated = draftEntry(cal, parsed.slug);
  writeCalendar(rootDir, parsed.site, cal);

  const response: DraftStartResponse = {
    entry: updated,
    filePath: scaffolded.filePath,
    relativePath: scaffolded.relativePath,
  };
  return ok(response);
}

/**
 * Drafting|Review → Published. Flips the stage with a publication date.
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
  const updated = publishEntry(cal, parsed.slug, targetDate);
  writeCalendar(rootDir, parsed.site, cal);

  const response: PublishResponse = { entry: updated };
  return ok(response);
}

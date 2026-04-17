/**
 * Cross-link audit between blog posts and YouTube videos.
 *
 * Closes the loop: for each Published entry, what does it link to, which
 * of those links resolve to known calendar entries, and which don't
 * reciprocate? The audit is bidirectional — a gap is "blog X links to
 * video Y, but Y's description doesn't link back to X" OR vice versa.
 *
 * This module does no I/O on its own. It's given:
 *  - the calendar (entries in memory)
 *  - the blog MD content for each blog entry (read by the caller)
 *  - a `fetchDescription(url)` closure that returns the YouTube video
 *    description (caller wires this to YouTube Data API or a fixture)
 *
 * Keeping I/O at the edges makes the audit testable and lets callers
 * swap in fixtures for tests or the live YouTube client in the skill.
 */

import { effectiveContentType, type CalendarEntry, type EditorialCalendar } from './types.js';
import { extractVideoId } from '../youtube/client.js';

/**
 * Find YouTube URLs in a blog post's markdown body.
 *
 * Captures:
 *  - plain `https://www.youtube.com/watch?v=...` and `https://youtu.be/...`
 *  - shorts `https://www.youtube.com/shorts/...`
 *  - `<iframe src="https://www.youtube.com/embed/...">` embeds
 */
export function extractYouTubeLinksFromMarkdown(md: string): string[] {
  const urls = new Set<string>();

  const patterns: RegExp[] = [
    // youtube.com/watch?v=ID (URL, not necessarily inside a link)
    /https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?[^\s"')]*v=[A-Za-z0-9_-]{11}[^\s"')]*/gi,
    // youtu.be/ID
    /https?:\/\/youtu\.be\/[A-Za-z0-9_-]{11}[^\s"')]*/gi,
    // youtube.com/shorts/ID
    /https?:\/\/(?:www\.)?youtube\.com\/shorts\/[A-Za-z0-9_-]{11}[^\s"')]*/gi,
    // youtube.com/embed/ID (inside iframe src)
    /https?:\/\/(?:www\.)?youtube\.com\/embed\/[A-Za-z0-9_-]{11}[^\s"')]*/gi,
  ];

  for (const pattern of patterns) {
    const matches = md.matchAll(pattern);
    for (const m of matches) urls.add(m[0]);
  }

  return [...urls];
}

/**
 * Find audiocontrol.org blog URLs in a string (typically a YouTube video
 * description). Returns the full URL; the caller is responsible for
 * extracting the slug if needed.
 */
export function extractBlogLinksFromDescription(desc: string): string[] {
  const urls = new Set<string>();
  const pattern =
    /https?:\/\/(?:www\.)?audiocontrol\.org\/blog\/[a-z0-9-]+\/?/gi;
  const matches = desc.matchAll(pattern);
  for (const m of matches) urls.add(m[0]);
  return [...urls];
}

/** Extract the slug from an audiocontrol.org/blog/ URL. */
export function slugFromBlogUrl(url: string): string | null {
  const match = url.match(
    /^https?:\/\/(?:www\.)?audiocontrol\.org\/blog\/([a-z0-9-]+)\/?/i,
  );
  return match ? match[1] : null;
}

/**
 * One outbound link found in a calendar entry's content, resolved against
 * the calendar so we can report whether the target is tracked.
 */
export interface OutboundLink {
  /** Raw URL as it appears in the source content */
  url: string;
  /** Slug of the calendar entry this link points to, if any */
  resolvedSlug: string | null;
  /** Whether the target entry exists in the calendar */
  resolved: boolean;
}

/** The audit result for a single calendar entry. */
export interface EntryAudit {
  entry: CalendarEntry;
  /** Links found in this entry's content */
  outbound: OutboundLink[];
  /**
   * Slugs of other entries that link to this one but are not reciprocated —
   * i.e. other entries where `outbound` includes this entry's slug but this
   * entry's `outbound` doesn't include theirs.
   */
  missingBacklinksTo: string[];
  /** Free-form errors encountered during the audit for this entry (e.g. fetch failed). */
  errors: string[];
}

export interface AuditCrossLinksInput {
  calendar: EditorialCalendar;
  /** Resolve a blog slug to its markdown body. Return null if unavailable. */
  fetchBlogMarkdown: (slug: string) => string | null;
  /** Fetch a YouTube video's description by the contentUrl. Returns null on failure. */
  fetchVideoDescription: (contentUrl: string) => Promise<string | null>;
}

/** The complete audit report. */
export interface AuditReport {
  entries: EntryAudit[];
}

/**
 * Run the cross-link audit against a calendar.
 *
 * Iterates Published entries, extracts outbound links from each, then
 * does a second pass to detect non-reciprocated links. Returns a report
 * with one EntryAudit per Published entry.
 */
export async function auditCrossLinks(
  input: AuditCrossLinksInput,
): Promise<AuditReport> {
  const { calendar, fetchBlogMarkdown, fetchVideoDescription } = input;
  const published = calendar.entries.filter((e) => e.stage === 'Published');

  const bySlug = new Map<string, CalendarEntry>();
  const byVideoId = new Map<string, CalendarEntry>();
  for (const e of published) {
    bySlug.set(e.slug, e);
    if (effectiveContentType(e) === 'youtube' && e.contentUrl) {
      try {
        byVideoId.set(extractVideoId(e.contentUrl), e);
      } catch {
        // contentUrl is present but not a recognizable YouTube URL — skip indexing
      }
    }
  }

  // First pass: per-entry outbound links
  const audits: EntryAudit[] = [];
  for (const entry of published) {
    const outbound: OutboundLink[] = [];
    const errors: string[] = [];

    const entryType = effectiveContentType(entry);

    // Tool entries are tracked in the calendar but the cross-link audit
    // doesn't analyze them yet: they have no MD file we own and no
    // fetch-able description. Tool-audit support is a follow-up.
    if (entryType === 'tool') {
      audits.push({ entry, outbound: [], missingBacklinksTo: [], errors: [] });
      continue;
    }

    if (entryType === 'blog') {
      const md = fetchBlogMarkdown(entry.slug);
      if (md === null) {
        errors.push(`could not read blog markdown for ${entry.slug}`);
      } else {
        for (const url of extractYouTubeLinksFromMarkdown(md)) {
          let resolvedSlug: string | null = null;
          try {
            const id = extractVideoId(url);
            const target = byVideoId.get(id);
            if (target) resolvedSlug = target.slug;
          } catch {
            // unparseable — treat as unresolved
          }
          outbound.push({ url, resolvedSlug, resolved: resolvedSlug !== null });
        }
      }
    } else if (entryType === 'youtube') {
      if (!entry.contentUrl) {
        errors.push(`YouTube entry ${entry.slug} has no contentUrl`);
      } else {
        let desc: string | null = null;
        try {
          desc = await fetchVideoDescription(entry.contentUrl);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push(
            `fetching description for ${entry.slug}: ${message}`,
          );
        }
        if (desc !== null) {
          for (const url of extractBlogLinksFromDescription(desc)) {
            const slug = slugFromBlogUrl(url);
            const resolvedSlug = slug && bySlug.has(slug) ? slug : null;
            outbound.push({
              url,
              resolvedSlug,
              resolved: resolvedSlug !== null,
            });
          }
        }
      }
    }

    audits.push({ entry, outbound, missingBacklinksTo: [], errors });
  }

  // Second pass: detect missing backlinks. For each audit A, find every
  // audit B where B.outbound resolves to A.entry.slug but A.outbound does
  // NOT resolve to B.entry.slug. Add B's slug to A.missingBacklinksTo.
  const auditBySlug = new Map<string, EntryAudit>();
  for (const a of audits) auditBySlug.set(a.entry.slug, a);

  for (const b of audits) {
    for (const link of b.outbound) {
      if (!link.resolvedSlug) continue;
      const a = auditBySlug.get(link.resolvedSlug);
      if (!a) continue;
      // Tool entries are not audited for outbound links, so reciprocation
      // isn't meaningful — skip to avoid false-positive "missing backlink"
      // flags against every tool.
      if (effectiveContentType(a.entry) === 'tool') continue;
      const reciprocated = a.outbound.some(
        (l) => l.resolvedSlug === b.entry.slug,
      );
      if (!reciprocated && !a.missingBacklinksTo.includes(b.entry.slug)) {
        a.missingBacklinksTo.push(b.entry.slug);
      }
    }
  }

  return { entries: audits };
}

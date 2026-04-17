/**
 * Cross-link audit across all three calendar content types.
 *
 * For each Published entry, what does it link to, which of those links
 * resolve to known calendar entries, and which don't reciprocate?
 *
 *   blog    → parse MD for YouTube URLs + audiocontrol.org URLs
 *   youtube → parse description (fetched) for audiocontrol.org URLs
 *   tool    → parse page HTML (fetched) for any outbound URL
 *
 * All URLs get resolved through a unified index: YouTube URLs match by
 * video ID; audiocontrol.org URLs match by canonical `contentUrl`.
 *
 * I/O is injected at the edges so tests use fixtures and the live skill
 * wires in the YouTube client and the HTML fetcher.
 */

import { load as cheerioLoad } from 'cheerio';
import {
  effectiveContentType,
  type CalendarEntry,
  type EditorialCalendar,
} from './types.js';
import { extractVideoId } from '../youtube/client.js';

// ---------------------------------------------------------------------------
// Link extraction
// ---------------------------------------------------------------------------

/**
 * Find YouTube URLs in blog post markdown.
 * Captures watch / youtu.be / shorts / embed forms.
 */
export function extractYouTubeLinksFromMarkdown(md: string): string[] {
  const urls = new Set<string>();
  const patterns: RegExp[] = [
    /https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?[^\s"')]*v=[A-Za-z0-9_-]{11}[^\s"')]*/gi,
    /https?:\/\/youtu\.be\/[A-Za-z0-9_-]{11}[^\s"')]*/gi,
    /https?:\/\/(?:www\.)?youtube\.com\/shorts\/[A-Za-z0-9_-]{11}[^\s"')]*/gi,
    /https?:\/\/(?:www\.)?youtube\.com\/embed\/[A-Za-z0-9_-]{11}[^\s"')]*/gi,
  ];
  for (const pattern of patterns) {
    for (const m of md.matchAll(pattern)) urls.add(m[0]);
  }
  return [...urls];
}

/**
 * Find any audiocontrol.org URL in a plain-text blob (YouTube descriptions,
 * blog MD that uses full URLs, anywhere URLs appear in raw text).
 *
 * Replaces the Phase 6 `extractBlogLinksFromDescription`, which only
 * matched `/blog/<slug>/` paths and silently dropped tool URLs.
 */
export function extractAudioControlLinksFromText(text: string): string[] {
  const urls = new Set<string>();
  const pattern = /https?:\/\/(?:www\.)?audiocontrol\.org\/[^\s"')\]<>]*/gi;
  for (const m of text.matchAll(pattern)) urls.add(m[0]);
  return [...urls];
}

/**
 * Find audiocontrol.org URLs in blog markdown — both absolute URLs
 * and markdown-link relative paths like `[text](/roland/s330/editor)`
 * (which resolve to the site's own pages).
 */
export function extractAudioControlLinksFromMarkdown(md: string): string[] {
  const urls = new Set<string>();

  for (const url of extractAudioControlLinksFromText(md)) urls.add(url);

  // [text](/path/...) — markdown link to a relative site path
  const relativePattern = /\]\((\/[^\s)]+)\)/g;
  for (const m of md.matchAll(relativePattern)) {
    urls.add(`https://audiocontrol.org${m[1]}`);
  }

  return [...urls];
}

/**
 * Extract outbound URLs from rendered HTML using cheerio — href, src,
 * and bare URLs in text nodes. Resolves relative URLs against the
 * provided base URL. Uses a real HTML parser so we're robust to
 * malformed/unclosed/quirky markup from any source.
 *
 * Skips:
 *   - anchor-only links (#section)
 *   - mailto / tel / javascript / data schemes
 *   - feeds (*.xml, *.rss, *.atom), sitemap.xml, robots.txt
 *   - script and style contents (quoted URLs in inline JS shouldn't count as outbound links)
 */
export function extractLinksFromHtml(html: string, baseUrl?: string): string[] {
  const $ = cheerioLoad(html);

  // Remove script and style before scanning text so their contents don't leak in
  $('script, style, noscript').remove();

  const raw = new Set<string>();

  $('a[href], link[href], area[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) raw.add(href);
  });

  $('img[src], iframe[src], video[src], source[src], audio[src], embed[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src) raw.add(src);
  });

  // Bare URLs in text content (e.g. a plain URL typed into a paragraph)
  const bareUrlPattern = /https?:\/\/[^\s<>"')]+/gi;
  const textContent = $.root().text();
  for (const m of textContent.matchAll(bareUrlPattern)) raw.add(m[0]);

  const base = baseUrl ? safeParseUrl(baseUrl) : undefined;
  const absolute = new Set<string>();

  for (const candidate of raw) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (/^(mailto|tel|javascript|data):/i.test(trimmed)) continue;

    let resolved: string | null = null;
    if (/^https?:\/\//i.test(trimmed)) {
      resolved = trimmed;
    } else if (base) {
      try {
        resolved = new URL(trimmed, base).toString();
      } catch {
        continue;
      }
    } else {
      continue;
    }

    if (/\.(xml|rss|atom)(\?|$)/i.test(resolved)) continue;
    if (/\/sitemap(-index)?\.xml/i.test(resolved)) continue;
    if (/\/robots\.txt(\?|$)/i.test(resolved)) continue;

    absolute.add(resolved);
  }

  return [...absolute];
}

/** Extract the slug from an audiocontrol.org/blog/ URL. */
export function slugFromBlogUrl(url: string): string | null {
  const match = url.match(
    /^https?:\/\/(?:www\.)?audiocontrol\.org\/blog\/([a-z0-9-]+)\/?/i,
  );
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// URL resolution
// ---------------------------------------------------------------------------

function safeParseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/**
 * Normalize a URL for comparison: lowercase hostname, strip trailing
 * slash from the path (except for root), drop fragment. Preserves query
 * string so distinct endpoints don't collide.
 */
export function canonicalizeUrl(url: string): string {
  const u = safeParseUrl(url);
  if (!u) return url.trim().toLowerCase();
  let path = u.pathname.replace(/\/+$/, '');
  if (path === '') path = '/';
  const query = u.search;
  return `${u.protocol}//${u.hostname.toLowerCase()}${path}${query}`;
}

function buildByContentUrl(entries: CalendarEntry[]): Map<string, CalendarEntry> {
  const map = new Map<string, CalendarEntry>();
  for (const e of entries) {
    const type = effectiveContentType(e);
    const url =
      type === 'blog'
        ? `https://audiocontrol.org/blog/${e.slug}/`
        : e.contentUrl;
    if (!url) continue;
    map.set(canonicalizeUrl(url), e);
  }
  return map;
}

function buildByVideoId(entries: CalendarEntry[]): Map<string, CalendarEntry> {
  const map = new Map<string, CalendarEntry>();
  for (const e of entries) {
    if (effectiveContentType(e) !== 'youtube' || !e.contentUrl) continue;
    try {
      map.set(extractVideoId(e.contentUrl), e);
    } catch {
      // contentUrl present but not a recognizable YouTube URL — skip indexing
    }
  }
  return map;
}

function resolveUrl(
  url: string,
  byVideoId: Map<string, CalendarEntry>,
  byContentUrl: Map<string, CalendarEntry>,
): CalendarEntry | null {
  // YouTube: video ID is more robust than URL match (handles youtu.be,
  // watch?v=, shorts/, embed/ all as one target)
  try {
    const id = extractVideoId(url);
    const hit = byVideoId.get(id);
    if (hit) return hit;
  } catch {
    // not a YouTube URL
  }
  return byContentUrl.get(canonicalizeUrl(url)) ?? null;
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export interface OutboundLink {
  url: string;
  resolvedSlug: string | null;
  resolved: boolean;
}

export interface EntryAudit {
  entry: CalendarEntry;
  outbound: OutboundLink[];
  missingBacklinksTo: string[];
  errors: string[];
}

export interface AuditCrossLinksInput {
  calendar: EditorialCalendar;
  /** Resolve a blog slug to its markdown body. Return null if unavailable. */
  fetchBlogMarkdown: (slug: string) => string | null;
  /** Fetch a YouTube video's description by the contentUrl. Returns null on failure. */
  fetchVideoDescription: (contentUrl: string) => Promise<string | null>;
  /** Fetch a tool page's HTML by the contentUrl. Returns null on failure. */
  fetchToolPage: (contentUrl: string) => Promise<string | null>;
}

export interface AuditReport {
  entries: EntryAudit[];
}

/**
 * Run the cross-link audit against a calendar.
 *
 * First pass: per-entry outbound link extraction.
 * Second pass: detect non-reciprocated links.
 *
 * O(entries × outbound²) in the second pass via the nested
 * reciprocation check. Fine at our scale (tens of entries); revisit if
 * the calendar grows past hundreds.
 */
export async function auditCrossLinks(
  input: AuditCrossLinksInput,
): Promise<AuditReport> {
  const { calendar, fetchBlogMarkdown, fetchVideoDescription, fetchToolPage } = input;
  const published = calendar.entries.filter((e) => e.stage === 'Published');

  const byVideoId = buildByVideoId(published);
  const byContentUrl = buildByContentUrl(published);

  const recordOutbound = (
    outbound: OutboundLink[],
    url: string,
    selfSlug: string,
  ): void => {
    const target = resolveUrl(url, byVideoId, byContentUrl);
    // Self-links don't count as outbound to another entry
    if (target && target.slug === selfSlug) return;
    outbound.push({
      url,
      resolvedSlug: target?.slug ?? null,
      resolved: target !== null,
    });
  };

  const audits: EntryAudit[] = [];

  for (const entry of published) {
    const outbound: OutboundLink[] = [];
    const errors: string[] = [];
    const entryType = effectiveContentType(entry);

    if (entryType === 'blog') {
      const md = fetchBlogMarkdown(entry.slug);
      if (md === null) {
        errors.push(`could not read blog markdown for ${entry.slug}`);
      } else {
        for (const url of extractYouTubeLinksFromMarkdown(md)) {
          recordOutbound(outbound, url, entry.slug);
        }
        for (const url of extractAudioControlLinksFromMarkdown(md)) {
          recordOutbound(outbound, url, entry.slug);
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
          errors.push(`fetching description for ${entry.slug}: ${message}`);
        }
        if (desc !== null) {
          for (const url of extractAudioControlLinksFromText(desc)) {
            recordOutbound(outbound, url, entry.slug);
          }
        }
      }
    } else if (entryType === 'tool') {
      if (!entry.contentUrl) {
        errors.push(`Tool entry ${entry.slug} has no contentUrl`);
      } else {
        let html: string | null = null;
        try {
          html = await fetchToolPage(entry.contentUrl);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push(`fetching tool page for ${entry.slug}: ${message}`);
        }
        if (html !== null) {
          for (const url of extractLinksFromHtml(html, entry.contentUrl)) {
            recordOutbound(outbound, url, entry.slug);
          }
        }
      }
    }

    audits.push({ entry, outbound, missingBacklinksTo: [], errors });
  }

  // Second pass: if B.outbound resolves to A, but A.outbound doesn't
  // resolve to B, flag on A.missingBacklinksTo.
  const auditBySlug = new Map<string, EntryAudit>();
  for (const a of audits) auditBySlug.set(a.entry.slug, a);

  for (const b of audits) {
    for (const link of b.outbound) {
      if (!link.resolvedSlug) continue;
      const a = auditBySlug.get(link.resolvedSlug);
      if (!a) continue;
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

/**
 * Scrapbook helpers — the per-article `content/blog/<slug>/scrapbook/`
 * directory. See docs/design/scrapbook-phase-19a-design.md for the
 * design contract this implements.
 *
 * Responsibilities:
 *   - Resolve + validate site + slug + filename (reject `..`, absolute
 *     paths, and anything outside the article's scrapbook dir)
 *   - List + read + mutate files inside one scrapbook
 *   - Classify files by extension into the design brief's type buckets
 *   - Format relative mtime + total size for the studio chip / viewer
 *
 * Never run in production. The API endpoints that wrap these helpers
 * all 404 in PROD; this library contains no PROD check of its own (the
 * design brief keeps the enforcement at the endpoint boundary).
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { isSite, type Site } from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Design-brief §4 type buckets. */
export type ScrapbookItemKind =
  | 'md'
  | 'json'
  | 'js'
  | 'img'
  | 'txt'
  | 'other';

export interface ScrapbookItem {
  name: string;
  kind: ScrapbookItemKind;
  size: number;
  mtime: string; // ISO8601
}

export interface ScrapbookSummary {
  site: Site;
  slug: string;
  dir: string; // absolute path
  exists: boolean;
  items: ScrapbookItem[];
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const FILENAME_RE = /^[a-zA-Z0-9._-][a-zA-Z0-9._ -]*$/;

export function assertSlug(slug: string): void {
  if (!SLUG_RE.test(slug)) {
    throw new Error(`invalid slug "${slug}" — must match ${SLUG_RE}`);
  }
}

export function assertFilename(name: string): void {
  if (!name || name === '.' || name === '..') {
    throw new Error(`invalid filename "${name}"`);
  }
  if (name.includes('/') || name.includes('\\') || name.includes('\0')) {
    throw new Error(`filename may not contain path separators: "${name}"`);
  }
  if (name.startsWith('.')) {
    // Dotfiles are suspicious for a dev-only operator UI. Reject.
    throw new Error(`filename may not start with a dot: "${name}"`);
  }
  if (!FILENAME_RE.test(name)) {
    throw new Error(
      `filename may only contain [A-Za-z0-9._ -]: "${name}"`,
    );
  }
  if (name.length > 200) {
    throw new Error(`filename too long (> 200 chars): "${name}"`);
  }
}

/**
 * Resolve the scrapbook directory for (site, slug) and ensure the
 * return path stays inside `src/sites/<site>/content/blog/<slug>/`.
 * Doesn't require the directory to exist.
 */
export function scrapbookDir(
  rootDir: string,
  site: Site,
  slug: string,
): string {
  assertSlug(slug);
  const articleDir = resolve(
    rootDir,
    'src',
    'sites',
    site,
    'content',
    'blog',
    slug,
  );
  return join(articleDir, 'scrapbook');
}

/**
 * Resolve a filename INSIDE a scrapbook dir and return the absolute
 * path. Throws if the resolved path escapes the scrapbook dir (guards
 * against `..` sequences that slipped through assertFilename).
 */
export function scrapbookFilePath(
  rootDir: string,
  site: Site,
  slug: string,
  filename: string,
): string {
  assertFilename(filename);
  const dir = scrapbookDir(rootDir, site, slug);
  const abs = resolve(dir, filename);
  if (!abs.startsWith(dir + '/') && abs !== dir) {
    throw new Error(
      `resolved path escapes scrapbook dir: "${filename}" → ${abs}`,
    );
  }
  return abs;
}

export function isValidSite(value: unknown): value is Site {
  return typeof value === 'string' && isSite(value);
}

// ---------------------------------------------------------------------------
// Type classification
// ---------------------------------------------------------------------------

export function classify(filename: string): ScrapbookItemKind {
  const ext = extname(filename).toLowerCase();
  switch (ext) {
    case '.md':
    case '.markdown':
      return 'md';
    case '.json':
    case '.jsonl':
      return 'json';
    case '.js':
    case '.mjs':
    case '.cjs':
    case '.ts':
    case '.tsx':
    case '.mts':
      return 'js';
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
    case '.webp':
    case '.svg':
      return 'img';
    case '.txt':
    case '.log':
      return 'txt';
    default:
      return 'other';
  }
}

// ---------------------------------------------------------------------------
// Listing
// ---------------------------------------------------------------------------

/** List the items in a scrapbook, sorted newest-mtime first. */
export function listScrapbook(
  rootDir: string,
  site: Site,
  slug: string,
): ScrapbookSummary {
  const dir = scrapbookDir(rootDir, site, slug);
  if (!existsSync(dir)) {
    return { site, slug, dir, exists: false, items: [] };
  }
  const entries = readdirSync(dir, { withFileTypes: true });
  const items: ScrapbookItem[] = [];
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (e.name.startsWith('.')) continue;
    const abs = join(dir, e.name);
    const st = statSync(abs);
    items.push({
      name: e.name,
      kind: classify(e.name),
      size: st.size,
      mtime: st.mtime.toISOString(),
    });
  }
  items.sort((a, b) => b.mtime.localeCompare(a.mtime));
  return { site, slug, dir, exists: true, items };
}

/** Just the item count — used by the studio chip for the badge. */
export function countScrapbook(
  rootDir: string,
  site: Site,
  slug: string,
): number {
  try {
    return listScrapbook(rootDir, site, slug).items.length;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export function readScrapbookFile(
  rootDir: string,
  site: Site,
  slug: string,
  filename: string,
): { name: string; kind: ScrapbookItemKind; size: number; mtime: string; content: Buffer } {
  const abs = scrapbookFilePath(rootDir, site, slug, filename);
  if (!existsSync(abs)) throw new Error(`not found: ${filename}`);
  const st = statSync(abs);
  if (!st.isFile()) throw new Error(`not a file: ${filename}`);
  const content = readFileSync(abs);
  return {
    name: filename,
    kind: classify(filename),
    size: st.size,
    mtime: st.mtime.toISOString(),
    content,
  };
}

/**
 * Create a new markdown note in the scrapbook. Creates the scrapbook
 * dir if it doesn't exist. Refuses to overwrite existing files.
 */
export function createScrapbookMarkdown(
  rootDir: string,
  site: Site,
  slug: string,
  filename: string,
  body: string,
): ScrapbookItem {
  if (!filename.endsWith('.md')) {
    throw new Error(`create endpoint only accepts .md files: "${filename}"`);
  }
  const abs = scrapbookFilePath(rootDir, site, slug, filename);
  if (existsSync(abs)) {
    throw new Error(`file already exists: "${filename}"`);
  }
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body, 'utf-8');
  const st = statSync(abs);
  return {
    name: filename,
    kind: 'md',
    size: st.size,
    mtime: st.mtime.toISOString(),
  };
}

/** Overwrite an existing file's contents. Refuses if the file is absent. */
export function saveScrapbookFile(
  rootDir: string,
  site: Site,
  slug: string,
  filename: string,
  body: string | Buffer,
): ScrapbookItem {
  const abs = scrapbookFilePath(rootDir, site, slug, filename);
  if (!existsSync(abs)) throw new Error(`file not found: "${filename}"`);
  writeFileSync(abs, body);
  const st = statSync(abs);
  return {
    name: filename,
    kind: classify(filename),
    size: st.size,
    mtime: st.mtime.toISOString(),
  };
}

export function renameScrapbookFile(
  rootDir: string,
  site: Site,
  slug: string,
  oldName: string,
  newName: string,
): ScrapbookItem {
  const oldAbs = scrapbookFilePath(rootDir, site, slug, oldName);
  const newAbs = scrapbookFilePath(rootDir, site, slug, newName);
  if (!existsSync(oldAbs)) throw new Error(`file not found: "${oldName}"`);
  if (existsSync(newAbs) && oldAbs !== newAbs) {
    throw new Error(`target name already exists: "${newName}"`);
  }
  renameSync(oldAbs, newAbs);
  const st = statSync(newAbs);
  return {
    name: newName,
    kind: classify(newName),
    size: st.size,
    mtime: st.mtime.toISOString(),
  };
}

export function deleteScrapbookFile(
  rootDir: string,
  site: Site,
  slug: string,
  filename: string,
): void {
  const abs = scrapbookFilePath(rootDir, site, slug, filename);
  if (!existsSync(abs)) throw new Error(`file not found: "${filename}"`);
  rmSync(abs);
}

/**
 * Seed a scrapbook's `README.md` at plan time. Idempotent — if the
 * README already exists, returns null without touching it. Used by
 * `/editorial-plan` so every Planned article gets a scrapbook home
 * with a template that names the article and invites receipts.
 */
export function seedScrapbookReadme(
  rootDir: string,
  site: Site,
  slug: string,
  title: string,
): ScrapbookItem | null {
  const abs = scrapbookFilePath(rootDir, site, slug, 'README.md');
  if (existsSync(abs)) return null;
  const now = new Date().toISOString().slice(0, 10);
  const body = [
    `# Scrapbook — ${title}`,
    '',
    `Planned ${now}. Working notes, research, receipts, and references`,
    `for the \`${slug}\` dispatch. Committed to git alongside the article;`,
    'not baked to the public site.',
    '',
    '## Receipts',
    '',
    '- ',
    '',
    '## Notes',
    '',
    '- ',
    '',
    '## References',
    '',
    '- ',
    '',
  ].join('\n');
  return createScrapbookMarkdown(rootDir, site, slug, 'README.md', body);
}

/**
 * Write an uploaded file into the scrapbook. Filename + content come
 * from the multipart body upstream; we validate and persist.
 */
export function writeScrapbookUpload(
  rootDir: string,
  site: Site,
  slug: string,
  filename: string,
  content: Buffer,
): ScrapbookItem {
  const abs = scrapbookFilePath(rootDir, site, slug, filename);
  if (existsSync(abs)) {
    throw new Error(`file already exists: "${filename}" — rename first`);
  }
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  const st = statSync(abs);
  return {
    name: filename,
    kind: classify(filename),
    size: st.size,
    mtime: st.mtime.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers (for the UI / chip)
// ---------------------------------------------------------------------------

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diff = now.getTime() - then;
  if (diff < 0) return 'just now';
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 14) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 9) return `${w}w ago`;
  const months = Math.floor(d / 30);
  if (months < 18) return `${months}mo ago`;
  const y = Math.floor(d / 365);
  return `${y}y ago`;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

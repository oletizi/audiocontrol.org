/**
 * Slug rename for Phase 18b.
 *
 * Renames a published post's slug cleanly. With Phase 18a's UUID
 * identity in place (entry.id + distribution.entryId + workflow.entryId),
 * the rename only has to touch the public surface:
 *
 *   1. Content file: src/sites/<site>/content/blog/<old>.md → <new>.md
 *   2. Image dir:    src/sites/<site>/public/images/blog/<old>/ → <new>/
 *   3. Frontmatter:  rewrite `image:` / `socialImage:` paths embedded
 *                    in the renamed content file
 *   4. Calendar:     entry.slug = <new> (entry.id unchanged)
 *   5. Distribution: cosmetic slug update on matching entryId
 *   6. _redirects:   append 301s for legacy URL variants (bare, slash,
 *                    splat) to the site's public/_redirects file
 *
 * No git operations. The operator reviews the diff and commits.
 *
 * Internal cross-link rewriting is out of scope — the 301 covers
 * inbound links. See workplan Phase 18b for the rationale.
 */

import { existsSync, readFileSync, renameSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { readCalendar, writeCalendar } from './calendar.js';
import { type Site } from './types.js';

export interface RenameSlugOptions {
  rootDir: string;
  site: Site;
  oldSlug: string;
  newSlug: string;
  dryRun?: boolean;
}

export interface RenameSlugPlanAction {
  kind:
    | 'file-rename'
    | 'dir-rename'
    | 'frontmatter-rewrite'
    | 'calendar-slug-change'
    | 'distribution-slug-sync'
    | 'redirect-append';
  summary: string;
  details?: string;
}

export interface RenameSlugResult {
  entryId: string;
  oldSlug: string;
  newSlug: string;
  actions: RenameSlugPlanAction[];
  dryRun: boolean;
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export function validateSlug(slug: string): void {
  if (!SLUG_RE.test(slug)) {
    throw new Error(`invalid slug "${slug}" — must match ${SLUG_RE}`);
  }
}

function contentPath(rootDir: string, site: Site, slug: string): string {
  return join(rootDir, 'src', 'sites', site, 'content', 'blog', `${slug}.md`);
}

function imageDirPath(rootDir: string, site: Site, slug: string): string {
  return join(rootDir, 'src', 'sites', site, 'public', 'images', 'blog', slug);
}

function redirectsPath(rootDir: string, site: Site): string {
  return join(rootDir, 'src', 'sites', site, 'public', '_redirects');
}

/**
 * Rewrite frontmatter `image:` and `socialImage:` paths that embed the
 * old slug segment. Conservative: only touches lines that match the
 * specific `/images/blog/<oldSlug>/...` pattern so unrelated paths
 * (e.g. an image: referencing a shared asset) aren't disturbed.
 */
export function rewriteEmbeddedSlug(
  markdown: string,
  oldSlug: string,
  newSlug: string,
): { markdown: string; changed: boolean } {
  // Only rewrite inside frontmatter. The markdown format is
  //   ---\n<frontmatter>\n---\n<body>
  const fmMatch = markdown.match(/^(---\s*\n)([\s\S]*?)(\n---\s*\n)([\s\S]*)$/);
  if (!fmMatch) return { markdown, changed: false };
  const [, opening, fmBody, closing, body] = fmMatch;

  const pattern = new RegExp(
    `(/images/blog/)${oldSlug.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}(/)`,
    'g',
  );
  const nextFm = fmBody.replace(pattern, `$1${newSlug}$2`);
  if (nextFm === fmBody) return { markdown, changed: false };
  return { markdown: opening + nextFm + closing + body, changed: true };
}

/**
 * Build the 301-redirect block for a slug rename, matching Netlify's
 * _redirects syntax as used in `src/sites/<site>/public/_redirects`.
 * Emits three lines to cover bare, trailing-slash, and splat variants.
 */
export function buildRedirectBlock(oldSlug: string, newSlug: string): string {
  return [
    '',
    `# Phase 18b: /blog/${oldSlug}/ renamed to /blog/${newSlug}/`,
    `/blog/${oldSlug}        /blog/${newSlug}/          301`,
    `/blog/${oldSlug}/       /blog/${newSlug}/          301`,
    `/blog/${oldSlug}/*      /blog/${newSlug}/:splat    301`,
    '',
  ].join('\n');
}

/**
 * Execute (or dry-run) a slug rename. Returns the planned action list;
 * when `dryRun: true`, no writes happen.
 */
export function renameSlug(options: RenameSlugOptions): RenameSlugResult {
  const { rootDir, site, oldSlug, newSlug, dryRun = false } = options;
  validateSlug(oldSlug);
  validateSlug(newSlug);
  if (oldSlug === newSlug) {
    throw new Error('oldSlug and newSlug are identical — nothing to do');
  }

  const calendar = readCalendar(rootDir, site);
  const entry = calendar.entries.find((e) => e.slug === oldSlug);
  if (!entry) {
    throw new Error(
      `no calendar entry with slug "${oldSlug}" on site "${site}"`,
    );
  }
  if (!entry.id) {
    throw new Error(
      `entry "${oldSlug}" has no UUID — run scripts/editorial/backfill-uuids.ts first`,
    );
  }

  const collision = calendar.entries.find(
    (e) => e.slug === newSlug && e.id !== entry.id,
  );
  if (collision) {
    throw new Error(
      `slug "${newSlug}" is already taken by entry ${collision.id} (${collision.title})`,
    );
  }

  const actions: RenameSlugPlanAction[] = [];

  // 1. Content file
  const oldFile = contentPath(rootDir, site, oldSlug);
  const newFile = contentPath(rootDir, site, newSlug);
  let fileExists = existsSync(oldFile);
  if (fileExists) {
    if (existsSync(newFile)) {
      throw new Error(`target content file already exists: ${newFile}`);
    }
    actions.push({
      kind: 'file-rename',
      summary: `rename content file`,
      details: `${oldFile}\n         → ${newFile}`,
    });
    if (!dryRun) renameSync(oldFile, newFile);
  }

  // 2. Image dir
  const oldImageDir = imageDirPath(rootDir, site, oldSlug);
  const newImageDir = imageDirPath(rootDir, site, newSlug);
  let imageDirExists = existsSync(oldImageDir);
  if (imageDirExists) {
    if (existsSync(newImageDir)) {
      throw new Error(`target image dir already exists: ${newImageDir}`);
    }
    actions.push({
      kind: 'dir-rename',
      summary: `rename image dir`,
      details: `${oldImageDir}\n         → ${newImageDir}`,
    });
    if (!dryRun) renameSync(oldImageDir, newImageDir);
  }

  // 3. Frontmatter rewrite (only meaningful when the file was renamed)
  if (fileExists) {
    const target = dryRun ? oldFile : newFile;
    const src = readFileSync(target, 'utf-8');
    const { markdown: rewritten, changed } = rewriteEmbeddedSlug(
      src,
      oldSlug,
      newSlug,
    );
    if (changed) {
      actions.push({
        kind: 'frontmatter-rewrite',
        summary: `rewrite frontmatter image paths`,
        details: `image: / socialImage: /images/blog/${oldSlug}/... → /images/blog/${newSlug}/...`,
      });
      if (!dryRun) writeFileSync(newFile, rewritten, 'utf-8');
    }
  }

  // 4. Calendar entry slug change
  actions.push({
    kind: 'calendar-slug-change',
    summary: `calendar entry.slug: "${oldSlug}" → "${newSlug}"`,
    details: `entry.id ${entry.id} unchanged — all workflow/distribution joins preserved`,
  });
  if (!dryRun) {
    entry.slug = newSlug;
  }

  // 5. Cosmetic slug sync on distributions with the same entryId
  const matchingDistributions = calendar.distributions.filter(
    (d) => d.entryId === entry.id,
  );
  if (matchingDistributions.length > 0) {
    actions.push({
      kind: 'distribution-slug-sync',
      summary: `sync slug on ${matchingDistributions.length} distribution record(s)`,
      details: matchingDistributions
        .map((d) => `  ${d.platform}${d.channel ? `/${d.channel}` : ''} → slug "${newSlug}"`)
        .join('\n'),
    });
    if (!dryRun) {
      for (const d of matchingDistributions) d.slug = newSlug;
    }
  }

  if (!dryRun) {
    writeCalendar(rootDir, site, calendar);
  }

  // 6. _redirects append
  const redirectsFile = redirectsPath(rootDir, site);
  const block = buildRedirectBlock(oldSlug, newSlug);
  actions.push({
    kind: 'redirect-append',
    summary: `append 301 redirect block to _redirects`,
    details: `  file: ${redirectsFile}\n${block
      .split('\n')
      .map((l) => `         ${l}`)
      .join('\n')}`,
  });
  if (!dryRun) {
    if (!existsSync(redirectsFile)) {
      writeFileSync(redirectsFile, block, 'utf-8');
    } else {
      appendFileSync(redirectsFile, block, 'utf-8');
    }
  }

  return {
    entryId: entry.id,
    oldSlug,
    newSlug,
    actions,
    dryRun,
  };
}

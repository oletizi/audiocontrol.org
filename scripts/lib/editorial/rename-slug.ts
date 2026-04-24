/**
 * Slug rename, Phase-18c-simplified.
 *
 * Under Phase 18c each blog post lives as a directory at
 * `src/sites/<site>/content/blog/<slug>/index.md` with its assets
 * co-located. Renaming a slug then reduces to a single directory
 * rename + a calendar slug update + a single `/blog/<old>/` → `/blog/<new>/`
 * redirect. No body rewrite. No image redirect. No frontmatter path
 * munging. The old `/images/blog/<slug>/...` absolute paths simply
 * don't exist under this layout — Astro's image pipeline serves the
 * co-located assets under hashed `/_astro/...` URLs that are
 * insensitive to the slug.
 *
 * UUID identity (Phase 18a) keeps workflows, distribution records,
 * and journal history joined through `entry.id` across the rename.
 */

import { existsSync, renameSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { readCalendar, writeCalendar } from './calendar.js';
import { effectiveContentType, type Site } from './types.js';

export interface RenameSlugOptions {
  rootDir: string;
  site: Site;
  oldSlug: string;
  newSlug: string;
  dryRun?: boolean;
}

export interface RenameSlugPlanAction {
  kind:
    | 'dir-rename'
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

function postDirPath(rootDir: string, site: Site, slug: string): string {
  return join(rootDir, 'src', 'sites', site, 'content', 'blog', slug);
}

function redirectsPath(rootDir: string, site: Site): string {
  return join(rootDir, 'src', 'sites', site, 'public', '_redirects');
}

/**
 * Build the 301 redirect block for a slug rename. Only covers the
 * page URL; per-post images are served as hashed `/_astro/` URLs
 * that don't embed the slug, so no image-path redirect is needed.
 */
export function buildRedirectBlock(oldSlug: string, newSlug: string): string {
  return [
    '',
    `# Slug rename: /blog/${oldSlug}/ → /blog/${newSlug}/`,
    `/blog/${oldSlug}        /blog/${newSlug}/          301`,
    `/blog/${oldSlug}/       /blog/${newSlug}/          301`,
    `/blog/${oldSlug}/*      /blog/${newSlug}/:splat    301`,
    '',
  ].join('\n');
}

/**
 * Execute (or dry-run) a slug rename.
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
  const oldDir = postDirPath(rootDir, site, oldSlug);
  const newDir = postDirPath(rootDir, site, newSlug);

  // 1. Directory rename. Under Phase 18c blog posts live as
  //    directories at content/blog/<slug>/ with assets co-located,
  //    so a single mv carries the markdown, feature images, and
  //    any body figures in one atomic operation. For blog entries
  //    the directory must exist — if it's missing the calendar row
  //    has drifted from disk and the operator needs to reconcile
  //    before rename can proceed.
  const dirExists = existsSync(oldDir);
  if (!dirExists && effectiveContentType(entry) === 'blog') {
    throw new Error(
      `calendar entry "${oldSlug}" is a blog post but no directory exists at ${oldDir}. ` +
      `The calendar row has drifted from disk — reconcile the row's slug to match the actual ` +
      `directory name, then re-run the rename against the real slug.`,
    );
  }
  if (dirExists) {
    if (existsSync(newDir)) {
      throw new Error(`target directory already exists: ${newDir}`);
    }
    actions.push({
      kind: 'dir-rename',
      summary: 'rename post directory',
      details: `${oldDir}\n         → ${newDir}`,
    });
    if (!dryRun) renameSync(oldDir, newDir);
  }

  // 2. Calendar entry slug change
  actions.push({
    kind: 'calendar-slug-change',
    summary: `calendar entry.slug: "${oldSlug}" → "${newSlug}"`,
    details: `entry.id ${entry.id} unchanged — all workflow/distribution joins preserved`,
  });
  if (!dryRun) {
    entry.slug = newSlug;
  }

  // 3. Cosmetic slug sync on distributions with the same entryId
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

  // 4. _redirects append
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

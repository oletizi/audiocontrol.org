/**
 * Unit tests for the slug-rename skill helper (Phase 18b + 18c).
 *
 * Post-18c the rename is a single directory move. Astro's image
 * pipeline serves co-located assets from the new path with no path
 * rewriting needed on our side. These tests exercise the validation
 * rules, the drift-guard, the directory move, calendar updates, and
 * the redirect append.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  buildRedirectBlock,
  readCalendar,
  renameSlug,
  validateSlug,
  type Site,
} from '../../scripts/lib/editorial/index.js';

const SITE: Site = 'audiocontrol';

function writeCalendar(rootDir: string, site: Site, markdown: string): void {
  const path = join(rootDir, 'docs', `editorial-calendar-${site}.md`);
  mkdirSync(join(rootDir, 'docs'), { recursive: true });
  writeFileSync(path, markdown, 'utf-8');
}

function scaffoldFixture(rootDir: string, oldSlug: string, entryId: string): void {
  const postDir = join(rootDir, 'src', 'sites', SITE, 'content', 'blog', oldSlug);
  mkdirSync(postDir, { recursive: true });
  mkdirSync(join(rootDir, 'src', 'sites', SITE, 'public'), { recursive: true });

  // Co-located content file + feature image in one directory.
  writeFileSync(
    join(postDir, 'index.md'),
    [
      '---',
      `title: "Example Post"`,
      `description: "Example description."`,
      `date: "April 2026"`,
      `datePublished: "2026-04-01"`,
      `dateModified: "2026-04-01"`,
      `author: "Orion Letizi"`,
      `image: "./feature-filtered.png"`,
      `socialImage: "./feature-og.png"`,
      `state: published`,
      '---',
      '',
      '# Example Post',
      '',
      'Body text.',
      '',
      '![a figure](./studio.png)',
      '',
    ].join('\n'),
    'utf-8',
  );
  writeFileSync(join(postDir, 'feature-og.png'), 'not-actually-a-png', 'utf-8');
  writeFileSync(join(postDir, 'studio.png'), 'not-actually-a-png', 'utf-8');

  writeCalendar(
    rootDir,
    SITE,
    [
      '# Editorial Calendar',
      '',
      '## Published',
      '',
      '| UUID | Slug | Title | Description | Keywords | Source | Published | Issue |',
      '|------|------|-------|-------------|----------|--------|-----------|-------|',
      `| ${entryId} | ${oldSlug} | Example Post | Example description. |  | manual | 2026-04-01 |  |`,
      '',
      '## Distribution',
      '',
      '| EntryID | Slug | Platform | URL | Shared | Notes |',
      '|---------|------|----------|-----|--------|-------|',
      `| ${entryId} | ${oldSlug} | reddit | https://reddit.com/r/x/1 | 2026-04-05 | r/x |`,
      '',
    ].join('\n'),
  );

  // Seed an existing _redirects so the append-path is exercised.
  writeFileSync(
    join(rootDir, 'src', 'sites', SITE, 'public', '_redirects'),
    '# existing\n/sitemap.xml /sitemap-index.xml 301\n',
    'utf-8',
  );
}

describe('Phase 18b+c: rename-slug helpers', () => {
  describe('validateSlug', () => {
    it('accepts kebab-case', () => {
      expect(() => validateSlug('my-post-name')).not.toThrow();
    });
    it('rejects uppercase', () => {
      expect(() => validateSlug('MyPost')).toThrow(/invalid slug/);
    });
    it('rejects leading hyphen', () => {
      expect(() => validateSlug('-foo')).toThrow(/invalid slug/);
    });
    it('rejects spaces', () => {
      expect(() => validateSlug('my post')).toThrow(/invalid slug/);
    });
  });

  describe('buildRedirectBlock', () => {
    it('emits blog URL redirects (bare / slash / splat)', () => {
      const block = buildRedirectBlock('old-post', 'new-post');
      expect(block).toContain('/blog/old-post');
      expect(block).toContain('/blog/new-post/');
      expect(block).toContain('/blog/old-post/*');
      expect(block).toContain('/blog/new-post/:splat');
      expect(block).toContain('301');
    });
    it('does not emit an /images/blog redirect under Phase 18c', () => {
      // Co-located assets are served at hashed /_astro/ URLs — no
      // slug-keyed image path exists to redirect from.
      const block = buildRedirectBlock('old-post', 'new-post');
      expect(block).not.toContain('/images/blog/');
    });
  });

  describe('renameSlug', () => {
    let rootDir: string;
    let entryId: string;
    const oldSlug = 'old-example-post';
    const newSlug = 'new-example-post';

    beforeEach(() => {
      rootDir = mkdtempSync(join(tmpdir(), 'phase18c-'));
      entryId = randomUUID();
      scaffoldFixture(rootDir, oldSlug, entryId);
    });

    afterEach(() => {
      rmSync(rootDir, { recursive: true, force: true });
    });

    const postDir = (r: string, slug: string) =>
      join(r, 'src', 'sites', SITE, 'content', 'blog', slug);

    it('dry-run lists actions without writing', () => {
      const result = renameSlug({ rootDir, site: SITE, oldSlug, newSlug, dryRun: true });
      expect(result.dryRun).toBe(true);
      expect(result.entryId).toBe(entryId);
      expect(result.actions.length).toBeGreaterThan(0);
      // Directory unchanged
      expect(existsSync(postDir(rootDir, oldSlug))).toBe(true);
      expect(existsSync(postDir(rootDir, newSlug))).toBe(false);
    });

    it('renames the whole post directory', () => {
      renameSlug({ rootDir, site: SITE, oldSlug, newSlug });
      expect(existsSync(postDir(rootDir, oldSlug))).toBe(false);
      expect(existsSync(postDir(rootDir, newSlug))).toBe(true);
      // Every file inside came along for the ride
      expect(existsSync(join(postDir(rootDir, newSlug), 'index.md'))).toBe(true);
      expect(existsSync(join(postDir(rootDir, newSlug), 'feature-og.png'))).toBe(true);
      expect(existsSync(join(postDir(rootDir, newSlug), 'studio.png'))).toBe(true);
    });

    it('leaves frontmatter ./ paths intact (co-located — no rewrite needed)', () => {
      renameSlug({ rootDir, site: SITE, oldSlug, newSlug });
      const markdown = readFileSync(
        join(postDir(rootDir, newSlug), 'index.md'),
        'utf-8',
      );
      expect(markdown).toContain('image: "./feature-filtered.png"');
      expect(markdown).toContain('socialImage: "./feature-og.png"');
      expect(markdown).toContain('![a figure](./studio.png)');
    });

    it('updates calendar entry.slug and keeps entry.id stable', () => {
      renameSlug({ rootDir, site: SITE, oldSlug, newSlug });
      const cal = readCalendar(rootDir, SITE);
      const entry = cal.entries.find((e) => e.id === entryId);
      expect(entry?.slug).toBe(newSlug);
      expect(entry?.id).toBe(entryId);
    });

    it('syncs slug on distribution records with the same entryId', () => {
      renameSlug({ rootDir, site: SITE, oldSlug, newSlug });
      const cal = readCalendar(rootDir, SITE);
      const records = cal.distributions.filter((d) => d.entryId === entryId);
      expect(records.length).toBeGreaterThan(0);
      for (const r of records) expect(r.slug).toBe(newSlug);
    });

    it('appends a 301 block to the site _redirects file', () => {
      renameSlug({ rootDir, site: SITE, oldSlug, newSlug });
      const redirects = readFileSync(
        join(rootDir, 'src', 'sites', SITE, 'public', '_redirects'),
        'utf-8',
      );
      expect(redirects).toContain('/sitemap.xml /sitemap-index.xml 301');
      expect(redirects).toContain(`/blog/${oldSlug}`);
      expect(redirects).toContain(`/blog/${newSlug}/`);
      expect(redirects).toContain(`/blog/${oldSlug}/*`);
    });

    it('refuses when newSlug is already taken', () => {
      const otherId = randomUUID();
      writeCalendar(
        rootDir,
        SITE,
        [
          '# Editorial Calendar',
          '',
          '## Published',
          '',
          '| UUID | Slug | Title | Description | Keywords | Source | Published | Issue |',
          '|------|------|-------|-------------|----------|--------|-----------|-------|',
          `| ${entryId} | ${oldSlug} | Example Post |  |  | manual | 2026-04-01 |  |`,
          `| ${otherId} | ${newSlug} | Other Post |  |  | manual | 2026-04-02 |  |`,
          '',
        ].join('\n'),
      );
      expect(() =>
        renameSlug({ rootDir, site: SITE, oldSlug, newSlug }),
      ).toThrow(/already taken/);
    });

    it('refuses when oldSlug has no calendar entry', () => {
      expect(() =>
        renameSlug({ rootDir, site: SITE, oldSlug: 'does-not-exist', newSlug }),
      ).toThrow(/no calendar entry/);
    });

    it('refuses when oldSlug === newSlug', () => {
      expect(() =>
        renameSlug({ rootDir, site: SITE, oldSlug, newSlug: oldSlug }),
      ).toThrow(/identical/);
    });

    it('refuses when the blog post directory is missing (drift guard)', () => {
      rmSync(postDir(rootDir, oldSlug), { recursive: true, force: true });
      expect(() =>
        renameSlug({ rootDir, site: SITE, oldSlug, newSlug }),
      ).toThrow(/drifted from disk|no directory/);
    });

    it('rejects malformed new slug before touching disk', () => {
      expect(() =>
        renameSlug({ rootDir, site: SITE, oldSlug, newSlug: 'Not A Slug' }),
      ).toThrow(/invalid slug/);
      expect(existsSync(postDir(rootDir, oldSlug))).toBe(true);
    });
  });
});

#!/usr/bin/env -S npx tsx
/*
 * enqueue.ts — helper for the /editorial-draft-review skill.
 *
 * Reads the blog markdown at src/sites/<site>/pages/blog/<slug>/index.md
 * and creates a longform review workflow in state `open`. The creation
 * is idempotent on (site, slug, contentKind): if a non-terminal workflow
 * already matches, the existing one is returned and we report it.
 *
 * Lives in the skill directory so the skill invokes a single stable
 * command instead of an ad-hoc one-liner:
 *
 *   npx tsx .claude/skills/editorial-draft-review/enqueue.ts --site <site> <slug>
 *
 * Exits non-zero with a descriptive message on failure:
 *   - unknown --site value
 *   - missing or malformed slug
 *   - missing blog markdown file (also lists the slugs that do exist)
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import {
  appendVersion,
  createWorkflow,
  readVersions,
} from '../../../scripts/lib/editorial-review/index.js';
import { assertSite, bodyState, type Site } from '../../../scripts/lib/editorial/index.js';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

interface Args {
  site: Site;
  slug: string;
}

function parseArgs(argv: readonly string[]): Args {
  let site: string | undefined;
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--site') {
      site = argv[++i];
      continue;
    }
    if (a.startsWith('--site=')) {
      site = a.slice('--site='.length);
      continue;
    }
    positional.push(a);
  }
  if (positional.length !== 1) {
    throw new Error('Usage: enqueue.ts [--site <site>] <slug>');
  }
  const slug = positional[0];
  if (!SLUG_RE.test(slug)) {
    throw new Error(`invalid slug: ${slug} (must match ${SLUG_RE})`);
  }
  return { site: assertSite(site), slug };
}

function blogDir(rootDir: string, site: Site, slug: string): string {
  return join(rootDir, 'src', 'sites', site, 'pages', 'blog', slug);
}

function listSiblingSlugs(rootDir: string, site: Site): string[] {
  const base = join(rootDir, 'src', 'sites', site, 'pages', 'blog');
  if (!existsSync(base)) return [];
  return readdirSync(base).filter((name) => {
    const p = join(base, name);
    try {
      return statSync(p).isDirectory() && existsSync(join(p, 'index.md'));
    } catch {
      return false;
    }
  });
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const rootDir = process.cwd();
  const dir = blogDir(rootDir, args.site, args.slug);
  const file = join(dir, 'index.md');

  if (!existsSync(file)) {
    const siblings = listSiblingSlugs(rootDir, args.site);
    const list = siblings.length > 0 ? siblings.map((s) => `  - ${s}`).join('\n') : '  (no posts yet)';
    throw new Error(
      `no blog markdown at ${file}\n` +
      `Expected scaffold under src/sites/${args.site}/pages/blog/${args.slug}/.\n` +
      `Existing slugs on ${args.site}:\n${list}\n` +
      `Run /editorial-draft --site ${args.site} ${args.slug} (or click Scaffold in the studio) to create it.`,
    );
  }

  const initialMarkdown = readFileSync(file, 'utf8');
  const body = bodyState(file);

  // createWorkflow is idempotent: if a non-terminal workflow already
  // matches (site, slug, contentKind='longform'), the existing one is
  // returned. Capture a timestamp BEFORE the call and treat any
  // workflow whose createdAt is at-or-after that moment as fresh.
  const before = Date.now();
  let workflow = createWorkflow(rootDir, {
    site: args.site,
    slug: args.slug,
    contentKind: 'longform',
    initialMarkdown,
    initialOriginatedBy: 'agent',
  });
  const fresh = Date.parse(workflow.createdAt) >= before;

  // If an existing workflow was matched (not freshly created) and its
  // current version's markdown doesn't match what's on disk now, the
  // file has moved on since the last enqueue (typical case: scaffold
  // → enqueue → /editorial-draft wrote the body). Append a new
  // version so the review UI reflects the current file instead of
  // the stale placeholder. This is what turns the review page from
  // "show v1 with placeholder" into "show v2 with real prose."
  let appended: 'none' | 'resync' = 'none';
  if (!fresh) {
    const versions = readVersions(rootDir, workflow.id);
    const current = versions.find((v) => v.version === workflow.currentVersion);
    if (current && current.markdown !== initialMarkdown) {
      appendVersion(rootDir, workflow.id, initialMarkdown, 'agent');
      appended = 'resync';
      const reRead = readVersions(rootDir, workflow.id);
      const latest = reRead[reRead.length - 1];
      if (latest) {
        workflow = { ...workflow, currentVersion: latest.version, updatedAt: latest.createdAt };
      }
    }
  }

  const url = `http://localhost:4321/dev/editorial-review/${args.slug}?site=${args.site}`;

  const lines = [
    fresh
      ? 'Enqueued new review workflow.'
      : appended === 'resync'
      ? 'Existing workflow matched; file diverged from last version — appended a new version.'
      : 'Existing review workflow matched; nothing created.',
    `  id      ${workflow.id}`,
    `  site    ${workflow.site}`,
    `  slug    ${workflow.slug}`,
    `  state   ${workflow.state}`,
    `  version ${workflow.currentVersion}`,
  ];
  if (body === 'placeholder') {
    lines.push('');
    lines.push('⚠  body is still the scaffold placeholder.');
    lines.push(`   Run /editorial-draft --site ${args.site} ${args.slug} to draft it.`);
    lines.push('   Reviewing a placeholder v1 is allowed but not useful.');
  }
  lines.push('');
  lines.push(`Review at: ${url}`);
  lines.push(`Start the dev server if needed: npm run dev:editorialcontrol`);
  process.stdout.write(lines.join('\n') + '\n');
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`editorial-draft-review/enqueue: ${message}\n`);
  process.exit(1);
}

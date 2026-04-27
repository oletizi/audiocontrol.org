#!/usr/bin/env -S npx tsx
/*
 * enqueue.ts — helper for the /editorial-draft-review skill.
 *
 * Reads the blog markdown at src/sites/<site>/content/blog/<slug>.md
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

function blogFilePath(rootDir: string, site: Site, slug: string): string {
  // Dir-based content collection (Phase 18c): file lives at
  // <slug>/index.md so per-post assets co-locate.
  return join(rootDir, 'src', 'sites', site, 'content', 'blog', slug, 'index.md');
}

function listSiblingSlugs(rootDir: string, site: Site): string[] {
  const base = join(rootDir, 'src', 'sites', site, 'content', 'blog');
  if (!existsSync(base)) return [];
  return readdirSync(base)
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.replace(/\.md$/, ''));
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const rootDir = process.cwd();
  const file = blogFilePath(rootDir, args.site, args.slug);

  if (!existsSync(file)) {
    const siblings = listSiblingSlugs(rootDir, args.site);
    const list = siblings.length > 0 ? siblings.map((s) => `  - ${s}`).join('\n') : '  (no posts yet)';
    throw new Error(
      `no blog markdown at ${file}\n` +
      `Expected scaffold under src/sites/${args.site}/content/blog/${args.slug}.md.\n` +
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
  const workflow = createWorkflow(rootDir, {
    site: args.site,
    slug: args.slug,
    contentKind: 'longform',
    initialMarkdown,
    initialOriginatedBy: 'agent',
  });
  const fresh = Date.parse(workflow.createdAt) >= before;

  // If an existing workflow was matched and the file on disk differs
  // from the workflow's current version, DO NOT silently append disk
  // as a new version. That was a previous behavior of this helper and
  // it produced a real bug: the operator's save-as-new-version edit
  // lived only in the journal (disk wasn't being written by the
  // review-UI Save handler), and the next resync copied the stale
  // disk over the operator's edit, obliterating it.
  //
  // The single-source-of-truth invariant is: the markdown file on
  // disk IS the article. The review-UI Save handler now writes to
  // disk first, then snapshots to the journal, so disk and the
  // latest version should agree at rest. Divergence here means
  // either:
  //
  //   a) The agent edited disk directly (e.g. via /editorial-iterate
  //      finalize) but hasn't snapshotted to the journal yet. That's
  //      legitimate uncommitted work — don't auto-commit it. The
  //      iterate skill takes care of its own snapshot.
  //   b) Stale journal from before the SSOT fix. The operator needs
  //      to reconcile manually.
  //
  // Report the divergence; don't fix it.
  let divergence: { diskLen: number; versionLen: number } | null = null;
  if (!fresh) {
    const versions = readVersions(rootDir, workflow.id);
    const current = versions.find((v) => v.version === workflow.currentVersion);
    if (current && current.markdown !== initialMarkdown) {
      divergence = {
        diskLen: initialMarkdown.length,
        versionLen: current.markdown.length,
      };
    }
  }

  const url = `http://localhost:4321/dev/editorial-review/${args.slug}?site=${args.site}`;

  const lines = [
    fresh
      ? 'Enqueued new review workflow.'
      : 'Existing review workflow matched; nothing created.',
    `  id      ${workflow.id}`,
    `  site    ${workflow.site}`,
    `  slug    ${workflow.slug}`,
    `  state   ${workflow.state}`,
    `  version ${workflow.currentVersion}`,
  ];
  if (divergence) {
    lines.push('');
    lines.push(
      '⚠  disk differs from the workflow\'s current version.',
    );
    lines.push(
      `   disk length = ${divergence.diskLen}, v${workflow.currentVersion} length = ${divergence.versionLen}.`,
    );
    lines.push(
      '   The file on disk is the source of truth. If this divergence was',
    );
    lines.push(
      '   intentional (agent edits mid-iterate), run /editorial-iterate to',
    );
    lines.push(
      '   snapshot. If unintended, reconcile manually before approving.',
    );
  }
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

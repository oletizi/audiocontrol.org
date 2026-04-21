#!/usr/bin/env -S npx tsx
/*
 * enqueue.ts — helper for the /editorial-outline skill.
 *
 * Scaffolds the blog file (frontmatter + # Title + empty ## Outline
 * section + body placeholder) at
 * `src/sites/<site>/content/blog/<slug>.md`, advances the calendar
 * stage Planned → Outlining, and creates an outline-review workflow
 * (contentKind: 'outline') in state `open` so the operator can
 * iterate on the shape via the dev-only review surface.
 *
 * Usage:
 *
 *   npx tsx .claude/skills/editorial-outline/enqueue.ts --site <site> <slug>
 *
 * Exits non-zero on:
 *   - unknown --site value
 *   - missing or malformed slug
 *   - unknown slug (lists existing Planned entries)
 *   - entry not in Planned (reports current stage)
 *   - blog file already exists (pipeline is out of sync)
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  assertSite,
  findEntry,
  outlineEntry,
  readCalendar,
  scaffoldBlogPost,
  writeCalendar,
  type Site,
} from '../../../scripts/lib/editorial/index.js';
import { createWorkflow } from '../../../scripts/lib/editorial-review/index.js';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const DRAFT_AUTHOR = 'Orion Letizi';

interface Args {
  site: Site;
  slug: string;
}

function parseArgs(argv: readonly string[]): Args {
  let site: string | undefined;
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--site') { site = argv[++i]; continue; }
    if (a.startsWith('--site=')) { site = a.slice('--site='.length); continue; }
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

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const rootDir = process.cwd();

  const cal = readCalendar(rootDir, args.site);
  const entry = findEntry(cal, args.slug);
  if (!entry) {
    const planned = cal.entries
      .filter((e) => e.stage === 'Planned')
      .map((e) => `  - ${e.slug}`)
      .join('\n');
    const list = planned || '  (none — add via /editorial-add + /editorial-plan)';
    throw new Error(
      `no calendar entry with slug "${args.slug}" on ${args.site}\n` +
      `Planned entries:\n${list}`,
    );
  }
  if (entry.stage !== 'Planned') {
    throw new Error(
      `entry "${args.slug}" is in stage "${entry.stage}" — must be Planned to outline.\n` +
      `If the entry has already been outlined, run /editorial-iterate to continue iterating,\n` +
      `or /editorial-outline-approve to advance to Drafting.`,
    );
  }

  const scaffolded = scaffoldBlogPost(rootDir, args.site, entry, DRAFT_AUTHOR);
  outlineEntry(cal, args.slug);
  writeCalendar(rootDir, args.site, cal);

  const initialMarkdown = readFileSync(scaffolded.filePath, 'utf8');
  const workflow = createWorkflow(rootDir, {
    site: args.site,
    slug: args.slug,
    contentKind: 'outline',
    initialMarkdown,
    initialOriginatedBy: 'agent',
  });

  const url = `http://localhost:4321/dev/editorial-review/${args.slug}?site=${args.site}`;

  const lines = [
    'Scaffolded outline and enqueued review workflow.',
    `  id      ${workflow.id}`,
    `  site    ${args.site}`,
    `  slug    ${args.slug}`,
    `  stage   Outlining`,
    `  file    ${scaffolded.relativePath}`,
    '',
    `Review at: ${url}`,
    `Start the dev server if needed: npm run dev:${args.site}`,
    '',
    'Next:',
    `  1. Sketch the outline in ${scaffolded.relativePath} under "## Outline" (ask the operator first, or let them write it).`,
    '  2. Iterate in the review UI until the operator approves.',
    `  3. /editorial-outline-approve --site ${args.site} ${args.slug}`,
  ];
  if (!existsSync(scaffolded.filePath)) {
    throw new Error(`expected scaffolded file at ${scaffolded.filePath}`);
  }
  process.stdout.write(lines.join('\n') + '\n');
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`editorial-outline/enqueue: ${message}\n`);
  process.exit(1);
}

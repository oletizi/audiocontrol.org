#!/usr/bin/env -S npx tsx
/*
 * apply.ts — helper for the /editorial-outline-approve skill.
 *
 * Terminal step for the outline loop. Validates the outline workflow
 * is in state `approved`, validates the calendar entry is in
 * Outlining, transitions the workflow to `applied`, and advances
 * the calendar Outlining → Drafting. Does NOT touch the blog file
 * on disk — by SSOT the file already holds the approved outline.
 *
 * Usage:
 *
 *   npx tsx .claude/skills/editorial-outline-approve/apply.ts --site <site> <slug>
 *
 * Exits non-zero with a descriptive message on:
 *   - unknown --site value
 *   - invalid slug
 *   - no outline workflow for (site, slug)
 *   - workflow not in state `approved`
 *   - calendar entry not in Outlining
 */

import {
  draftEntry,
  readCalendar,
  writeCalendar,
  assertSite,
  type Site,
} from '../../../scripts/lib/editorial/index.js';
import {
  handleGetWorkflow,
  transitionState,
  type DraftVersion,
  type DraftWorkflowItem,
} from '../../../scripts/lib/editorial-review/index.js';

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
    if (a === '--site') { site = argv[++i]; continue; }
    if (a.startsWith('--site=')) { site = a.slice('--site='.length); continue; }
    positional.push(a);
  }
  if (positional.length !== 1) {
    throw new Error('Usage: apply.ts [--site <site>] <slug>');
  }
  const slug = positional[0];
  if (!SLUG_RE.test(slug)) {
    throw new Error(`invalid slug: ${slug} (must match ${SLUG_RE})`);
  }
  return { site: assertSite(site), slug };
}

function isSuccessBody(
  body: unknown,
): body is { workflow: DraftWorkflowItem; versions: DraftVersion[] } {
  if (typeof body !== 'object' || body === null) return false;
  return 'workflow' in body && 'versions' in body;
}

function errorFromBody(body: unknown): string {
  if (typeof body === 'object' && body !== null) {
    const value = Reflect.get(body, 'error');
    if (typeof value === 'string') return value;
  }
  return 'unknown error';
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const rootDir = process.cwd();

  const fetched = handleGetWorkflow(rootDir, {
    id: null,
    site: args.site,
    slug: args.slug,
    contentKind: 'outline',
    platform: null,
    channel: null,
  });
  if (fetched.status !== 200 || !isSuccessBody(fetched.body)) {
    throw new Error(
      `no outline workflow for ${args.site}/${args.slug}: ${errorFromBody(fetched.body)}\n` +
      `Start one with: /editorial-outline --site ${args.site} ${args.slug}`,
    );
  }

  const workflow = fetched.body.workflow;
  if (workflow.state !== 'approved') {
    throw new Error(
      `Outline workflow is in state '${workflow.state}', not 'approved'.\n` +
      `Click Approve in the review UI first (that transitions to 'approved').`,
    );
  }

  const cal = readCalendar(rootDir, args.site);
  const entry = cal.entries.find((e) => e.slug === args.slug);
  if (!entry) {
    throw new Error(`no calendar entry for slug "${args.slug}" on ${args.site}`);
  }
  if (entry.stage !== 'Outlining') {
    throw new Error(
      `calendar entry "${args.slug}" is in stage "${entry.stage}", not Outlining.\n` +
      `This skill advances the outline → drafting transition; the entry must be in Outlining.`,
    );
  }

  // Stage transition + workflow transition. Neither touches disk —
  // the approved outline is already on disk per SSOT.
  draftEntry(cal, args.slug);
  writeCalendar(rootDir, args.site, cal);
  transitionState(rootDir, workflow.id, 'applied');

  const lines = [
    'Outline approved. Calendar advanced Outlining → Drafting.',
    `  id     ${workflow.id}`,
    `  site   ${args.site}`,
    `  slug   ${args.slug}`,
    `  stage  Drafting`,
    '',
    'Next:',
    `  /editorial-draft --site ${args.site} ${args.slug}   # draft the body using the voice skill`,
  ];
  process.stdout.write(lines.join('\n') + '\n');
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`editorial-outline-approve/apply: ${message}\n`);
  process.exit(1);
}

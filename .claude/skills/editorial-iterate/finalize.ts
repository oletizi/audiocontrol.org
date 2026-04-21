#!/usr/bin/env -S npx tsx
/*
 * finalize.ts — helper for the /editorial-iterate skill.
 *
 * Call this AFTER the agent has rewritten the blog markdown file on
 * disk based on the operator's comments + the site voice skill. The
 * helper does the mechanical persist-and-transition step:
 *
 *   1. Read the existing workflow (must be in state `iterating`).
 *   2. If the file on disk differs from the workflow's current
 *      version, append a new version (originatedBy = 'agent').
 *   3. Transition the workflow back to `in-review`.
 *   4. Report workflow id, new version, review URL.
 *
 * Usage:
 *
 *   npx tsx .claude/skills/editorial-iterate/finalize.ts --site <site> <slug>
 *
 * Refuses (non-zero exit) on:
 *   - Missing / malformed slug
 *   - Unknown site
 *   - Missing blog file
 *   - No workflow for this slug
 *   - Workflow not in `iterating` state (tells the operator the current
 *     state + the next expected action)
 *   - File on disk still matches the current version (no revision was
 *     actually written; refuse rather than producing a duplicate version)
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  appendVersion,
  handleGetWorkflow,
  readVersions,
  transitionState,
  type DraftVersion,
  type DraftWorkflowItem,
} from '../../../scripts/lib/editorial-review/index.js';
import { assertSite, type Site } from '../../../scripts/lib/editorial/index.js';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

type IterableKind = 'longform' | 'outline';

interface Args {
  site: Site;
  slug: string;
  kind: IterableKind;
}

function parseKind(value: string | undefined): IterableKind {
  if (value === undefined || value === '' || value === 'longform') return 'longform';
  if (value === 'outline') return 'outline';
  throw new Error(`invalid --kind: ${value} (expected 'longform' or 'outline')`);
}

function parseArgs(argv: readonly string[]): Args {
  let site: string | undefined;
  let kindRaw: string | undefined;
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--site') { site = argv[++i]; continue; }
    if (a.startsWith('--site=')) { site = a.slice('--site='.length); continue; }
    if (a === '--kind') { kindRaw = argv[++i]; continue; }
    if (a.startsWith('--kind=')) { kindRaw = a.slice('--kind='.length); continue; }
    positional.push(a);
  }
  if (positional.length !== 1) {
    throw new Error('Usage: finalize.ts [--site <site>] [--kind <longform|outline>] <slug>');
  }
  const slug = positional[0];
  if (!SLUG_RE.test(slug)) {
    throw new Error(`invalid slug: ${slug} (must match ${SLUG_RE})`);
  }
  return { site: assertSite(site), slug, kind: parseKind(kindRaw) };
}

function blogFilePath(rootDir: string, site: Site, slug: string): string {
  return join(rootDir, 'src', 'sites', site, 'content', 'blog', `${slug}.md`);
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
  const file = blogFilePath(rootDir, args.site, args.slug);

  if (!existsSync(file)) {
    throw new Error(`no blog markdown at ${file}`);
  }

  const fetched = handleGetWorkflow(rootDir, {
    id: null,
    site: args.site,
    slug: args.slug,
    contentKind: args.kind,
    platform: null,
    channel: null,
  });

  if (fetched.status !== 200 || !isSuccessBody(fetched.body)) {
    const starter =
      args.kind === 'outline'
        ? `/editorial-outline --site ${args.site} ${args.slug}`
        : `/editorial-draft-review --site ${args.site} ${args.slug}`;
    throw new Error(
      `no workflow for ${args.site}/${args.slug} (${args.kind}): ${errorFromBody(fetched.body)}\n` +
      `Start one with: ${starter}`,
    );
  }

  const workflow = fetched.body.workflow;

  if (workflow.state !== 'iterating') {
    throw new Error(
      `Workflow is in state '${workflow.state}', not 'iterating'.\n` +
      `Expected: the operator clicks Iterate in the review UI (which transitions to 'iterating') before this helper runs.\n` +
      `Run /editorial-review-help to see each workflow's next action.`,
    );
  }

  const versions = readVersions(rootDir, workflow.id);
  const current = versions.find((v) => v.version === workflow.currentVersion);
  if (!current) {
    throw new Error(`Workflow v${workflow.currentVersion} not found in history`);
  }

  const diskMarkdown = readFileSync(file, 'utf8');
  if (diskMarkdown === current.markdown) {
    throw new Error(
      `File on disk matches v${workflow.currentVersion} exactly — no revision was written.\n` +
      `Edit ${file} against the operator's comments first, then re-run this helper.`,
    );
  }

  const nextVersion = appendVersion(rootDir, workflow.id, diskMarkdown, 'agent');
  transitionState(rootDir, workflow.id, 'in-review');

  const reviewUrl = `http://localhost:4321/dev/editorial-review/${args.slug}?site=${args.site}`;
  const lines = [
    `Iterated. v${nextVersion.version} persisted; workflow is now in 'in-review'.`,
    `  id       ${workflow.id}`,
    `  site     ${args.site}`,
    `  slug     ${args.slug}`,
    `  version  ${nextVersion.version}`,
    '',
    `Review at: ${reviewUrl}`,
    `Operator decides next: Approve / Iterate again / Reject.`,
  ];
  process.stdout.write(lines.join('\n') + '\n');
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`editorial-iterate/finalize: ${message}\n`);
  process.exit(1);
}

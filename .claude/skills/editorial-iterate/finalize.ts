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
  appendAnnotation,
  appendVersion,
  handleGetWorkflow,
  mintAnnotation,
  readVersions,
  transitionState,
  type DraftVersion,
  type DraftWorkflowItem,
} from '../../../scripts/lib/editorial-review/index.js';
import { assertSite, type Site } from '../../../scripts/lib/editorial/index.js';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const DISPOSITIONS = new Set(['addressed', 'deferred', 'wontfix'] as const);
type Disposition = 'addressed' | 'deferred' | 'wontfix';

interface DispositionEntry {
  disposition: Disposition;
  reason?: string;
}

type DispositionMap = Record<string, DispositionEntry>;

type IterableKind = 'longform' | 'outline';

interface Args {
  site: Site;
  slug: string;
  kind: IterableKind;
  dispositionsPath?: string;
}

function parseKind(value: string | undefined): IterableKind {
  if (value === undefined || value === '' || value === 'longform') return 'longform';
  if (value === 'outline') return 'outline';
  throw new Error(`invalid --kind: ${value} (expected 'longform' or 'outline')`);
}

function parseArgs(argv: readonly string[]): Args {
  let site: string | undefined;
  let kindRaw: string | undefined;
  let dispositionsPath: string | undefined;
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--site') { site = argv[++i]; continue; }
    if (a.startsWith('--site=')) { site = a.slice('--site='.length); continue; }
    if (a === '--kind') { kindRaw = argv[++i]; continue; }
    if (a.startsWith('--kind=')) { kindRaw = a.slice('--kind='.length); continue; }
    if (a === '--dispositions') { dispositionsPath = argv[++i]; continue; }
    if (a.startsWith('--dispositions=')) { dispositionsPath = a.slice('--dispositions='.length); continue; }
    positional.push(a);
  }
  if (positional.length !== 1) {
    throw new Error(
      'Usage: finalize.ts [--site <site>] [--kind <longform|outline>] ' +
      '[--dispositions <path>] <slug>',
    );
  }
  const slug = positional[0];
  if (!SLUG_RE.test(slug)) {
    throw new Error(`invalid slug: ${slug} (must match ${SLUG_RE})`);
  }
  return { site: assertSite(site), slug, kind: parseKind(kindRaw), dispositionsPath };
}

/**
 * Load and validate a dispositions JSON file. Shape:
 *   { "<commentId>": { "disposition": "addressed"|"deferred"|"wontfix",
 *                      "reason": "optional text" }, ... }
 * Throws on any structural violation — we'd rather fail loudly than
 * silently skip a comment the agent intended to address.
 */
function loadDispositions(path: string): DispositionMap {
  const raw = readFileSync(path, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`dispositions: expected JSON object at ${path}`);
  }
  const out: DispositionMap = {};
  for (const [commentId, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`dispositions[${commentId}]: expected object with 'disposition' field`);
    }
    const v = value as { disposition?: unknown; reason?: unknown };
    if (typeof v.disposition !== 'string' || !DISPOSITIONS.has(v.disposition as Disposition)) {
      throw new Error(
        `dispositions[${commentId}]: disposition must be one of ${[...DISPOSITIONS].join(', ')}`,
      );
    }
    if (v.reason !== undefined && typeof v.reason !== 'string') {
      throw new Error(`dispositions[${commentId}]: reason must be a string if provided`);
    }
    out[commentId] = {
      disposition: v.disposition as Disposition,
      ...(typeof v.reason === 'string' ? { reason: v.reason } : {}),
    };
  }
  return out;
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

  // Record per-comment dispositions if provided. Written AFTER
  // appendVersion so the `version` field matches the snapshot that
  // the agent claims to have addressed these comments in.
  const dispositions: DispositionMap = args.dispositionsPath
    ? loadDispositions(args.dispositionsPath)
    : {};
  const dispositionCount = { addressed: 0, deferred: 0, wontfix: 0 };
  for (const [commentId, entry] of Object.entries(dispositions)) {
    const annotation = mintAnnotation({
      type: 'address',
      workflowId: workflow.id,
      commentId,
      version: nextVersion.version,
      disposition: entry.disposition,
      ...(entry.reason ? { reason: entry.reason } : {}),
    });
    appendAnnotation(rootDir, annotation);
    dispositionCount[entry.disposition]++;
  }

  transitionState(rootDir, workflow.id, 'in-review');

  const reviewUrl = `http://localhost:4321/dev/editorial-review/${args.slug}?site=${args.site}`;
  const dispositionLine = args.dispositionsPath
    ? `  address  ${dispositionCount.addressed} addressed, ${dispositionCount.deferred} deferred, ${dispositionCount.wontfix} wontfix`
    : `  address  (no --dispositions provided; no address annotations written)`;
  const lines = [
    `Iterated. v${nextVersion.version} persisted; workflow is now in 'in-review'.`,
    `  id       ${workflow.id}`,
    `  site     ${args.site}`,
    `  slug     ${args.slug}`,
    `  version  ${nextVersion.version}`,
    dispositionLine,
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

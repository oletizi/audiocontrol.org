#!/usr/bin/env -S npx tsx
/*
 * apply.ts — helper for the /editorial-approve skill.
 *
 * Terminal write step for the review loop. Validates the workflow
 * state, resolves the approved version via the latest 'approve'
 * annotation, and transitions the workflow to 'applied'.
 *
 * Under the single-source-of-truth invariant (the markdown file is
 * the article; the journal is history), the longform path has
 * nothing to write at approve time — disk is already the approved
 * content because the review-UI Save handler writes disk first and
 * the approve-annotation captures the current version at click time.
 * If the workflow's current version has moved on since the approve
 * annotation was recorded (operator saved more edits after clicking
 * Approve), this helper refuses rather than silently rolling disk
 * back to a stale snapshot. The operator re-clicks Approve on the
 * now-current version to proceed.
 *
 * Shortform is different: there is no per-post file. The approved
 * markdown is inserted into the matching DistributionRecord's
 * `shortform` field in the calendar. That write is still required.
 *
 * Usage:
 *
 *   npx tsx .claude/skills/editorial-approve/apply.ts --site <site> <slug>
 *   npx tsx .claude/skills/editorial-approve/apply.ts --site <site> <slug> --platform <p> [--channel <c>]
 *
 * Exits non-zero on any validation failure with a message that
 * names the specific next step the operator should take.
 */

import { existsSync } from 'fs';
import { join } from 'path';
import {
  handleGetWorkflow,
  readAnnotations,
  transitionState,
  type DraftAnnotation,
  type DraftVersion,
  type DraftWorkflowItem,
} from '../../../scripts/lib/editorial-review/index.js';
import {
  assertSite,
  readCalendar,
  writeCalendar,
  type Site,
} from '../../../scripts/lib/editorial/index.js';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

interface Args {
  site: Site;
  slug: string;
  platform?: string;
  channel?: string;
}

function parseArgs(argv: readonly string[]): Args {
  let site: string | undefined;
  let platform: string | undefined;
  let channel: string | undefined;
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--site') { site = argv[++i]; continue; }
    if (a.startsWith('--site=')) { site = a.slice('--site='.length); continue; }
    if (a === '--platform') { platform = argv[++i]; continue; }
    if (a.startsWith('--platform=')) { platform = a.slice('--platform='.length); continue; }
    if (a === '--channel') { channel = argv[++i]; continue; }
    if (a.startsWith('--channel=')) { channel = a.slice('--channel='.length); continue; }
    positional.push(a);
  }
  if (positional.length !== 1) {
    throw new Error('Usage: apply.ts [--site <site>] <slug> [--platform <p>] [--channel <c>]');
  }
  const slug = positional[0];
  if (!SLUG_RE.test(slug)) {
    throw new Error(`invalid slug: ${slug} (must match ${SLUG_RE})`);
  }
  return {
    site: assertSite(site),
    slug,
    ...(platform ? { platform } : {}),
    ...(channel ? { channel } : {}),
  };
}

function isSuccessBody(body: unknown): body is { workflow: DraftWorkflowItem; versions: DraftVersion[] } {
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

/** Find the most recent 'approve' annotation for this workflow. */
function latestApproveAnnotation(annotations: readonly DraftAnnotation[]): DraftAnnotation | undefined {
  const approves = annotations.filter((a) => a.type === 'approve');
  if (approves.length === 0) return undefined;
  return approves.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
}

function applyLongform(
  rootDir: string,
  args: Args,
  workflow: DraftWorkflowItem,
  approvedVersion: number,
): string[] {
  // SSOT invariant: disk IS the approved content whenever
  // approvedVersion == workflow.currentVersion. Nothing to write.
  if (approvedVersion !== workflow.currentVersion) {
    throw new Error(
      `Approved v${approvedVersion}, but workflow is at v${workflow.currentVersion}.\n` +
      `Disk has moved on since the approve click. Two paths:\n` +
      `  - Re-click Approve in the review UI to annotate v${workflow.currentVersion} as approved, then re-run.\n` +
      `  - Iterate to bring disk back to v${approvedVersion}'s content, then re-run.`,
    );
  }

  // Sanity: the file should exist. If not, something went wrong
  // earlier in the pipeline (scaffold was removed, wrong slug, etc).
  // Post-Phase-18c, blog posts are directories with co-located assets;
  // the markdown file is at <slug>/index.md.
  const blogFile = join(rootDir, 'src', 'sites', args.site, 'content', 'blog', args.slug, 'index.md');
  if (!existsSync(blogFile)) {
    throw new Error(
      `Blog file missing at ${blogFile}.\n` +
      `The approve step assumes disk is the source of truth, but there is no file to approve. ` +
      `Run /editorial-draft-review <slug> once the file exists.`,
    );
  }

  transitionState(rootDir, workflow.id, 'applied');

  return [
    `Applied. Disk already has the approved content — no write needed.`,
    `  id       ${workflow.id}`,
    `  site     ${args.site}`,
    `  slug     ${args.slug}`,
    `  file     ${blogFile}`,
    `  version  v${approvedVersion}`,
    '',
    `Next (manual):`,
    `  git status`,
    `  git diff ${blogFile}`,
    `  git add ${blogFile}`,
    `  git commit -m "..."`,
    `  git push`,
  ];
}

function applyShortform(
  rootDir: string,
  args: Args,
  workflow: DraftWorkflowItem,
  versions: readonly DraftVersion[],
  approvedVersion: number,
): string[] {
  if (!args.platform) {
    throw new Error('--platform is required for shortform workflows');
  }
  const approvedMarkdown = versions.find((v) => v.version === approvedVersion)?.markdown;
  if (approvedMarkdown == null) {
    throw new Error(`approved v${approvedVersion} not found in history`);
  }

  // Shortform does not have a separate markdown file. The approved
  // markdown lives in the calendar's DistributionRecord for this
  // (slug, platform, channel). Find and update that record.
  const cal = readCalendar(rootDir, args.site);
  const channelLower = args.channel?.toLowerCase();
  const match = cal.distributions.find((d) => {
    if (d.slug !== args.slug) return false;
    if (d.platform !== args.platform) return false;
    if (channelLower) {
      const dChannel = d.channel?.toLowerCase();
      return dChannel === channelLower;
    }
    return !d.channel;
  });
  if (!match) {
    const channelBit = args.channel ? ` · channel=${args.channel}` : '';
    throw new Error(
      `No DistributionRecord for (slug=${args.slug}, platform=${args.platform}${channelBit}).\n` +
      `Create it with /editorial-distribute first. This skill writes copy into an existing record; ` +
      `it does not create new DistributionRecords.`,
    );
  }

  match.shortform = approvedMarkdown;
  writeCalendar(rootDir, args.site, cal);
  transitionState(rootDir, workflow.id, 'applied');

  const channelBit = args.channel ? ` · ${args.channel}` : '';
  return [
    `Applied. Wrote approved shortform copy into the calendar.`,
    `  id       ${workflow.id}`,
    `  site     ${args.site}`,
    `  slug     ${args.slug}`,
    `  platform ${args.platform}${channelBit}`,
    `  version  v${approvedVersion}`,
    '',
    `Next (manual):`,
    `  git status`,
    `  git diff docs/editorial-calendar-${args.site}.md`,
    `  git add docs/editorial-calendar-${args.site}.md`,
    `  git commit -m "..."`,
    `  git push`,
    '',
    `When you actually share the post, record the live URL with /editorial-distribute.`,
  ];
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const rootDir = process.cwd();
  // /editorial-approve is terminal for longform and shortform only.
  // Outline approvals go through /editorial-outline-approve, which
  // advances the calendar Outlining → Drafting instead of finalizing.
  const contentKind = args.platform ? 'shortform' : 'longform';

  // Resolve slug → entryId via the calendar so the workflow join
  // survives post-Phase-18 slug renames. If the calendar has no
  // entry for this slug (fresh intake before /editorial-plan) we
  // still get a legacy (site, slug) match inside handleGetWorkflow.
  const calendar = readCalendar(rootDir, args.site);
  const entryId = calendar.entries.find(e => e.slug === args.slug)?.id ?? null;

  const fetched = handleGetWorkflow(rootDir, {
    id: null,
    entryId,
    site: args.site,
    slug: args.slug,
    contentKind,
    platform: args.platform ?? null,
    channel: args.channel ?? null,
  });

  if (fetched.status !== 200 || !isSuccessBody(fetched.body)) {
    throw new Error(
      `no ${contentKind} workflow for ${args.site}/${args.slug}: ${errorFromBody(fetched.body)}`,
    );
  }

  const workflow = fetched.body.workflow;
  const versions = fetched.body.versions;

  if (workflow.state !== 'approved') {
    throw new Error(
      `Workflow state is '${workflow.state}', not 'approved'.\n` +
      `Click Approve in the review UI first (that transitions to 'approved' and records which version was approved).`,
    );
  }

  const annotations = readAnnotations(rootDir, workflow.id);
  const approveAnn = latestApproveAnnotation(annotations);
  const approvedVersion = approveAnn?.version ?? workflow.currentVersion;
  if (!approveAnn) {
    process.stderr.write(
      `warn: no 'approve' annotation found; falling back to current version v${approvedVersion}\n`,
    );
  }

  const lines =
    contentKind === 'longform'
      ? applyLongform(rootDir, args, workflow, approvedVersion)
      : applyShortform(rootDir, args, workflow, versions, approvedVersion);
  process.stdout.write(lines.join('\n') + '\n');
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`editorial-approve/apply: ${message}\n`);
  process.exit(1);
}

#!/usr/bin/env -S npx tsx
/*
 * pending.ts — pre-step helper for the /editorial-iterate skill.
 *
 * Prints a structured report of everything the iterate skill needs
 * before it can revise: workflow lookup, state check, version
 * history, pending (unresolved) comment annotations on the current
 * version. Replaces the ad-hoc shell pipelines that were being
 * re-assembled every iterate turn.
 *
 * Usage:
 *
 *   npx tsx .claude/skills/editorial-iterate/pending.ts --site <site> <slug>
 *   npx tsx .claude/skills/editorial-iterate/pending.ts --site <site> <slug> --kind outline
 *
 * Output is human-readable markdown; the iterate skill reads it,
 * decides whether to proceed (state == iterating AND at least one
 * pending comment), then does the revision work. Non-zero exit if
 * the workflow can't be resolved or the state isn't iterating.
 */

import {
  handleGetWorkflow,
  readAnnotations,
  type CommentAnnotation,
  type DraftAnnotation,
  type DraftVersion,
  type DraftWorkflowItem,
  type ResolveAnnotation,
} from '../../../scripts/lib/editorial-review/index.js';
import { assertSite, type Site } from '../../../scripts/lib/editorial/index.js';

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

type Kind = 'longform' | 'outline';

interface Args {
  site: Site;
  slug: string;
  kind: Kind;
}

function parseArgs(argv: readonly string[]): Args {
  let site: string | undefined;
  let kind: Kind = 'longform';
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--site') { site = argv[++i]; continue; }
    if (a.startsWith('--site=')) { site = a.slice('--site='.length); continue; }
    if (a === '--kind') { kind = argv[++i] === 'outline' ? 'outline' : 'longform'; continue; }
    if (a.startsWith('--kind=')) { kind = a.slice('--kind='.length) === 'outline' ? 'outline' : 'longform'; continue; }
    positional.push(a);
  }
  if (positional.length !== 1) {
    throw new Error('Usage: pending.ts [--site <site>] [--kind <longform|outline>] <slug>');
  }
  const slug = positional[0];
  if (!SLUG_RE.test(slug)) {
    throw new Error(`invalid slug: ${slug}`);
  }
  return { site: assertSite(site), slug, kind };
}

function isSuccess(body: unknown): body is { workflow: DraftWorkflowItem; versions: DraftVersion[] } {
  return typeof body === 'object' && body !== null && 'workflow' in body && 'versions' in body;
}

function isComment(a: DraftAnnotation): a is CommentAnnotation {
  return a.type === 'comment';
}
function isResolve(a: DraftAnnotation): a is ResolveAnnotation {
  return a.type === 'resolve';
}

/** Latest-wins resolution state per commentId. */
function resolvedCommentIds(anns: readonly DraftAnnotation[]): Set<string> {
  const resolves = anns.filter(isResolve).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const state = new Map<string, boolean>();
  for (const r of resolves) state.set(r.commentId, r.resolved);
  const out = new Set<string>();
  for (const [id, isResolved] of state) if (isResolved) out.add(id);
  return out;
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const rootDir = process.cwd();
  const fetched = handleGetWorkflow(rootDir, {
    id: null,
    site: args.site,
    slug: args.slug,
    contentKind: args.kind,
    platform: null,
    channel: null,
  });
  if (fetched.status !== 200 || !isSuccess(fetched.body)) {
    const err = typeof fetched.body === 'object' && fetched.body && Reflect.get(fetched.body, 'error');
    process.stderr.write(
      `no ${args.kind} workflow for ${args.site}/${args.slug}: ${String(err ?? 'unknown')}\n`,
    );
    process.exit(2);
  }
  const { workflow, versions } = fetched.body;
  const annotations = readAnnotations(rootDir, workflow.id);
  const resolved = resolvedCommentIds(annotations);
  const current = workflow.currentVersion;
  // "Pending" means unresolved — regardless of which version the
  // comment was originally attached to. Prior-version comments that
  // rebased onto text still present in the current body are every bit
  // as much the operator's revision brief as freshly-minted comments
  // on the current version. The earlier current-only filter was
  // wrong: it silently dropped carried-forward concerns that the
  // anchor rebasing mechanism explicitly exists to preserve.
  const pending = annotations
    .filter(isComment)
    .filter((c) => !resolved.has(c.id))
    .sort((a, b) => {
      // Current-version comments first (those have authoritative
      // offsets and natural reading order); then prior-version
      // comments in descending version order so the freshest
      // carried-forward concerns come next.
      if (a.version !== b.version) {
        if (a.version === current) return -1;
        if (b.version === current) return 1;
        return b.version - a.version;
      }
      return a.range.start - b.range.start;
    });
  const currentCount = pending.filter((c) => c.version === current).length;
  const priorCount = pending.length - currentCount;

  const lines: string[] = [];
  lines.push(`Workflow ${workflow.id.slice(0, 8)} · ${workflow.contentKind} · state=${workflow.state} · v${current}`);
  lines.push(`  ${args.site}/${args.slug}`);
  lines.push('');
  if (workflow.state !== 'iterating') {
    lines.push(`state is '${workflow.state}', not 'iterating' — nothing to iterate.`);
    if (workflow.state === 'in-review') lines.push('  operator must click Iterate in the review UI first.');
    if (workflow.state === 'open') lines.push('  operator must open the review page first.');
    if (['approved', 'applied', 'cancelled'].includes(workflow.state)) {
      lines.push('  terminal state; revision is a no-op.');
    }
    process.stdout.write(lines.join('\n') + '\n');
    process.exit(3);
  }
  lines.push(
    `Unresolved comments: ${pending.length}` +
    (pending.length > 0
      ? ` (${currentCount} on v${current}` +
        (priorCount > 0 ? `, ${priorCount} carried forward from prior versions` : '') +
        `)`
      : ''),
  );
  if (pending.length === 0) {
    lines.push('');
    lines.push('No unresolved comments. Iterate was likely clicked without marks, or all marks are resolved.');
    process.stdout.write(lines.join('\n') + '\n');
    process.exit(4);
  }
  lines.push('');
  for (const [idx, c] of pending.entries()) {
    const origin = c.version === current ? `v${current}` : `from v${c.version}`;
    lines.push(`${idx + 1}. [${c.range.start}-${c.range.end}] id=${c.id.slice(0, 8)} · ${origin}` +
      (c.category ? ` · ${c.category}` : ''));
    const anchor = c.anchor ?? '(no anchor captured)';
    lines.push(`   anchor: ${JSON.stringify(anchor.length > 160 ? anchor.slice(0, 160) + '…' : anchor)}`);
    const text = (c.text || '').replace(/\s+/g, ' ').trim();
    lines.push(`   note:   ${text.length > 300 ? text.slice(0, 300) + '…' : text}`);
    lines.push('');
  }
  // Version history summary — helpful for recalling what prior
  // iterations looked like without having to re-read the journal.
  lines.push(`Versions: ${versions.map((v) => `v${v.version}(${v.originatedBy})`).join(' → ')}`);
  process.stdout.write(lines.join('\n') + '\n');
}

try {
  main();
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`editorial-iterate/pending: ${msg}\n`);
  process.exit(1);
}

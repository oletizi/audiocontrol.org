#!/usr/bin/env tsx
/*
 * apply.ts — apply a single approved image to its target post.
 *
 * Handles both routes through the pipeline:
 *   1. A decided workflow item (has postPath + logEntryId)
 *   2. A freestanding approved log entry (no workflow; caller supplies target)
 *
 * Responsibilities per invocation:
 *   - Copy -og, -youtube, -instagram, -filtered, and -raw files from the
 *     scratch output dir to src/sites/<site>/public/images/blog/<slug>/
 *     with the feature-<format>.png naming convention
 *   - Edit the post markdown frontmatter to add image + socialImage fields
 *   - Mark the log entry with appliedTo=<postPath>
 *   - If applying a decided workflow, mark the workflow applied with
 *     changedFiles
 *
 * Usage (one of):
 *   tsx .claude/skills/feature-image-apply/apply.ts --workflow=<id>
 *   tsx .claude/skills/feature-image-apply/apply.ts --entry=<id> --to=<post-path>
 *
 * Optional:
 *   --base=<url>        Override http://localhost:4321
 *   --dry-run           Print plan without writing files
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

type Site = 'audiocontrol' | 'editorialcontrol';

interface Args {
  base: string;
  workflowId?: string;
  entryId?: string;
  to?: string;
  dryRun: boolean;
}

function parseArgs(): Args {
  const args: Args = { base: 'http://localhost:4321', dryRun: false };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--base=')) args.base = arg.slice('--base='.length);
    else if (arg.startsWith('--workflow=')) args.workflowId = arg.slice('--workflow='.length);
    else if (arg.startsWith('--entry=')) args.entryId = arg.slice('--entry='.length);
    else if (arg.startsWith('--to=')) args.to = arg.slice('--to='.length);
    else if (arg === '--dry-run') args.dryRun = true;
  }
  if (!args.workflowId && !args.entryId) {
    throw new Error('Pass --workflow=<id> or --entry=<id>');
  }
  if (args.entryId && !args.to) {
    throw new Error('--entry requires --to=<post-path>');
  }
  return args;
}

function repoRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '..', '..', '..');
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url}: ${res.status}`);
  return (await res.json()) as T;
}

async function postJson(url: string, body: unknown): Promise<unknown> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${url}: ${res.status} ${text}`);
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

interface LogEntry {
  id: string;
  title?: string;
  site?: Site;
  outputs?: {
    raw?: string[];
    filtered?: string[];
    composited?: Array<{ format: string; path: string }>;
  };
}

interface WorkflowItem {
  id: string;
  state: string;
  context: { postPath?: string; slug?: string; site?: Site; title?: string };
  decision?: { logEntryId: string };
}

/** Resolve URL-style public path (/images/...) to absolute filesystem path. */
function resolvePublicPath(urlPath: string, root: string): string {
  // Scratch output lands in audiocontrol's publicDir (GALLERY_HOST_SITE).
  // URL path /images/generated/foo.png → src/sites/audiocontrol/public/images/generated/foo.png
  const clean = urlPath.replace(/^\//, '');
  return join(root, 'src', 'sites', 'audiocontrol', 'public', clean);
}

function siteFromPostPath(postPath: string): Site {
  const match = postPath.match(/src\/sites\/([^/]+)/);
  if (match && (match[1] === 'audiocontrol' || match[1] === 'editorialcontrol')) {
    return match[1] as Site;
  }
  throw new Error(`Cannot infer site from post path: ${postPath}`);
}

function slugFromPostPath(postPath: string): string {
  const match = postPath.match(/pages\/blog\/([^/]+)\/index\.md$/);
  if (!match) throw new Error(`Cannot infer slug from post path: ${postPath}`);
  return match[1];
}

function copyVariant(source: string, dest: string, root: string, dryRun: boolean): string | null {
  const absSource = resolvePublicPath(source, root);
  if (!existsSync(absSource)) {
    console.warn(`  skip: source missing ${absSource}`);
    return null;
  }
  if (dryRun) {
    console.log(`  [dry-run] copy ${absSource} → ${dest}`);
    return dest;
  }
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(absSource, dest);
  console.log(`  copied ${basename(absSource)} → ${basename(dest)}`);
  return dest;
}

function upsertFrontmatterField(src: string, key: string, value: string): string {
  const fmMatch = src.match(/^(---\s*\n)([\s\S]*?)(\n---)/);
  if (!fmMatch) throw new Error('no YAML frontmatter found');
  const fmBody = fmMatch[2];
  const fieldRx = new RegExp(`^${key}:.*$`, 'm');
  if (fieldRx.test(fmBody)) {
    const nextFmBody = fmBody.replace(fieldRx, `${key}: "${value}"`);
    return src.replace(fmMatch[0], fmMatch[1] + nextFmBody + fmMatch[3]);
  }
  const nextFmBody = fmBody.trimEnd() + `\n${key}: "${value}"`;
  return src.replace(fmMatch[0], fmMatch[1] + nextFmBody + fmMatch[3]);
}

function updateFrontmatter(postPath: string, slug: string, dryRun: boolean): void {
  const abs = join(repoRoot(), postPath);
  if (!existsSync(abs)) {
    throw new Error(`post missing: ${abs}`);
  }
  const src = readFileSync(abs, 'utf-8');
  const today = new Date().toISOString().slice(0, 10);
  let next = src;
  next = upsertFrontmatterField(next, 'image', `/images/blog/${slug}/feature-filtered.png`);
  next = upsertFrontmatterField(next, 'socialImage', `/images/blog/${slug}/feature-og.png`);
  next = upsertFrontmatterField(next, 'dateModified', today);
  if (next === src) {
    console.log('  frontmatter already current (no diff)');
    return;
  }
  if (dryRun) {
    console.log(`  [dry-run] update frontmatter: image, socialImage, dateModified=${today}`);
    return;
  }
  writeFileSync(abs, next, 'utf-8');
  console.log(`  updated frontmatter: image, socialImage, dateModified=${today}`);
}

async function main() {
  const args = parseArgs();
  const root = repoRoot();

  // Resolve entry + target from either mode.
  let entryId: string;
  let postPath: string;
  let workflow: WorkflowItem | null = null;

  if (args.workflowId) {
    const wf = await getJson<{ items: WorkflowItem[] }>(`${args.base}/api/dev/feature-image/workflow?state=decided`);
    workflow = wf.items.find(i => i.id === args.workflowId) ?? null;
    if (!workflow) throw new Error(`decided workflow ${args.workflowId} not found`);
    if (!workflow.decision?.logEntryId) throw new Error('workflow has no logEntryId');
    if (!workflow.context.postPath) throw new Error('workflow has no postPath');
    entryId = workflow.decision.logEntryId;
    postPath = workflow.context.postPath;
  } else {
    entryId = args.entryId!;
    postPath = args.to!;
  }

  const log = await getJson<{ entries: LogEntry[] }>(`${args.base}/api/dev/feature-image/log`);
  const entry = log.entries.find(e => e.id === entryId);
  if (!entry) throw new Error(`log entry ${entryId} not found`);
  if (!entry.outputs) throw new Error(`entry ${entryId} has no outputs`);

  const site = siteFromPostPath(postPath);
  const slug = slugFromPostPath(postPath);
  const destDir = join(root, 'src', 'sites', site, 'public', 'images', 'blog', slug);

  console.log(`Apply plan:`);
  console.log(`  entry:     ${entryId}`);
  console.log(`  title:     ${entry.title ?? '-'}`);
  console.log(`  post path: ${postPath}`);
  console.log(`  site:      ${site}`);
  console.log(`  dest dir:  ${destDir}`);
  if (args.dryRun) console.log('  DRY RUN');

  const changedFiles: string[] = [];
  for (const c of entry.outputs.composited ?? []) {
    const dest = join(destDir, `feature-${c.format}.png`);
    const r = copyVariant(c.path, dest, root, args.dryRun);
    if (r) changedFiles.push(r);
  }
  for (const f of entry.outputs.filtered ?? []) {
    const dest = join(destDir, 'feature-filtered.png');
    const r = copyVariant(f, dest, root, args.dryRun);
    if (r) changedFiles.push(r);
    break; // only the first filtered variant
  }
  for (const r of entry.outputs.raw ?? []) {
    const dest = join(destDir, 'feature-raw.png');
    const x = copyVariant(r, dest, root, args.dryRun);
    if (x) changedFiles.push(x);
    break;
  }

  console.log(`Frontmatter:`);
  updateFrontmatter(postPath, slug, args.dryRun);

  if (!args.dryRun) {
    await postJson(`${args.base}/api/dev/feature-image/log`, { id: entryId, appliedTo: postPath });
    console.log(`Marked entry ${entryId.slice(0, 8)} appliedTo=${postPath}`);
    if (workflow) {
      await postJson(`${args.base}/api/dev/feature-image/workflow`, {
        action: 'apply-result',
        id: workflow.id,
        changedFiles,
      });
      console.log(`Marked workflow ${workflow.id.slice(0, 8)} applied`);
    }
  }

  console.log(`\nDone. ${changedFiles.length} files written${args.dryRun ? ' (dry run)' : ''}.`);
  console.log(`Next: npm run dev:${site} and preview /blog/${slug} to verify, then commit.`);
}

main().catch(err => {
  console.error(`apply failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

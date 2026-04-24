#!/usr/bin/env tsx
/*
 * scan.ts — list everything pending application: decided workflow items
 * AND approved log entries that haven't been applied yet. For each pending
 * item, shows the candidate target post(s) so the agent can route without
 * asking the user when the match is unambiguous.
 *
 * Usage: tsx .claude/skills/feature-image-apply/scan.ts [--base=<url>]
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

type Site = 'audiocontrol' | 'editorialcontrol';

interface WorkflowItem {
  id: string;
  state: string;
  type: string;
  context: {
    postPath?: string;
    slug?: string;
    site?: Site;
    title?: string;
  };
  decision?: { logEntryId: string; userNotes?: string };
}

interface LogEntry {
  id: string;
  title?: string;
  subtitle?: string;
  site?: Site;
  status?: string;
  appliedTo?: string;
  outputs?: {
    raw?: string[];
    filtered?: string[];
    composited?: Array<{ format: string; path: string }>;
  };
}

interface PostMatch {
  postPath: string;
  site: Site;
  slug: string;
  title: string;
}

function parseBase(argv: string[]): string {
  const arg = argv.find(a => a.startsWith('--base='));
  return arg ? arg.slice('--base='.length) : 'http://localhost:4321';
}

function repoRoot(): string {
  // scan.ts lives at .claude/skills/feature-image-apply/
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '..', '..', '..');
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} at ${url}`);
  return (await res.json()) as T;
}

function extractTitleFromMd(path: string): string | null {
  try {
    const src = readFileSync(path, 'utf-8');
    const fmMatch = src.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!fmMatch) return null;
    const titleMatch = fmMatch[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    return titleMatch ? titleMatch[1] : null;
  } catch {
    return null;
  }
}

function listPostsForSite(site: Site): PostMatch[] {
  const root = repoRoot();
  const blogDir = join(root, 'src', 'sites', site, 'content', 'blog');
  if (!existsSync(blogDir)) return [];
  const posts: PostMatch[] = [];
  for (const entry of readdirSync(blogDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const indexMd = join(blogDir, entry.name);
    const slug = entry.name.replace(/\.md$/, '');
    const title = extractTitleFromMd(indexMd);
    if (title === null) continue;
    posts.push({
      postPath: `src/sites/${site}/content/blog/${entry.name}`,
      site,
      slug,
      title,
    });
  }
  return posts;
}

function findMatches(entry: LogEntry): PostMatch[] {
  const site = entry.site ?? 'audiocontrol';
  const posts = listPostsForSite(site);
  if (!entry.title) return [];
  const lowered = entry.title.trim().toLowerCase();
  return posts.filter(p => p.title.trim().toLowerCase() === lowered);
}

async function main() {
  const base = parseBase(process.argv.slice(2));

  // ── Decided workflows ───────────────────────────────────────────────
  const wf = await getJson<{ items: WorkflowItem[] }>(`${base}/api/dev/feature-image/workflow?state=decided`);
  const decided = wf.items;

  // ── Approved log entries without appliedTo ──────────────────────────
  const log = await getJson<{ entries: LogEntry[] }>(`${base}/api/dev/feature-image/log`);
  // Archive is the operator's "hide this from future work" signal —
  // an entry an operator archived should drop out of the apply scan
  // the same way it drops out of the gallery's default view. Without
  // this filter, archived iteration entries kept showing up as
  // pending apply candidates every run.
  const approvedUnapplied = log.entries.filter(
    e => e.status === 'approved' && !e.appliedTo && !e.archived,
  );

  const summary = {
    decidedCount: decided.length,
    approvedUnappliedCount: approvedUnapplied.length,
    decided: decided.map(item => ({
      workflowId: item.id,
      postPath: item.context.postPath,
      slug: item.context.slug,
      site: item.context.site,
      title: item.context.title,
      logEntryId: item.decision?.logEntryId,
      userNotes: item.decision?.userNotes,
    })),
    approvedUnapplied: approvedUnapplied.map(entry => {
      const matches = findMatches(entry);
      return {
        entryId: entry.id,
        site: entry.site,
        title: entry.title,
        subtitle: entry.subtitle,
        composited: (entry.outputs?.composited ?? []).map(c => c.format),
        hasFiltered: (entry.outputs?.filtered?.length ?? 0) > 0,
        hasRaw: (entry.outputs?.raw?.length ?? 0) > 0,
        candidateTargets: matches,
        targetDecision: matches.length === 1 ? 'auto' : matches.length === 0 ? 'none' : 'ambiguous',
      };
    }),
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch(err => {
  console.error(`scan failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

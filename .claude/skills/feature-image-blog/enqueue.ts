#!/usr/bin/env tsx
/*
 * enqueue.ts — create a feature-image-blog workflow item.
 *
 * Re-reads the post to pull authoritative title + description, derives site
 * and slug from the post path, and POSTs a workflow item the user can
 * activate in the gallery.
 *
 * Usage:
 *   tsx .claude/skills/feature-image-blog/enqueue.ts \
 *     --post=<post-path> \
 *     (--prompt=<prompt> | --prompt-file=<path>) \
 *     --preset=<preset> \
 *     [--provider=<provider>] \
 *     [--template=<slug>] \
 *     [--candidates=slug1,slug2,...] \
 *     [--notes=<text> | --notes-file=<path>] \
 *     [--base=<url>]
 *
 * Prompts with newlines are brittle in `--prompt=...` form because any shell
 * escaping mistake ends up as an empty-or-truncated argument. Prefer the
 * `--prompt-file=<path>` form when chaining scan.ts + enqueue.ts:
 *   tsx scan.ts <slug> > /tmp/fi-scan.json
 *   jq -r '.recommendedPrompt' /tmp/fi-scan.json > /tmp/fi-prompt.txt
 *   tsx enqueue.ts --post=... --prompt-file=/tmp/fi-prompt.txt --preset=...
 *
 * Prints the created workflow id on success, non-zero exit on failure.
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

type Site = 'audiocontrol' | 'editorialcontrol';

interface Args {
  base: string;
  post: string;
  prompt: string;
  preset: string;
  provider: string | undefined;
  template: string | undefined;
  candidates: string[];
  notes: string | undefined;
}

function parseArgs(): Args {
  const out: Partial<Args> & { base: string; candidates: string[] } = {
    base: 'http://localhost:4321',
    candidates: [],
  };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--base=')) out.base = arg.slice('--base='.length);
    else if (arg.startsWith('--post=')) out.post = arg.slice('--post='.length);
    else if (arg.startsWith('--prompt=')) out.prompt = arg.slice('--prompt='.length);
    else if (arg.startsWith('--prompt-file=')) {
      const path = arg.slice('--prompt-file='.length);
      if (!existsSync(path)) throw new Error(`--prompt-file not found: ${path}`);
      out.prompt = readFileSync(path, 'utf-8').trim();
    }
    else if (arg.startsWith('--preset=')) out.preset = arg.slice('--preset='.length);
    else if (arg.startsWith('--provider=')) out.provider = arg.slice('--provider='.length);
    else if (arg.startsWith('--template=')) out.template = arg.slice('--template='.length);
    else if (arg.startsWith('--candidates=')) {
      out.candidates = arg
        .slice('--candidates='.length)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    } else if (arg.startsWith('--notes=')) out.notes = arg.slice('--notes='.length);
    else if (arg.startsWith('--notes-file=')) {
      const path = arg.slice('--notes-file='.length);
      if (!existsSync(path)) throw new Error(`--notes-file not found: ${path}`);
      out.notes = readFileSync(path, 'utf-8').trim();
    }
  }
  if (!out.post) throw new Error('--post=<path> is required');
  if (!out.prompt) throw new Error('--prompt=<prompt> or --prompt-file=<path> is required');
  if (!out.preset) throw new Error('--preset=<preset> is required');
  return out as Args;
}

function repoRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '..', '..', '..');
}

interface Frontmatter {
  title: string;
  description: string;
}

function parseFrontmatter(postPath: string): Frontmatter {
  const abs = join(repoRoot(), postPath);
  if (!existsSync(abs)) throw new Error(`post not found at ${postPath}`);
  const src = readFileSync(abs, 'utf-8');
  const m = src.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) throw new Error(`no frontmatter block in ${postPath}`);
  const body = m[1];
  const scalar = (field: string): string | null => {
    const re = new RegExp(`^${field}:\\s*(?:"([^"]*)"|'([^']*)'|(.+?))\\s*$`, 'm');
    const mm = body.match(re);
    return mm ? (mm[1] ?? mm[2] ?? mm[3] ?? null) : null;
  };
  const title = scalar('title');
  if (!title) throw new Error(`missing title in frontmatter of ${postPath}`);
  return { title, description: scalar('description') ?? '' };
}

function deriveSiteAndSlug(postPath: string): { site: Site; slug: string } {
  const m = postPath.match(/^src\/sites\/(audiocontrol|editorialcontrol)\/pages\/blog\/([^/]+)\/index\.md$/);
  if (!m) {
    throw new Error(
      `post path doesn't match src/sites/<site>/pages/blog/<slug>/index.md: ${postPath}`,
    );
  }
  return { site: m[1] as Site, slug: m[2] };
}

async function main() {
  const args = parseArgs();
  const fm = parseFrontmatter(args.post);
  const { site, slug } = deriveSiteAndSlug(args.post);

  const notes = args.notes ??
    (args.template
      ? `baseline template: ${args.template}${args.candidates.length ? ` · candidates: ${args.candidates.join(', ')}` : ''}`
      : args.candidates.length
        ? `candidates considered: ${args.candidates.join(', ')}`
        : 'fresh prompt (no strong template match)');

  const body = {
    action: 'create',
    type: 'feature-image-blog',
    createdBy: 'agent',
    context: {
      postPath: args.post,
      slug,
      site,
      title: fm.title,
      description: fm.description,
      suggestedPrompt: args.prompt,
      suggestedPreset: args.preset,
      ...(args.provider ? { suggestedProvider: args.provider } : {}),
      ...(args.template ? { suggestedTemplateSlug: args.template } : {}),
      ...(args.candidates.length ? { candidateTemplates: args.candidates } : {}),
      notes,
    },
  };

  const url = `${args.base}/api/dev/feature-image/workflow`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`POST ${url}: ${res.status} ${res.statusText}\n${text}`);
  }
  let parsed: { item?: { id: string } } = {};
  try { parsed = JSON.parse(text); } catch {
    throw new Error(`non-JSON response from ${url}: ${text}`);
  }
  const id = parsed.item?.id;
  if (!id) throw new Error(`no item.id in response: ${text}`);

  console.log(JSON.stringify({
    workflowId: id,
    site,
    slug,
    postPath: args.post,
    title: fm.title,
    preset: args.preset,
    templateSlug: args.template ?? null,
    galleryUrl: `${args.base}/dev/feature-image-preview`,
  }, null, 2));
}

main().catch(err => {
  console.error(`enqueue failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

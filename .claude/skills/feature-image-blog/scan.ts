#!/usr/bin/env tsx
/*
 * scan.ts — recommend a feature-image prompt for a blog post.
 *
 * Takes a post path OR a bare slug (auto-discovers across both sites), reads
 * frontmatter tags, queries the template library for tag matches, ranks
 * candidates, and prints a JSON recommendation bundle to stdout. Read-only.
 *
 * Usage:
 *   tsx .claude/skills/feature-image-blog/scan.ts <post-path-or-slug> [--base=<url>]
 *
 * Example output:
 *   {
 *     "postPath": "src/sites/editorialcontrol/pages/blog/<slug>/index.md",
 *     "site": "editorialcontrol",
 *     "slug": "<slug>",
 *     "title": "...",
 *     "description": "...",
 *     "tags": ["AI agents", "Editorial", ...],
 *     "candidateTemplates": [
 *       { "slug": "...", "name": "...", "tagsMatched": [...], "fitness": 0, "preset": "subtle", "prompt": "..." }
 *     ],
 *     "recommendedTemplate": "tracked-changes" | null,
 *     "recommendedPrompt": "...",
 *     "recommendedPreset": "subtle"
 *   }
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

type Site = 'audiocontrol' | 'editorialcontrol';

interface TemplateFitness {
  slug: string;
  usageCount: number;
  averageRating: number;
  recentAverageRating: number;
  fitness: number;
}

interface PromptTemplate {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  prompt: string;
  preset?: string;
  provider?: string;
  archived?: boolean;
  site?: Site | null;
}

interface RankedTemplate extends PromptTemplate {
  fitness: TemplateFitness;
  uses: number;
}

interface ScanOutput {
  postPath: string;
  site: Site;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  candidateTemplates: Array<{
    slug: string;
    name: string;
    site: Site | null | undefined;
    tagsMatched: string[];
    fitness: number;
    uses: number;
    preset: string | undefined;
    provider: string | undefined;
    prompt: string;
  }>;
  recommendedTemplate: string | null;
  recommendedTemplateSlug: string | null;
  recommendedPrompt: string;
  recommendedPreset: string | undefined;
  recommendedProvider: string | undefined;
}

const NO_TEXT_GUARD = 'no text, no words, no letters, no typography, no labels';

function repoRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '..', '..', '..');
}

function parseArgs(): { input: string; base: string } {
  let input: string | null = null;
  let base = 'http://localhost:4321';
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--base=')) base = arg.slice('--base='.length);
    else if (!arg.startsWith('--')) input = arg;
  }
  if (!input) {
    throw new Error('Usage: scan.ts <post-path-or-slug> [--base=<url>]');
  }
  return { input, base };
}

interface PostResolution {
  postPath: string;
  site: Site;
  slug: string;
}

function resolvePost(input: string): PostResolution {
  const root = repoRoot();

  if (input.includes('/')) {
    const abs = join(root, input);
    if (!existsSync(abs)) {
      throw new Error(`post not found at ${input}`);
    }
    const m = input.match(/^src\/sites\/(audiocontrol|editorialcontrol)\/pages\/blog\/([^/]+)\/index\.md$/);
    if (!m) {
      throw new Error(`path doesn't match src/sites/<site>/pages/blog/<slug>/index.md: ${input}`);
    }
    return { postPath: input, site: m[1] as Site, slug: m[2] };
  }

  const slug = input;
  const candidates: PostResolution[] = [];
  for (const site of ['audiocontrol', 'editorialcontrol'] as const) {
    const relPath = `src/sites/${site}/pages/blog/${slug}/index.md`;
    if (existsSync(join(root, relPath))) {
      candidates.push({ postPath: relPath, site, slug });
    }
  }
  if (candidates.length === 0) {
    throw new Error(`no post with slug "${slug}" under src/sites/*/pages/blog/`);
  }
  if (candidates.length > 1) {
    throw new Error(
      `slug "${slug}" exists under multiple sites (${candidates.map(c => c.site).join(', ')}); ` +
      `pass full path instead`,
    );
  }
  return candidates[0];
}

interface Frontmatter {
  title: string;
  description: string;
  tags: string[];
}

function parseFrontmatter(postPath: string): Frontmatter {
  const root = repoRoot();
  const src = readFileSync(join(root, postPath), 'utf-8');
  const m = src.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) throw new Error(`no frontmatter block in ${postPath}`);
  const body = m[1];

  const scalar = (field: string): string | null => {
    const re = new RegExp(`^${field}:\\s*(?:"([^"]*)"|'([^']*)'|(.+?))\\s*$`, 'm');
    const mm = body.match(re);
    if (!mm) return null;
    return mm[1] ?? mm[2] ?? mm[3] ?? null;
  };

  const title = scalar('title');
  if (!title) throw new Error(`missing title in frontmatter of ${postPath}`);

  const description = scalar('description') ?? '';

  const tagsMatch = body.match(/^tags:\s*\[([^\]]*)\]/m);
  const tags: string[] = [];
  if (tagsMatch) {
    for (const raw of tagsMatch[1].split(',')) {
      const t = raw.trim().replace(/^["']|["']$/g, '').trim();
      if (t) tags.push(t);
    }
  }

  return { title, description, tags };
}

function tagVariants(tag: string): string[] {
  const lowered = tag.toLowerCase().trim();
  const variants = new Set<string>();
  variants.add(lowered);
  variants.add(lowered.replace(/\s+/g, '-'));
  for (const word of lowered.split(/\s+/)) {
    if (word.length > 2) variants.add(word);
  }
  return [...variants];
}

async function fetchTemplates(base: string, tag: string): Promise<RankedTemplate[]> {
  const url = `${base}/api/dev/feature-image/templates?tag=${encodeURIComponent(tag)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} at ${url}`);
  const data = (await res.json()) as { templates: RankedTemplate[] };
  return data.templates ?? [];
}

interface Candidate {
  template: RankedTemplate;
  tagsMatched: string[];
}

async function gatherCandidates(
  base: string,
  postTags: string[],
  site: Site,
): Promise<Candidate[]> {
  const bySlug = new Map<string, Candidate>();
  const postTagsLower = new Set(postTags.map(t => t.toLowerCase().trim()));

  for (const postTag of postTags) {
    for (const variant of tagVariants(postTag)) {
      let templates: RankedTemplate[];
      try {
        templates = await fetchTemplates(base, variant);
      } catch {
        continue;
      }
      for (const tpl of templates) {
        if (tpl.archived) continue;
        if (tpl.site && tpl.site !== site) continue;
        const matched = tpl.tags.filter(tt => {
          const low = tt.toLowerCase();
          if (postTagsLower.has(low)) return true;
          return postTags.some(pt => tagVariants(pt).includes(low));
        });
        const existing = bySlug.get(tpl.slug);
        if (existing) {
          for (const m of matched) {
            if (!existing.tagsMatched.includes(m)) existing.tagsMatched.push(m);
          }
        } else {
          bySlug.set(tpl.slug, { template: tpl, tagsMatched: matched });
        }
      }
    }
  }

  return [...bySlug.values()];
}

function rank(candidates: Candidate[]): Candidate[] {
  return [...candidates].sort((a, b) => {
    if (a.tagsMatched.length !== b.tagsMatched.length) {
      return b.tagsMatched.length - a.tagsMatched.length;
    }
    const fa = a.template.fitness?.fitness ?? 0;
    const fb = b.template.fitness?.fitness ?? 0;
    if (fa !== fb) return fb - fa;
    const ua = a.template.uses ?? 0;
    const ub = b.template.uses ?? 0;
    return ua - ub;
  });
}

function composePrompt(templatePrompt: string): string {
  if (templatePrompt.toLowerCase().includes('no text')) return templatePrompt;
  const trimmed = templatePrompt.trim().replace(/[.,;\s]+$/, '');
  return `${trimmed}, ${NO_TEXT_GUARD}`;
}

async function main() {
  const { input, base } = parseArgs();
  const resolved = resolvePost(input);
  const fm = parseFrontmatter(resolved.postPath);

  let candidates: Candidate[] = [];
  if (fm.tags.length > 0) {
    candidates = await gatherCandidates(base, fm.tags, resolved.site);
  }

  let allSiteTemplates: RankedTemplate[] = [];
  if (candidates.length === 0) {
    try {
      const res = await fetch(`${base}/api/dev/feature-image/templates`);
      if (res.ok) {
        const data = (await res.json()) as { templates: RankedTemplate[] };
        allSiteTemplates = (data.templates ?? []).filter(
          t => !t.archived && (!t.site || t.site === resolved.site),
        );
        candidates = allSiteTemplates.map(template => ({ template, tagsMatched: [] }));
      }
    } catch {
      // if the API is unreachable we still emit a valid scan — the agent
      // can draft a prompt from scratch using site brand defaults
    }
  }

  const ranked = rank(candidates);
  const top = ranked[0] ?? null;
  const hasMatch = top !== null && top.tagsMatched.length > 0;
  const recommendedTemplateSlug = hasMatch ? top!.template.slug : null;
  const recommendedPrompt = hasMatch
    ? composePrompt(top!.template.prompt)
    : '';
  const recommendedPreset = hasMatch ? top!.template.preset : undefined;
  const recommendedProvider = hasMatch ? top!.template.provider : undefined;

  const output: ScanOutput = {
    postPath: resolved.postPath,
    site: resolved.site,
    slug: resolved.slug,
    title: fm.title,
    description: fm.description,
    tags: fm.tags,
    candidateTemplates: ranked.slice(0, 5).map(c => ({
      slug: c.template.slug,
      name: c.template.name,
      site: c.template.site,
      tagsMatched: c.tagsMatched,
      fitness: c.template.fitness?.fitness ?? 0,
      uses: c.template.uses ?? 0,
      preset: c.template.preset,
      provider: c.template.provider,
      prompt: c.template.prompt,
    })),
    recommendedTemplate: recommendedTemplateSlug,
    recommendedTemplateSlug,
    recommendedPrompt,
    recommendedPreset,
    recommendedProvider,
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch(err => {
  console.error(`scan failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

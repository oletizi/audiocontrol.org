import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { LogEntry } from './log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const TEMPLATES_PATH = join(rootDir, 'docs', 'feature-image-prompts.yaml');

export interface PromptTemplate {
  /** URL-safe unique identifier */
  slug: string;
  /** Human-readable name */
  name: string;
  /** When to use this template */
  description: string;
  /** Topic tags for auto-matching to blog posts */
  tags: string[];
  /** The prompt body (fed to the AI provider) */
  prompt: string;
  /** Default filter preset (optional) */
  preset?: string;
  /** Default provider (optional; falls back to the gallery default) */
  provider?: string;
  /** Slug of the template this one was forked from */
  parent?: string;
  /** Hide from default suggestions (still forkable) */
  archived?: boolean;
  /** Back-references to log entries that used this template successfully */
  examples: string[];
  /**
   * Which site this template is tuned for. When set, the picker should
   * filter by this value. Omitted or null means "works for any site".
   * Phase 14 adds full site-aware filtering; for now the field is
   * carried on data but not yet enforced by the picker.
   */
  site?: 'audiocontrol' | 'editorialcontrol' | null;
}

export interface TemplateFitness {
  slug: string;
  usageCount: number;
  averageRating: number;
  recentAverageRating: number;
  /** Composite score combining recent average and sample size */
  fitness: number;
}

export interface TemplateFileShape {
  version: number;
  templates: PromptTemplate[];
}

/** Minimum rated generations before a template can appear in the default picker ranking. */
const MIN_USAGE_FOR_RANKING = 1;
/** Weight applied to recent ratings (most recent 5) vs. overall average. */
const RECENT_WEIGHT = 0.7;

export function getTemplatesPath(): string {
  return TEMPLATES_PATH;
}

/** Read all templates from disk. Returns empty array if the file doesn't exist. */
export function readTemplates(): PromptTemplate[] {
  if (!existsSync(TEMPLATES_PATH)) return [];
  const content = readFileSync(TEMPLATES_PATH, 'utf-8');
  const data = parseYaml(content) as TemplateFileShape | null;
  if (!data || !Array.isArray(data.templates)) return [];
  return data.templates;
}

/** Write all templates back to disk in a stable order. */
export function writeTemplates(templates: PromptTemplate[]): void {
  const shape: TemplateFileShape = {
    version: 1,
    templates: [...templates].sort((a, b) => a.slug.localeCompare(b.slug)),
  };
  // lineWidth: 0 prevents YAML from line-wrapping long prompt strings
  writeFileSync(TEMPLATES_PATH, stringifyYaml(shape, { lineWidth: 0 }), 'utf-8');
}

/** Find a template by slug. */
export function getTemplate(slug: string): PromptTemplate | undefined {
  return readTemplates().find(t => t.slug === slug);
}

/** Create a new template. Throws if the slug already exists. */
export function createTemplate(template: PromptTemplate): PromptTemplate {
  const all = readTemplates();
  if (all.some(t => t.slug === template.slug)) {
    throw new Error(`Template with slug "${template.slug}" already exists`);
  }
  all.push(template);
  writeTemplates(all);
  return template;
}

/** Update fields on an existing template (merge semantics). */
export function updateTemplate(slug: string, patch: Partial<PromptTemplate>): PromptTemplate | null {
  const all = readTemplates();
  const idx = all.findIndex(t => t.slug === slug);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, slug: all[idx].slug };
  writeTemplates(all);
  return all[idx];
}

/**
 * Fork a template: create a new template with `parent` set to the source slug.
 * The new template starts with an empty examples list.
 */
export function forkTemplate(
  sourceSlug: string,
  newSlug: string,
  overrides: Partial<Pick<PromptTemplate, 'name' | 'description' | 'tags' | 'prompt' | 'preset' | 'provider'>> = {},
): PromptTemplate {
  const source = getTemplate(sourceSlug);
  if (!source) throw new Error(`Source template "${sourceSlug}" not found`);
  const forked: PromptTemplate = {
    slug: newSlug,
    name: overrides.name ?? `${source.name} (fork)`,
    description: overrides.description ?? source.description,
    tags: overrides.tags ?? [...source.tags],
    prompt: overrides.prompt ?? source.prompt,
    preset: overrides.preset ?? source.preset,
    provider: overrides.provider ?? source.provider,
    parent: sourceSlug,
    examples: [],
  };
  return createTemplate(forked);
}

/** Toggle the `archived` flag. */
export function archiveTemplate(slug: string, archived = true): PromptTemplate | null {
  return updateTemplate(slug, { archived });
}

/**
 * Compute fitness metrics for every template based on the history log entries
 * that used it (matched by templateSlug field on LogEntry).
 */
export function computeFitness(templates: PromptTemplate[], history: LogEntry[]): Map<string, TemplateFitness> {
  const result = new Map<string, TemplateFitness>();

  for (const template of templates) {
    const usages = history.filter(e => e.templateSlug === template.slug && typeof e.rating === 'number');
    const usageCount = usages.length;

    if (usageCount === 0) {
      result.set(template.slug, {
        slug: template.slug,
        usageCount: 0,
        averageRating: 0,
        recentAverageRating: 0,
        fitness: 0,
      });
      continue;
    }

    // Sort by timestamp descending for recency weighting
    const sortedByRecency = [...usages].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    const recent = sortedByRecency.slice(0, 5);

    const mean = (ratings: number[]): number =>
      ratings.length === 0 ? 0 : ratings.reduce((a, b) => a + b, 0) / ratings.length;

    const averageRating = mean(usages.map(e => e.rating as number));
    const recentAverageRating = mean(recent.map(e => e.rating as number));

    // Fitness: weighted blend of recent average and overall average, scaled by a
    // confidence factor derived from usage count (Laplace smoothing toward 0).
    const confidence = usageCount / (usageCount + 3);
    const blended = RECENT_WEIGHT * recentAverageRating + (1 - RECENT_WEIGHT) * averageRating;
    const fitness = blended * confidence;

    result.set(template.slug, {
      slug: template.slug,
      usageCount,
      averageRating,
      recentAverageRating,
      fitness,
    });
  }

  return result;
}

/** Rank non-archived templates by fitness descending, filtering to minimum usage. */
export function rankTemplates(templates: PromptTemplate[], history: LogEntry[]): Array<PromptTemplate & { fitness: TemplateFitness }> {
  const fitness = computeFitness(templates, history);
  return templates
    .filter(t => !t.archived)
    .map(t => ({ ...t, fitness: fitness.get(t.slug)! }))
    .sort((a, b) => {
      // New templates (no usage) float to the top so they can accumulate data
      const aNew = a.fitness.usageCount < MIN_USAGE_FOR_RANKING;
      const bNew = b.fitness.usageCount < MIN_USAGE_FOR_RANKING;
      if (aNew && !bNew) return -1;
      if (!aNew && bNew) return 1;
      return b.fitness.fitness - a.fitness.fitness;
    });
}

/** Filter templates by tag (returns ones whose tags overlap with any of the given). */
export function filterByTags(templates: PromptTemplate[], tags: string[]): PromptTemplate[] {
  if (tags.length === 0) return templates;
  const wanted = new Set(tags.map(t => t.toLowerCase()));
  return templates.filter(t => t.tags.some(tag => wanted.has(tag.toLowerCase())));
}

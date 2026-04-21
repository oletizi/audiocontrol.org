/**
 * Blog post scaffolding for the editorial calendar.
 *
 * Creates the blog post markdown under the site's Astro content
 * collection at src/sites/<site>/content/blog/<slug>.md. Posts are
 * scaffolded with state: draft — the production build gate filters
 * drafts out, so an in-flight article is invisible on prod until an
 * operator flips state to published.
 */

import { dirname } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import type { CalendarEntry, Site } from './types.js';

export function blogContentDir(site: Site): string {
  return `src/sites/${site}/content/blog`;
}

/** Path (relative to project root) of the markdown file for a given slug. */
export function blogContentPath(site: Site, slug: string): string {
  return `${blogContentDir(site)}/${slug}.md`;
}

/** Format a date as "Month YYYY" for the `date` frontmatter field. */
function formatDateHuman(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Today's date as YYYY-MM-DD. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface ScaffoldResult {
  /** Absolute path to the created markdown file */
  filePath: string;
  /** Path relative to project root */
  relativePath: string;
}

/**
 * Create the content-collection markdown for a calendar entry.
 *
 * - File: src/sites/<site>/content/blog/<slug>.md
 * - Frontmatter: title, description, date, datePublished, dateModified,
 *   author, state: draft
 */
export function scaffoldBlogPost(
  rootDir: string,
  site: Site,
  entry: CalendarEntry,
  author: string,
): ScaffoldResult {
  const relativePath = blogContentPath(site, entry.slug);
  const filePath = `${rootDir}/${relativePath}`;

  if (existsSync(filePath)) {
    throw new Error(`Blog post already exists at ${relativePath}`);
  }

  const dateStr = today();
  const frontmatter = [
    '---',
    `title: "${entry.title.replace(/"/g, '\\"')}"`,
    `description: "${entry.description.replace(/"/g, '\\"')}"`,
    `date: "${formatDateHuman(dateStr)}"`,
    `datePublished: "${dateStr}"`,
    `dateModified: "${dateStr}"`,
    `author: "${author}"`,
    'state: draft',
    '---',
    '',
    `# ${entry.title}`,
    '',
    '<!-- Write your post here -->',
    '',
  ].join('\n');

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, frontmatter, 'utf-8');

  return { filePath, relativePath };
}

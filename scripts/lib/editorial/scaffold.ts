/**
 * Blog post scaffolding for the editorial calendar.
 *
 * Creates the blog post directory structure and index.md with frontmatter
 * matching existing blog conventions (see workflow-playbooks.md).
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import type { CalendarEntry } from './types.js';

const BLOG_DIR = 'src/pages/blog';

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
  /** Absolute path to the created index.md */
  filePath: string;
  /** Path relative to project root */
  relativePath: string;
}

/**
 * Create a blog post directory and index.md from a calendar entry.
 *
 * Follows the existing convention:
 * - Directory: src/pages/blog/<slug>/
 * - File: src/pages/blog/<slug>/index.md
 * - Frontmatter: layout, title, description, date, datePublished, dateModified, author
 */
export function scaffoldBlogPost(
  rootDir: string,
  entry: CalendarEntry,
  author: string,
): ScaffoldResult {
  const dir = `${rootDir}/${BLOG_DIR}/${entry.slug}`;
  const filePath = `${dir}/index.md`;
  const relativePath = `${BLOG_DIR}/${entry.slug}/index.md`;

  if (existsSync(filePath)) {
    throw new Error(
      `Blog post already exists at ${relativePath}`,
    );
  }

  const dateStr = today();
  const frontmatter = [
    '---',
    'layout: ../../../layouts/BlogLayout.astro',
    `title: "${entry.title.replace(/"/g, '\\"')}"`,
    `description: "${entry.description.replace(/"/g, '\\"')}"`,
    `date: "${formatDateHuman(dateStr)}"`,
    `datePublished: "${dateStr}"`,
    `dateModified: "${dateStr}"`,
    `author: "${author}"`,
    '---',
    '',
    `# ${entry.title}`,
    '',
    '<!-- Write your post here -->',
    '',
  ].join('\n');

  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, frontmatter, 'utf-8');

  return { filePath, relativePath };
}

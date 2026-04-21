/**
 * Detect whether a scaffolded blog post's body is still the placeholder
 * or has been replaced with real prose.
 *
 * The scaffold produced by `scaffoldBlogPost` writes a `# <title>`
 * heading followed by `<!-- Write your post here -->`. Until an
 * operator (or drafter) replaces that comment, every version the
 * review pipeline picks up will be a placeholder.
 *
 * This helper lets both the studio UI and the `/editorial-draft` /
 * `/editorial-draft-review` skills branch on body state instead of
 * silently carrying the placeholder through the pipeline.
 */

import { existsSync, readFileSync } from 'fs';

export type BodyState = 'missing' | 'placeholder' | 'written';

/** The marker written by `scaffoldBlogPost`. Exact string. */
export const PLACEHOLDER_MARKER = '<!-- Write your post here -->';

/**
 * Classify the body of a scaffolded blog post.
 *
 * - `missing`      — file does not exist.
 * - `placeholder`  — file exists and its body is ONLY frontmatter +
 *                    H1 heading + the placeholder comment + blank
 *                    lines. No real prose.
 * - `written`      — file exists and the body has content beyond
 *                    the placeholder (either the placeholder was
 *                    replaced with prose, or prose was added
 *                    alongside it).
 */
export function bodyState(filePath: string): BodyState {
  if (!existsSync(filePath)) return 'missing';
  const content = readFileSync(filePath, 'utf8');

  // Strip frontmatter block if present.
  const fmMatch = content.match(/^---\n[\s\S]*?\n---\n?/);
  const body = fmMatch ? content.slice(fmMatch[0].length) : content;

  // Strip leading whitespace, then the H1 line the scaffold writes
  // ("# Title"). `^\s*` lets the blank line between frontmatter and
  // heading not trip us up — without it, the heading sits at line 2
  // of the body and this regex misses.
  const withoutH1 = body.replace(/^\s*#[^\n]*\n?/, '');

  // The placeholder + any whitespace = placeholder state.
  const trimmed = withoutH1.trim();
  if (trimmed === PLACEHOLDER_MARKER) return 'placeholder';
  if (trimmed === '') return 'placeholder';

  // Content remains after the placeholder is removed? Real prose.
  const withoutPlaceholder = trimmed.replace(PLACEHOLDER_MARKER, '').trim();
  return withoutPlaceholder.length > 0 ? 'written' : 'placeholder';
}

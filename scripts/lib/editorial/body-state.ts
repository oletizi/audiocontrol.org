/**
 * Detect whether a scaffolded blog post's body is still the placeholder
 * or has been replaced with real prose.
 *
 * The scaffold produced by `scaffoldBlogPost` writes a `# <title>`
 * heading followed by a `## Outline` section (scaffold placeholder
 * for outline work) followed by `<!-- Write your post here -->`.
 * Until an operator (or drafter) replaces the body placeholder with
 * prose, the article body is considered un-drafted — even if the
 * outline section has been filled in.
 *
 * This matters because the Outlining stage (Phase 17c) fills in the
 * outline section but leaves the body placeholder intact. A post
 * moving from Outlining → Drafting has an outline full of real
 * content and still a body that hasn't been written. `bodyState`
 * must not confuse the two — it specifically reports on the
 * *article body*, i.e. the prose below the outline section.
 *
 * This helper lets both the studio UI and the `/editorial-draft` /
 * `/editorial-draft-review` skills branch on body state instead of
 * silently carrying the placeholder through the pipeline.
 */

import { existsSync, readFileSync } from 'fs';

export type BodyState = 'missing' | 'placeholder' | 'written';

/** The body-placeholder marker written by `scaffoldBlogPost`. Exact string. */
export const PLACEHOLDER_MARKER = '<!-- Write your post here -->';

/**
 * Strip the `## Outline` section before we classify the body. The
 * outline is a legitimate authored artifact during Outlining; its
 * presence should not make the body look written.
 *
 * Termination rule, in priority order:
 *   1. The first `---` line (thematic break) after the heading —
 *      the explicit convention used by the magazine voice.
 *   2. The next `## ` heading.
 *   3. End of file.
 *
 * Mirrors `remark-strip-outline.mjs` so this classifier and the
 * public render agree on where the outline ends. The H2 / EOF
 * fallbacks are deliberate: an early-Outlining-stage post may have
 * an outline but no body separator yet, in which case we want to
 * treat everything below `## Outline` as still-outlined and report
 * 'placeholder' — not 'written'.
 *
 * Implemented line-wise (not by regex) because multiline + end-of-
 * string lookahead in JS regex has enough footguns to be worse
 * than a four-line scan.
 */
function stripOutlineSection(body: string): string {
  const lines = body.split('\n');
  const startIdx = lines.findIndex((line) => /^##[ \t]+Outline\b/.test(line));
  if (startIdx < 0) return body;
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^---[ \t]*$/.test(lines[i])) {
      endIdx = i + 1;
      break;
    }
    if (/^##[ \t]+/.test(lines[i])) {
      endIdx = i;
      break;
    }
  }
  return [...lines.slice(0, startIdx), ...lines.slice(endIdx)].join('\n');
}

/**
 * Classify the body of a scaffolded blog post.
 *
 * - `missing`      — file does not exist.
 * - `placeholder`  — file exists and its body (after the outline
 *                    section is stripped) is ONLY the placeholder
 *                    comment and whitespace. No real prose.
 * - `written`      — file exists and prose exists below the
 *                    outline section, beyond the placeholder.
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

  // Strip the outline section so its (potentially large) content
  // doesn't masquerade as article body prose.
  const withoutOutline = stripOutlineSection(withoutH1);

  // The placeholder + any whitespace = placeholder state.
  const trimmed = withoutOutline.trim();
  if (trimmed === PLACEHOLDER_MARKER) return 'placeholder';
  if (trimmed === '') return 'placeholder';

  // Content remains after the placeholder is removed? Real prose.
  const withoutPlaceholder = trimmed.replace(PLACEHOLDER_MARKER, '').trim();
  return withoutPlaceholder.length > 0 ? 'written' : 'placeholder';
}

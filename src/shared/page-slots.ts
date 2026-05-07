/**
 * Page-content slot parser.
 *
 * Static-site pages keep their structural HTML in `.astro` files but
 * lift editable copy into the body of a markdown content-collection
 * entry. Slots in the body are fenced like:
 *
 *     ---slot: name
 *
 *     ...arbitrary markdown...
 *
 *     ---
 *
 * The opener is a single line `---slot: <name>` (no space after the
 * three dashes; CommonMark won't read it as a thematic break since
 * non-dash chars follow). The closer is a bare `---` on its own line.
 *
 * Why this shape: the opener renders as plain paragraph text in any
 * Markdown renderer (so a copywriter editing in deskwork-studio's
 * review surface sees the slot label inline), and the closer renders
 * as an `<hr>` (so each slot has a visible bottom edge). Inside a
 * slot the copywriter has full Markdown — `##`, `###`, lists, links,
 * bold — none of which collide with the fence.
 *
 * Constraint: a bare `---` line inside slot content closes the slot.
 * Authors should not use thematic breaks inside slot content.
 */
import { marked } from 'marked';

const SLOT_RE = /^---slot:\s*([A-Za-z][A-Za-z0-9_-]*)\s*\n([\s\S]*?)\n---\s*$/gm;

export interface PageSlots {
  /** Raw markdown for each slot, keyed by slot name. Trimmed. */
  raw: Record<string, string>;
}

/**
 * Parse slot fences out of a markdown body. Returns the per-slot raw
 * markdown (trimmed). Unknown content outside any slot is ignored;
 * unbalanced fences are silently skipped — author should keep their
 * fences well-formed.
 */
export function parsePageSlots(body: string): PageSlots {
  const raw: Record<string, string> = {};
  for (const match of body.matchAll(SLOT_RE)) {
    const [, name, content] = match;
    raw[name] = content.trim();
  }
  return { raw };
}

/**
 * Render a slot as block-level HTML (paragraphs, headings, lists,
 * etc.). Returns an empty string for unknown slots so a missing slot
 * collapses cleanly in the page render.
 */
export function renderSlotBlock(slots: PageSlots, name: string): string {
  const md = slots.raw[name];
  if (md === undefined) return '';
  return marked.parse(md, { async: false }) as string;
}

/**
 * Render a slot as inline HTML — strips the wrapping `<p>` tag that
 * `marked.parse` produces for single-paragraph content. Use for
 * label-style slots that get inlined into a heading or other inline
 * context.
 */
export function renderSlotInline(slots: PageSlots, name: string): string {
  const md = slots.raw[name];
  if (md === undefined) return '';
  return marked.parseInline(md, { async: false }) as string;
}

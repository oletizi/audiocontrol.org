/**
 * remark plugin: strip the `## Outline` section from rendered
 * markdown output.
 *
 * Applied to Astro's markdown pipeline (astro.*.config.mjs) so the
 * outline section an operator iterates during the Outlining stage
 * disappears from the public `/blog/<slug>/` render. The editorial
 * review surface at `/dev/editorial-review/<slug>` does NOT go
 * through this plugin — it has its own unified pipeline in
 * `scripts/lib/editorial-review/render.ts` — so the outline stays
 * visible there for annotate-and-iterate work.
 *
 * Stripping shape: find the H2 whose text starts with "Outline",
 * then remove that heading plus everything up to and including the
 * first thematic break (`---`) that follows. The `---` after the
 * outline is the explicit terminator — a convention the magazine
 * voice already uses as a section separator, so it costs nothing to
 * load it with the additional meaning of "outline ends here." The
 * operator may put any content inside the outline section (bullets,
 * drafting-notes HTML comments, paragraphs explaining beats, etc.)
 * without breaking the stripper.
 *
 * No-op when there is no `## Outline` heading, or when the heading
 * exists but has no following thematic break — the latter only
 * happens in early-stage outline-only files, which are draft state
 * and filtered out of production by the content-collection query.
 */

function hasOutlineHeading(node) {
  if (node.type !== 'heading' || node.depth !== 2) return false;
  const first = node.children?.[0];
  if (!first || first.type !== 'text') return false;
  return /^Outline\b/.test(first.value);
}

export default function remarkStripOutline() {
  return (tree) => {
    const children = tree.children;
    const start = children.findIndex(hasOutlineHeading);
    if (start < 0) return;

    let terminator = -1;
    for (let i = start + 1; i < children.length; i++) {
      if (children[i].type === 'thematicBreak') {
        terminator = i;
        break;
      }
    }
    if (terminator < 0) return;

    children.splice(start, terminator - start + 1);
  };
}

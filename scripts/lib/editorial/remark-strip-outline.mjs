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
 * Stripping shape: find the first H2 whose text starts with
 * "Outline", then remove that heading plus every subsequent top-
 * level node until the next H1 or H2 (non-inclusive) or the end
 * of the document. Matches the line-based stripper in
 * `scripts/lib/editorial/body-state.ts`; kept independent here
 * because mdast traversal beats regex on structured content.
 *
 * No-op when the document has no outline section.
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

    let end = children.length;
    for (let i = start + 1; i < children.length; i++) {
      const n = children[i];
      if (n.type === 'heading' && n.depth <= 2) {
        end = i;
        break;
      }
    }
    children.splice(start, end - start);
  };
}

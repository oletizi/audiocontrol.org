---
proposal: stackcontrol.org visual identity — constraints brief
status: BRIEF
date: 2026-06-01
feature: docs/1.0/001-IN-PROGRESS/stackcontrol-site/
visual: N/A — this is the design-pass input; mockups land under ACCEPTED/REJECTED
---

# stackcontrol.org — identity constraints brief

Input to the `/frontend-design` pass (Phase 2). Each generated direction's mockup is later
filed as an ACCEPTED or REJECTED entry under this feature's `explorations/{ACCEPTED,REJECTED}/`
per [`DESIGN-DECISIONS-PROTOCOL.md`](../../../../../DESIGN-DECISIONS-PROTOCOL.md).

## What stackcontrol is

The public home for the **deskwork lifecycle plugin** — the `/dw-lifecycle:*` and `/deskwork:*`
toolchain that runs feature definition, workplans, scope discovery, audit barrages, and the
editorial pipeline. The site is a **hybrid: product page + devlog**. It explains what the plugin
does (product) and chronicles building it in the open (devlog). Audience is developers who run
agentic coding workflows. Tone is technical, precise, builder-to-builder — not marketing gloss.

## Hard constraints (settled — do NOT re-propose around these)

- **Dark surface.** All three sibling sites are dark (`color-scheme: dark`). stackcontrol is dark too.
- **Mono-accent discipline.** One dominant chromatic accent (`--primary`) + one sparing
  counter-accent (`--accent`). No rainbow palettes; the family reads as restrained, instrument-like.
- **Implements the shared `Brand` shape.** `src/sites/stackcontrol/brand.ts` must export
  `brand: Brand` from `src/shared/brand.ts` — same `colors` (HSL-component strings) and `typography`
  fields the siblings use.
- **Consumes `src/shared/design-tokens-base.css`.** The site's `design-tokens.css` layers its own
  `:root` palette/fonts on top of the shared base (structural tokens, type/radius scale, utilities),
  imported base-first in the Layout — exactly as editorialcontrol does.
- **Accessibility / contrast.** Body and UI text meet WCAG AA on the dark surface; the accent is
  legible as link color and as a solid-fill button background with dark text.

## Differentiation constraint (the point of the pass)

stackcontrol must be visually **distinct from its two siblings** at a glance:

- **audiocontrol** — amber accent, service-manual / hardware-panel aesthetic, Space-Grotesk-ish
  technical display.
- **editorialcontrol** — signal-green chartreuse primary + parchment-cream accent, serif display
  (Fraunces), publication / masthead aesthetic.

So stackcontrol's primary accent must read as **neither amber/orange nor green/chartreuse**. The
open lane is the cool-to-electric range — cyan, teal, electric blue, indigo, violet, or magenta —
whichever best carries a "lifecycle / orchestration / control-plane" feeling. The display face
should also diverge from both siblings (audiocontrol's technical sans and editorialcontrol's serif).

## What the direction should evoke

A **control plane for a build pipeline**: phases, stacks, lifecycle stages, orchestration. Think
dashboards, status rails, monospace telemetry, staged progress — the visual language of a tool that
watches work move through phases. The product+devlog hybrid means the homepage carries both a
"here's what it does" register and a "here's it being built" register.

## Deliverable from the pass

2–3 distinct identity directions (palette + display/body/mono type + one signature structural
device), each as a self-contained `mockup.html`. The operator picks one; the rest become REJECTED
archive entries.

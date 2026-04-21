# PRD: Feature Image Generator

## Problem Statement

Creating feature images for blog posts and pages is a tedious multi-step manual process involving image generation/sourcing, layout, typography overlay, and export. The site already has a build-time OG image generator (`scripts/generate-og-images.ts`) that composites text overlays on static background images using satori + sharp, but it requires manually sourced background images and a hardcoded page list.

This feature adds AI-generated backgrounds (via DALL-E 3 and FLUX) and wraps the full pipeline in a Claude Code skill so that generating branded feature images becomes a single command driven by page frontmatter.

## User Stories

1. **As a content author**, I want to generate a feature image for a new blog post by running a single skill command, so I don't need to leave my editor or use external design tools.

2. **As a content author**, I want to compare AI-generated backgrounds from multiple providers so I can choose the best one for each post.

3. **As a site maintainer**, I want generated images to follow the site's brand (colors, fonts, layout) automatically so images are visually consistent without manual design work.

4. **As a content author**, I want images generated in all required formats (OG, YouTube, Instagram) from a single background so I don't have to resize manually.

## Scope

### In Scope

- Image generation provider interface with DALL-E 3 and FLUX implementations
- CLI script that generates backgrounds from a text prompt
- Text overlay compositing using sharp (title, subtitle, branding)
- Multi-format output (OG 1200x630, YouTube 1280x720, Instagram 1080x1080)
- Claude Code `/feature-image` skill that reads page frontmatter and drives the pipeline
- Provider comparison workflow (generate from both, pick the best)

### In Scope (Extended — Phases 6-11)

- Astro dev-only preview gallery for interactive prompt + filter iteration, with persistent log of attempts
- Two-way async workflow pipeline between Claude Code skills and the gallery (agent enqueues → user iterates → user decides → agent applies)
- Expanded filter library: analog-display (chromatic aberration, bloom, lens distortion), 8-bit (dither, posterize, gradient-map), cinematic (letterbox, light-leak, halftone), and utility (sharpen, contrast, threshold, invert, duotone) primitives
- New presets combining the new primitives (e.g., `vhs`, `8-bit`, `cinematic`, `monitor`)
- Prompt template library with fitness-ranked selection, lineage tracking, and "save as template" / fork mechanics — cultivates a shared visual identity by artificial selection over time

### In Scope (Extended — Phase 12)

- Live DOM-based preview in the gallery: title, subtitle, filter chain, and overlay visibility edited inline with zero backend round-trip
- DOM-to-PNG bake on commit via Playwright screenshot of the exact preview element, eliminating the satori/sharp dual-source-of-truth for gallery-driven bakes

### In Scope (Extended — Phase 13)

- Conversation thread pinned to each focused gallery entry: user types natural-language feedback, Claude responds asynchronously with new generations and commentary
- Lineage tracking on log entries (parent → child) so iterations form a tree and a thread is visible on any entry in the chain
- New `/feature-image-iterate` skill (or extension to `/feature-image-help`) that picks up pending thread messages, reads the snapshot + feedback, and invokes the generation pipeline

### In Scope (Extended — Phase 14)

- Multi-site feature image generation. The repo now hosts two sites under `src/sites/<site>/` (audiocontrol and editorialcontrol); each has its own `brand.ts` with distinct palette, typography, and name/tagline.
- `OGPreview` component and the bake pipeline read site brand data so the overlay uses the correct fonts, colors, logo, and brand text per site.
- Gallery surfaces site selection: generation form captures which site an image is for; focused entry allows switching sites for exploratory recomposition; applying a workflow routes output into the correct site's public directory.
- Templates gain optional `site` affinity so the library picker can filter by site and fitness is tracked per-site.

### In Scope (Extended — Phase 15)

- Replace the three monolithic JSONL logs (`.feature-image-history.jsonl`, `.feature-image-pipeline.jsonl`, `.feature-image-threads.jsonl`) with per-entry JSON files under a `journal/` directory, so cross-branch merges never collide on these stores.
- Shared `journal.ts` helper for directory-backed append/read/update against `journal/history/`, `journal/pipeline/`, `journal/threads/`. Public APIs of `log.ts`, `workflow.ts`, and `threads.ts` stay stable so every consumer keeps working.
- One-shot, idempotent migration script that fans out existing JSONL entries into per-file records, with a receipt noting counts.

### In Scope (Extended — Phase 16)

- Full redesign of the Feature Image Studio UI against the audiocontrol house voice: service-manual / flight-instrumentation aesthetic. Departure Mono display + IBM Plex Sans body + JetBrains Mono readouts; warm-ink near-black background + phosphor-amber primary + Roland-blue accent.
- Information-architecture split: the current ~4000-line single-page tool at `/dev/feature-image-preview` breaks into linked routes — `/dev/studio` (gallery), `/dev/studio/focus/[id]` (focus canvas), `/dev/studio/generate`, `/dev/studio/templates`, `/dev/studio/help`. Old route redirects to the new gallery for muscle-memory continuity.
- Shared `ProgressTape` primitive fixed to viewport bottom: numbered multi-stage reel-to-reel progress bar with live tabular elapsed + estimated-remaining readouts (driven by a localStorage EMA of prior runs), cancel affordance, and a compact idle state that shows the last operation's summary stamp. Every long-running operation (generate / recomposite / approve / apply) routes through it.
- TARGET-site indicator in the header (AUDIOCONTROL / EDITORIALCONTROL) that switches a `--studio-target` accent variable amber ↔ chartreuse; chrome itself stays audiocontrol-branded so the operator never feels lost about which tool they're using.
- Zero backend churn — same API endpoints, same journal storage, same skills, same bake pipeline. This is a UI-layer phase.

### Out of Scope

- Changes to the existing `generate-og-images.ts` build-time script
- CMS for content management
- Video or animated image generation
- Automatic deployment or git commit of generated images
- Production-facing UI (gallery is dev-only)

## Technical Context

### Existing Infrastructure

- `scripts/generate-og-images.ts` — satori + sharp OG generator (text overlay on static backgrounds)
- `sharp` already in devDependencies
- `satori` already in devDependencies
- `tsx` used as script runner
- Site brand: dark backgrounds, teal accents, JetBrains Mono / Inter fonts

### New Dependencies

- `openai` — for DALL-E 3 API access
- FLUX — via REST API (no SDK needed)

### Environment Variables

- `OPENAI_API_KEY` — for DALL-E 3
- `FLUX_API_KEY` — for FLUX (provider TBD: fal.ai, Replicate, or BFL API)

## Success Criteria

- Running the CLI with `--provider dalle` generates a background image via DALL-E 3
- Running the CLI with `--provider flux` generates a background image via FLUX
- Running with `--provider both` generates from both for comparison
- Generated images include readable title text matching site brand
- All three format variants are generated from a single background
- `/feature-image` skill generates images from page frontmatter
- Images land in correct `public/images/` subdirectories

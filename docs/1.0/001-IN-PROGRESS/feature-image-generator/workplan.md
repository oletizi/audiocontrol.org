# Workplan: Feature Image Generator

**Feature slug:** `feature-image-generator`
**Branch:** `feature/feature-image-generator`
**Milestone:** Feature Image Generator

## Phase 1: Infrastructure & Provider Interface (#32)

**Deliverable:** Can generate raw background images from both providers via CLI

### Tasks

- [x] Define image generation provider interface (`scripts/feature-image/types.ts`)
- [x] Implement DALL-E 3 provider with openai SDK
- [x] Implement FLUX provider with REST API
- [x] Add `openai` as dependency
- [x] Create CLI entry point that accepts a prompt and provider flag
- [x] Verify both providers generate and save images

### Acceptance Criteria

- [x] `--provider dalle` generates a background image via DALL-E 3
- [x] `--provider flux` generates a background image via FLUX
- [x] `--provider both` generates from both for comparison
- [x] Images are saved to a specified output path

## Phase 2: Text Overlay & Compositing (#33)

**Deliverable:** End-to-end generation of formatted feature images with branded text overlays

### Tasks

- [x] Build text overlay compositing module using sharp
- [x] Implement semi-transparent dark panel with title/subtitle text
- [x] Match site design tokens (colors, fonts)
- [x] Generate all format variants (OG 1200x630, YouTube 1280x720, Instagram 1080x1080)
- [x] Handle resize/crop from provider-native sizes to target dimensions

### Acceptance Criteria

- [x] Generated images include readable title text in JetBrains Mono
- [x] Text overlay uses site brand colors (teal, dark background)
- [x] All three format variants are generated from a single background
- [x] Output matches the visual style of existing site OG images

## Phase 3: Claude Code Skill (#34)

**Deliverable:** Working `/feature-image` skill that generates images from page frontmatter

### Tasks

- [x] Create skill definition in `.claude/skills/feature-image/`
- [x] Skill reads target page frontmatter (title, description, slug)
- [x] Skill builds AI image prompt from page content
- [x] Skill invokes the generator script with appropriate arguments
- [x] Output files saved to correct `public/images/` paths
- [x] Document usage in skill definition

### Acceptance Criteria

- [x] `/feature-image src/pages/blog/some-post/index.md` generates all image variants
- [x] Images land in the correct `public/images/` subdirectories
- [x] Provider is selectable via argument
- [x] Skill provides clear output about what was generated and where

### Notes

This session also added a higher-level `feature-image-blog` skill that wraps the full blog post flow (generate → wire frontmatter → update blog index card). See `.claude/skills/feature-image-blog/SKILL.md`.

## Phase 4: Bake-off & Polish (#35)

**Deliverable:** Documented, tested skill with tuned prompts

### Tasks

- [x] Generate images for 2-3 existing blog posts with both providers
- [x] Compare quality and select default provider or document trade-offs
- [x] Tune prompt templates for best results
- [x] Document usage, prompt tips, and examples in skill definition
- [ ] Update `.env.example` with required keys

### Acceptance Criteria

- [x] Side-by-side comparison images exist for at least 2 blog posts
- [x] Default provider recommendation is documented
- [x] Skill definition includes usage examples and prompt guidance

### Notes

Default provider settled on **flux** based on visual review (more stylistically consistent, less "uncanny valley" on photographic prompts). Prompt tuning converged on abstract/geometric prompts with explicit "no text, no words" guards. See `.claude/skills/feature-image-blog/SKILL.md` for prompt guidance.

## Phase 5: Post-Processing Filter Pipeline (#47)

**Deliverable:** Composable filter pipeline that applies a consistent visual style to AI-generated images

### Motivation

AI-generated backgrounds vary widely in mood, palette, and grain even with carefully tuned prompts. A deterministic post-processing pipeline gives every site image a cohesive look without forcing the prompt to do all the work. It also lets us combine wildly different prompts (geometric, photographic, pixel-art) into a unified visual brand.

### Tasks

- [x] Define `Filter` interface (`scripts/feature-image/filters/types.ts`)
- [x] Implement primitive filters using sharp:
  - [x] `scanlines` — composite horizontal CRT scanline overlay (configurable thickness)
  - [x] `vignette` — radial darkening toward edges
  - [x] `grain` — film grain noise overlay
  - [x] `grade` — color grading via `linear()`/`modulate()`
  - [x] `phosphor` — Gaussian blur for CRT bloom effect (added during session)
  - [ ] `chromatic-aberration` — moved to Phase 7
- [x] Implement filter chain executor (apply N filters in order)
- [x] Add named presets: `retro-crt`, `subtle`, `none`, `teal-amber`, `heavy-crt`
- [x] CLI flags: `--filters scanlines,vignette` and `--preset retro-crt`
- [ ] Skill: pick preset based on page topic or accept override (skill accepts override; auto-pick deferred)
- [ ] Document presets with example before/after images

### Acceptance Criteria

- [x] Each primitive filter is independently invocable
- [x] Named presets produce visually consistent results across different sources (verified across 3 AI/agent posts)
- [x] CLI supports both ad-hoc filter chains and named presets
- [x] Generated images for 3 different blog posts share visual identity when same preset is applied
- [x] `--preset none` (or omitting filters) bypasses post-processing entirely

### Notes

Shipped 5 primitives + 5 presets. `chromatic-aberration` deferred to Phase 7 (Analog Display Filter Primitives) where it lives more naturally with `bloom` and `lens-distortion`.

## Phase 6: Preview Gallery & Iteration Workflow (#48)

**Deliverable:** Astro dev-only route for interactive prompt + filter iteration, with persistent log the agent can read.

### Motivation

Filter and prompt iteration is currently CLI-driven and one-shot. A web UI with free-text prompt input, filter selection, and side-by-side variant display dramatically accelerates the design loop. A persisted log gives the Claude Code skill context on what has been tried, so iteration with the agent doesn't restart from zero.

### Tasks

- [ ] Refactor CLI generation into a programmatic `generateFeatureImage()` function so both CLI and HTTP can call it
- [ ] Add Astro API endpoint `POST /api/dev/feature-image/generate` that accepts `{ prompt, provider, preset, filters, title?, subtitle? }` and returns `{ outputPath, durationMs, error? }`
- [ ] Add Astro API endpoint `GET /api/dev/feature-image/log` and `POST /api/dev/feature-image/log` for read/append of the iteration log
- [ ] Add Astro page at `/dev/feature-image-preview` with: prompt textarea, provider/preset selector, multi-filter checkboxes, generate button, image display, and log table with notes/status
- [ ] All `/api/dev/*` endpoints and the `/dev/*` route return 404 in production (env check)
- [ ] Define log schema (JSONL): `{ timestamp, prompt, provider, presetOrFilters, outputPath, status, notes? }`
- [ ] Persist log at `.feature-image-history.jsonl` in repo root (gitignored)
- [ ] Update `feature-image-blog` skill to optionally read the log for iteration context

### Acceptance Criteria

- [ ] Running `npm run dev` and visiting `/dev/feature-image-preview` shows the gallery
- [ ] Submitting a prompt + preset generates an image and displays it within the page
- [ ] Each generation appends an entry to `.feature-image-history.jsonl`
- [ ] User can mark entries with status (approved/rejected) and notes via the UI
- [ ] Production build does NOT expose the gallery or its API endpoints
- [ ] The `feature-image-blog` skill can read the log file directly to recall recent iterations

## Phase 7: Analog Display Filter Primitives (#49)

**Deliverable:** Three new filter primitives that complete the analog-display look (CRT, vintage video).

### Tasks

- [ ] Implement `chromatic-aberration` — slight per-channel RGB offset for CRT/lens fringing
- [ ] Implement `bloom` — boost highlights and add Gaussian glow around bright pixels
- [ ] Implement `lens-distortion` — barrel-distortion warp for CRT screen curvature
- [ ] Add new presets: `vhs` (chromatic-aberration + scanlines + grain + grade), `monitor` (phosphor + scanlines + lens-distortion + vignette)
- [ ] Update preview gallery filter list

### Acceptance Criteria

- [ ] Each primitive is independently invocable via `--filters <name>` and visible in the gallery
- [ ] `vhs` and `monitor` presets produce visually distinct, recognizable looks
- [ ] No regressions in existing presets

## Phase 8: 8-bit / Pixel Filter Primitives (#50)

**Deliverable:** Three filters for vintage-computing/pixel-art aesthetic.

### Tasks

- [ ] Implement `dither` — Bayer or Floyd-Steinberg dithering with configurable depth
- [ ] Implement `posterize` — reduce color count to a small palette (configurable)
- [ ] Implement `gradient-map` — map luminance to a color ramp (default: site teal→amber palette)
- [ ] Add preset: `8-bit` (posterize + dither + scanlines + gradient-map)
- [ ] Update preview gallery filter list

### Acceptance Criteria

- [ ] `gradient-map` with site palette enforces brand colors regardless of source image colors
- [ ] `8-bit` preset produces a recognizable pixel-art look that ties together visually disparate sources
- [ ] Each primitive is independently invocable

## Phase 9: Cinematic / Editorial Filter Primitives (#51)

**Deliverable:** Three filters for cinematic and editorial photography aesthetic.

### Tasks

- [ ] Implement `letterbox` — top/bottom black bars at configurable aspect ratio
- [ ] Implement `light-leak` — composite analog-camera light-leak overlay (texture asset or generated gradient)
- [ ] Implement `halftone` — printing-style dot pattern overlay
- [ ] Add preset: `cinematic` (letterbox + grade + grain + vignette + bloom)
- [ ] Update preview gallery filter list

### Acceptance Criteria

- [ ] Each primitive is independently invocable
- [ ] `cinematic` preset produces editorial-grade hero images with film-photography feel
- [ ] `letterbox` aspect ratio is configurable

## Phase 10: Utility Filter Primitives (#52)

**Deliverable:** Building-block utility filters for fine-grained control.

### Tasks

- [ ] Implement `sharpen` — counter-blur for accentuating detail
- [ ] Implement `contrast` — adjust black/white points
- [ ] Implement `threshold` — pure B/W conversion at a luminance cutoff
- [ ] Implement `invert` — color inversion
- [ ] Implement `duotone` — two-color mapping from luminance (different from gradient-map; only two colors)
- [ ] Update preview gallery filter list

### Acceptance Criteria

- [ ] Each primitive is independently invocable and chainable
- [ ] All filters from Phases 7-10 appear in the gallery filter selector
- [ ] Documentation lists every filter with parameters and a short example

## File Structure

```
scripts/feature-image/
├── types.ts              # Provider interface, format types
├── providers/
│   ├── dalle.ts
│   └── flux.ts
├── filters/              # Phase 5 + 7-10 primitives
│   ├── types.ts
│   ├── scanlines.ts
│   ├── vignette.ts
│   ├── grain.ts
│   ├── grade.ts
│   ├── phosphor.ts
│   ├── chromatic-aberration.ts  # Phase 7
│   ├── bloom.ts                 # Phase 7
│   ├── lens-distortion.ts       # Phase 7
│   ├── dither.ts                # Phase 8
│   ├── posterize.ts             # Phase 8
│   ├── gradient-map.ts          # Phase 8
│   ├── letterbox.ts             # Phase 9
│   ├── light-leak.ts            # Phase 9
│   ├── halftone.ts              # Phase 9
│   ├── sharpen.ts               # Phase 10
│   ├── contrast.ts              # Phase 10
│   ├── threshold.ts             # Phase 10
│   ├── invert.ts                # Phase 10
│   ├── duotone.ts               # Phase 10
│   └── index.ts                 # Registry + presets
├── overlay.ts            # Text overlay compositing
├── pipeline.ts           # Phase 6: programmatic generateFeatureImage()
└── cli.ts

src/pages/dev/
└── feature-image-preview.astro  # Phase 6: gallery UI (dev-only)

src/pages/api/dev/feature-image/
├── generate.ts                  # Phase 6: POST generation endpoint
└── log.ts                       # Phase 6: GET/POST log endpoints

.claude/skills/
├── feature-image/
└── feature-image-blog/

.feature-image-history.jsonl     # Phase 6: iteration log (gitignored)
```

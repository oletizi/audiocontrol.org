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

## Phase 11: Prompt Library & Fitness-Ranked Selection (#63)

**Deliverable:** A curated library of prompt templates with fitness scores, lineage, and selection mechanisms that let a shared visual identity evolve over time instead of being reinvented per post.

### Motivation

Every generation right now starts from either a hand-typed prompt or one the agent proposes from scratch. Reusable, on-brand prompts decay as session memory fades. This phase establishes a persistent, ranked library of templates that seeds every new workflow and lets good prompts be cultivated by artificial selection: rate generations, fitness rolls up to templates, forking creates variants, low-fitness templates get deprioritized.

### Concepts

- **Template** — a named prompt with metadata (description, tags, default preset/provider, link to parent template, back-references to successful generations)
- **Fitness** — rolling aggregate of 1-5 user scores on generations that used the template (with a usage-count minimum to discount tiny-sample winners)
- **Lineage** — `parent` field on each template; supports a visible tree view of how the library evolved
- **Selection pressure** — gallery and `/feature-image-blog` weight suggestions by fitness × recency; low-fitness templates archive but stay forkable

### Tasks

- [x] Define template schema (`scripts/feature-image/templates.ts`): `{ slug, name, description, tags, prompt, preset?, provider?, parent?, archived?, examples: logEntryId[] }`
- [x] Store library at `docs/feature-image-prompts.yaml` (hand-editable, checked in)
- [x] Add `rating` field (1-5) to `LogEntry` schema; extend `POST /api/dev/feature-image/log` to accept rating updates
- [x] Compute template fitness: `avg(ratings of generations that used this template, weighted by recency)` with a minimum usage count before a template can appear in the default picker
- [x] API endpoints: `GET /api/dev/feature-image/templates`, `POST /api/dev/feature-image/templates` (create/update/fork/archive)
- [x] Gallery UI:
  - Template picker dropdown on the generate form (pre-fills prompt + preset + provider)
  - Star-rating widget on each history entry (1-5)
  - "Save as template" action on an approved entry (creates a new library entry; user names it)
  - "Fork this template" action on a template (clones with parent reference; opens for edit)
- [ ] Template list view with fitness scores and lineage indicators (deferred — `/feature-image-prompts` skill provides this for now; richer in-gallery UI later)
- [x] Skill `/feature-image-prompts` — list templates by tag / fitness / lineage
- [x] Update `/feature-image-blog` to auto-suggest top-N templates matching the post's tags (auto-tag derived from blog index `tags: []`, user can override)
- [x] Seed library with templates extracted from the four applied generations on main (data-packet-network referencing the real log entry; crystal-teal/-amber and stacked-panels-receding as starting points awaiting first ratings)

### Acceptance Criteria

- [x] `docs/feature-image-prompts.yaml` exists with 4 seed templates (one with a real example reference)
- [x] Gallery template picker pre-fills the form; submitting the form records which template was used so its fitness can update
- [x] Rating a generation updates the corresponding template's fitness
- [x] Forking a template creates a new one with `parent` set; parent chain is visible in the template list
- [x] `/feature-image-blog` suggests matching templates from the library when tags overlap
- [x] Archiving a template hides it from default suggestions but it stays forkable

### Deferred to Future Phases

- AI-assisted crossover (Claude combines two templates into a new one)
- Pairwise tournament UI (user picks between two generations; ELO-style rating)
- Auto-archival when fitness drops below threshold for N consecutive generations
- Per-site-section template sets (e.g., different libraries for blog vs. device pages)

## Phase 12: DOM Preview & Commit-to-PNG (#67)

**Deliverable:** Interactive gallery preview where title/subtitle, filter chain, and overlay visibility are live-editable in HTML/CSS. Committing rasterizes the exact DOM via Playwright, making preview == bake and eliminating the satori/sharp dual-source-of-truth.

### Motivation

Today a gallery user can't tweak title/subtitle or toggle the overlay without regenerating. The CSS preview and the baked PNG are also produced by two different code paths (DOM vs. satori+sharp), so they can diverge visually. Moving the preview into live DOM and rasterizing that same DOM on commit solves both problems at once.

### Tasks

- [ ] Build interactive preview component in the gallery
  - [ ] Replace static composited `<img>` with a `<div class="og-preview">` layering the raw AI image + CSS filter overlays + positioned title/subtitle block
  - [ ] Text overlay: editable `<input>` (title) and `<textarea>` (subtitle) positioned inside the preview
  - [ ] Toggle: overlay on/off checkbox (hides the text block without destroying content)
  - [ ] Per-filter toggles (scanlines, grain, vignette, grade, phosphor) + preset quick-select
  - [ ] All controls drive CSS variables on the preview element; no backend calls during iteration
- [ ] Add CSS implementations of each filter primitive matching existing sharp filters directionally:
  - [ ] scanlines (repeating-linear-gradient overlay)
  - [ ] vignette (radial-gradient overlay)
  - [ ] grain (tiled noise PNG overlay)
  - [ ] grade (`filter: brightness contrast saturate hue-rotate`)
  - [ ] phosphor (`filter: blur`)
- [ ] Build bake route `/dev/feature-image-bake`
  - [ ] Accepts query params: `entry`, `format` (og|youtube|instagram), `title`, `subtitle`, `preset`, filter chain, `overlay` bool
  - [ ] Server-renders a single variant at exact pixel dims using the shared preview stylesheet
  - [ ] 404 in production (`import.meta.env.PROD`)
- [ ] Build commit endpoint `POST /api/dev/feature-image/recomposite`
  - [ ] Request: `{ entryId, title, subtitle, preset, filters, overlay, formats[] }`
  - [ ] Launches Playwright headless (already in devDeps), navigates to bake route per format, screenshots at viewport size, writes `public/images/generated/<id>-<format>.png`
  - [ ] Appends a new log entry with references to the rebaked outputs (preserves history of iterations)
- [ ] Wire "Commit" button on each gallery item to call the recomposite endpoint
  - [ ] Show in-flight state + success/error
  - [ ] Refresh gallery on success so new bake shows as latest log entry
- [ ] Manual verification
  - [ ] Editing title/subtitle updates preview with zero network traffic
  - [ ] Toggling filters updates preview immediately
  - [ ] Commit produces PNGs that match what the preview showed
  - [ ] All three formats (og, youtube, instagram) render correctly

### Acceptance Criteria

- [ ] Gallery preview reflects title/subtitle/filter edits in real time with no backend round-trip
- [ ] Overlay toggle hides/shows text without affecting the background
- [ ] Each filter primitive is independently toggleable in the preview and matches its sharp counterpart directionally
- [ ] Commit button produces PNG files on disk via Playwright DOM screenshot
- [ ] All three formats (1200×630, 1280×720, 1080×1080) bake correctly
- [ ] Preview and bake use the same stylesheet — no visual divergence
- [ ] Production build does not expose the bake route or the recomposite endpoint

### Deferred

- Retiring satori/sharp overlay path from the initial-generation pipeline (first-time generation still uses the existing bake; only gallery-driven recomposition uses DOM rasterization in this phase)
- Shareable preview permalinks (a URL that replays a specific preview state)

## Phase 13: Conversation Thread with Claude (#76)

**Deliverable:** The gallery becomes a conversation surface. Each focused entry has a thread where the user types natural-language feedback ("too literal", "try amber instead") and Claude responds asynchronously with new generations plus commentary. Iterations form a tree via parent/child lineage, so the thread persists across the chain.

### Motivation

Today's iteration loop is one-way: the user adjusts prompt/preset/filters and re-generates, and a single history log captures the outcomes. There's no record of *why* an iteration was requested, and no way to ask Claude for help when the feedback isn't directly actionable by tweaking selectors ("this doesn't feel like it matches the post's tone — can you try something different?"). Phase 13 makes the tool what the user actually wants it to be: a dialogue with Claude about getting to the right answer.

### Concepts

- **Thread** — a sequence of messages anchored to a root log entry. Any entry in the parent-child lineage rooted at that entry sees the same thread.
- **Message** — `{ role: 'user' | 'assistant', timestamp, text, logEntryId?, snapshot? }`. User messages carry a snapshot of the current edits (title, subtitle, prompt, preset, filters, overlay). Assistant messages may reference a newly-generated log entry.
- **Lineage** — each `LogEntry` gets an optional `parentEntryId` field; iterations set this to the entry they were generated from. The thread follows the root of the lineage.
- **Pending iteration** — a workflow item of type `feature-image-iterate` that points at a thread + the last user message. Claude picks it up via a skill and responds.

### Tasks

- [ ] Add `parentEntryId?: string` to `LogEntry` schema; persist it in the recomposite endpoint and any new iterate endpoint
- [ ] Define `Message` and thread persistence (`scripts/feature-image/threads.ts`): JSONL at `.feature-image-threads.jsonl`, append-only messages keyed by `threadId` (= root entry id of the lineage)
- [ ] API endpoints:
  - [ ] `GET /api/dev/feature-image/threads?entryId=<id>` — returns the thread for the lineage containing that entry (resolves root via parent chain), oldest-message-first
  - [ ] `POST /api/dev/feature-image/threads` with `action: 'append-message'` — appends a user message and enqueues a `feature-image-iterate` workflow item
- [ ] Gallery thread panel (focus mode only):
  - [ ] Message list rendered in order with role styling
  - [ ] Composer textarea + Send button
  - [ ] Inline thumbnail for any assistant message referencing a log entry (click → focus that entry)
  - [ ] Polling every 5-10s while focus mode is active to pull new assistant messages
  - [ ] "Waiting for Claude…" indicator on the user's pending last message
- [ ] New skill `.claude/skills/feature-image-iterate/` — invoked by the agent to drain pending `feature-image-iterate` workflow items:
  - [ ] Reads the thread, the snapshot on the latest user message, and the source log entry
  - [ ] Proposes a prompt adjustment (or a preset/filter change) based on the feedback
  - [ ] Invokes the generation pipeline; the new log entry gets `parentEntryId` set to the source entry
  - [ ] Appends an `assistant` message to the thread referencing the new entry + a short explanation of what changed
  - [ ] Marks the workflow item applied
- [ ] Update the right-drawer workflow panel to show iterate items distinctly from `feature-image-blog` items (different group label)
- [ ] Extend `/feature-image-help` to report pending iterate workflow count alongside blog workflow count

### Acceptance Criteria

- [ ] User can open focus mode on any entry and see a thread (empty string if no messages yet)
- [ ] Sending a message appends to the thread immediately and enqueues a pending iterate workflow item
- [ ] Running the iterate skill in Claude Code generates a new entry with `parentEntryId` set to the source, appends an assistant message to the thread, and the workflow moves to applied
- [ ] The gallery polls and renders the assistant response without a manual reload
- [ ] Opening any entry in a lineage (root or child) shows the same thread
- [ ] Workflow panel distinguishes iterate items from feature-image-blog items

### Deferred to Future Phases

- Server-sent-events for instant assistant-message delivery (polling is fine for v1)
- Branching threads (user forks a conversation at a specific message)
- Assistant text-only messages (Claude asks a clarifying question without generating)
- Thread search across history
- Per-message ratings (thumbs up/down on a Claude response)

## Phase 14: Multi-Site Feature Images (#85)

**Deliverable:** The feature-image generator works for both sites in the repo (audiocontrol and editorialcontrol) with each site's native brand — correct fonts, palette, logo, and brand text — instead of hard-coded audiocontrol styling. Gallery lets the user choose a target site per generation and per focused entry; applying a workflow routes images into the correct site's public directory and wires the correct frontmatter.

### Motivation

Main merged a major architectural split: the repo now hosts `src/sites/audiocontrol/` and `src/sites/editorialcontrol/` as sibling sites, each with its own `brand.ts`, typography, palette, layouts, and `public/`. The feature-image generator predates the split and hard-codes audiocontrol's brand (JB Mono, teal `#2fb8a8`, `/favicon.svg`, "audiocontrol.org"). Without this phase, editorialcontrol blog posts can't use the gallery — they'd come out looking like audiocontrol posts.

### Concepts

- **Site-aware bake** — the `OGPreview` component and bake route read site brand tokens from `src/sites/<site>/brand.ts` (via the shared `Brand` interface in `src/shared/brand.ts`) and set CSS custom properties that drive the overlay's fonts and colors.
- **Site-aware routing** — the gallery's Generate form and the per-entry focus panel carry a `site` value that flows through `/api/dev/feature-image/generate` and `/recomposite`. `/feature-image-blog` infers the site from the target post's path (`src/sites/<site>/pages/blog/<slug>/index.md`). `/feature-image-apply` copies approved images into `src/sites/<site>/public/images/blog/<slug>/`.
- **Shared dev tooling** — the dev-only gallery, API endpoints, and scripts stay outside site subtrees (at repo root or under `src/shared/dev/`) so both sites use the same workbench.
- **Per-site templates (optional)** — `PromptTemplate` gains an optional `site: 'audiocontrol' | 'editorialcontrol' | null` field. `null` means "works for any site". The picker filters by current-site + null. Fitness is scoped per-site so cross-site ratings don't pollute each other.

### Tasks

- [ ] **Audit placement after the main merge.** Determine whether the gallery, API endpoints, OGPreview component, bake route, and og-preview.css should:
  - live at the repo root (shared) under a new `src/shared/dev/` tree, or
  - live under one site's subtree (audiocontrol, since it's the workbench) and serve both
  - whichever Astro's multi-site config supports with least friction
- [ ] **Add `site` parameter to the pipeline:**
  - `OGPreview.astro` accepts `site: 'audiocontrol' | 'editorialcontrol'` prop (default `audiocontrol` for backwards compat)
  - Component reads `src/sites/<site>/brand.ts` at render time and emits CSS custom properties (`--og-primary`, `--og-foreground`, `--og-panel-bg`, `--og-font-display`, `--og-font-body`) the stylesheet consumes
  - Bake route `/dev/feature-image-bake` accepts `?site=<slug>` query param
  - `/api/dev/feature-image/generate` and `/recomposite` accept `site` in the body and persist it on the log entry
- [ ] **Rewrite `og-preview.css`** to use brand custom properties instead of literal colors/fonts. Typography: `font-family: var(--og-font-display)` for title, `var(--og-font-body)` for subtitle. Panel/accent colors come from the same vars. Behavior stays directionally identical when site=audiocontrol.
- [ ] **Extend `LogEntry` schema** with optional `site: 'audiocontrol' | 'editorialcontrol'`. Default to `audiocontrol` if absent (pre-Phase-14 entries).
- [ ] **Gallery UI site selector:**
  - Generate drawer gets a Site field (radio or segmented control) above the Prompt. Defaults to `audiocontrol`; remembered via localStorage.
  - Focused entry shows which site it's for; focus-mode preview controls include a small Site switcher so the user can re-bake the same raw image under a different site's brand.
  - Template grid filters by current site + null-site templates.
- [ ] **Extend `/feature-image-blog` skill:** infer `site` from the post path (first path segment after `src/sites/`). Pass into the workflow context.
- [ ] **Extend `/feature-image-apply` skill:** use `site` from the workflow context or the approved log entry to route output into `src/sites/<site>/public/images/blog/<slug>/` and update the correct site's blog index + post frontmatter.
- [ ] **Extend `PromptTemplate` schema** with optional `site` field; update the YAML seeds + templates endpoint + gallery picker filter.
- [ ] **Seed editorialcontrol templates** — hand-author 2-3 starter templates that reflect editorialcontrol's brand (serif display, editorial feel) so the picker has something sensible on day one.
- [ ] **Dogfood on one editorialcontrol post** — generate, iterate, approve, apply. Verify the baked PNG uses Fraunces display + chartreuse accent + editorialcontrol branding and lands in the correct directory.

### Acceptance Criteria

- [ ] `OGPreview` and the bake route produce visibly different images for `site=audiocontrol` vs `site=editorialcontrol` from the same raw background
- [ ] Generated images for audiocontrol are visually unchanged from pre-Phase-14 behavior
- [ ] Gallery's Generate form has a Site selector; selection persists between sessions
- [ ] Focused entry displays its site and lets the user switch sites for recomposition
- [ ] `/feature-image-blog` correctly infers the site from the post path
- [ ] `/feature-image-apply` writes to the correct `src/sites/<site>/public/images/blog/<slug>/` directory
- [ ] Template picker filters templates by the currently-selected site
- [ ] Log entries persist `site` alongside prompt/preset/filters

### Deferred

- Automatic palette inference for the overlay panel from the site's brand (e.g. panel-bg derived from `--card` token) — start with hand-tuned per-site overrides
- Visual cross-site A/B comparison in the gallery (show the same raw image baked under both sites side by side)
- Per-site commit hook that regenerates all open workflows when brand tokens change

## Phase 15: Journal Records (One File Per Entry) (#99)

**Deliverable:** Replace the three monolithic append-only JSONL files with per-entry JSON files under `journal/`. Cross-branch merge conflicts on these stores go to zero; individual entries become greppable, editable, and cherry-pickable in isolation.

### Motivation

Two live merge conflicts hit this session on `.feature-image-history.jsonl` and `.feature-image-pipeline.jsonl` during rebase/merge of the feature branch. The root cause is monolithic append logs — any two branches writing at the same tail collide. With a directory-per-type (`journal/history/<ts>-<id>.json`), each entry is its own file, so writes never conflict by construction. The pattern also cleans up runtime drift (archived flags, examples-arrays, template fitness updates) that currently re-writes the whole file and inflates diffs.

### Concepts

- **One file per entry.** `journal/history/<ISO-ts>-<id>.json`, `journal/pipeline/<ISO-ts>-<id>.json`, `journal/threads/<ISO-ts>-<thread-id>-<msg-id>.json`. Filename sort order ≡ chronological order.
- **Plain JSON, pretty-printed.** Human-greppable; each entry fits on a screen; diffs tell a story.
- **Directory-as-log.** `readLog()` globs the directory, parses each file, sorts by `timestamp` field. Cost at ~500 entries is negligible.
- **Update-in-place.** `updateLog(id, patch)` writes the single file that owns that id instead of rewriting the whole log. `.archived`, `.rating`, `.notes` patches become single-file diffs.
- **Migration is one-shot + idempotent.** A script reads the old JSONL and fans out one file per entry; running it twice is safe (skip if target exists).

### Tasks

- [x] **Write `scripts/feature-image/journal.ts`** — shared helper for directory-backed record stores. Exports `readJournal(dir)`, `appendJournal(dir, record, idField, timestampField)`, `updateJournal(dir, id, patch, idField)`, `deleteJournal(dir, id, idField)`. Filename convention: `<timestamp>-<id>.json`.
- [x] **Migration script** `scripts/feature-image/migrate-journal.ts` that reads each `.feature-image-*.jsonl` and fans out per-entry files into `journal/history/`, `journal/pipeline/`, `journal/threads/`. Idempotent (skip if file exists). Produces a `journal/MIGRATED.txt` receipt with counts.
- [x] **Rewrite `scripts/feature-image/log.ts`** — `readLog/appendLog/updateLog` use `journal.ts` against `journal/history/`. Public signatures unchanged. Drop the `LOG_PATH` constant.
- [x] **Rewrite `scripts/feature-image/workflow.ts`** — same pattern against `journal/pipeline/`.
- [x] **Rewrite `scripts/feature-image/threads.ts`** — same pattern against `journal/threads/`. Each message filename is `<normalized-ts>-<messageId>.json`; `readAllMessages` reads the whole directory and `readThread` filters by threadId + sorts by timestamp (same as before).
- [x] **Verify consumers** — `recomposite.ts`, `generate.ts`, API log endpoint, templates fitness calculation, gallery refresh all keep working through the same public APIs. Verified via direct tsx smoke tests (read 12 history / 7 pipeline / 7 threads correctly) + playwright-driven gallery load rendering 3 active + 9 archived cards.
- [x] **Gallery refresh strategy** — the gallery was already polling the API endpoints every 5-6s, never watching files directly, so the directory-backed reads flow through unchanged.
- [x] **Gitignore sweep** — `.gitignore` note updated to reference the new `journal/` layout; `journal/` tree stays tracked (fitness + lineage depend on it).
- [x] **Remove old JSONL files** in the same commit as the journal infra landing.
- [x] **Add a README note** in `docs/1.0/001-IN-PROGRESS/feature-image-generator/` describing the on-disk journal layout so future contributors don't re-invent the storage.

### Acceptance Criteria

- [x] `journal/history/` contains one JSON file per historical entry; `.feature-image-history.jsonl` is gone
- [x] `journal/pipeline/` contains one JSON file per workflow item; `.feature-image-pipeline.jsonl` is gone
- [x] `journal/threads/` contains one JSON file per thread message; `.feature-image-threads.jsonl` is gone
- [x] `readLog()` returns all entries sorted oldest-first; `appendLog(entry)` writes exactly one new file; `updateLog(id, patch)` modifies exactly one file
- [x] Gallery refresh picks up new entries within a reasonable beat (current behavior or better)
- [x] Rebase or merge of a branch that added N history entries, against a main that added M, never conflicts on journal files (design-level guarantee — each entry is a separate file)
- [x] Gallery loads cleanly; generate / recomposite / commit / approve paths exercise `appendLog` + `updateLog` via the existing API endpoints (same public APIs)
- [x] `npm run build` green for both sites

### Deferred

- Compaction/archival tooling (glob older-than-N-days, tar-ball, drop) — not needed at current scale
- Indexing files (e.g. `journal/history/INDEX.json`) to speed up reads — only if directory scan shows measurable cost
- Cross-tool format-sharing (e.g. reusing the same journal for the editorial calendar) — out of scope

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

# Feature Images

A pipeline for generating branded feature images for blog posts and pages: AI-generated background → post-processing filter chain → branded text overlay → multi-format output. Driven through a two-way async workflow between Claude Code skills and a dev-only preview gallery.

## How It Works

```
prompt → AI provider → background → filter chain → text overlay → format variants
```

Each stage is independently configurable:

- **Provider** — DALL-E 3 or FLUX (Black Forest Labs API)
- **Filters** — composable post-processing applied to the background before overlay (so text stays sharp)
- **Overlay** — branded panel with title, subtitle, logo, and "audiocontrol.org" wordmark
- **Formats** — OG (1200×630), YouTube (1280×720), Instagram (1080×1080) — all generated from a single source

## The Two-Way Workflow (Default Flow for Blog Posts)

Blog-post feature images use an async pipeline between Claude Code and the preview gallery:

```
/feature-image-blog <post>   →   agent enqueues workflow item (open)
user opens gallery           →   activates the workflow, iterates on prompts & filters
user submits decision        →   picks an approved generation (workflow → decided)
/feature-image-apply         →   agent copies files, wires frontmatter + index (→ applied)
```

State machine on each workflow item:

```
open  →  decided  →  applied
   \       /
    cancelled
```

Two JSONL files back this pipeline (both gitignored):

- `.feature-image-history.jsonl` — every generation run through the gallery or CLI (raw record)
- `.feature-image-pipeline.jsonl` — workflow items with state transitions (intent + decision + outcome)

## Skills

| Skill | Purpose |
|-------|---------|
| `/feature-image-blog <post-path-or-url>` | Enqueue a workflow item for a blog post; hand off to the gallery |
| `/feature-image-apply` | Process all `decided` workflow items; copy files, wire frontmatter, update blog index |
| `/feature-image-help` | Show pipeline state: open workflows, recent generations, quick-start hints |
| `/feature-image <page-path>` | Older inline generation for non-blog pages (not part of the async pipeline) |

`/feature-image-blog` is the primary entry point for blog posts. It accepts either a path (`src/pages/blog/my-post/index.md`) or a URL (`https://audiocontrol.org/blog/my-post/` — the slug is extracted automatically).

## Preview Gallery

Dev-only Astro route at `/dev/feature-image-preview`. Requires `npm run dev`. Returns 404 in production.

Features:
- **Pending workflows panel** — open items enqueued by the agent, plus decided items awaiting `/feature-image-apply`. Auto-polls every 5 seconds.
- **Activate** a workflow to pre-fill the form with the post's context (prompt, title, subtitle, suggested preset)
- **Generate** — free-text prompt, provider/preset/filter selection, multi-format output
- **History** — every generation with raw/filtered/composited variants, approve/reject, notes, "Copy as input" to re-seed the form
- **Submit for workflow** — per-entry button (only visible when a workflow is active) that links the approved generation to the workflow

## API Endpoints (Dev-Only)

All under `/api/dev/feature-image/`. All return 404 in production.

| Endpoint | Purpose |
|----------|---------|
| `POST /generate` | Run the pipeline; append to history log; return the new log entry |
| `GET /log` | Return the history log (most recent first) |
| `POST /log` | Update an existing history entry (status / notes) |
| `GET /workflow[?state=X]` | List workflow items, optionally filtered by state |
| `POST /workflow` | Create / decide / cancel / apply-result on a workflow item |

## CLI

The CLI is still available for one-off generation outside the gallery workflow:

```bash
# Generate a background and full overlay set with a preset
tsx scripts/feature-image/cli.ts \
  --prompt "abstract geometric structure, teal and amber, no text" \
  --provider flux \
  --preset retro-crt \
  --title "Post Title" \
  --subtitle "One-line description" \
  --formats og,youtube,instagram \
  --name feature \
  --output public/images/blog/<slug>

# Apply filters to an existing background (no AI generation)
tsx scripts/feature-image/cli.ts \
  --background path/to/existing.png \
  --preset heavy-crt \
  --title "Title" \
  --formats og \
  --name feature \
  --output public/images/blog/<slug>
```

### Flags

| Flag | Description |
|------|-------------|
| `--prompt` | Text prompt for AI background generation |
| `--provider` | `dalle`, `flux`, or `both` (default: `dalle`) |
| `--background` | Path to existing background (skips AI generation) |
| `--title` | Title text for overlay (enables overlay mode) |
| `--subtitle` | Subtitle text for overlay |
| `--formats` | Comma-separated: `og,youtube,instagram` (default: all) |
| `--filters` | Comma-separated filter names (e.g. `scanlines,vignette,grain`) |
| `--preset` | Named filter chain (see below) |
| `--name` | Base filename for output (default: `generated`) |
| `--output` | Output directory (default: `public/images/generated`) |

Both the CLI and the HTTP generate endpoint share a single library function: `generateFeatureImage()` in `scripts/feature-image/pipeline.ts`.

## Providers

| Provider | Model | Notes |
|----------|-------|-------|
| `dalle` | DALL-E 3 (HD) | Native 1792×1024 landscape; tends toward photorealistic |
| `flux` | FLUX 1.1 Pro (BFL) | Max 1440×1024, multiples of 32; tends toward stylized |

`flux` is the recommended default — generates more stylistically consistent results with less "uncanny valley" on photographic prompts.

### API Keys

The pipeline auto-loads keys from `~/.config/audiocontrol/`:

- `openai-key.txt` → `OPENAI_API_KEY` (DALL-E)
- `flux-key.txt` → `BFL_API_KEY` (FLUX)

Environment variables override the file-based keys when set. See `.env.example`.

## Filter Pipeline

Filters are applied to the background **before** the text overlay, so generated text stays crisp.

### Primitives

| Filter | Purpose |
|--------|---------|
| `scanlines` | CRT-style horizontal dark lines (configurable thickness, opacity, cycle) |
| `vignette` | Radial darkening toward the edges |
| `grain` | Monochrome noise overlay (film-grain texture) |
| `grade` | Color grading: saturation, brightness, hue, per-channel levels |
| `phosphor` | Gaussian blur for CRT bloom / soft-glow effect |

### Presets

Named chains for common looks. Use `--preset <name>` or select in the gallery.

| Preset | Chain | Use case |
|--------|-------|----------|
| `none` | (empty) | Skip post-processing entirely |
| `subtle` | vignette + grain | Conservative — preserves source character |
| `retro-crt` | grade + phosphor + vignette + thick scanlines + grain | Default for AI/agent and tech-focused posts |
| `teal-amber` | warm grade + vignette + grain | Editorial film-look |
| `heavy-crt` | grade + heavier phosphor + thicker scanlines + heavy vignette + grain | Strong vintage-monitor stylization |

## Frontmatter Convention

Blog posts use two distinct image fields with different responsibilities:

| Field | Purpose | Used by |
|-------|---------|---------|
| `image` | Inline display at top of the post (no text overlay needed — title is on the page) | `BlogLayout`, blog index card thumbnail |
| `socialImage` | OG / sharing card with branded title overlay | `<meta property="og:image">`, schema.org JSON-LD |

Example:

```yaml
---
title: "Post Title"
description: "One-line description"
image: "/images/blog/<slug>/feature-filtered.png"
socialImage: "/images/blog/<slug>/feature-og.png"
---
```

If `socialImage` is omitted, the OG meta falls back to the auto-discovered `/images/og/<slug>.png` (generated by the build-time `scripts/generate-og-images.ts`).

## Output Files

A typical run with `--name feature` produces:

```
public/images/blog/<slug>/
├── feature-raw.png        # Direct AI provider output (only when generating from --prompt)
├── feature-filtered.png   # Post-filter background, no overlay (used inline)
├── feature-og.png         # 1200×630 with branded text overlay (used as socialImage)
├── feature-youtube.png    # 1280×720 with overlay
└── feature-instagram.png  # 1080×1080 with overlay
```

## Typical Workflow

### Adding a feature image to a blog post (preferred flow)

```
1.  In Claude Code:    /feature-image-blog src/pages/blog/my-post/index.md
2.  In your browser:   http://localhost:4321/dev/feature-image-preview
                         → Activate the pending workflow
                         → Iterate on prompt / preset / filters until one feels right
                         → Click "Submit for workflow XXXXXXXX"
3.  In Claude Code:    /feature-image-apply
```

Step 3 copies the approved images into `public/images/blog/<slug>/`, updates the post's frontmatter (`image` + `socialImage`), and updates the blog index card. Review in the dev server, then commit.

### Seeing what's in flight

```
/feature-image-help
```

Reports open workflows (awaiting gallery interaction), decided workflows (awaiting apply), and the last few generation entries.

### One-off iteration (no workflow, just playing)

Visit the gallery directly without activating a workflow. Generate whatever you want — everything lands in `public/images/generated/` (gitignored) and in the history log. Approve entries for your own notes; nothing is wired into any post.

## File Layout

```
scripts/feature-image/
├── types.ts              # Provider interface, output format definitions
├── providers/
│   ├── dalle.ts          # DALL-E 3 (OpenAI SDK)
│   └── flux.ts           # FLUX 1.1 Pro (BFL REST API)
├── filters/
│   ├── types.ts          # Filter interface + chain executor
│   ├── scanlines.ts
│   ├── vignette.ts
│   ├── grain.ts
│   ├── grade.ts
│   ├── phosphor.ts
│   └── index.ts          # Filter registry + named presets
├── overlay.ts            # Text overlay via satori + sharp
├── pipeline.ts           # generateFeatureImage() — shared by CLI and HTTP endpoint
├── log.ts                # history JSONL schema and read/append/update
├── workflow.ts           # pipeline JSONL schema and state transitions
└── cli.ts                # CLI entry point

src/pages/dev/
└── feature-image-preview.astro     # Gallery UI (dev-only)

src/pages/api/dev/feature-image/
├── generate.ts            # POST — run the pipeline
├── log.ts                 # GET / POST — history
└── workflow.ts            # GET / POST — workflow state transitions

.claude/skills/
├── feature-image/         # older inline-generation skill
├── feature-image-blog/    # enqueue a workflow for a blog post
├── feature-image-apply/   # process decided workflow items
└── feature-image-help/    # show pipeline state

src/layouts/BlogLayout.astro        # Renders inline image, sets OG meta from socialImage

.feature-image-history.jsonl        # Generation history (gitignored)
.feature-image-pipeline.jsonl       # Workflow pipeline state (gitignored)
```

## Prompt Guidance

Tested patterns from the AI/agent post series:

**Do:**
- Bias toward abstract, geometric, or vintage-computing aesthetics
- Specify mood and color palette (e.g., "deep teal and amber, dark moody background")
- Always append: `"no text, no words, no letters, no typography, no labels"`
- Use specific style anchors: "isometric crystal structure", "translucent panels", "8-bit pixel art"

**Avoid:**
- Trying to depict identifiable hardware that the audience knows (the AI version always reads as fake to experts)
- Overly detailed scenes — abstract reads better at thumbnail sizes
- Photographic prompts of specific brands (uncanny-valley territory)

The filter pipeline normalizes wildly different sources into a consistent house style — lean on it for cross-image consistency rather than trying to make the prompt do all the work.

## Documentation

- [Workplan](./docs/1.0/001-IN-PROGRESS/feature-image-generator/workplan.md) — phase breakdown and task status
- [PRD](./docs/1.0/001-IN-PROGRESS/feature-image-generator/prd.md) — requirements and motivation

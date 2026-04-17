# Feature Images

A pipeline for generating branded feature images for blog posts and pages: AI-generated background → post-processing filter chain → branded text overlay → multi-format output. Driven from the CLI or via Claude Code skills.

## How It Works

```
prompt → AI provider → background → filter chain → text overlay → format variants
```

Each stage is independently configurable:

- **Provider** — DALL-E 3 or FLUX (Black Forest Labs API)
- **Filters** — composable post-processing applied to the background before overlay (so text stays sharp)
- **Overlay** — branded panel with title, subtitle, logo, and "audiocontrol.org" wordmark
- **Formats** — OG (1200x630), YouTube (1280x720), Instagram (1080x1080) — all generated from a single source

## Skills

The image workflow is exposed as Claude Code skills.

| Skill | Purpose |
|-------|---------|
| `/feature-image-blog <post-path>` | End-to-end: generate, filter, composite, wire frontmatter, update blog index |
| `/feature-image <page-path>` | General-purpose image generation for any page (no auto-wiring) |

`/feature-image-blog` is the primary workflow. It reads the post frontmatter, builds an abstract prompt, asks for confirmation, generates the image set, and wires everything into the post and the blog index card.

## CLI

The CLI is the building block. Skills call into it.

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

## Providers

| Provider | Model | Notes |
|----------|-------|-------|
| `dalle` | DALL-E 3 (HD) | Native 1792×1024 landscape; tends toward photorealistic |
| `flux` | FLUX 1.1 Pro (BFL) | Max 1440×1024, multiples of 32; tends toward stylized |

`flux` is the recommended default — generates more stylistically consistent results with less "uncanny valley" on photographic prompts.

### API Keys

The CLI auto-loads keys from `~/.config/audiocontrol/`:

- `openai-key.txt` → `OPENAI_API_KEY` (DALL-E)
- `flux-key.txt` → `BFL_API_KEY` (FLUX)

Environment variables override the file-based keys when set.

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

Named chains for common looks. Use `--preset <name>`.

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
├── feature-raw.png        # Direct AI provider output (only for --provider, not --background)
├── feature-filtered.png   # Post-filter background, no overlay (used inline)
├── feature-og.png         # 1200x630 with branded text overlay (used as socialImage)
├── feature-youtube.png    # 1280x720 with overlay
└── feature-instagram.png  # 1080x1080 with overlay
```

## Typical Workflow

### Adding a feature image to a new blog post

```
/feature-image-blog src/pages/blog/my-post/index.md
```

The skill will:
1. Read post title and description
2. Propose an abstract image prompt; confirm with you
3. Generate the image set into `public/images/blog/<slug>/`
4. Update post frontmatter (`image` + `socialImage`)
5. Update the matching entry in `src/pages/blog/index.astro`

### Iterating on style

```bash
# Try a different preset on the same background
tsx scripts/feature-image/cli.ts \
  --background public/images/blog/<slug>/feature-raw.png \
  --preset heavy-crt \
  --title "Title" \
  --subtitle "Subtitle" \
  --formats og \
  --name feature-heavy \
  --output public/images/generated
```

### Comparing providers

```
--provider both
```

Generates from both DALL-E and FLUX with `-dalle` / `-flux` filename suffixes for side-by-side comparison.

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
└── cli.ts                # CLI entry point

.claude/skills/
├── feature-image/SKILL.md         # General-purpose generation
└── feature-image-blog/SKILL.md    # Blog-post end-to-end orchestration

src/layouts/BlogLayout.astro       # Renders inline image, sets OG meta from socialImage
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

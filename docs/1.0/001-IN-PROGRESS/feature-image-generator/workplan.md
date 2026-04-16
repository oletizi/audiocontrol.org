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
- [ ] Verify both providers generate and save images (needs API keys)

### Acceptance Criteria

- [ ] `--provider dalle` generates a background image via DALL-E 3 (needs API key)
- [ ] `--provider flux` generates a background image via FLUX (needs API key)
- [ ] `--provider both` generates from both for comparison (needs API keys)
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
- [ ] Output matches the visual style of existing site OG images (needs visual review)

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

- [ ] `/feature-image src/pages/blog/some-post/index.md` generates all image variants (needs API key)
- [ ] Images land in the correct `public/images/` subdirectories (needs API key)
- [x] Provider is selectable via argument
- [x] Skill provides clear output about what was generated and where

## Phase 4: Bake-off & Polish (#35)

**Deliverable:** Documented, tested skill with tuned prompts

### Tasks

- [ ] Generate images for 2-3 existing blog posts with both providers
- [ ] Compare quality and select default provider or document trade-offs
- [ ] Tune prompt templates for best results
- [ ] Document usage, prompt tips, and examples in skill definition
- [ ] Update `.env.example` with required keys

### Acceptance Criteria

- [ ] Side-by-side comparison images exist for at least 2 blog posts
- [ ] Default provider recommendation is documented
- [ ] Skill definition includes usage examples and prompt guidance

## File Structure

```
scripts/feature-image/
├── types.ts          # Provider interface, format types
├── providers/
│   ├── dalle.ts      # DALL-E 3 implementation
│   └── flux.ts       # FLUX implementation
├── overlay.ts        # Text overlay compositing
└── cli.ts            # CLI entry point

.claude/skills/feature-image/
└── SKILL.md          # Skill definition
```

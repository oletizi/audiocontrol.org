---
name: feature-image
description: "Generate feature images for blog posts and pages using AI backgrounds and branded text overlays."
user_invocable: true
---

# Feature Image Generator

Generate feature images for a blog post or page. Reads frontmatter, builds an AI image prompt, generates background images, and composites branded text overlays in multiple formats.

## Usage

```
/feature-image <page-path> [--provider dalle|flux|both] [--prompt <custom-prompt>]
```

### Arguments

- `<page-path>` — Path to the `.md` or `.astro` page file (e.g., `src/pages/blog/my-post/index.md`)
- `--provider` — AI provider: `dalle` (default), `flux`, or `both` (for comparison)
- `--prompt` — Override the auto-generated image prompt

## Steps

1. **Read page frontmatter** from the provided page path:
   - Extract `title`, `description`, `date`, and `slug` (derive slug from directory name)
   - If the file doesn't exist or has no frontmatter, report an error

2. **Build image prompt** (unless `--prompt` is provided):
   - Use the page title and description to craft a prompt for an abstract, atmospheric background
   - The prompt should describe a visual mood/scene, NOT include text (text is added via overlay)
   - Good prompts: abstract textures, atmospheric scenes, tech-themed visuals, moody gradients
   - Include: "no text, no words, no letters, no typography" to prevent baked-in text
   - Show the generated prompt to the user and ask for confirmation before generating

3. **Generate images** by running the CLI:
   ```bash
   tsx scripts/feature-image/cli.ts \
     --prompt "<prompt>" \
     --provider <provider> \
     --title "<page title>" \
     --subtitle "<page description or date>" \
     --name "<slug>" \
     --output "public/images/blog/<slug>"
   ```

4. **Report results:**
   - List all generated files with paths
   - Show the OG image for visual review (read the PNG file)
   - Suggest frontmatter updates for the page:
     ```yaml
     featureImage: /images/blog/<slug>/<slug>-og.png
     ogImage: /images/blog/<slug>/<slug>-og.png
     ```

5. **Do NOT commit** — let the user review and commit when ready

## Environment Requirements

- `OPENAI_API_KEY` env var set (for DALL-E provider)
- `BFL_API_KEY` env var set (for FLUX provider)

## Prompt Tips

Good image prompts for blog feature images:
- Focus on mood, texture, and atmosphere rather than specific objects
- Use terms like "abstract", "atmospheric", "cinematic lighting"
- Reference color palettes that complement the site's dark teal theme
- Avoid: faces, text, logos, specific brand imagery
- Always append: "no text, no words, no letters, no typography"

## Examples

```
/feature-image src/pages/blog/roland-s-series-samplers/index.md
/feature-image src/pages/blog/my-post/index.md --provider both
/feature-image src/pages/blog/my-post/index.md --prompt "abstract dark synthesizer circuits, teal glow, cinematic, no text"
```

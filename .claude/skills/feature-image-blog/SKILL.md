---
name: feature-image-blog
description: "End-to-end feature image flow for a blog post: generate AI background, composite branded social card, apply filters, wire into post frontmatter and blog index."
user_invocable: true
---

# Feature Image (Blog Post)

Full pipeline for adding a feature image to a blog post. Generates the image set via the `feature-image` CLI, then wires the results into the post frontmatter and the blog index card.

## Usage

```
/feature-image-blog <post-path> [--preset <name>] [--prompt <override>] [--provider <name>]
```

### Arguments

- `<post-path>` — Path to the blog post markdown file (e.g., `src/pages/blog/my-post/index.md`)
- `--preset` — Filter preset (default: `retro-crt`). Options: `none`, `subtle`, `retro-crt`, `teal-amber`, `heavy-crt`
- `--prompt` — Override the auto-built AI image prompt
- `--provider` — Image provider (default: `flux`). Options: `dalle`, `flux`, `both`

## Steps

1. **Validate post path:**
   - Verify file exists at the given path
   - Verify path matches `src/pages/blog/<slug>/index.md` pattern
   - Extract `<slug>` from the directory name

2. **Read post frontmatter:**
   - Extract `title` and `description`
   - If either is missing, report an error and stop

3. **Check for existing images:**
   - If `public/images/blog/<slug>/feature-og.png` already exists, ask the user before overwriting

4. **Build AI image prompt** (unless `--prompt` is provided):
   - Use the post title and description to draft an abstract background prompt
   - Bias toward abstract / vintage-computing aesthetics that won't clash with site brand
   - ALWAYS append: "no text, no words, no letters, no typography, no labels"
   - Show the proposed prompt to the user and ask for confirmation or edits before generating

5. **Generate via CLI:**
   ```bash
   tsx scripts/feature-image/cli.ts \
     --prompt "<confirmed prompt>" \
     --provider <provider> \
     --preset <preset> \
     --title "<post title>" \
     --subtitle "<post description>" \
     --formats og,youtube,instagram \
     --name feature \
     --output public/images/blog/<slug>
   ```

   This produces:
   - `feature-filtered.png` — filtered background, no text overlay (used inline)
   - `feature-og.png` — branded 1200x630 social card
   - `feature-youtube.png` — branded 1280x720
   - `feature-instagram.png` — branded 1080x1080

6. **Update post frontmatter** (in `src/pages/blog/<slug>/index.md`):
   - Add or replace `image: "/images/blog/<slug>/feature-filtered.png"` (inline display)
   - Add or replace `socialImage: "/images/blog/<slug>/feature-og.png"` (OG/sharing card)
   - Use the Edit tool. Preserve all other frontmatter fields and ordering.

7. **Update blog index** (`src/pages/blog/index.astro`):
   - Find the entry whose `slug` matches `<slug>`
   - Add or replace its `image:` field to `"/images/blog/<slug>/feature-filtered.png"`
   - If no matching entry exists, report it — do NOT add a new entry (the user maintains that list manually)

8. **Report results:**
   - List the files created with paths
   - Note the frontmatter and blog index changes
   - Show the OG image for visual review (read the PNG file)
   - Suggest the user start the dev server to preview, and commit when satisfied

9. **Do NOT commit** — let the user review the visuals and decide

## Frontmatter Convention

This skill assumes the project's BlogLayout convention:

- `image` → inline feature image displayed at the top of the post (no text overlay needed since the title is on the page)
- `socialImage` → OG/sharing card with branded text overlay (used when shared on Twitter, LinkedIn, etc.)
- `image` is also used in `src/pages/blog/index.astro` as the card thumbnail

## Environment

Requires API keys (auto-loaded from `~/.config/audiocontrol/`):
- `OPENAI_API_KEY` for `--provider dalle`
- `BFL_API_KEY` for `--provider flux`

## Examples

```
/feature-image-blog src/pages/blog/my-new-post/index.md
/feature-image-blog src/pages/blog/my-new-post/index.md --preset heavy-crt
/feature-image-blog src/pages/blog/my-new-post/index.md --provider dalle --preset subtle
/feature-image-blog src/pages/blog/my-new-post/index.md --prompt "abstract dark synthesizer circuits, teal glow, no text"
```

## Related Skills

- `/feature-image` — general-purpose image generation for any page (not blog-specific)

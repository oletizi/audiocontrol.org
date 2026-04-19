---
name: feature-image-blog
description: "Start a feature image workflow for a blog post: derive context from the post, enqueue a workflow item, and hand off to the dev-only gallery for iteration."
user_invocable: true
---

# Feature Image (Blog Post) — Workflow Start

This skill is the **entry point** for the async feature-image pipeline:

```
agent enqueues (this skill)  →  user iterates in gallery  →  user decides
  →  agent applies (/feature-image-apply)
```

This skill does NOT generate images directly. It records intent and context so the user can iterate freely in the gallery, then approve a specific generation for the agent to wire into the post.

## Usage

```
/feature-image-blog <post-path-or-url>
```

### Arguments

- `<post-path-or-url>` — Path to the blog post markdown file (e.g., `src/sites/audiocontrol/pages/blog/my-post/index.md`) OR a URL (e.g., `https://audiocontrol.org/blog/my-post/` or `http://localhost:4321/blog/my-post/`). URLs resolve via the host to the correct site's `src/sites/<site>/pages/blog/<slug>/index.md`.

## Multi-site awareness

The repo hosts two sites. Each lives at `src/sites/<site>/` with its own brand, typography, palette, layouts, and `public/` tree:

| site | host | source root | public dir |
|------|------|-------------|------------|
| `audiocontrol` | `audiocontrol.org` | `src/sites/audiocontrol/pages/` | `src/sites/audiocontrol/public/` |
| `editorialcontrol` | `editorialcontrol.org` | `src/sites/editorialcontrol/pages/` | `src/sites/editorialcontrol/public/` |

The skill infers `site` from the post's path (the first segment after `src/sites/`) and from URL hosts. It threads `site` through the workflow context so the gallery renders with the right brand and `/feature-image-apply` writes to the right public tree.

## Steps

1. **Resolve the post path + site:**
   - If the input is a path, read the `src/sites/<site>/...` prefix to derive `site`
   - If the input is a URL, use the host to pick the site:
     - `audiocontrol.org` / `localhost:4321` / `orion-m4:4321` → `audiocontrol`
     - `editorialcontrol.org` / `localhost:4322` / site-specific ports → `editorialcontrol`
     - If the host is ambiguous (e.g., `localhost` without a port that maps), fall back to `audiocontrol` and note the inference in the output
   - Extract the slug from the URL's `/blog/<slug>/` segment
   - Build the path: `src/sites/<site>/pages/blog/<slug>/index.md`
   - Verify the file exists; error out with a clear message if not

2. **Read post frontmatter:**
   - Extract `title`, `description`, `date`
   - If `title` is missing, error out

3. **Read the post's tags** from `src/sites/<site>/pages/blog/index.astro`:
   - Find the entry whose `slug:` matches and grab its `tags: [...]` array
   - These drive template matching in the next step

4. **Suggest matching prompt templates from the library:**
   - Prefer HTTP if the dev server is up: `GET http://localhost:4322/api/dev/feature-image/templates?tag=<tag>` for each post tag (and merge results, deduping by slug)
   - Otherwise read `docs/feature-image-prompts.yaml` directly and filter by tag overlap
   - Filter candidates to templates matching the inferred site (or with no site set — they're site-agnostic)
   - Sort by fitness (highest first; templates with no usage float to top so they accumulate ratings)
   - Pick the top 3 (or fewer)

5. **Compose the suggested prompt:**
   - If a strong template match exists (good tag overlap, decent fitness), use its `prompt` and `preset`/`provider` as the suggestion baseline; record its `slug` so the gallery records `templateSlug` on generations
   - Otherwise draft a fresh abstract prompt tuned to the site's brand. For `audiocontrol` bias toward service-manual / flight-instrumentation / phosphor-amber. For `editorialcontrol` bias toward publication-dark / chartreuse-pencil / ink-on-cream marginalia.
   - ALWAYS append: `"no text, no words, no letters, no typography, no labels"`

6. **Optionally check recent related work** in `.feature-image-history.jsonl` for similar topics (filtered to the same site) the user already approved/rated (informs the prompt or template choice)

7. **Enqueue a workflow item** via `POST /api/dev/feature-image/workflow`:
   ```json
   {
     "action": "create",
     "type": "feature-image-blog",
     "createdBy": "agent",
     "context": {
       "postPath": "src/sites/<site>/pages/blog/<slug>/index.md",
       "slug": "<slug>",
       "site": "<audiocontrol|editorialcontrol>",
       "title": "<post title>",
       "description": "<post description>",
       "suggestedPrompt": "<drafted prompt>",
       "suggestedPreset": "retro-crt",
       "suggestedTemplateSlug": "<template-slug-or-omitted>",
       "candidateTemplates": ["slug-1", "slug-2", "slug-3"],
       "notes": "<context including which templates were considered and which site>"
     }
   }
   ```
   The endpoint returns the created workflow item with its `id`.

8. **Report to the user:**
   - Echo the workflow `id`, the inferred site, the candidate templates considered, the suggested prompt, and which template (if any) was the baseline
   - Tell the user to open the gallery (check `npm run dev` output for the current port — usually `http://localhost:4321/dev/feature-image-preview` for audiocontrol; the gallery itself is shared between sites and lives under audiocontrol's dev routes)
   - Note that the Generate drawer's Site selector will auto-pre-select the inferred site when the workflow is activated

9. **Do NOT apply changes** — the agent waits. When the user finishes iterating and submits a decision via the gallery, they invoke `/feature-image-apply` to have the agent process the decision.

## Environment

- API keys auto-loaded from `~/.config/audiocontrol/` by the pipeline when the user triggers a generation in the gallery (agent doesn't need them for this skill)
- Requires `npm run dev` (the shared `dev` script that runs audiocontrol's dev server) to be running for the gallery endpoint to be reachable

## URL / Path Resolution Examples

| Input | Site | Resolves to |
|-------|------|-------------|
| `src/sites/audiocontrol/pages/blog/my-post/index.md` | `audiocontrol` | (already a path) |
| `src/sites/editorialcontrol/pages/blog/my-post/index.md` | `editorialcontrol` | (already a path) |
| `https://audiocontrol.org/blog/my-post/` | `audiocontrol` | `src/sites/audiocontrol/pages/blog/my-post/index.md` |
| `https://editorialcontrol.org/blog/my-post/` | `editorialcontrol` | `src/sites/editorialcontrol/pages/blog/my-post/index.md` |
| `http://localhost:4321/blog/my-post/` | `audiocontrol` (the gallery's home site) | `src/sites/audiocontrol/pages/blog/my-post/index.md` |
| `/blog/my-post/` (no host) | `audiocontrol` (fallback; note inference in output) | `src/sites/audiocontrol/pages/blog/my-post/index.md` |

## Related Skills

- `/feature-image-apply` — process decided workflow items (run after the user submits a decision in the gallery). It uses `site` from the workflow context to write into `src/sites/<site>/public/images/blog/<slug>/`.
- `/feature-image-iterate` — drain gallery iterate requests with a generation response
- `/feature-image-help` — report pipeline state

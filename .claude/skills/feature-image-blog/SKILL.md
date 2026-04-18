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

- `<post-path-or-url>` — Path to the blog post markdown file (e.g., `src/pages/blog/my-post/index.md`) OR a URL (e.g., `https://audiocontrol.org/blog/my-post/` or `http://localhost:4321/blog/my-post/`). URLs are resolved to the corresponding `src/pages/blog/<slug>/index.md`.

## Steps

1. **Resolve the post path:**
   - If the input is a URL, extract the slug from `/blog/<slug>/` and build `src/pages/blog/<slug>/index.md`
   - Verify the file exists; error out with a clear message if not

2. **Read post frontmatter:**
   - Extract `title`, `description`, `date`
   - If `title` is missing, error out

3. **Read the post's tags** from `src/pages/blog/index.astro`:
   - Find the entry whose `slug:` matches and grab its `tags: [...]` array
   - These drive template matching in the next step

4. **Suggest matching prompt templates from the library:**
   - Prefer HTTP if the dev server is up: `GET http://localhost:4321/api/dev/feature-image/templates?tag=<tag>` for each post tag (and merge results, deduping by slug)
   - Otherwise read `docs/feature-image-prompts.yaml` directly and filter by tag overlap
   - Sort by fitness (highest first; templates with no usage float to top so they accumulate ratings)
   - Pick the top 3 (or fewer)

5. **Compose the suggested prompt:**
   - If a strong template match exists (good tag overlap, decent fitness), use its `prompt` and `preset`/`provider` as the suggestion baseline; record its `slug` so the gallery records `templateSlug` on generations
   - Otherwise draft a fresh abstract / vintage-computing prompt biased toward geometric, textural, or pixel-art aesthetics
   - ALWAYS append: `"no text, no words, no letters, no typography, no labels"`

6. **Optionally check recent related work** in `.feature-image-history.jsonl` for similar topics the user already approved/rated (informs the prompt or template choice)

7. **Enqueue a workflow item** via `POST /api/dev/feature-image/workflow`:
   ```json
   {
     "action": "create",
     "type": "feature-image-blog",
     "createdBy": "agent",
     "context": {
       "postPath": "src/pages/blog/<slug>/index.md",
       "slug": "<slug>",
       "title": "<post title>",
       "description": "<post description>",
       "suggestedPrompt": "<drafted prompt>",
       "suggestedPreset": "retro-crt",
       "suggestedTemplateSlug": "<template-slug-or-omitted>",
       "candidateTemplates": ["slug-1", "slug-2", "slug-3"],
       "notes": "<context including which templates were considered>"
     }
   }
   ```
   The endpoint returns the created workflow item with its `id`.

8. **Report to the user:**
   - Echo the workflow `id`, the candidate templates considered, the suggested prompt, and which template (if any) was the baseline
   - Tell the user to open `http://localhost:4321/dev/feature-image-preview` (or the current dev port — check `npm run dev` output)
   - Note that the item will appear in the gallery's "Pending workflow" section

9. **Do NOT apply changes** — the agent waits. When the user finishes iterating and submits a decision via the gallery, they invoke `/feature-image-apply` to have the agent process the decision.

## Environment

- API keys auto-loaded from `~/.config/audiocontrol/` by the pipeline when the user triggers a generation in the gallery (agent doesn't need them for this skill)
- Requires `npm run dev` to be running for the gallery endpoint to be reachable

## URL Resolution Examples

| Input | Resolves to |
|-------|-------------|
| `src/pages/blog/my-post/index.md` | (already a path) |
| `https://audiocontrol.org/blog/my-post/` | `src/pages/blog/my-post/index.md` |
| `http://localhost:4321/blog/my-post/` | `src/pages/blog/my-post/index.md` |
| `/blog/my-post/` | `src/pages/blog/my-post/index.md` |

## Related Skills

- `/feature-image-apply` — process decided workflow items (run after the user submits a decision in the gallery)
- `/feature-image` — older inline generation skill for non-blog pages (not part of the pipeline)

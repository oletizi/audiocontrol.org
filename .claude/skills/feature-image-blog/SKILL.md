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
/feature-image-blog <post-path-or-slug-or-url>
```

### Arguments

- `<post-path-or-slug-or-url>` — one of:
  - a repo-relative path, e.g. `src/sites/audiocontrol/pages/blog/my-post/index.md`
  - a bare slug, e.g. `my-post` (auto-discovers across both sites; ambiguous slugs error out and ask for the full path)
  - a URL, e.g. `https://audiocontrol.org/blog/my-post/` or `http://localhost:4321/blog/my-post/`

The dev server (default `http://localhost:4321`) must be running for the helper scripts to reach the workflow + template API.

## Helper scripts

Two scripts live next to this SKILL.md. Both accept `--base=<url>` to override the default dev-server port.

- `scan.ts <post-path-or-slug>` — read-only: resolves path+site+slug, parses frontmatter, queries the template library for tag matches, ranks candidates, and prints a JSON recommendation bundle (path, site, tags, `candidateTemplates`, `recommendedTemplateSlug`, `recommendedPrompt`, `recommendedPreset`).
- `enqueue.ts --post=<path> --prompt=<prompt> --preset=<preset> [--provider=<provider>] [--template=<slug>] [--candidates=slug1,slug2,...] [--notes=<text>]` — POSTs a `feature-image-blog` workflow item and prints the created id + gallery URL.

## Multi-site awareness

The repo hosts two sites. Each lives at `src/sites/<site>/` with its own brand, typography, palette, layouts, and `public/` tree:

| site | host | source root | public dir |
|------|------|-------------|------------|
| `audiocontrol` | `audiocontrol.org` | `src/sites/audiocontrol/pages/` | `src/sites/audiocontrol/public/` |
| `editorialcontrol` | `editorialcontrol.org` | `src/sites/editorialcontrol/pages/` | `src/sites/editorialcontrol/public/` |

The skill infers `site` from the post's path (the first segment after `src/sites/`) and from URL hosts. It threads `site` through the workflow context so the gallery renders with the right brand and `/feature-image-apply` writes to the right public tree.

## Steps

### 1. Normalise URLs (if needed) before invoking `scan.ts`

`scan.ts` accepts a path or a bare slug. If the user gave a URL instead, map the host to a site before handing off:

| Host | Site |
|------|------|
| `audiocontrol.org`, `localhost:4321`, `orion-m4:4321` | `audiocontrol` |
| `editorialcontrol.org`, `localhost:4322` | `editorialcontrol` |
| ambiguous / unknown `localhost` | fallback to `audiocontrol`; note the inference in your final report |

Pull the slug from the `/blog/<slug>/` segment. Use the bare slug — `scan.ts` will auto-discover which site it lives under.

### 2. Scan for a recommended template

```bash
tsx .claude/skills/feature-image-blog/scan.ts <post-path-or-slug>
```

Output is JSON with `postPath`, `site`, `slug`, `title`, `description`, `tags`, `candidateTemplates` (ranked, top 5), `recommendedTemplateSlug`, `recommendedPrompt`, and `recommendedPreset` / `recommendedProvider`.

Ranking: templates with the most matched tags first, then by fitness (highest), then by use count (lowest — so unused templates surface to accumulate data). Templates are filtered to ones matching the post's site (plus site-agnostic ones).

If `recommendedTemplateSlug` is set, the prompt is ready to use as-is — it already has the no-text guard appended. If it's `null`, no template had any tag match; draft a fresh abstract prompt tuned to the site's brand:
- `audiocontrol` → service-manual / flight-instrumentation / phosphor-amber
- `editorialcontrol` → publication-dark / chartreuse-pencil / ink-on-cream marginalia

Always append the no-text guard: `no text, no words, no letters, no typography, no labels`.

### 3. Optionally consult history

Read `.feature-image-history.jsonl` for recent approved / highly-rated entries on similar topics for the same site — the gallery already feeds this back into template fitness, but it can inform prompt adjustments or pre-empt a template that's underperformed.

### 4. Enqueue the workflow

Prompts are multi-line and inline quoting is brittle — write the prompt to a file and pass `--prompt-file=<path>`:

```bash
# example: run scan, extract prompt into a tmpfile, then enqueue
tsx .claude/skills/feature-image-blog/scan.ts <slug> > /tmp/fi-scan.json
jq -r '.recommendedPrompt' /tmp/fi-scan.json > /tmp/fi-prompt.txt

tsx .claude/skills/feature-image-blog/enqueue.ts \
  --post=<postPath> \
  --prompt-file=/tmp/fi-prompt.txt \
  --preset=<recommendedPreset> \
  [--provider=<recommendedProvider>] \
  [--template=<recommendedTemplateSlug>] \
  [--candidates=slug1,slug2,slug3] \
  [--notes-file=/tmp/fi-notes.txt | --notes="<short context>"]
```

`--prompt=<string>` and `--notes=<string>` still work for short inline values, but `--prompt-file` is the safe default for a scan-derived prompt. `enqueue.ts` re-reads the post to pull authoritative `title` + `description`, derives `site` + `slug` from the path, and POSTs the workflow item. On success it prints a JSON block with `workflowId`, `galleryUrl`, and the echoed context.

### 5. Report to the user

- Echo the workflow `id`, inferred site, recommended template (if any), and the candidates considered
- Point them at the gallery URL printed by `enqueue.ts`
- Note that the Generate drawer's Site selector will auto-pre-select the inferred site when the workflow is activated

### 6. Do NOT apply changes

The agent waits. When the user submits a decision or approves an entry in the gallery, `/feature-image-apply` picks it up.

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

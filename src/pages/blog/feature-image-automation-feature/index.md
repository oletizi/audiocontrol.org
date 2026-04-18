---
layout: ../../../layouts/BlogLayout.astro
title: "Feature Images on Autopilot"
description: "An AI-generation pipeline for blog feature images with a lightweight dashboard, a JSONL work queue, and Claude Code as the backend. Plus a preview of evolving prompts by artificial selection."
date: "April 2026"
datePublished: "2026-04-17"
dateModified: "2026-04-17"
author: "Orion Letizi"
---

# Feature Images on Autopilot

Every blog post needs a feature image. The hand-crafted version: pick a photo, add a title overlay in Figma, export three formats, multiply by every post you ship — and watch the brand drift because nobody remembers which lavender accent went on which post.

AI can handle the background generation now. That's table stakes. The harder problem is the pipeline around it: iterating on prompts until the image is actually on-brand, keeping a human in the loop without making them open three apps, and not inventing a new workflow system just to manage the queue.

This post walks through how we solved that for audiocontrol.org: AI generation, a filter chain, branded overlays, and multi-format output — wired together through a dashboard that has no database, no framework, and uses Claude Code as the backend.

## The pipeline

Generating one feature image runs through four stages:

1. **AI background** — DALL-E 3 or FLUX, behind a common provider interface so they can be swapped or compared at the same prompt.
2. **Post-processing filters** — scanlines, vignette, grain, grade, phosphor bloom; composable, with named presets like `retro-crt` or `teal-amber` that encode a specific visual identity.
3. **Branded text overlay** — title and subtitle rendered with Satori, using our brand font and color system, positioned with controllable margins and alignment.
4. **Multi-format export** — OG (1200×630), YouTube (1280×720), Instagram (1080×1080), all in a single run.

That part is mechanical. The interesting part is what wraps around it.

## AI output is noisy — you need a cheap human gate

Generation is high-variance. The average output of any image model on any prompt is mediocre. The distribution has a long tail of excellent results and a long tail of nonsense, and you don't know which you got until you see it.

So you iterate. Tweak the prompt. Swap the preset. Try a different provider. Regenerate. Reject three, keep one. Apply it to the post.

Doing that from a CLI is painful — you're context-switching between terminal output, a file viewer, and the dev server. Doing it in a proper SaaS dashboard is overkill — you've signed up to maintain a web app that does one thing.

We took a middle path.

## The lightweight dashboard

The entire interface is an Astro page served only by the dev server: `/dev/feature-image-preview`. In production it 404s. Three regions:

- **Pending workflows panel** — open items the agent has enqueued, plus decided items waiting to be applied. Auto-polls every five seconds.
- **Generate form** — prompt, provider, preset, filter selections, title, subtitle. Submitting runs the pipeline and appends to the history.
- **Image grid** — every generation, with approval/rejection, a notes field, and (when a workflow is active) a "Submit for workflow X" button per generation.

No database. No framework. Just Astro, two server endpoints that 404 in prod, and two JSONL files in the repo.

## The queue is a file

Two JSONL files back the whole thing, both gitignored:

- `.feature-image-history.jsonl` — every generation ever run. One line per record. The raw audit log.
- `.feature-image-pipeline.jsonl` — workflow items with state transitions. One record per pipeline run; appended on every state change.

Every workflow item is in one of four states:

```
open → decided → applied | cancelled
```

That's the entire contract. `open` means the agent has enqueued a post and the user is expected to iterate and pick one. `decided` means the user has marked an approved generation for this workflow. `applied` means `/feature-image-apply` has copied the image, updated the post frontmatter, and wired the blog index card.

Why a file instead of a database:

- **Zero infrastructure.** No server to run, no connection string, no ORM.
- **Inspectable with shell tools.** `tail -f`, `grep`, `jq`.
- **The schema is a TypeScript type.** If we need to change it, we edit the type and add handling for legacy records. No migrations.
- **Rewriting history is `git`, or at worst `sed`.**

## Claude Code is the backend

The dashboard has no application logic. It's a thin client over the JSONL files. All the behavior lives in a family of Claude Code skills:

- **`/feature-image-blog <post>`** — reads the post, builds an initial prompt from its title and description, appends an `open` workflow item. No generation yet.
- **`/feature-image-apply`** — reads all `decided` workflow items, copies approved images into `public/images/blog/<slug>/`, updates frontmatter (`image` + `socialImage`), updates the blog index card, transitions the workflow to `applied`.
- **`/feature-image-help`** — reports the current pipeline state. Open workflows, decided-awaiting-apply, recent generations.

Skills are Markdown files with library calls. When the workflow shape changes, we change the skill, not the plumbing. Nothing else needs updating.

The trade-off: the user has to open their Claude Code session to make anything happen. That's fine for a dev-facing tool. It would be the wrong trade for a customer-facing product.

## The pattern generalizes

Any workflow where:

- Humans need to approve or refine AI output before it ships,
- Iteration is high-bandwidth (you'll try many variants before keeping one),
- The decision surface is too rich for a CLI yes/no prompt,

benefits from the same shape: queue as a file, dashboard as dev-only Astro routes, Claude Code as the backend, the workflow captured as a family of skills. This is a reusable template for a lot of AI-assisted content and engineering workflows where the human gate matters.

A follow-up post goes wide on the pattern itself — what belongs in the queue, when to reach for a polling dashboard versus a one-shot CLI, how to keep the schema honest across skill revisions.

## What's next: prompts that evolve

Every generation today starts from a hand-typed prompt or one the agent proposes from scratch. On-brand prompts decay as session memory fades. The result, over time, is brand drift — every post's feature image is individually plausible but the set doesn't hold together.

The next phase tackles this, and it does so not by engineering a better prompt but by letting good prompts emerge from a population.

A prompt library in the repo. Each template carries its own aggregate fitness — a rolling average of 1-5 ratings on the generations that used it. Every generation in the gallery can be rated. Every rating updates the template's fitness. Templates can be forked; the lineage is visible in the library UI. The gallery weights suggestions by `fitness × recency`, so older, lower-performing templates get out of the way while staying forkable for future experiments.

Brand consistency becomes a by-product. The mechanism is artificial selection.

There's a broader point here, and it will get its own post: for high-variance search spaces — prompts, filter combinations, parameter tunings, maybe even skill docs — a population of candidates under selection pressure beats brute-force search or one-shot engineering. You don't have to be smart enough to write the right prompt. You have to be consistent enough to rate what comes out and occasionally fork what works.

## Try it

The source lives on the `feature/feature-image-generator` branch until the prompt-library phase ships. The workflow is documented in `FEATURE-IMAGES.md`. The skills are under `.claude/skills/feature-image-*/`. The pipeline library is `scripts/feature-image/`.

---
layout: ../../../layouts/BlogLayout.astro
title: "Automating Around a Design Skills Gap"
description: "The older feature images on my audiocontrol.org blog are rough. I'm not a designer and I'm not trying to become one. Closing the skills gap with automation, dropping the friction of shipping posts, and growing a design system by artificial selection."
date: "April 2026"
datePublished: "2026-04-18"
dateModified: "2026-04-18"
author: "Orion Letizi"
---

# Automating Around a Design Skills Gap

Scroll through the older posts on my audiocontrol.org blog and the feature images give away the truth: I made them by hand, I'm not a designer, and it shows. Some are passable. Most are rough. The set doesn't cohere. The brand drifted in whichever direction the current panic pointed me. This publication, editorialcontrol.org, is where I'm writing about the fix — audiocontrol is where the fix has to run.

This isn't a post about how we solved that. It's a post about how we're trying to automate our way out of it — using AI generation, a lightweight iteration workflow, and, most importantly, an evolving design system cultivated by artificial selection.

The visible results will lag. The older images are still there. Some of the newer ones are better. The point of what follows is the *approach*: AI as the generator, a cheap iteration surface so a non-designer can actually pick good ones, and selection pressure as the slow work of converging on a visual language I couldn't have written down upfront.

## The skills gap is real, and I'm not going to close it by studying

I've tried to get better at visual design. It never sticks. Not enough reps, not enough taste built up, not enough interest in the parts that aren't technical. Every one-off hand-made feature image is an exercise in ad-hoc choices: which color, which crop, which font size, which background. Consistency across fifteen posts isn't something I'm going to achieve with an artisanal approach, because I don't have the internal standard to apply consistently.

Automation isn't a substitute for design skill. It's a way to bake in consistency where I can't provide it manually, and a way to raise the floor when I can't move the ceiling. That's the honest frame.

## The other half of the problem: friction

The skills gap alone wouldn't have driven this. I would have kept making mediocre images and moved on. What pushed automation up the priority list was the compounding effect of friction.

Every manual feature image is an interruption. Open the post. Open a background generator. Pick a crop. Open Figma (or whatever tool is handy that day). Position the title text. Pick a color. Export OG, YouTube, Instagram. Wire them into the frontmatter. Update the blog index card.

Fifteen minutes if everything goes well. Forty-five when it doesn't — when the background doesn't quite work, when the title won't fit at a legible size, when I forget which tool I'm using for what.

Multiply by every post and you get the soft backlog that kills a publishing cadence. Posts sit in drafting because the feature image is still to-do. Momentum dies. The queue of ideas outpaces the queue of shipped work, and eventually you stop adding to either.

Automation doesn't just improve the quality floor — it changes the economics. A fixed-cost step becomes nearly free, and the threshold for "worth shipping" drops with it. Small ideas become postable, because the feature-image overhead isn't the rate-limiting step anymore. Honestly, that matters more than the skills-gap framing: the skills-gap framing is about quality; the friction framing is about whether the post ships at all.

And automation compounds. Once one step on the pre-publish checklist is automated, the next one looks tractable. Cross-link audit. OG images for non-blog pages. Canonical URL checks. Each one that turns into a one-shot skill takes a whole category of toil off the table.

## The pipeline (the generator)

The pipeline itself is mechanical and roughly feature-complete:

1. **AI background** — DALL-E 3 or FLUX, behind a common provider interface so they can be swapped or compared at the same prompt.
2. **Post-processing filters** — scanlines, vignette, grain, grade, phosphor bloom; composable, with named presets like `retro-crt` or `teal-amber` that encode a visual identity.
3. **Branded text overlay** — title and subtitle rendered with Satori using our brand font, positioned with controllable margins and alignment.
4. **Multi-format export** — OG (1200×630), YouTube (1280×720), Instagram (1080×1080), all in a single run.

That part does its job. But the generator is only the easy half of the problem.

## AI output is noisy — a human gate is non-negotiable

Generation is high-variance. The average output of any image model on any prompt is mediocre. The distribution has a long tail of excellent results and a long tail of nonsense, and you don't know which you got until you see it. Someone has to look at the output and decide.

For a non-designer, "decide" mostly means pattern-matching against whatever reference examples are nearby. Which means the iteration surface has to be cheap enough to actually use — otherwise I'll keep the first acceptable result instead of the best available one, and the brand drift problem I'm trying to fix will just move from manual to automated.

## The lightweight iteration surface

Iterating from a CLI is painful — context-switching between terminal output, a file viewer, and the dev server. Iterating through a proper SaaS dashboard is overkill — now I'm maintaining a web app that does one thing.

We took a middle path: a dev-only Astro page at `/dev/feature-image-preview`. In production it 404s. Three regions on the page:

- **Pending workflows panel** — open items the agent has enqueued, plus decided items waiting to be applied. Auto-polls every five seconds.
- **Generate form** — prompt, provider, preset, filter selections, title, subtitle. Submitting runs the pipeline and appends to the history.
- **Image grid** — every generation, with approval/rejection, a notes field, and (when a workflow is active) a "Submit for workflow X" button per generation.

No database. No framework. Just Astro, two server endpoints that 404 in prod, and two JSONL files in the repo.

## The queue is a file

Two JSONL files back the whole thing, checked into the repo:

- `.feature-image-history.jsonl` — every generation ever run. One line per record. The raw audit log.
- `.feature-image-pipeline.jsonl` — workflow items with state transitions. One record per pipeline run; appended on every state change.

These are versioned on purpose. They hold the history that Phase 11's prompt-library fitness scores will be computed from — lose them and you lose the ability for the design system to evolve from prior decisions.

Every workflow item is in one of four states:

```
open → decided → applied | cancelled
```

That's the entire contract. `open` means the agent has enqueued a post and I'm expected to iterate and pick one. `decided` means I've marked an approved generation for this workflow. `applied` means `/feature-image-apply` has copied the image, updated the post frontmatter, and wired the blog index card.

Why a file instead of a database:

- **Zero infrastructure.** No server, no connection string, no ORM.
- **Inspectable with shell tools.** `tail -f`, `grep`, `jq`.
- **The schema is a TypeScript type.** If we need to change it, we edit the type and handle legacy records. No migrations.
- **Rewriting history is `git`, or at worst `sed`.**

## Claude Code is the backend

The dashboard has no application logic. It's a thin client over the JSONL files. All behavior lives in a family of Claude Code skills:

- **`/feature-image-blog <post-path-or-url>`** — the async entry point. Reads the post's frontmatter, drafts a starting prompt from the title and description, appends an `open` `WorkflowItem` to `.feature-image-pipeline.jsonl`, and hands off to the gallery. No generation happens here; the user iterates in the browser.
- **`/feature-image-apply`** — the async exit point. Reads all `decided` workflow items, copies approved images into `public/images/blog/<slug>/`, updates frontmatter (`image` + `socialImage`), updates the blog index card, transitions the workflow to `applied` or `cancelled` with any errors recorded on the item.
- **`/feature-image-help`** — reports current pipeline state: open workflows, decided workflows awaiting apply, recent generations from the history log, and a short hint on what action to take next.

Skills are Markdown files with library calls. When the workflow shape changes, we change the skill, not the plumbing.

The trade-off: I have to open a Claude Code session to make anything happen. That's fine for a dev-facing tool. It would be the wrong trade for a customer-facing product.

## The part that's actually hard: a design system nobody wrote down

Here's where I have to be honest about the limits of what's shipped. The generator works. The iteration surface works. But neither of those gets you consistency across posts, and consistency is the thing I can't provide manually.

Today, every generation starts from either a hand-typed prompt or one the agent proposes from scratch. On-brand prompts decay as session memory fades. The images get better individually — I have a cheap way to pick the best of a few candidates now — but the set still drifts, because I'm still making the design decisions one post at a time.

The next phase attacks this through the same basic insight that keeps showing up: when the human can't engineer the right answer, set up the conditions for the right answer to emerge from selection.

A prompt library lives in the repo. Each template carries its own aggregate fitness — a rolling average of 1-5 ratings on the generations that used it. Every generation in the gallery can be rated. Every rating updates the template's fitness. Templates can be forked; the lineage is visible in the library UI. The gallery weights suggestions by `fitness × recency`, so older, lower-performing templates get out of the way while staying forkable.

The library *is* the design system. Not a static Figma file. An evolving population of prompt templates under selection pressure, where the fitness function is me rating what comes out of the pipeline, and the selection happens implicitly every time the gallery picks what to suggest for the next post.

I don't have to be smart enough to write the right prompt. I have to be consistent enough to rate what comes out and occasionally fork what works. Over enough generations, the library converges on the visual language I wasn't going to articulate on my own.

## Why this matters beyond feature images

The pattern here generalizes in two directions, each worth its own follow-up:

**The workflow shape.** Queue as a file, dashboard as dev-only Astro routes, Claude Code as the backend, the workflow captured as a family of skills. Any AI-assisted workflow that needs a human gate on output could use the same shape. The decision surface for feature images is richer than a CLI yes/no but thinner than a SaaS dashboard, and a lot of AI-assisted content and engineering tasks fit that same shape.

**The evolution-over-engineering principle.** For high-variance search spaces — prompts, filter combinations, parameter tunings, maybe even skill docs — a population of candidates under selection pressure beats brute-force search or one-shot engineering. You don't have to be the expert. You have to be the fitness function.

Both of those deserve dedicated posts. This one is just the anchor: the current state of the pipeline, the honest reason it exists (a skills gap I'm not planning to close the hard way), and the direction things are headed.

## Show our work

Here's what the core pieces actually look like.

The `WorkflowItem` type *is* the state machine:

```typescript
export type WorkflowState =
  | 'open'       // agent has enqueued; user is iterating
  | 'decided'    // user has picked an approved generation
  | 'applied'    // agent has wired it into the post
  | 'cancelled';

export interface WorkflowItem {
  id: string;
  type: 'feature-image-blog';
  createdAt: string;
  createdBy: 'agent' | 'user';
  state: WorkflowState;
  context: {
    postPath?: string;
    slug?: string;
    title?: string;
    description?: string;
    suggestedPrompt?: string;
    suggestedPreset?: string;
    notes?: string;
  };
  decision?: {
    decidedAt: string;
    logEntryId: string;       // ref into .feature-image-history.jsonl
    userNotes?: string;
  };
  application?: {
    appliedAt: string;
    changedFiles: string[];
    error?: string;
  };
}
```

Each line of `.feature-image-pipeline.jsonl` is one of these objects, appended on every state transition. The `state` field moves through the lifecycle; the `context`, `decision`, and `application` fields carry whatever metadata that transition needs.

Here's the top of `/feature-image-blog`'s `SKILL.md` — the entire skill is a Markdown file like this, and the agent follows it:

```markdown
---
name: feature-image-blog
description: "Start a feature image workflow for a blog post:
  derive context from the post, enqueue a workflow item, and
  hand off to the dev-only gallery for iteration."
user_invocable: true
---

# Feature Image (Blog Post) — Workflow Start

This skill is the entry point for the async feature-image pipeline:

    agent enqueues (this skill) → user iterates in gallery
      → user decides → agent applies (/feature-image-apply)

This skill does NOT generate images directly. It records intent
and context so the user can iterate freely in the gallery, then
approve a specific generation for the agent to wire into the post.

## Steps

1. Resolve the post path (either a file or a URL)
2. Read post frontmatter (title, description)
3. Propose an AI image prompt biased toward the site's visual style
4. Append an `open` WorkflowItem to .feature-image-pipeline.jsonl
5. Report the new workflow id and hand off to the gallery
```

That's it. No framework, no workflow engine — a Markdown file instructing the agent how to compose a few library calls. When the shape changes, I edit the Markdown.

Fuller snippets — the pipeline module, the Astro API routes, the whole SKILL.md family — are available as gists on request.

## Where it stands

The older feature images on audiocontrol.org are still the old, hand-made ones. New posts are going through the pipeline. Somewhere between the two is where the system has to prove it works — not by making me a designer, but by making "not a designer" good enough.

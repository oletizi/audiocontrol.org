---
layout: ../../../layouts/BlogLayout.astro
title: "AI Doesn't Remember"
description: "Brand consistency is an in-process problem. On the in-process infrastructure that keeps AI-assisted content from drifting off-brand across a hundred independent sessions."
date: "April 2026"
datePublished: "2026-04-18"
dateModified: "2026-04-20"
author: "Orion Letizi"
tags: ["AI", "Automation", "Design", "Workflow"]
image: "/images/blog/ai-doesnt-remember/feature-filtered.png"
socialImage: "/images/blog/ai-doesnt-remember/feature-og.png"
---

# Your Brand Survives the First Generation. Does It Survive the Hundredth?

The site you're reading was designed by Claude Code. The feature images on it weren't — not because an image model can't make them, but because generation alone doesn't hold a brand together across a hundred posts. (Claude Code doesn't generate images natively; the pipeline here calls DALL-E 3 or FLUX from inside a Claude Code skill.)

Ask an image model for a feature image and you'll get something usable. Ask it twenty times across twenty posts and the set starts to drift. By the hundredth image, every one is individually plausible, and the set doesn't hang together — there's no visual identity left to drift from.

Two pieces of infrastructure are missing from the usual workflow. A human gate cheap enough to actually use, so the best generation gets picked instead of the first acceptable one. And a design system that gets sharper every time you use it, so the set converges toward a visual language instead of drifting away from one.

This post is about both, and about the generator that feeds them.

## Why the generator isn't the bottleneck

It's tempting to think the problem with AI feature images is the model. Get a better model, get better images. But the generator is the easy half because it only solves half of the problem.

Two distinct problems live inside feature-image production. **Per-generation quality** — is this specific image good enough to ship? And **cross-generation consistency** — does the set of images from this publication cohere into a recognizable visual identity over hundreds of posts? A steered-well generator handles the first. It can produce on-brand output when the prompt tells it what on-brand means. What a generator alone can't do is carry that "on-brand" context across a hundred independent sessions. Each new session starts from whatever instinct the current prompt captures, which decays as context fades, which is why the set drifts.

The quality problem and the consistency problem are different problems. The gate fixes the first. The library fixes the second.

## Friction is the other half of the story

Drift alone wouldn't have driven this. I'd have kept making mediocre images and moved on. What pushed this up the priority list was friction.

Every manual feature image is an interruption. Open the post. Open a background generator. Pick a crop. Open Figma. Position the title. Pick a color. Export OG, YouTube, Instagram. Wire them into the frontmatter. Update the blog index card.

Fifteen minutes when it goes well. Forty-five when it doesn't. Multiply by every post and you get the soft backlog that kills a publishing cadence — posts sit in drafting because the feature image is still to-do, momentum dies, the queue of ideas outpaces the queue of shipped work.

A fixed-cost step becomes nearly free, and the threshold for "worth shipping" drops with it. Small ideas become postable, because the feature-image overhead isn't the rate-limiting step anymore. The drift framing is about what the published set looks like; the friction framing is about whether the set exists at all. Both matter, but friction matters first — you can't iterate on what you didn't ship.

## The pipeline, end to end

The whole system is four moving parts:

1. **Generator** — DALL-E 3 or FLUX behind a common provider interface, post-processing filters (scanlines, vignette, grain, grade, phosphor bloom) composed into named presets like `retro-crt` or `teal-amber`, branded text overlay via Satori, multi-format export (OG, YouTube, Instagram) in a single run.
2. **Gate** — a dev-only Astro page at `/dev/feature-image-preview` where I approve, reject, and rate every generation.
3. **Library** — a collection of prompt templates in the repo, each carrying a fitness score that updates every time I rate one of its generations.
4. **Orchestration** — a family of Claude Code skills that enqueue workflow items, apply decisions to posts, and report state.

The generator is the least interesting part. The gate and the library are the parts that make this more than a fancy prompt runner.

## The gate: a dev-only page, not a SaaS dashboard

Iterating from a CLI is painful — context-switching between terminal output, a file viewer, and the dev server. Iterating through a proper SaaS dashboard is overkill — now I'm maintaining a web app that does one thing. A dev-only Astro page at `/dev/feature-image-preview` splits the difference. In production it 404s. Three regions on the page:

- **Pending workflows panel** — open items the agent has enqueued, plus decided items waiting to be applied. Auto-polls every five seconds.
- **Generate form** — prompt, provider, preset, filter selections, title, subtitle. Submitting runs the pipeline and appends to the history.
- **Image grid** — every generation, with approval, rejection, a 1–5 rating, a notes field, and a "Submit for workflow X" button per generation when a workflow is active.

No database. No framework. Just Astro, two server endpoints that 404 in prod, and two JSONL files in the repo.

### The queue is a file

Two JSONL files back the whole thing, checked into the repo:

- `.feature-image-history.jsonl` — every generation ever run. One line per record. The raw audit log, and the substrate that fitness scores are computed from.
- `.feature-image-pipeline.jsonl` — workflow items with state transitions. One record per state change.

The whole state machine is a TypeScript union:

```typescript
export type WorkflowState =
  | 'open'       // agent has enqueued; user is iterating
  | 'decided'    // user has picked an approved generation
  | 'applied'    // agent has wired it into the post
  | 'cancelled';
```

Each line of `.feature-image-pipeline.jsonl` is a `WorkflowItem` keyed to one of those states, appended on every transition.

Why files instead of a database: zero infrastructure, inspectable with `tail -f` and `jq`, the schema is a TypeScript type, and rewriting history is `git`. But the load-bearing reason is that these files are the substrate the library learns from — losing them would mean losing the selection history. Version control makes that hard to do by accident.

### Claude Code is the backend

The dashboard has no application logic. All behavior lives in a family of Claude Code skills:

- **`/feature-image-blog <post-path-or-url>`** — async entry point. Reads frontmatter, drafts a starting prompt, appends an `open` workflow item, hands off to the gallery. No generation happens here.
- **`/feature-image-apply`** — async exit point. Reads all `decided` workflow items, copies approved images into `public/images/blog/<slug>/`, updates frontmatter (`image` + `socialImage`), updates the blog index card, transitions the workflow to `applied` or `cancelled`.
- **`/feature-image-help`** — reports current pipeline state and the next action to take.

Skills are Markdown files with library calls. When the workflow shape changes, the skill changes, not the plumbing. The trade-off: I have to open a Claude Code session to make anything happen. That's fine for a dev-facing tool. It would be the wrong trade for a customer-facing product.

## The library: a design system under selection pressure

Here's the part that makes the rest matter.

Without the library, every generation starts from either a hand-typed prompt or one the agent proposes from scratch. On-brand prompts decay as session memory fades. The images get better individually — the gate gives me a cheap way to pick the best of a few candidates — but the set drifts, because I'm still making the design decisions one post at a time. A gate without a library is a high-quality version of the same inconsistency problem.

The library fixes this by making prompts first-class artifacts. Each template in the repo carries its own aggregate fitness — a rolling average of 1–5 ratings on the generations that used it. Every generation in the gallery can be rated. Every rating updates the template's fitness. Templates can be forked; the lineage is visible in the library UI. The gallery weights suggestions by `fitness × recency`, so older, lower-performing templates get out of the way while staying forkable.

The library *is* the design system. Not a static Figma file. An evolving population of prompt templates under selection pressure, where the fitness function is me rating what comes out, and the selection happens implicitly every time the gallery picks what to suggest for the next post.

This is the answer to the question the rest of the post raises but doesn't otherwise answer: how does a non-designer converge on a coherent visual language without being able to articulate what it should be? I don't have to be smart enough to write the right prompt. Rating is a weaker act than authoring — I only have to be consistent enough to say "this one more than that one" and occasionally fork what works. Over enough generations, the library converges on a visual language I wasn't going to write down on my own.

And the library has a second property the rest of the system doesn't: it gets sharper over time, without me deciding it should. A static set of prompt templates would calcify into the same problem I'm trying to escape — a visual identity frozen at whatever I happened to think was good six months ago. Selection pressure keeps it moving. Templates that stop carrying their weight get out of the way. Forks that work get promoted. The library two months from now won't be the library today, and I won't have had to plan the transition.

## What's actually running, and what isn't

The generator, the gate, and the library are all running. The JSONL audit log and the workflow state machine are running. Rating, fitness scoring, and weighted suggestion are running. The skills are in use.

What isn't yet: the library is young. Fitness scores are based on a few dozen generations, not a few thousand. Convergence is a claim about where this goes, not a claim about where it is.

## Why this matters beyond feature images

The pattern generalizes past images. Any creative identity that has to survive across many AI-assisted sessions — voice, tone, house style, visual language — has the same shape of problem: per-session quality is a different job than cross-session coherence, and no amount of better prompting at the point of use will fix the second one. Feature images are one instance. Headline style is another. An editorial voice, kept recognizable across a hundred posts written with AI assistance, is another.

The load-bearing pieces are the same every time: a generator, a gate cheap enough to actually use, and a population of parameterizations under selection pressure. The generator is the easy part. The gate and the library are the missing infrastructure. Build those, and a fourth thing happens on its own — the system gets sharper without anyone having to plan for it.

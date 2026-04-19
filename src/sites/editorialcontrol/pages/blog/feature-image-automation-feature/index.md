---
layout: ../../../layouts/BlogLayout.astro
title: "Your Brand Survives the First Generation. Does It Survive the Hundredth?"
description: "Most AI-generated feature image workflows stop at the generator. That's the easy half. The missing infrastructure is a human gate cheap enough to actually use, and a design system that gets sharper every time you use it."
date: "April 2026"
datePublished: "2026-04-18"
dateModified: "2026-04-18"
author: "Orion Letizi"
tags: ["AI", "Automation", "Design", "Workflow"]
---

# Your Brand Survives the First Generation. Does It Survive the Hundredth?

Most posts about AI-generated feature images stop at the generator: pick a model, write a prompt, get an image. That's the easy half. The half that actually determines whether your site ends up with a coherent visual identity — or fifteen one-off images that drift in whichever direction the current panic pointed you — is the half nobody talks about.

Two pieces of infrastructure are missing from the usual workflow. A human gate cheap enough to actually use, so the best generation gets picked instead of the first acceptable one. And a design system that gets sharper every time you use it, so the set converges toward a visual language instead of drifting away from one.

This post is about both, and about the generator that feeds them. The visible results will lag — the older feature images on this site are still the old, hand-made ones, and they give away the truth: I made them by hand, I'm not a designer, and it shows. The point is the approach: AI as the generator, a cheap iteration surface so a non-designer can actually pick good ones, and a prompt library evolving under selection pressure toward a visual language I couldn't have written down upfront.

## Why the generator isn't the bottleneck

It's tempting to think the problem with AI feature images is the model. Get a better model, get better images. But the generator is the easy half of the problem, and the skills gap makes that obvious.

I've tried to get better at visual design. It never sticks. Not enough reps, not enough taste built up, not enough interest in the parts that aren't technical. Every one-off hand-made feature image is an exercise in ad-hoc choices: which color, which crop, which font size, which background. Consistency across fifteen posts isn't something I'm going to achieve with an artisanal approach, because I don't have the internal standard to apply consistently.

Automation isn't a substitute for design skill. It's a way to bake in consistency where I can't provide it manually, and a way to raise the floor when I can't move the ceiling.

But a pure generator doesn't do that. A generator with no gate produces noise on average — AI output is high-variance, with a long tail of excellent results and a long tail of nonsense, and you don't know which you got until you see it. A generator with no design system produces fifteen unrelated images, because every prompt starts from scratch and whatever "on-brand" instinct the session had at the start decays as context fades.

The quality problem and the consistency problem are different problems. The gate fixes the first. The library fixes the second.

## Friction is the other half of the story

The skills gap alone wouldn't have driven this. I'd have kept making mediocre images and moved on. What pushed this up the priority list was friction.

Every manual feature image is an interruption. Open the post. Open a background generator. Pick a crop. Open Figma. Position the title. Pick a color. Export OG, YouTube, Instagram. Wire them into the frontmatter. Update the blog index card.

Fifteen minutes when it goes well. Forty-five when it doesn't. Multiply by every post and you get the soft backlog that kills a publishing cadence — posts sit in drafting because the feature image is still to-do, momentum dies, the queue of ideas outpaces the queue of shipped work.

A fixed-cost step becomes nearly free, and the threshold for "worth shipping" drops with it. Small ideas become postable, because the feature-image overhead isn't the rate-limiting step anymore. The skills-gap framing is about quality; the friction framing is about whether the post ships at all. Both matter, but friction matters first — you can't iterate on what you didn't ship.

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

- `.feature-image-history.jsonl` — every generation ever run. One line per record. The raw audit log, and the substrate fitness scores are computed from.
- `.feature-image-pipeline.jsonl` — workflow items with state transitions. One record per state change.

Every workflow item moves through four states:

```
open → decided → applied | cancelled
```

`open` means the agent has enqueued a post and I'm expected to iterate and pick one. `decided` means I've marked an approved generation for this workflow. `applied` means `/feature-image-apply` has copied the image, updated frontmatter, and wired the blog index card.

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

What isn't: the library is young. The fitness scores are based on a few dozen generations, not a few thousand. Convergence is a claim about where this goes, not a claim about where it is. The older feature images on this site are still the old, hand-made ones. New posts go through the pipeline. Somewhere between the two is where the system has to prove out — not by making me a designer, but by making "not a designer" good enough.

## Why this matters beyond feature images

The pattern generalizes. For any AI-assisted workflow where output is high-variance and the human can't articulate the target in advance, three pieces are load-bearing: a generator, a gate cheap enough to actually use, and a population of parameterizations under selection pressure. The generator is the easy part. The gate and the library are the missing infrastructure. Build those, and a fourth thing happens on its own: the system gets sharper without anyone having to plan for it.

## Show our work

The `WorkflowState` union is the whole state machine:

```typescript
export type WorkflowState =
  | 'open'       // agent has enqueued; user is iterating
  | 'decided'    // user has picked an approved generation
  | 'applied'    // agent has wired it into the post
  | 'cancelled';
```

Each line of `.feature-image-pipeline.jsonl` is a `WorkflowItem` keyed to one of those states, appended on every transition. The full `WorkflowItem` interface, the `SKILL.md` files, and the pipeline module are available as gists on request.

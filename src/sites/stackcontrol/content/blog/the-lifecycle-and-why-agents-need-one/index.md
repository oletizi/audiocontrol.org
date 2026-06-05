---
title: "The Lifecycle, and Why Agents Need One"
description: "The thesis of the deskwork lifecycle: unstructured agentic work skips scope, over-builds, and ships unreviewed. Define → workplan → implement → audit → ship puts gates between intent and merge — why the structure beats vibes, and what each phase actually buys you."
date: "June 2026"
datePublished: "2026-06-05"
dateModified: "2026-06-05"
author: "Orion Letizi"
draft: true
deskwork:
  id: c196e248-3076-4e79-b44b-842691354340
  stage: Outlining
  iteration: 0
---

# The Lifecycle, and Why Agents Need One

> **Outline (Outlining stage).** Section skeleton + the argument each section
> carries. The Drafting iterate turns this into prose.

## Opening — the failure has a shape

- Unstructured agentic work fails in a recognizable way: it skips scope,
  over-builds, and ships unreviewed.
- The interesting claim: the cure isn't a smarter model — it's **gates between
  intent and merge**.
- deskwork's answer is a five-phase lifecycle: define → workplan → implement →
  audit → ship. The rest of the piece is what each phase actually buys.

## What goes wrong without rails

- **Skipped scope.** The agent invents work you didn't ask for; "make this
  change" silently becomes three changes.
- **Over-building.** Abstractions nobody needed, because nothing said where to
  stop.
- **Unreviewed shipping.** Output that is confident, plausible, and wrong — the
  worst combination, because it reads as done.
- Tie-in: this is the same degradation surface explored in the session-fatigue
  piece — cross-link when both ship.

## The five phases, and what each buys you

- **Define** — an interview captures the problem and the scope *before* code
  moves. The load-bearing part is writing down what's **out** of scope.
- **Workplan** — scope becomes phases + tasks, each backed by a GitHub issue
  with acceptance criteria you can check off. Plan and tracker can't drift.
- **Implement** — each task is delegated to a specialized subagent and
  committed at a clean boundary. Never one giant blob.
- **Audit** — every task gets a cross-model audit barrage. What independent
  reviewers *disagree* about is usually where the real bug lives.
- **Ship** — acceptance criteria verified, PR opened, and the toolchain stops.
  The operator owns the merge.

## The framing: a control plane, not a checklist

- The lifecycle as a surface that *watches work move through phases* — the same
  metaphor as the site's phase rail.
- **Mechanize over policy.** The gates live in the tooling (commit-msg hooks,
  the open-findings gate, the audit hook), not in good intentions that erode at
  hour four.

## Why structure beats vibes

- Vibes-coding works until it doesn't, and the failure is silent and
  compounding.
- The lifecycle's job is to make the cheap, skippable disciplines (scoping,
  review) actually happen *every* time.
- Cost/payoff: the ceremony is bounded; the regressions it prevents are not.

## Close — where this sits in the series

- This is the overview. Each later entry drills into one phase or system:
  scope discovery, the audit barrage, subagents + workflows, design discipline.
- One-line forward pointer to the next piece.

---
title: "Standing up a site with its own lifecycle plugin"
description: "stackcontrol.org was built using deskwork — the same lifecycle toolchain the site documents. Here's what running define → workplan → implement → audit → ship on a real feature actually looked like."
date: "June 2026"
datePublished: "2026-06-01"
dateModified: "2026-06-01"
author: "Orion Letizi"
phase: "PIPELINE"
draft: false
---

This site is the public home of **deskwork**, the lifecycle plugin for Claude Code. It is also the
first thing built end-to-end by that plugin in front of an audience. The whole point of deskwork is
that "make this change" should become a tracked lifecycle rather than an unsupervised sprint, so it
seemed dishonest to launch the product page any other way. We ran the lifecycle on the lifecycle.

## Define before code

The first command was `/dw-lifecycle:define`. It runs an interview — what is the change, what is in
scope, what is explicitly out — and writes a feature definition before anything is implemented. For
stackcontrol that meant deciding up front that this was a *third sibling site* in the "control"
family, that it would reuse the shared design-token base, and that its visual identity had to be
established under the design-decisions protocol rather than improvised.

The discipline here is boring and load-bearing: writing down what's out of scope is what stops an
agent from quietly building three extra pages you never asked for.

## Workplan, then issues

`/dw-lifecycle:setup` created the branch, the worktree, and a versioned docs directory holding a
PRD and a workplan. The workplan breaks the feature into phases — recon, scaffold, a design pass,
the build, the design-discipline archive, and deploy — each with acceptance criteria you can check
off. Every phase becomes a GitHub issue, so the plan and the tracker never drift apart.

## Implement, one task at a time

`/dw-lifecycle:implement` walks the workplan task by task. Each task is delegated to a specialized
subagent, reviewed, and committed at a clean boundary. The rule we hold to is **commit and push
early and often** — a green commit per task is the cheapest insurance against losing work, and it
makes the history readable after the fact.

The identity itself came from a `/frontend-design` pass that generated three distinct directions —
a cyan control-plane, an indigo schematic, and a magenta typographic stack. The operator picked
one; the other two were filed as rejected entries in the design archive so a future session doesn't
re-propose them. That archive is the durable record of what was *explored*, separate from the
design system that records what is *settled*.

## Audit, then ship

Every task is followed by a cross-model audit barrage — independent reviewers fired at the diff in
parallel. What the reviewers disagree about is usually where the real bug lives. When the workplan's
acceptance criteria are met, `/dw-lifecycle:ship` opens the pull request and stops. The toolchain
deliberately does not merge: the operator owns that decision.

That's the loop. Define, workplan, implement, audit, ship — the same five phases on the rail at the
top of the homepage. This entry was written inside it.

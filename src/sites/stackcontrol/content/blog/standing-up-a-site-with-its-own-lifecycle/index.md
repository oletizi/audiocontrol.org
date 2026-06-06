---
title: "Standing up a site with its own lifecycle plugin"
description: "stackcontrol.org was built with stack-control — the same toolchain the site documents. Here's what running the loop — define, implement, audit, repeat — on a real feature actually looked like."
date: "June 2026"
datePublished: "2026-06-01"
dateModified: "2026-06-06"
author: "Orion Letizi"
phase: "PIPELINE"
draft: false
---

This site is the public home of **stack-control**, a lifecycle plugin for coding agents. It is also the
first thing built end-to-end by that plugin in front of an audience. The whole point of stack-control
is that "make this change" should become a tracked loop rather than an unsupervised sprint, so it
seemed dishonest to launch the product page any other way. We ran the loop on the loop.

## Define before code

The first command was `/stack-control:define`. It runs an interview — what is the change, what is in
scope, what is explicitly out — and writes the spec before anything is implemented. For stackcontrol
that meant deciding up front that this was a *third sibling site* in the "control" family, that it
would reuse the shared design-token base, and that its visual identity had to be established under
the design-decisions protocol rather than improvised.

Define is also where the plan lives. It sets up the branch, the worktree, and a versioned docs
directory holding the spec and its task graph — the feature broken into phases with acceptance
criteria, each one a GitHub issue so the plan and the tracker never drift apart. The discipline here
is boring and load-bearing: writing down what's out of scope is what stops an agent from quietly
building three extra pages you never asked for.

## Implement, one task at a time

`/stack-control:implement` walks the task graph. Each task is delegated to a specialized subagent,
reviewed, and committed at a clean boundary. The rule we hold to is **commit and push early and
often** — a green commit per task is the cheapest insurance against losing work, and it makes the
history readable after the fact.

The identity itself came from a `/frontend-design` pass that generated three distinct directions —
a cyan control-plane, an indigo schematic, and a magenta typographic stack. The operator picked
one; the other two were filed as rejected entries in the design archive so a future session doesn't
re-propose them. That archive is the durable record of what was *explored*, separate from the
design system that records what is *settled*.

## Audit, every diff

Every task is followed by a cross-model audit barrage — independent reviewers fired at the diff in
parallel. What the reviewers disagree about is usually where the real bug lives. The barrage isn't a
gate the operator remembers to run; it fires automatically on every implementation pass.

## Repeat until clean

Audit findings aren't exceptions — they're guardrails that point implementation back to the happy
path. Implement and audit run on a loop until the diff comes back clean. Only then does the work
ship, and stack-control deliberately stops at the pull request: the operator owns that decision.

That's the loop. Define, implement, audit, repeat — the same four phases on the rail at the top of
the homepage. This entry was written inside it.

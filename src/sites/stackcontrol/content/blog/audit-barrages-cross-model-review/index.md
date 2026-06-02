---
title: "Audit barrages: cross-model review on every task"
description: "After each task, deskwork fires several CLI reviewers at the same diff in parallel and triages what comes back. Agreement is cheap; disagreement is where the real bugs hide."
date: "May 2026"
datePublished: "2026-05-14"
dateModified: "2026-05-14"
author: "Orion Letizi"
phase: "AUDIT"
draft: false
---

A single reviewer — human or model — has blind spots. The fix deskwork uses is not a better
reviewer; it's *more independent* reviewers, fired at the same diff at the same time. We call it an
audit barrage, and it runs after every implementation task.

## Fan out, don't serialize

`/dw-lifecycle:audit-barrage` takes the feature diff and dispatches it to several command-line
reviewers at once — different models, each blind to the others' output. Running them in parallel
matters for two reasons. The obvious one is wall-clock: serial review is slow enough that you skip
it. The subtler one is independence — a reviewer that can see another's findings tends to anchor on
them, and you lose the diversity that made the second opinion worth having.

## Triage by agreement

The findings come back tagged by which reviewer raised them. The interesting signal is not the
count; it's the **shape of the agreement**:

- When every reviewer flags the same line, it's almost always real, and usually obvious in
  hindsight.
- When exactly one reviewer flags something the others missed, that's the case worth reading
  closely — it's either a genuine edge the others walked past, or a false positive worth recording
  so it isn't re-raised.
- When reviewers *disagree* about whether something is a bug, that disagreement is the tell. It
  marks the spot where the code is ambiguous enough that reasonable readers diverge — which is
  exactly where defects like to live.

Findings get a stable ID and an explicit status — open, acknowledged, or scoped into the workplan
as a fix-task. The status transitions are append-only, so the audit log is a durable record rather
than a scratchpad.

## Guardrails, not gates you can skip

The design principle is that audit findings are *failures of the previous step pointed back at the
happy path* — not optional extra credit. So the lifecycle treats open findings as the next work,
not as exceptions you route around. You don't advance to the next task with an unresolved finding
sitting in the log; you either fix it or record why it's acknowledged.

It is not magic, and it doesn't replace reading the diff yourself. What it does is make the cheap,
parallelizable part of review actually happen every time, so your attention goes to the handful of
places where the models couldn't agree.

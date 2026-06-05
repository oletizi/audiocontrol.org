---
title: "Rolling My Own: From Web Editors to a Lifecycle Plugin to stack-control"
description: "A first-person account of arriving at a process for agentic development — invented out of necessity building the audiocontrol web editors, generalized into the dw-lifecycle plugin, and now rebuilt as stack-control on top of Spec Kit while keeping the parts that earned their keep: the audit barrage and scope discovery. With receipts from the commit log and session transcripts."
date: "June 2026"
datePublished: "2026-06-05"
dateModified: "2026-06-05"
author: "Orion Letizi"
draft: true
deskwork:
  id: c196e248-3076-4e79-b44b-842691354340
  stage: Outlining
  iteration: 1
---

# Rolling My Own: From Web Editors to a Lifecycle Plugin to stack-control

> **Outline (Outlining stage, re-framed as a first-person story).** Section
> skeleton + the argument each section carries + where the *receipts* come from.
> The Drafting iterate turns this into prose. Receipts = git commit log +
> Claude Code session transcripts, cited inline at draft time.

## Opening — a problem with no playbook (that I knew of)

- Last year I set out to build the **audiocontrol web editors** — browser-based
  editors for old samplers (Roland S-330 and friends) — and I wanted to build
  them *with* agentic coding.
- The catch: there wasn't a consensus I knew of for how to actually develop
  software this way. No accepted playbook for keeping an agent on the rails
  across a real, multi-week project.
- So I did the only thing available: I started inventing a process as I went.
- **Receipts:** the earliest audiocontrol commits + session transcripts, where
  the process is visibly ad hoc — the "before" state.

## Act I — Rolling my own, inside the audiocontrol repo

- What the process became in-repo: define-before-code, written workplans,
  commit-at-task-boundaries, a development journal, session start/end rituals.
- The discoveries that actually mattered — the moves that kept the work honest:
  hard scoping up front, reviewing *every* change, refusing to trust plausible
  output.
- The texture of learning it the hard way — the corrections that taught the
  rules (an agent inventing work I didn't ask for; a confident, wrong diff).
- **Receipts:** commits/transcripts where the conventions first appear — the
  first DEVELOPMENT-NOTES entry, the first workplan, the first "wait, did you
  scope this?" correction.

## Act II — Generalizing it out: the dw-lifecycle plugin

- The realization: none of this was audiocontrol-specific. I had several
  projects and kept re-implementing the same scaffolding by hand.
- So I lifted the process *out* of the audiocontrol repo into a standalone
  plugin — **dw-lifecycle** — so every project could run the same lifecycle.
- Continuous improvement, and the two parts that emerged from real pain and
  became the unique value:
  - the **audit barrage** — fire several independent models at the same diff
    after every task; disagreement is where the bug hides.
  - **scope discovery** — catch the drift a workplan misses (the clones, the
    over-reach) before it ships.
- **Receipts:** the extraction commit (lift-out of audiocontrol), the
  audit-barrage and scope-discovery feature commits, and the audit-log evidence
  of findings they caught.

## Act III — The rebuild: stack-control

- What changed in the world: a consensus is finally forming. Spec-driven
  tooling — **Spec Kit** — is now state of the art for the spec→execution
  spine. The thing I had to invent now has a community answer for its hardest,
  most generic part.
- So I'm rebuilding dw-lifecycle as **stack-control** (CLI `stackctl`) — a new
  plugin, branded to this site — built **integration-first against Spec Kit**:
  curate a spec, run it via *native* Spec Kit execution (`/speckit-implement`),
  with governance firing automatically afterward.
- Front door = in-session skills **`define` / `extend` / `execute`**, mirroring
  the lifecycle vocabulary I already had.
- What I'm **keeping**, because the consensus doesn't give it to you: the
  **audit barrage** and **scope discovery**. Governance rehomes first; the
  scope-discovery/audit-barrage migrations are later features. dw-lifecycle keeps
  working untouched while stack-control stands up beside it.
- Self-hosting: once the front door exists, every later feature gets built
  *through* it.
- **Receipts:** the stack-control spec (`specs/003-stack-control-front-door`),
  the plugin scaffold + MVP commits, the `/speckit-*` commit trail on
  `feature/pluggable-lifecycle-providers`.

## Close — what the arc actually says

- You don't need permission or a finished consensus to start — you need a
  process you'll actually follow, and the discipline to keep the parts that earn
  their keep.
- Adopt the consensus where it's genuinely better (the spec spine); keep what's
  yours where it's better (audit barrage, scope discovery).
- Forward pointer: the later entries in this devlog drill into those kept parts.

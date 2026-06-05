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
  iteration: 2
---

# Rolling My Own: From Web Editors to a Lifecycle Plugin to stack-control

> **Outline (Outlining stage), receipts cited per beat.** Drafting turns this into
> prose. `[op]` = operator decision still open (see `notes.md` §4–§5). Full receipts in
> `./research/`; pull-quotes in `./research/quote-bank.md`.

## Opening — from hand-coding to agents, with no playbook

- The real roots are **hand-coded and pre-agentic**: **`oletizi/ol_dsp`** (**2023-11-08**,
  C — *"dsp libraries… for use in Daisy"*, the embedded-audio platform) and
  **`oletizi/audio-tools`** (**2024-10-11**, TypeScript). Both written by hand, **before
  agentic coding was really available**.
- When agentic coding arrived, audio-tools was flattened into the **monorepo**
  (**2025-09-01**) and the work shifted to building *with* agents — starting with the
  **audiocontrol web editors** (first: **Novation Launch Control XL 3**, workplan
  **2025-09-25**). `[op: name Novation, or "the editors"?]`
- There was no consensus I knew of for *how* to develop software with agents. Coming from
  hand-coding embedded DSP, I had to build the guardrails myself. The claim the piece
  argues: the cure for agents going sideways isn't a smarter model — it's **gates between
  intent and merge**.

## Act I — rolling my own, invented by correction

- **The process was invented in-repo, not imported** — the old audio-tools repo carried
  no `.claude/`. First process artifact: a module `CLAUDE.md` (9-agent roster)
  **2025-09-24**; the *root* `CLAUDE.md` only **2026-02-02**.
- **The spine (receipt):** across **182 sessions (2026-02-19→05-21), 225 corrections** —
  taxonomy **PROCESS 128** / FABRICATION 32 / UX 26 / DOCS 25 / COMPLEXITY 16 / ARCH 3.
  The failures were *wrong-thing / wrong-order / didn't-check* — **not bad code**. The
  process is what those corrections taught.
- **Disaster → rule (dated):**
  - **05-14 `21b95c31`** — sliders shipped as non-interactive `role="img"` behind **175
    passing specs**: *"You shipped garbage… what's the point of UI tests that don't
    exercise the UI?"* → the **test-theater rule** + render/wiring/sign-off gates.
  - **05-03 `57e0bc83`** — a *"JUST FOR NOW"* `window.prompt()` fallback never restored →
    `agent-discipline.md` + "nucleation site of bad behavior."
  - **03-29 `3db928d3`** — *"'Graceful' failover is misleading and bad"* → fail-fast.
- **CLAUDE.md's arc** = accretion → distillation: 361 → **773-line peak** → distilled to
  **198** path-scoped lines (`.claude/rules/`, **2026-04-14 #286**).
- **The lifecycle gets *named*: 2026-04-10 `3e302fff` (#188)** — session start/end
  checklists, the journal template with correction categories, sub-agent mapping, playbooks.

## Act II — generalizing it out: the dw-lifecycle plugin

- **The extraction: 2026-04-21 `7311d842`** — six minutes after the bare init, the
  deskwork repo ports audiocontrol's `.claude` tooling verbatim (7 agents, 14 skills,
  rules). Decision dated **04-19 `d4df8ec4`**: *"extract skills into open-source plugins,
  codename deskwork."*
- **Scope discovery** — seed **03-21 `27263c0e`** (*"Why didn't that automatically get
  updated?"*) → contracts-to-reduce-corrections **04-12** (55 violations) → canonized into
  the plugin **05-25 `9ddcc6d4`**. Operator: *"I shouldn't have had to point out the
  problem by brute force."*
- **Audit barrage** — cross-model pilot **04-13**; MESA II rigor **04-16 `bc965958`**
  (*"this is an INFERENCE, not a finding"*); framed in the ROADMAP **05-28** (operator
  attention = the binding constraint); **ships 05-29 `4ef3c09f`** (claude/codex/gemini,
  *"usage based, not token based"*).
- **"Mechanized with teeth"** — the `/dwi` end-of-task hook **`3a370a19`**: *"Audit
  findings are failures of the previous implementation… guardrails to point the
  implementation team back to the happy path."* Three enforcement layers; bug **#383
  `c9849b61`** (autonomous burndowns ran with *zero audit coverage*) → split the gate.
- **The throughline:** *policy in rules < policy in process* — "didn't gain teeth until
  converted to process."

## Act III — the rebuild: stack-control

- **Why now:** **Spec Kit** is the emerging consensus for the spec→execution spine —
  exactly the define/plan/tasks scaffolding I hand-built and ported out of audiocontrol.
  So adopt the consensus for *authoring + execution*.
- **stack-control** (`stackctl`) — *"successor to dw-lifecycle, built integration-first
  against Spec Kit"*; branch `feature/pluggable-lifecycle-providers` (from **06-04**), MVP
  **06-05** (native Spec Kit execution + governance). Front door = in-session skills
  **`define` / `extend` / `execute`**.
- **What I keep that the consensus doesn't give:** the cross-model **audit barrage**
  firing *automatically* on `after_implement` (SC-002), **provider-neutral** (SC-004,
  "branch on capability, never identity" — survives a vendor sunsetting headless CLI mode),
  plus **scope discovery**. dw-lifecycle keeps running untouched; self-hosting — *"every
  later feature is specced and built through it."*

## Close — what the arc actually says

- The corrections were **process, not code**. You don't need permission or a finished
  consensus to start — you need a process you'll actually follow, and the discipline to
  keep the parts that earn their keep.
- Adopt the consensus where it's genuinely better (the spec spine); keep what's yours
  where it's better (audit barrage, scope discovery).
- Forward pointer: later entries drill into those kept parts.

---

> **`[op]` open before Drafting:** title; whether to quote **"2,400 sessions"** (the
> committed report says **183 sessions / 2,122 commits**); naming the Novation first editor.

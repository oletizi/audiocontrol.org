---
title: "Coding Agents Are Insane, Hyperintelligent Toddlers"
description: "So I built them a babysitter. The origin story of an agentic-development process — from hand-coding audio DSP and sampler SysEx control, through the dw-lifecycle plugin, to a rebuild as stack-control on Spec Kit, keeping the audit barrage and scope discovery. With receipts from the commit log and session transcripts."
date: "June 2026"
datePublished: "2026-06-05"
dateModified: "2026-06-05"
author: "Orion Letizi"
draft: true
deskwork:
  id: c196e248-3076-4e79-b44b-842691354340
  stage: Outlining
  iteration: 3
---

# Coding Agents Are Insane, Hyperintelligent Toddlers

*So I built them a babysitter: from hand-coded DSP to stack-control.*

> **Full-piece outline (Outlining), rebuilt around the babysitter/toddler arc.** Deep per-act
> outlines with quotes + receipts: `./outline-act1.md`, `./outline-act2.md`, `./outline-act3.md`.
> Research corpus: `research/agentic-dev-origin/` (`author-narrative.md`, `notes.md`,
> `research/quote-bank.md`).
>
> **Drafting conventions:** verbatim operator quotes render as **pull quotes** (blockquotes set
> apart in their section), *not* woven into the prose. The **all-caps** quotes are **inflection
> markers** — each one signals "stop yelling, re-architect," and is followed by the next
> innovation (see `author-narrative.md` installment 6).

## Hook
- **Lead line:** *"Coding agents are insane, hyperintelligent toddlers that lie, get bored, and
  need constant babysitting… which is why I built an agent babysitter plugin."*
- The clauses are promises the body keeps: **lie** → the audit barrage; **bored** →
  scope-deferral / session fatigue; **babysitting** → the workplan / on-task protocol;
  **babysitter plugin** → dw-lifecycle → stack-control.
- **The toddler diagnosis** (sets up why exhortation fails): a toddler has a **30-second
  memory** (→ the memory wipe / context haze) and an **underdeveloped prefrontal cortex** (→ no
  impulse control: drift, scope-deferral, lying). *You don't fix a toddler by yelling — you
  change the environment.* That's the whole approach: process over policy, mechanized detection
  over exhortation. **Babysitting = engineering the crib, not raising your voice.**
- **The all-caps rule** (recurring motif): *"Every time I caught myself typing in all caps, it
  meant the same thing — stop yelling, re-architect."* Each all-caps pull quote in the body is
  one of those inflection points.

---

## Act 1 — How I ended up needing a babysitter  ·  *(detail: `outline-act1.md`)*
*Origin → the process invented by correction.*

- **Rewind: the hand-coder.** Hand-coded embedded audio DSP — `ol_dsp` (2023-11-08, C/C++ for
  Daisy/Teensy + Eurorack + a JUCE host) → `audio-tools` (2024-10-11). Pre-agentic for ~2 years.
- **The pivot (Sept 2025) + Wall 1: the memory wipe.** Building browser editors *with* agents
  (hand-coded SysEx for Akai S3000XL / S5000-6000, Roland JV-1080); the agent's memory wiped at
  almost every auto-compact boundary. → **Fix 1: source-of-truth docs** (PRD + workplan).
- **Wall 2: keeping the agent on task** — *"did you update the workplan?"*, repeated endlessly.
- **Wall 3: the big `CLAUDE.md` dissolves into the context haze** — policy written down and
  *still* ignored (*"you shipped garbage"* / *"JUST FOR NOW"* / *"'Graceful' failover is
  misleading and bad"*).
- **The turn:** decompose policy into **skills + processes** (CLAUDE.md 773 → 198 path-scoped;
  the lifecycle *named*, #188). → **portability → dw-lifecycle.**

---

## Act 2 — The babysitter grows teeth  ·  *(detail: `outline-act2.md`)*
*The quiet failures, and the two mechanisms that answer them.*

- **Thesis:** once the basics were in place, the dangerous failures went **quiet** — the agent
  *shirking*, not erroring. You can't exhort quiet failure away; you have to **detect** it.
- **Failure A — scope-deferral → anemic work** (*"defer NOTHING… scope obsession is BULLSHIT"*).
- **Failure B — duplication instead of refactoring** (anti-patterns as nucleation sites).
- **Failure C — incomplete change discovery** (UI-redesign brute-force; *"why didn't that
  automatically get updated?"*).
- **The mechanisms:** **scope discovery** (answers B + C) + **the audit barrage** (answers A).
  Centerpiece — **"stochastic correctness":** the *genetic diversity of multi-model scrutiny
  converges on the right answer.* Money line: *"insane, hyperintelligent toddlers… pit them
  together and they correct each other's mistakes, confabulations, and laziness."*

---

## Act 3 — Rebuilding the babysitter on the shared crib  ·  *(detail: `outline-act3.md`)*
*The rebuild: stack-control.*

- **Why now (the philosophy):** I always assumed the state of the art would outpace my solo
  work — so I **continuously shed bespoke pieces for the SOTA as it matures.** The bespoke
  PRD/workplan was getting naive; **Spec Kit** is now the define→plan→tasks spine I hand-built.
  *Arc closure: the first fix I invented (PRD/workplan, Act 1) is the first thing I shed.*
- **Fresh start:** replacing the spine + a new name (*"dw-lifecycle has always been a dumb
  name"*) → **stack-control** (`stackctl`), successor to dw-lifecycle, **integration-first
  against Spec Kit**; front door = `define` / `extend` / `execute`.
- **The thesis:** these plugins are **opinionated but lightweight shells over state-of-the-art
  tooling** (a "thin control plane"). The **crown jewels** (audit barrage, scope discovery) are
  the parts the SOTA doesn't *yet* give — **kept only until it does** (same shedding schedule).
- **Self-hosting + isolation:** every later feature built *through* it; dw-lifecycle untouched.

---

## Close — the babysitter, paid off
- The agents are *still* insane, hyperintelligent toddlers that lie and get bored. What changed
  is that I now have a real **babysitter** — and I'm rebuilding it on the shared crib (Spec Kit)
  while keeping the parts that actually catch the lying (audit barrage) and the boredom (scope
  discovery).
- The deeper note: the babysitter is **built to be replaced from underneath** — its willingness
  to be outpaced by the state of the art is what keeps it durable.
- Forward pointer: the rest of the "Building deskwork" series drills into each kept part.

---

> **Locked decisions:** title (above); editor lineage = Akai S3000XL / S5000-6000 + Roland
> JV-1080 SysEx (Novation experimental); numbers = verified **183 sessions / 2,122 commits**
> (not "2,400"); research promoted to `research/agentic-dev-origin/`.

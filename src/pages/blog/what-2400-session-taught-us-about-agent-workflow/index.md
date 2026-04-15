---
layout: ../../../layouts/BlogLayout.astro
title: "Instructions Are Not Enough: What 2,400 Sessions Taught Us About AI Agent Workflow"
description: "Telling an AI agent what to do is easy. Getting it to reliably follow process requires something structural — skills, session journals, and correction-driven guardrails."
date: "April 2026"
datePublished: "2026-04-17"
dateModified: "2026-04-17"
author: "Orion Letizi"
---
# Instructions Are Not Enough: What 2,400 Sessions Taught Us About AI Agent Workflow

The hard problem isn’t getting an AI agent to write code. It’s getting it to reliably follow process.

I’ve been building [audiocontrol](https://audiocontrol.org) — a TypeScript monorepo for controlling vintage hardware samplers via web-based editors. Roland S-330, Roland S-550, Akai S3000XL. MIDI over SCSI. SysEx protocols reverse-engineered from 1980s service manuals. A Raspberry Pi running a Rust bridge between modern browsers and 30-year-old hardware.

I’ve done nearly all of it with Claude Code as my primary collaborator. 2,400+ sessions. 1,100+ commits. 55 sessions analyzed with quantitative metrics. And the most important thing I’ve learned: telling an AI agent what to do is easy. Getting it to reliably do what you told it requires something structural.

-----

## The Before: “I EXPLICITLY Told You NOT to Implement”

Early sessions were extraordinary. I could describe a feature — “build a SysEx parser for the Roland S-330’s patch format” — and watch scaffolding materialize in minutes that would have taken me days. The codebase spans hardware protocols, React UIs, audio processing algorithms, and cross-compilation for ARM. Claude Code was the force multiplier I needed.

But then the corrections started. And kept coming. And kept being the same ones.

The March 2026 library-ux session tells the story. Two days. 350+ messages from me. 37 commits. Approximately 20 corrections — moments where I had to stop the agent and redirect its approach. The agent operated blind: it didn’t read the feature workplan, didn’t know what had been tried in previous sessions, didn’t know that 14 sub-feature documents existed describing exactly what needed to be built and in what order.

The failure modes became depressingly familiar:

**Fabrication.** “No, you can’t write directly to the sampler’s memory. You just made that up.” The agent would state device capabilities it had invented from whole cloth — protocol behaviors that didn’t exist, hardware features that had never shipped. The hardware has been in continuous service for 30 years. Our code was days old. But the agent would blame the device before questioning its own work.

**Refusing to delegate.** “You are the orchestrator, not the implementation team.” This became the single most frequent correction across all sessions. I’d explicitly assign the agent an orchestrator role and it would immediately start writing code itself. When I asked why, the agent was disarmingly honest: *“No good reason. I fell into the exact pattern documented in the corrections. The path of least resistance is to just do it.”*

**Skipping process.** The agent would implement without committing. It wouldn’t read existing patterns before building from scratch. In one session, it wasted four iterations building broken envelope drag math when a working, debugged implementation already existed in another editor module — one grep away.

**Claiming things were fixed.** “I thought you said you fixed that problem?” I’d reported that loop detection was producing candidates only a few hundred samples long — essentially granular synthesis fragments, not usable loops. The agent claimed it had fixed the issue. The loops were still microseconds long.

Every correction costs attention, context-switching, and trust. At 20 corrections per session, the agent isn’t a force multiplier. It’s a force divider. You’re spending more time supervising than you would have spent doing the work yourself.

The moment that crystallized the problem: I asked *“How do you know that?”* about a claim the agent made regarding SCSI protocol behavior. We were mid-session, debugging a handshake issue on the S3000XL, and the agent had confidently stated a specific timing requirement — with technical detail, with authority. When I pushed back, there was no source. No service manual. No spec. It had invented a behavior for hardware that predates the internet, in the middle of a debugging session that depended on getting it right. That moment spawned Tenet #3 of our process framework: *Never accept fabrication.*

-----

## Phase One: Writing the Rules Down

The natural first response was more instructions. After each painful session, I’d add rules to CLAUDE.md — the configuration file Claude Code loads at the start of every conversation:

- *“Never add delays as a first resort — investigate protocol and encoding first.”*
- *“Never implement fallbacks or use mock data outside of test code.”*
- *“Never assume the device is at fault — it has 30 years of field service; our code is days old.”*

Each rule was a scar from a specific session.

I also formalized how we tracked problems. Instead of ad hoc complaints, every session journal entry tagged corrections with one of five categories: `[COMPLEXITY]`, `[UX]`, `[FABRICATION]`, `[DOCUMENTATION]`, `[PROCESS]`. I created DEVELOPMENT-NOTES.md as an institutional memory — a structured journal written at the end of every session, documenting what we accomplished, what didn’t work, and course corrections with category tags. This was the bridge between ephemeral conversations and persistent knowledge.

It helped. But not enough.

CLAUDE.md grew to 774 lines. The rules existed. The agent read them — they’re injected into the system prompt. But PROCESS corrections still dominated at 69% of all corrections across 52 analyzed sessions. The agent *knew* what it should do and still didn’t do it. The instructions competed with the agent’s natural tendency to start coding, and the tendency won.

The agent articulated the problem better than I could: *“Soft instructions are insufficient — the agent needs mechanical constraints.”* It said this after being corrected for the same delegation failure in three out of three orchestrator sessions.

Telling the agent what to do is easy. Getting it to reliably do what you told it requires something structural.

-----

## Phase Two: The Structural Turn

The breakthrough came when I stopped thinking about rules and started thinking about systems. I articulated what I called the virtuous cycle:

```
Corrections → Rules → Playbooks → Templates → Autonomy
     ↑                                              |
     └──────────── fewer corrections ←──────────────┘
```

Each correction becomes a rule. Rules that repeat become playbooks. Playbooks that stabilize become skills — automated commands the agent executes. Skills enable autonomous execution. Autonomous execution produces fewer corrections. The cycle compounds.

The implementation had three parts.

### Skills: Automating the Right Sequence

Claude Code supports custom skills — slash commands that expand into structured prompts. I built skills that encode entire workflows.

`/session-start` doesn’t *suggest* reading the workplan. It *is* reading the workplan. The skill identifies the current feature from the worktree name, reads the workplan and its completion state, reads the latest DEVELOPMENT-NOTES.md entry (including corrections from the previous session), reads the session analysis report (aggregate correction patterns across all sessions), checks open GitHub issues, and reports a summary — then waits for the user to confirm the session goal. The agent can’t skip these steps because the steps *are* the command.

`/session-end` automatically updates the feature README status table, checks off completed workplan tasks, writes the journal entry, and commits all documentation. This replaces the pre-improvement pattern where documentation was routinely forgotten.

The skill inventory grew to 18 commands. Each one encodes a process that previously required me to provide step-by-step instructions from memory.

### Sub-Agents: Making Delegation the Easy Path

Instead of telling the main agent “don’t implement, delegate” — which failed in three out of three attempts — I gave it specialized agents to delegate to: a `hardware-protocol-engineer` that understands SCSI CDBs, SDS sample dumps, and Roland SysEx encoding; a `library-ux-engineer` that knows the design system and drag-and-drop patterns; a `code-reviewer` that catches guideline violations before commit.

When specialized agents exist, delegation becomes the path of least resistance instead of solo implementation. The agent doesn’t have to resist the urge to code — it has a better option.

The difference was immediate. In a later session, the agent launched four audit sub-agents in parallel within the first two minutes: one to audit keygroup CRUD operations, one for program CRUD, one to map device parameters, one to review patterns from the Roland editor. Research that would have taken hours of serial tool calls completed in approximately two minutes.

Compare that to the March session where the agent wandered for hours doing everything itself.

### Tool Restrictions: Mechanical Constraints

The most effective change was the bluntest. The orchestrator agent’s definition restricts which tools it can use. It literally cannot write code files. It can read, search, plan, and spawn sub-agents — but it cannot edit source.

This isn’t a suggestion. It’s an enforcement mechanism. The “orchestrator tries to implement” pattern occurred in three out of three early sessions despite explicit instructions not to. After tool restrictions: zero occurrences.

You don’t solve a structural problem with more documentation. You solve it with structure.

### Smaller CLAUDE.md, Scoped Rules

I refactored CLAUDE.md from 774 lines to 198. Domain-specific rules moved to `.claude/rules/` with path-scoped loading. When the agent works on an Akai editor file, it sees Akai rules. When it works on UI components, it sees UI rules. Less noise, more signal. The agent encounters the right rule at the right time — not all rules all the time.

-----

## Phase Three: Closing the Feedback Loop

Rules and skills encoded what I’d already learned. But the system also needed to learn from itself.

I built a session analytics pipeline that extracts structured data from Claude Code’s JSONL session logs and sends conversation content to Claude Haiku for classification: session arc type (feature, debug, exploration, quick-task), correction count, correction categories, and improvement suggestions. Then it aggregates everything into a human-readable report.

The numbers across 52 analyzed sessions:

|Category     |Count|%  |
|-------------|-----|---|
|PROCESS      |53   |69%|
|UX           |7    |9% |
|FABRICATION  |6    |8% |
|DOCUMENTATION|5    |6% |
|COMPLEXITY   |3    |4% |
|ARCHITECTURE |3    |4% |

77 total corrections. 1.48 per session on average. PROCESS dominates — and that’s the category most amenable to structural fixes. The data validated the entire approach.

The critical integration: `/session-start` reads the analysis report. Every session begins with the agent aware of its own historical failure patterns. In one session, the agent explicitly noted: *“These are mistakes from previous sessions — actively avoid repeating them.”* The system corrects itself.

-----

## What Actually Changed

The qualitative shift is stark.

Early sessions were adversarial. I caught fabrications, demanded evidence, corrected every other design decision. *“STOP TRYING TO ADD DELAYS.” “Garbage UX.” “No, you can’t write directly to the sampler’s memory. You just made that up.”* I was a supervisor correcting a junior engineer who kept making the same mistakes.

Mature sessions are collaborative. I consult the agent for input: *“How are context menus typically handled on a touchscreen device?”* Corrections shift from “you did the wrong thing” to gentle architectural nudges: *“did you delegate?”* The relationship shifted from supervisor-subordinate to collaborator.

The quantitative shift:

|Metric               |Before             |After (avg)             |After (best)       |
|---------------------|-------------------|------------------------|-------------------|
|Corrections/session  |~20                |~4                      |0                  |
|Fabrications/session |~4                 |~0.2                    |0                  |
|User messages/session|350+               |~30                     |3                  |
|Session completion   |multi-day marathons|single-session features |autonomous         |
|Sub-agents used      |0                  |4–18                    |parallel, proactive|
|CLAUDE.md size       |774 lines          |198 lines + scoped rules|—                  |
|Interaction tone     |adversarial        |collaborative           |silent             |

The crown jewel is the test-infra session from April 15. I typed three skill invocations: `/session-start`, `/feature-pickup`, `/feature-implement`. The agent read the workplan, identified the next task, delegated research to an Explore sub-agent, reviewed findings, delegated implementation to a `typescript-pro` sub-agent, verified with the TypeScript compiler, committed, moved to Phase 2, delegated two parallel sub-agents for two editor modules — all without a single correction from me.

Three inputs. Zero corrections. A complete feature delivered.

-----

## The Lessons

**Instructions are necessary but not sufficient.** Write the rules. But don’t expect them to be followed just because they exist. LLM agents have the same problem as human teams: knowing what to do and doing it are different things. Our CLAUDE.md was 774 lines of good advice that was routinely ignored.

**Structure beats willpower.** The agent “deciding” to delegate is fragile. The agent having its write permissions revoked is robust. Design for the failure mode, not the ideal case. If a behavior needs to be reliable, make the wrong behavior mechanically impossible.

**Measure corrections, not output.** Commits and lines of code are vanity metrics. Corrections per session is the real signal. If you’re correcting the same category repeatedly, you have a process gap, not a performance problem.

**The feedback loop is the product.** The session analytics pipeline, the structured journal, the memory system, the skills that read prior corrections at startup — this infrastructure is more valuable than any single feature the agent built. Features are one-time value. A compounding feedback loop is permanent leverage.

**Your CLAUDE.md should get smaller over time, not bigger.** A 774-line instruction file is a code smell for your agent configuration. Extract domain rules into scoped files. Automate sequences into skills. Encode constraints into agent definitions. The goal is for the agent to encounter the right rule at the right time — not all rules all the time.

**The user’s role changes.** You stop being a typist who delegates coding tasks. You become an architect who designs the system that the agent operates within. The meta-work — building skills, writing rules, analyzing sessions, designing agent roles — is the highest-leverage work you can do. Every hour spent on process infrastructure saves ten hours of corrections.

**“How do you know that?” is the most valuable question you can ask.** It catches fabrication. It forces evidence. It teaches both you and the agent to distinguish between reasoning and invention. Make it a reflex. When the agent states something about device behavior, protocol details, or architecture without citing a source — challenge it. The answer will either be evidence (good) or uncomfortable silence (invaluable).

-----

## What’s Next

The continuous-improvement feature was itself a 9-phase meta-feature with its own PRD, workplan, and GitHub issues — the same process applied to improving the process. Areas still exploring: automated trend detection for persistent correction categories, pre-commit review gates that enforce process standards, and cross-project propagation of the skills and analytics pipeline.

The tension between autonomy and oversight is real. How much process is too much? When does structure become bureaucracy? No final answers. But the data says the current level of structure — 18 skills, 8 rule files, a session analytics pipeline, structured journal entries — reduces corrections by 5x without noticeably slowing down productive work.

The goal isn’t an agent that never makes mistakes. It’s a system where mistakes become rules, rules become automation, and automation reduces mistakes.

The cycle compounds.

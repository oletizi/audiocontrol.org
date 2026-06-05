# Act 1 — working outline (iterate here)

Working outline for **Act 1** of "Rolling My Own: From Hand-Coded DSP Code to a Lifecycle
Plugin to stack-control". Not built as a page. Iterate on structure here before drafting into
`index.md`. Corpus: `research/agentic-dev-origin/` (esp. `author-narrative.md`, `notes.md`,
`research/quote-bank.md`).

**v3 restructures Act 1 around the operator's own causal chain** (`author-narrative.md`,
installment 1). The running argument: *the failures weren't bad code — they were the agent
losing the plot; each wall got a structural fix, and the fixes compounded into a lifecycle.*
PROVISIONAL — awaiting installment 2.

Quotes are **verbatim** (`[V]`) operator words from decrypted transcripts, or paraphrase to
verify (`[P]`). Session id in `[brackets]`.

---

## §1.0 — Opening hook (the whole piece in one line)
- **Lead line** (operator's, canonical): *"Coding agents are insane, hyperintelligent
  toddlers that lie, get bored, and need constant babysitting… which is why I built an agent
  babysitter plugin."*
- Thesis-as-hook: front-load the payoff, then rewind. Each clause is a promise the body keeps
  (**lie** → audit barrage / "stochastic correctness"; **get bored** → scope-deferral &
  session fatigue; **babysitting** → the workplan/on-task protocol; **babysitter plugin** →
  dw-lifecycle → stack-control). The "toddler/babysitter" frame recurs as a light motif and
  pays off at the close.

## §1.1 — Rewind: the hand-coder (pre-agentic)
- *"But let me back up."* Before the babysitting: hand-coding embedded audio DSP — `ol_dsp`
  (2023-11-08, C/C++ for Daisy/Teensy + a Eurorack module + a JUCE host). The obsession
  that's the spine: *talk to real audio hardware at the byte/MIDI/SysEx/DSP level.*
  `audio-tools` (2024-10-11). No agent artifacts for ~2 years.
- Optional craftsman voicing: [V, 03-29] *"stick with the technology stack(s) at hand…
  node, typescript, and C++/JUCE."*

## §1.2 — The pivot, and Wall 1: the memory wipe
- Sept 2025: agentic tooling arrives (first `CLAUDE.md` 2025-09-01); the work shifts to
  building browser editors *with* agents — hand-coded SysEx for **Akai S3000XL, S5000/S6000,
  Roland JV-1080**. No consensus I knew of for *how*.
- **The failure that really started it: memory wipe at almost every auto-compact boundary.**
  The agent lost context mid-session — work and intent evaporated.
- [V] *"all of your advice has been wrong… I don't want guesses based on what 'seems plausible'."*

## §1.3 — Fix 1: source-of-truth documentation (PRD + workplan)
- The response: durable docs that survive the wipe and get re-read — **the PRD and the
  workplan**. Source of truth that outlives the context window.
- Receipts: first `prd.md`/`workplan.md` ~2026-02-10 (`ad8db1e`); `docs/<version>/<status>/<slug>/`
  convention 2026-02-05 (`a59d1601`).

## §1.4 — Wall 2: keeping the agent on task
- Even with docs, the agent drifted; I repeated protocol constantly — *write your planned
  steps to the workplan; what's next; did you update the workplan?*
- The two drift directions:
  - didn't-actually-do-it: [V] *"did you check to see if it worked?"*
  - quietly-shrinks-the-work: [V] *"defer NOTHING… you will NEVER unilaterally push scope."*
- **Evidence (show, don't tell) — the disasters:**
  - **slider, 05-14** [`21b95c31`]: [V] *"None of the controls are functional. You shipped
    garbage."* / *"QA theater."* / *"How would you write a test harness that PROVES the value
    slider works?"*

## §1.5 — Wall 3: the big CLAUDE.md dissolves into the context haze
- I accreted a huge `CLAUDE.md` of policy + standards — and learned **policy in a document
  gets forgotten / dissolves into the context haze.** A rule the agent "has" but doesn't apply.
- **Evidence:** standards that were *written down* and *still* violated —
  - **"JUST FOR NOW," 05-03** [`57e0bc83`]: [V] *"every time you… do something 'JUST FOR NOW',
    it turns into a nucleation site of bad behavior which never gets fixed."*
  - **fail-fast, 03-29** [`3db928d3`]: [V] *"'Graceful' failover is misleading and bad."* /
    *"No silently skipped tests."*
- Receipts: CLAUDE.md grew to a **773-line peak** (`a20b8f07`, 2026-04-14).

## §1.6 — The turn: decompose policy into explicit skills + processes
- The realization: stop relying on a giant doc; **convert policy into process** — explicit
  skills, path-scoped rules that load only when relevant, session rituals, a named lifecycle.
- Receipts: CLAUDE.md **distilled 773 → 198 path-scoped lines** same day (`31319e1c`, #286);
  the lifecycle *named* 2026-04-10 (`3e302fff`, #188: session start/end, journal w/ correction
  categories, sub-agent map).
- [P] *"policy embedded in rules is far less effective than policy enforced in process …
  didn't gain teeth until converted to process."* (verify verbatim)
- [V] *"I want it to be credible… avoid a future where we have hundreds of green tests that
  don't test what users care about."*

## §1.7 — Portability → dw-lifecycle (hand-off to Act 2)
- Once I had processes + skills, I needed them **portable across projects** → the decision to
  build the **dw-lifecycle plugin**.
- Receipts: extract-to-plugin decision 2026-04-19 (`d4df8ec4`); deskwork genesis 2026-04-21
  (`7311d842`); [V, 05-24] *"canonize the scope and duplication discovery tooling… into
  deskwork lifecycle."*
- → Act 2 picks up here. (Operator's installment 2 will extend this.)

---

## Open structural calls
1. **Cold-open depth** — how much hardware/DSP texture in §1.1? (Vivid craftsman vs. fast to
   the agentic lede.)
2. **Thesis surfacing** — keep it implicit in the wall→fix chain (current), or state
   "process, not code" outright early?
3. ~~Scope of Act 1~~ — RESOLVED by the narrative: Act 1 ends at the portability realization
   (§1.7), which opens Act 2.

## Iteration log
- v1 — initial 6-section structure + 3 open calls.
- v2 — added verbatim operator quotes per section.
- v3 (2026-06-05) — **restructured around the operator's causal chain** (memory-wipe → SoT
  docs → on-task → CLAUDE.md context-haze → decompose policy into skills/process → portability
  → plugin); disasters demoted to evidence inside Walls 2–3.
- v4 (2026-06-05) — added **§1.0 opening hook** (the "agent babysitter / toddlers that lie,
  get bored" line) as the lead; §1.1 becomes the rewind to the hand-coder. Babysitter motif
  maps to the body (see `author-narrative.md` installment 4).

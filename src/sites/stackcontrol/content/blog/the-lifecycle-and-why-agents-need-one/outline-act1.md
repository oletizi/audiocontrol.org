# Act 1 — working outline (iterate here)

Working outline for **Act 1** of "Rolling My Own: From Hand-Coded DSP Code to a Lifecycle
Plugin to stack-control". Not built as a page. We iterate on structure here before drafting
prose into `index.md`. Receipts/quotes corpus: `research/agentic-dev-origin/`.

**Act 1 = the origin:** hand-coder → agentic pivot → inventing the process by correction.
Hands off to Act 2 (generalize → dw-lifecycle).

Quotes are **verbatim** operator words pulled from the decrypted session transcripts (`[V]`),
or analysis-paraphrase to verify before publishing (`[P]`). Session id in `[brackets]`.

---

## §1.1 — Cold open: the hand-coder (pre-agentic)
- Who I was: hand-coding embedded audio DSP — `ol_dsp` (2023-11-08, C/C++ for Daisy/Teensy
  + a Eurorack module + a JUCE host): synth voices, effects, MIDI. Then `audio-tools`
  (2024-10-11, TS).
- The obsession that's the spine of the whole story: *talk to real audio hardware at the
  byte/MIDI/SysEx/DSP level.* ~268 hand-coded commits; no agent artifacts for ~2 years.
- **Quotes:** none from this era (pre-transcript, 2023). The craftsman's voice shows up
  later as stack discipline — usable here as a flash-forward:
  - [V, 03-29 `3db928d3`] *"I would prefer you stick with the technology stack(s) at hand.
    At the moment, that's node, typescript, and C++/JUCE."*

## §1.2 — The pivot to agents (Sept 2025)
- Agentic coding arrives: first `CLAUDE.md` 2025-09-01, a 231-commit explosion, audio-tools
  → ol_dsp → audiocontrol. New work: browser editors for the same hardware — hand-coded
  SysEx for **Akai S3000XL, S5000/S6000, Roland JV-1080**.
- The problem: no consensus I knew of for *how* to build with a fast, confident,
  sometimes-wrong collaborator — and a refusal to run on plausible-sounding guesses.
- **Quotes:**
  - [V] *"all of your advice has been wrong. I only want what YOU KNOW YOU NEED — I don't
    want guesses based on what 'seems plausible'."*

## §1.3 — The failures had a shape (Act 1's thesis)
- The reveal: the corrections weren't about bad code. **128 of 225 corrections were
  PROCESS** — wrong-thing / wrong-order / didn't-check. A smarter model wouldn't have fixed
  it; a *process* would. (183 sessions / 2,122 commits.)
- **Quotes:**
  - [V] *"did you check to see if it worked?"* — the recurring refrain.
  - [V] *"I want you to defer NOTHING. Your scope obsession is BULLSHIT!!! I will tell you
    when something is out of scope. You will NEVER unilaterally push scope."* — the other
    failure mode: an agent that quietly *shrinks* the work.

## §1.4 — Three disasters that became rules (the heart — show, don't tell)
- **The slider that didn't slide** (05-14 `21b95c31`): non-interactive sliders behind 175
  passing specs → the test-theater rule.
  - [V] *"There's nothing to test. None of the controls are functional. You shipped garbage."*
  - [V] *"your browser testing has been mostly QA theater."*
  - [V] *"you burned days building a UI test suite that tests nothing. How would you write a
    test harness that PROVES the value slider works as advertised?"*
- **"JUST FOR NOW"** (05-03 `57e0bc83`): a temp `window.prompt()` never restored →
  `agent-discipline.md`.
  - [V] *"Every time you or a subagent do something 'JUST FOR NOW', it turns into a
    nucleation site of bad behavior which never gets fixed and worsens the problem."*
- **Silent failover** (03-29 `3db928d3`): fail-fast on hardware.
  - [V] *"The hardware e2e tests should fail fast and loud if it can't talk to the attached
    device. 'Graceful' failover is misleading and bad in this case."*
  - [V] *"There should be no graceful skipping. If something should exist and doesn't, the
    test should fail. No silently skipped tests."*

## §1.5 — The process accretes, then distills
- CLAUDE.md: 361 → 773-line peak → distilled to 198 path-scoped lines. The lifecycle gets
  *named* (2026-04-10, #188). The deeper principle that powers Acts 2–3: *policy in rules <
  policy in process.*
- **Quotes:**
  - [V] *"I want it to be credible. I want to avoid a future where we have hundreds of green
    tests that don't test what users care about."* — the standard the whole process serves.
  - [P] *"policy embedded in rules is far less effective than policy enforced in process …
    didn't gain teeth until converted to process."* (verify verbatim before publishing.)

## §1.6 — Hand-off to Act 2
- It worked — but it lived in one repo, re-implemented by hand across projects. The next
  move: pull it out. → dw-lifecycle.
- **Quotes:**
  - [V, 05-24] *"I want to canonize the scope and duplication discovery tooling that was
    piloted in the audiocontrol repository into deskwork lifecycle."*

---

## Open structural calls (to iterate)
1. **Thesis placement** — state "failures were process, not code" up front (§1.3), or let
   the three disasters land first and derive the thesis from them?
2. **Cold-open depth** — how much hardware/DSP texture in §1.1?
3. **Scope of Act 1** — stop at "the lifecycle gets named" (§1.5), or pull the extraction
   into Act 1's close?

## Iteration log
- v1 (2026-06-05) — initial 6-section structure + 3 open calls.
- v2 (2026-06-05) — added verbatim operator quotes per section (pulled from decrypted
  transcripts: slider 05-14, JUST-FOR-NOW 05-03, failover 03-29; + corpus thematics).

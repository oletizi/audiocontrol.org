# Act 1 — working outline (iterate here)

Working outline for **Act 1** of "Rolling My Own: From Hand-Coded DSP Code to a Lifecycle
Plugin to stack-control". Not built as a page. We iterate on structure here before drafting
prose into `index.md`. Receipts/quotes are in the promoted corpus
(`research/agentic-dev-origin/` — `notes.md`, `research/quote-bank.md`).

**Act 1 = the origin:** hand-coder → agentic pivot → inventing the process by correction.
It hands off to Act 2 (generalize → dw-lifecycle).

---

## §1.1 — Cold open: the hand-coder (pre-agentic)
- Who I was: hand-coding embedded audio DSP — `ol_dsp` (2023-11-08, C/C++ for Daisy/Teensy
  + a Eurorack module + a JUCE host): synth voices, effects, MIDI.
- The obsession that's the spine of the whole story: *talk to real audio hardware at the
  byte/MIDI/SysEx/DSP level.* Then `audio-tools` (2024-10-11, TS).
- Function: establish a careful, close-to-the-metal craftsman. ~268 hand-coded commits;
  no agent artifacts for ~2 years.

## §1.2 — The pivot to agents (Sept 2025)
- Agentic coding arrives: first `CLAUDE.md` 2025-09-01, a 231-commit explosion, audio-tools
  → ol_dsp → audiocontrol.
- The new work: browser editors for the same hardware — hand-coded SysEx for **Akai
  S3000XL, S5000/S6000, Roland JV-1080**.
- The problem: no consensus I knew of for *how* to build software with a fast, confident,
  sometimes-wrong collaborator.

## §1.3 — The failures had a shape (Act 1's thesis)
- The reveal: the corrections weren't about bad code. **128 of 225 corrections were
  PROCESS** — wrong-thing / wrong-order / didn't-check. A smarter model wouldn't have fixed
  it; a *process* would. (Numbers: 183 sessions / 2,122 commits.)

## §1.4 — Three disasters that became rules (the heart — show, don't tell)
- **The slider that didn't slide** (05-14): non-interactive sliders behind 175 passing
  specs → *"You shipped garbage"* → the test-theater rule.
- **"JUST FOR NOW"** (05-03): a temp `window.prompt()` never restored → `agent-discipline.md`.
- **Silent failover** (03-29): *"'Graceful' failover is misleading and bad"* → fail-fast.

## §1.5 — The process accretes, then distills
- CLAUDE.md: 361 → 773-line peak → distilled to 198 path-scoped lines. The lifecycle gets
  *named* (2026-04-10, #188: session rituals, journal w/ correction categories, sub-agent map).
- The lesson that powers Acts 2–3: *policy in rules < policy in process* — "didn't gain
  teeth until converted to process."

## §1.6 — Hand-off to Act 2
- It worked — but it lived in one repo, re-implemented by hand across projects. The next
  move: pull it out. → dw-lifecycle.

---

## Open structural calls (to iterate)
1. **Thesis placement** — state "failures were process, not code" up front (§1.3), or let
   the three disasters land first and derive the thesis from them? (More telling vs. more earned.)
2. **Cold-open depth** — how much hardware/DSP texture in §1.1? A vivid paragraph (SysEx
   bytes, Daisy) sets the author apart but risks burying the "agentic process" lede.
3. **Scope of Act 1** — stop at "the lifecycle gets named" (§1.5) and let the extraction
   open Act 2, or pull the extraction into Act 1's close?

## Iteration log
- v1 (2026-06-05) — initial 6-section structure + 3 open calls.

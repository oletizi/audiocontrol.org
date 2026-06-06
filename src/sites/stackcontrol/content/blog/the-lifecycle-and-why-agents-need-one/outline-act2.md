# Act 2 — working outline (iterate here)

Working outline for **Act 2** of "Coding Agents Are Insane, Hyperintelligent Toddlers". Not built as a page. Built from the
operator's narrative installment 2 (`research/agentic-dev-origin/author-narrative.md`).
PROVISIONAL.

**Act 2 = generalizing it out: dw-lifecycle, and the *quiet* failures that forged its crown
jewels (scope discovery + audit barrage).** Picks up at Act 1 §1.7 (the portability move);
hands off to Act 3 (rebuild → stack-control).

**Running argument:** once the basics were in place, the dangerous failures went *quiet* — the
agent shirking, not erroring. Exhortation doesn't fix quiet failure; **mechanized detection**
does. `[V]` = verbatim operator quote; `[P]` = verify before publishing.

---

## §2.1 — The portability move: in-repo process → a plugin
- Once I had skills + processes, I needed them **portable across projects** → the dw-lifecycle
  plugin. (Continues Act 1 §1.7.)
- Receipts: extract-to-plugin 2026-04-19 (`d4df8ec4`); deskwork genesis 2026-04-21
  (`7311d842`, "Ported from audiocontrol.org's .claude tooling"); dw-lifecycle forms 04-29.
- [V, 05-24] *"canonize the scope and duplication discovery tooling… into deskwork lifecycle."*

## §2.2 — A new class of failure: the *quiet* ones
- With the basics in place, the loud errors faded; what remained was the agent **shirking** —
  not failing loudly. You can't exhort your way out of quiet failure; you have to **detect** it.
- (Act 2 thesis. Sets up why the next three failures all get *mechanized* answers.)

## §2.3 — Failure A: scope-deferral → tech debt → anemic implementations
- A relentless urge to **carve out and defer scope** — producing mounting tech debt and
  implementations so anemic they weren't fit for purpose. The origin of the **"JUST FOR NOW is
  BULLSHIT"** directive.
- [V] *"I want you to defer NOTHING. Your scope obsession is BULLSHIT!!! … you will NEVER
  unilaterally push scope."*
- [V, 05-03] *"every time you… do something 'JUST FOR NOW', it turns into a nucleation site of
  bad behavior which never gets fixed and worsens the problem."*

## §2.4 — Failure B: duplication instead of refactoring (nucleation)
- Agents **duplicate code instead of refactoring**; bad habits beget bad habits — anti-patterns
  become **nucleation sites** for more bad behavior.
- Receipts: clone-detection pilot 2026-03-18 (`cb78ab0e`, jscpd, PR #59); the `contracts`
  feature 2026-04-12 (`719e8d42`, **55 violations** incl. duplicated types, built "to reduce
  agent corrections"); `clones.yaml`.

## §2.5 — Failure C: incomplete change discovery (the UI-redesign brute-force)
- Agents **don't find all the code that must change** as a codebase evolves. Worst in UIs —
  redesigns were brutal, **brute-forcing the agent component by component**.
- [V, 03-21 `27263c0e`] *"Why didn't that automatically get updated?"*
- [V, 05-26] *"I shouldn't have had to point out the problem by brute force."*
- (The s550 editor redesign — same project as the slider disaster — is the worked example.)

## §2.6 — The mechanisms: scope discovery + the audit barrage
- **Scope discovery** — mechanized detection of unchanged-but-should-change code + duplication
  (`check-clones` against a baseline, `scope-widen`, `clones.yaml` dispositions, anti-patterns,
  adopter manifests). Answers Failures B + C.
- **Audit barrage** — independent **cross-model** review (claude/codex/gemini) catching the
  quiet shirking/anemia that a single self-review misses. Answers Failure A (and the rest).
  **The standout tool.** The concept (centerpiece): **"stochastic correctness"** — the code
  faces the **genetic diversity of multi-model scrutiny that converges on the right answer.**
  - [V — the money line] *"Individual agents are like insane, hyperintelligent toddlers with
    a tendency to lie. Pit multiple agents together continuously and they tend to correct each
    other's mistakes, confabulations, and laziness."*
  - Proof: MESA II 04-16 (`bc965958`) — a single self-review baked an inference in as evidence
    (*"this is an INFERENCE, not a finding"*); the Phase-12 dogfood surfaced 4 cross-model HIGH
    findings the other two surfaces missed. deskwork's ROADMAP calls it "genetic diversity in
    failure modes" — the operator's own framing.
  - **THE worked example — the Claude-vs-Codex MESA II thread** (`audiocontrol-org/audiocontrol#315`,
    310 comments; detail: `research/receipts-mesa-claude-codex-315.md`). A real parallel effort to
    reverse-engineer the SCSI conversation between MESA II and the **Akai S3000XL** — chartered
    into **adversarial lanes** (Claude = emulator-forward executor; Codex = "contract recovery
    and falsification," tasked to *"independently verify or falsify Claude's interpretations"*).
    The money beats (pull quotes):
    - **the death-spiral break:** Claude blamed silent hardware, was pressed, then self-reported
      it *"inferred device failure from a symptom… and dressed the inference up as a
      measurement,"* and asked Codex to *"always question it and demand proof."*
    - Codex forces a **"PROVED → CANDIDATE" downgrade**; refuses to endorse a brief that
      *"overstates what is MEASURED."* Claude concedes *"'force the conclusion' was too strong"* /
      *"REFUTED by primary evidence."*
    - **Convergence under a MEASURED / CANDIDATE / OPEN ledger:** the one genuinely MEASURED win
      (the SRAW CDB wire format `0C 00 [len] 80`) earned the tag only after *both* agents
      confirmed it byte-for-byte — *"measured enough to stop arguing about it"* — correcting an
      earlier *shared* false belief. The surviving claims are the ones that survived
      cross-examination. **That is "stochastic correctness" caught in the act.**
- Receipts: scope-discovery canonized 2026-05-25 (`9ddcc6d4`); audit-barrage ROADMAP 05-28
  (`847ea708`, operator attention = "the binding constraint") + ship 05-29 (`4ef3c09f`);
  MESA II rigor 04-16 (`bc965958`, *"this is an INFERENCE, not a finding"*).
- [V, 06-01] *"when to run the barrage should not be a matter of policy and the agent should
  have no discretion. It must be mechanized with teeth."*
- [C, `3a370a19`] *"Audit findings are failures of the previous implementation… guardrails to
  point the implementation team back to the happy path."*

## §2.7 — Hand-off to Act 3
- These two — scope discovery + audit barrage — are exactly what I **keep** when I rebuild the
  whole thing on Spec Kit. → stack-control.

---

## Open structural calls
1. **Order of §2.3–2.5** — by chronology, or by "worst/most-surprising first"?
2. **Scope vs audit framing** — present them as two answers to one theme ("quiet failure →
   mechanized detection"), or give each its own mini-arc?
3. **How much mechanism detail** here vs. deferring to the later per-system devlog entries
   (the series drills into each)?
4. **"Stochastic correctness" as centerpiece** — the audit barrage + this coinage may be the
   conceptual peak of the whole piece. Give §2.6 (or just the barrage) the most weight / a
   named section? Is "stochastic correctness" the article's term or a one-off?

## Iteration log
- v1 (2026-06-05) — built from narrative installment 2 (quiet failures A/B/C → scope discovery
  + audit barrage). Provisional.
- v2 (2026-06-05) — installment 3: "stochastic correctness" + the toddler metaphor folded
  into §2.6 as the audit-barrage centerpiece.
- v3 (2026-06-05) — added THE worked example to §2.6: the Claude-vs-Codex MESA II thread
  (audiocontrol-org/audiocontrol#315) — death-spiral break, PROVED→CANDIDATE downgrades,
  MEASURED/CANDIDATE/OPEN ledger, SRAW byte-format convergence. Receipt: receipts-mesa-claude-codex-315.md.

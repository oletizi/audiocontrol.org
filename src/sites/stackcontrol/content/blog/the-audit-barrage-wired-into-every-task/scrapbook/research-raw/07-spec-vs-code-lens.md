# Spec-shaped lens vs code-shaped lens — the live discovery (2026-06-07)

Added 2026-06-07 at operator direction, mid-development. This is the **newest chapter** of the
stack-control story (newer than `research-raw/02`), and it's the most devlog-perfect beat in the
piece: a discovery being made *as the post is being written*, with the team literally starting "a log
of our discoveries." Source: `feature/stack-control` commit log, deskwork repo — chiefly:
- `ea7993e2` (2026-06-07 17:57) `feat(audit-barrage): mode-aware audit lens — spec vs implement`
- `1694b113` (2026-06-07 17:15) `docs(spec-governance): spec-audit failure-modes log + diminishing-returns rule`
- the live `specs/005 design/document-primitives` spec-governance run (iterations 1–8, the dogfood)
- files: `plugins/stack-control/spec-kit/spec-governance/SPEC-AUDIT-FAILURE-MODES.md`,
  `.claude/rules/spec-audit-diminishing-returns.md`, `plugins/stack-control/src/govern/payload-spec.ts`

## The discovery in one sentence

Same barrage, same principles — but **a spec needs a different lens than code, because spec auditing
has no crisp convergence floor.** Point a *code-shaped* lens at a spec and the barrage **plateaus
instead of converging**, and the critiques **drift from spec coherence down to implementation
detail** — the auditors start demanding the spec *be the code*.

## Why specs are different (the crux — the operator's exact point)

From `.claude/rules/spec-audit-diminishing-returns.md` and `SPEC-AUDIT-FAILURE-MODES.md`, verbatim:

> "Auditing **code** has a crisp convergence floor: 0 findings means done, and a clean diff is
> objectively clean. Auditing a **spec** does not. A spec is prose — inherently incomplete — so a
> sufficiently aggressive cross-model barrage can **always** surface another under-specified edge ...
> There is no '0 findings is obviously correct' floor. That makes **knowing when you've hit
> diminishing returns genuinely fuzzy** — harder than for code."

→ Code **converges** (a real zero exists). A spec **plateaus** (no zero exists; you can always find
another prose gap). So the same tool needs a different *stopping* judgment and a different *lens*.

This also sharpens the **stochastic-correctness** thesis from §0: for code there's at least a
deterministic-looking floor to aim at; for a spec there *isn't one at all* — "correctness" is openly
a statistical/judgment terminal state. The honest end state for a spec is an **override** (we decided
it's good enough and the residual is implementation detail), explicitly **not** "converged."

## What goes wrong without a spec lens (FM-2, the generator)

The barrage prompt was **mode-agnostic** — it applied the code checklist (missed edge cases /
operator-interrupt / file-size) to specs too. Commit `ea7993e2` names the failure:

> "the code-audit checklist (missed edge cases / operator-interrupt / file-size) was applied to specs
> too, **telling the auditor to litigate IMPLEMENTATION in the spec** (the FM-2 generator from the
> 005 dogfood)."

That's the operator's "critiques start being about implementation instead of spec consistency and
completeness," exactly. The catalog calls it **FM-2 — mechanism-over-specification generator (the big
one):** when a spec tries to fully specify an *implementation mechanism* in prose, the barrage
correctly refuses every incomplete attempt, and **each attempt spawns or resurfaces a finding — a
generator that patching cannot exhaust.** Root cause: the spec crossed the **"promises before
mechanism"** line.

### The fix: a mode-aware lens (commit ea7993e2)
Make the **lens** per-mode, supplied by the payload; the renderer stays mode-agnostic.
- **CODE_AUDIT_LENS** = the existing checklist (edge cases, interrupt, file-size).
- **SPEC_AUDIT_LENS** = a different question entirely. Verbatim core:
  > "**You are auditing a SPECIFICATION — a statement of PROMISES, REQUIREMENTS, and DESIGN DECISIONS
  > — NOT an implementation.** Look for flaws in *what the spec promises and decides*, never in *how
  > it would be built*."
  - In scope: internal **contradictions** (the highest-value spec finding), **impossible promises**,
    **ambiguity an unattended builder resolves wrongly**, **unmeasurable promises**, **missing
    guarantee/decision**.
  - Out of scope: "over-specified mechanism (altitude violation)" — algorithms, file layouts,
    write/recovery protocols, edge-case handling → flagged as *"move to contracts/tests"* and **capped
    at `medium`** with a `[mechanism — defer to contracts/tests]` prefix.
  - **The litmus, verbatim:** *"is this a flaw in WHAT the spec promises/decides, or in HOW it would
    be implemented? WHAT → in scope, flag it. HOW → OUT of scope."*

So: same barrage, same severity/output machinery — only the **lens** (what you tell the auditors to
look for) and the **artifact framing** change by mode. That's the whole adapter.

## The 005 dogfood — the concrete picture (this is the story to tell)

First self-hosted spec-governance run, `design/document-primitives` (specs/005), claude + codex, today.

**HIGH trajectory: `7 → 5 → 2 → 1 → 5 → 5 → 1 → 4`.** *That bounce — 1 back up to 5 — is the plateau
made visible.* It is the single best concrete image of "plateaus instead of converges."

- **The generator (FM-2):** the spec tried to promise `archive --apply` was "atomic all-or-nothing
  across both files." **No two-file atomic commit exists**, so every prose attempt (atomic-rename →
  "rolls back cleanly" → …) was correctly rejected and **resurfaced: AUDIT-29 → 39 → 40.** That drove
  the `1→5→5` re-spike.
- **The break (structural root-fix, "playbook A"):** at iteration 6→7 they **stopped patching** and
  *removed the mechanism from the spec entirely*, replacing it with a **promise** — *"an interrupted
  `--apply` never silently loses content; documents are version-controlled so any inconsistency is
  recoverable (revert + re-run)"* — and deferred the write/recovery protocol to `plan`/`contracts` +
  RED tests. **HIGH dropped 5 → 1 in one round.** The log's line: *"The plateau **was** the generator;
  removing it (not feeding it) converged it."* Operator's framing: *"version control is like a write
  journal… it lets you recover from corruption."*
- **The second plateau (different shape):** iter-8 re-spiked to 4 — but this time **diffuse fix-debt
  with no common generator** (seven unrelated boundary conditions). No single structural fix collapses
  it → the signal for **"playbook B": override & graduate.** Closed via a recorded `GOVERN_OVERRIDE`;
  the 7 residual were dispositioned `acknowledged-deferred-impl` and scoped into the task list.
  **39 findings fixed across 8 iterations.**

**Two plateau *shapes* — the key discovered judgment:** (i) a *single generator* (29→39→40) → break it
with a structural root-fix; (ii) *diffuse fix-debt, no common generator* → override and defer. "Does
one change collapse many findings, or are they seven unrelated boundary conditions?" That distinction
is the new skill.

**A discovery within the discovery (great honest detail):** *even a clean, correct fix spawns ~N new
boundary findings next round* — "intrinsic to specifying behavior in prose ... a reason convergence to
literal-zero is often not the right goal for a spec." And: **the override is the honest terminal
state for a spec, not a failure** — distinct from `converged`, which would falsely claim zero residual.

## The plateau-detection heuristics (the "how do you know" answer)

You're likely at diminishing returns when **≥2** hold across consecutive rounds:
1. HIGH count **stops monotonically decreasing** — plateaus/oscillates (`…→1→5→5`).
2. A meaningful fraction of new findings are **fix-debt** (consequences of the prior round's edits).
3. A **root issue resurfaces** under a new ID.
4. Findings **shift altitude** — from contradiction/promise-level down to implementation-mechanism
   level ("the spec is being asked to *be the code*").

Cross-model agreement is still the HIGH-confidence signal even at the plateau — "a multi-model finding
is almost always a genuine deep tension, not noise."

## The meta-move = the devlog principle, embodied in the tooling (the connective tissue)

The response to all this wasn't just a code fix — it was **starting an append-only log of discoveries.**
Commit `1694b113` created `SPEC-AUDIT-FAILURE-MODES.md` (a "well-known, append-only log") + a
session-loaded stop-heuristic rule, with an entry format for future audits. The operator's framing is
the perfect tie to this site's whole reason for existing:

> **Operator (verbatim, in the rule's "why this exists"):** *"It's clearly harder and fuzzier to
> determine when you've hit the diminishing-returns plateau than when auditing code. We should be
> keeping a log… of our discoveries."*

→ This is the **devlog thesis inside the machine.** The post is a devlog about discovering the
barrage; the team is *simultaneously* keeping a devlog of what the barrage keeps teaching them. Worth
landing explicitly: the work and the writing-about-the-work are the same practice. (And it makes the
"we don't have all the answers" stance concrete — they built a *logbook for the answers they don't
have yet.*)

## How this lands in the outline

- **§9 (governing the spec)** gets deepened from "extending left" into a real discovery beat: *we
  pointed the same barrage at specs and it didn't behave the same way.* The `7→5→2→1→5→5→1` bounce,
  the FM-2 generator, the "remove the mechanism, state the promise" break, the two plateau shapes, and
  the override-as-honest-terminal-state.
- It reinforces **discovery-first** (this is pure discovery, made this week) and **devlog** (literally
  "keeping a log of our discoveries"; still mid-flight — 005 just graduated by override today).
- Frame connection (use at most glancingly, per LIGHT dosage): selection pressure has to **fit the
  substrate** — a code-shaped predator pointed at a spec selects for the wrong trait, so the
  population never reaches a fitness peak. A different prey needs a differently-adapted predator. Note
  it; don't belabor it.

## Pull-quotes (verbatim, sourced)
- (rule) "Auditing code has a crisp convergence floor ... Auditing a spec does not. A spec is prose —
  inherently incomplete." — `spec-audit-diminishing-returns.md`
- (commit) "the code-audit checklist ... was applied to specs too, telling the auditor to **litigate
  IMPLEMENTATION in the spec**." — `ea7993e2`
- (spec lens) "Look for flaws in *what the spec promises and decides*, never in *how it would be
  built*." — `payload-spec.ts:SPEC_AUDIT_LENS`
- (litmus) "WHAT → in scope ... HOW → OUT of scope." — `payload-spec.ts`
- (log) "The plateau **was** the generator; removing it (not feeding it) converged it." — 005 entry
- (operator) "version control is like a write journal… it lets you recover from corruption."
- (operator) "We should be keeping a log… of our discoveries." — `spec-audit-diminishing-returns.md`
- HIGH trajectory `7 → 5 → 2 → 1 → 5 → 5 → 1 → 4`; structural root-fix dropped 5→1; 39 findings / 8
  iterations; graduated by override. — `SPEC-AUDIT-FAILURE-MODES.md`

## Sources
- `feature/stack-control` commits `ea7993e2`, `1694b113` (deskwork repo)
- `plugins/stack-control/spec-kit/spec-governance/SPEC-AUDIT-FAILURE-MODES.md`
- `.claude/rules/spec-audit-diminishing-returns.md`
- `plugins/stack-control/src/govern/payload-spec.ts` (SPEC_AUDIT_LENS / SPEC_ARTIFACT_FRAMING)

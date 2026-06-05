# Author narrative — Orion's first-person account (primary source)

Captured from the operator directly (the most authoritative source — the receipts
corroborate it). Quote/paraphrase faithfully when drafting. Delivered in installments.

---

## Installment 1 (2026-06-05) — the causal chain that motivated the process

> Paraphrase of the operator's account, kept close to his words:

1. **The failure that really motivated me: the memory wipe.** It happened in almost every
   session at the **auto-compact boundaries** — the agent lost its memory/context mid-session.
2. **That's what prompted "source-of-truth documentation": the PRD and the workplan.** Durable
   docs that survive the wipe and can be re-read.
3. **Then another failure point: keeping the agent on task.** I had to repeat myself
   constantly about protocol — *"always write your planned steps to the workplan," "what's
   next on the workplan?", "did you update the workplan?"*
4. **I also accreted a very large `CLAUDE.md`** full of policy and standards — and I realized
   **those are often forgotten or dissolve into the context haze.**
5. **So I began to decompose the policy and standards into explicit skills and processes.**
6. **Once I had the processes and skills, it became clear I needed them portable across
   projects — so I decided to create the dw-lifecycle plugin.**

*(— more to come in the next installment.)*

### Receipts that corroborate installment 1
- **Source-of-truth docs:** first `prd.md` + `workplan.md` ~2026-02-10 (`ad8db1e`, monorepo);
  the `docs/<version>/<status>/<slug>/` convention 2026-02-05 (`a59d1601`).
- **On-task drift:** PROCESS = 128 of 225 corrections; verbatim refrains *"did you check to
  see if it worked?"*, *"did you scope it into the workplan?"*
- **Big CLAUDE.md → context haze → decompose:** CLAUDE.md grew to a **773-line peak**
  (`a20b8f07`, 2026-04-14) then **distilled to 198 path-scoped lines** the same day
  (`31319e1c`, #286) by extracting rules into `.claude/rules/` with conditional `paths:`
  loading; the lifecycle *named* 2026-04-10 (`3e302fff`, #188).
- **Portability → plugin:** decision to extract into a plugin 2026-04-19 (`d4df8ec4`); deskwork
  repo genesis 2026-04-21 (`7311d842`, "Ported from audiocontrol.org's .claude tooling");
  *"I want to canonize the … tooling … into deskwork lifecycle"* (05-24).

### Note on the disasters (slider / JUST-FOR-NOW / failover)
These are vivid *illustrations* of steps 3–4 (the agent drifting / policy-in-a-doc being
ignored), not separate plot points. Deploy them as evidence inside the on-task + context-haze
beats, not as their own act.

---

## Installment 2 (2026-06-05) — the new failure modes that drove scope discovery + the audit barrage

> Once the basic skills + workflow processes were in place, **new** failure modes appeared.
> Paraphrase of the operator, close to his words:

**a) A weird, relentless urge to carve out and defer scope.** It caused mounting tech debt
and implementations so anemic they weren't fit for purpose. **This is where the "JUST FOR NOW
is BULLSHIT" directive came from** — i.e. the directive's true origin is *scope-deferral →
anemic implementations*, not merely the one `window.prompt()` fallback instance.

**b) Agents would relentlessly duplicate code instead of refactoring.** And **bad habits begat
more bad habits** — anti-patterns served as **nucleation sites** for further bad behavior.

**c) Agents often would not find all the code that needed to change as codebases evolved.**
Especially bad in **user interfaces**, where UI redesigns were extremely painful because I had
to **brute-force the agents to make the needed updates component by component**.

**→ The two mechanisms arose to combat the *quiet* bad behavior** of agents:
- shirking their duty to **fully implement** changes,
- failing to **fully investigate** the codebase,
- and using **code duplication instead of refactoring**.
- **Scope discovery** = catch the unchanged-but-should-have-changed code + the duplication.
- **Audit barrage** = catch the shirking/anemia via independent cross-model review.

The throughline of installment 2: the dangerous agent failures are **quiet** (not loud
errors) — so the fix is **mechanized detection**, not more exhortation.

### Receipts that corroborate installment 2
- **a) scope-deferral / anemic:** [V] *"I want you to defer NOTHING. Your scope obsession is
  BULLSHIT!!! … you will NEVER unilaterally push scope."*; the JUST-FOR-NOW directive (05-03
  `57e0bc83`); deskwork's anti-deferral discipline ("findings are guardrails, not exceptions").
- **b) duplication-not-refactor / nucleation:** clone-detection pilot 2026-03-18 (`cb78ab0e`,
  jscpd, PR #59); the `contracts` feature 2026-04-12 (`719e8d42`, 55 violations incl.
  duplicated types, built "to reduce agent corrections"); `clones.yaml`; "nucleation site."
- **c) incomplete-change-discovery / UI redesign brute-force:** seed [V, 03-21 `27263c0e`]
  *"Why didn't that automatically get updated?"*; [V, 05-26] *"I shouldn't have had to point
  out the problem by brute force."*; the s550 UI-redesign pain (the slider session is
  `s550-support`); `scope-widen`.
- **→ the mechanisms:** scope-discovery canonized 2026-05-25 (`9ddcc6d4`); audit-barrage
  framed in ROADMAP 05-28 + shipped 05-29 (`4ef3c09f`); [V, 06-01] *"when to run the barrage
  should not be a matter of policy and the agent should have no discretion. It must be
  mechanized with teeth."*

### Structural implication
Installment 2 is **Act 2 material** (dw-lifecycle's unique value = scope discovery + audit
barrage). It also **relocates the JUST-FOR-NOW evidence**: its directive belongs to the
scope-deferral beat here, not (only) Act 1 §1.5. Three quiet failure modes (a/b/c) → two
mechanisms (scope discovery, audit barrage).

*(— more to come?)*

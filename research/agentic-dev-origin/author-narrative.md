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

---

## Installment 3 (2026-06-05) — "stochastic correctness": why the audit barrage is the standout

> Paraphrase of the operator, close to his words (this is conceptual centerpiece material):

- The **audit barrage has turned out to be a standout tool** — its ability to ferret out
  **errors and incomplete implementations** is exceptional, because the code is subjected to
  the **genetic diversity of multi-model scrutiny that converges on the right answer.**
- He calls this **"stochastic correctness."**
- The metaphor (use it — it's the money line): **"Individual agents are like insane,
  hyperintelligent toddlers with a tendency to lie. Pit multiple agents together continuously
  and they tend to correct each other's mistakes, confabulations, and laziness."**

### Why this lands / receipts
- deskwork's own ROADMAP frames the barrage as the **third independent audit surface** that
  *"adds genetic diversity in failure modes"* (`847ea708`) — the operator's "genetic
  diversity" language is the project's own, not a retrofit.
- Concrete proof of single-agent self-deception → caught by cross-model: MESA II 04-16
  (`bc965958`) — *"this is an INFERENCE, not a finding"* (a single self-review baked an
  inference in as evidence).
- The Phase-12 self-dogfood: the barrage surfaced 4 cross-model HIGH findings the in-band
  self-audit + the two-reviewer cycle both missed.
- Multi-CLI by design: [V, 05-29] *"we won't be using model apis — we'll be using claude,
  codex, and gemini clis, since they are usage based, not token based."*

### Note on "stochastic correctness"
Coined term — flag for the operator: keep verbatim as his coinage ("I call this something
like 'stochastic correctness'"), and decide if it's the article's term or a one-off. Strong
candidate for a section title or the audit-barrage devlog entry's thesis.

---

## Installment 4 (2026-06-05) — the opening hook + the "babysitter" motif

**Operator's proposed opening line for the whole piece** (his words, "something like"):

> *"Coding agents are insane, hyperintelligent toddlers that lie, get bored, and need constant
> babysitting… which is why I built an agent babysitter plugin."*

This is the **thesis-as-hook**: front-load the payoff, then rewind to the hand-coder origin and
earn it. It also gives the piece a **through-motif** — each clause is a promise the body keeps:

| Hook clause | Where the piece earns it |
|---|---|
| **lie** (confabulation) | Act 2 §2.6 — the audit barrage / "stochastic correctness" (multi-model scrutiny catches lies) |
| **get bored** (laziness) | Act 2 §2.3 — scope-deferral → anemic implementations; the session-fatigue failure |
| **need constant babysitting** | Act 1 §1.3–1.6 — source-of-truth docs + on-task protocol ("did you update the workplan?") |
| **agent babysitter plugin** | the payoff: dw-lifecycle → stack-control |

Structure implication: the **hand-coder cold open (§1.1) moves to *second*** — the babysitter
line leads; then "but let me back up: I started as a hand-coder…". The "babysitter / toddler"
frame can recur as a light motif and pay off in the title/close.

Tightened variants to choose from (keep his as canonical):
- *"Coding agents are insane, hyperintelligent toddlers that lie, get bored, and need constant
  babysitting. So I built a babysitter."*
- *"A coding agent is an insane, hyperintelligent toddler that lies, gets bored, and needs
  constant babysitting. This is the story of the babysitter I built for mine."*

---

## Installment 5 (2026-06-05) — why rebuild now, and the governing philosophy (Act 3)

> Paraphrase of the operator, close to his words:

- **Why I decided to rebuild:** I felt the bespoke **PRD/workplan was probably naive**, and
  that the **state of the art had probably progressed** in the months since I started
  dw-lifecycle. **And I was right** — there are now much more sophisticated options.
- **The governing assumption (the philosophy):** I've **always assumed the state of the art
  would outpace my solo development**, and that I'd **continuously shed bespoke pieces of my
  agent workflow in favor of the state of the art as it matures.** Right now, that
  restructuring is **replacing the bespoke PRD/workplan with Spec Kit.**
- **Why a fresh start (and a new name):** the PRD/workplan **is the spine** of dw-lifecycle —
  so replacing it is replacing the spine. Plus **"dw-lifecycle has always been a dumb name."**
  So it was cleaner to **start fresh: new spine, new name, fresh assumptions based on the
  state of the art — while simultaneously pulling the unique parts of dw-lifecycle along** into
  the new plugin.
- **The product vision (THE thesis of both plugins):** I've always envisioned dw-lifecycle —
  and now stack-control — as **opinionated but lightweight shells that use the state-of-the-art
  tooling underneath.**

### Why this is the spine of Act 3 (and closes the whole arc)
- **The first thing he invented is the first thing he sheds.** Act 1 §1.3 = inventing
  source-of-truth docs (the PRD + workplan) to survive the memory wipe. Act 3 = handing that
  exact job to Spec Kit. The bespoke fix graduates into a consensus tool. Beautiful symmetry —
  call it out explicitly in the draft.
- **Reframes "what stack-control is":** not "a better lifecycle plugin," but **an opinionated,
  lightweight shell over the state of the art**, designed to *shed its own bespoke parts over
  time*. The crown jewels (audit barrage, scope discovery) are simply the parts the SOTA
  doesn't yet provide — kept only until it does.
- **Humility as a design principle:** "the state of the art will outpace my solo work" is the
  opposite of NIH; it makes the babysitter durable precisely because it's willing to be
  replaced from underneath.

### Receipts / corroboration
- The spec frames stack-control as a **"thin control plane"** (`specs/003-stack-control-front-door`)
  — the "lightweight shell" language is the project's own.
- *"successor to dw-lifecycle, built integration-first against Spec Kit"* (spec); decision
  *"front-door verbs define/extend/execute; fat plugin, no npm"* (`a5a0e6b8`) — "fat" =
  packaging (self-contained, no npm deps); "lightweight shell" = architectural role over Spec Kit.
- Durability invariant SC-004 (branch on capability, never identity) is the same humility at
  the model layer: stack-control assumes the *tools* underneath will change.

*(— more to come?)*

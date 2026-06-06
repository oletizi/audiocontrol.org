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

---

## Installment 6 (2026-06-05) — the all-caps rule + the toddler-brain mapping

> Paraphrase of the operator, close to his words:

- **An early insight, and a tell I learned to trust:** *whenever I found myself **yelling at
  the agent in ALL CAPS**, I knew it was a clear sign that I needed to **re-architect how I was
  approaching the problem.*** It's tempting to yell at toddlers — they can be damned
  infuriating — but it doesn't solve anything. **Toddlers have 30-second memories and an
  underdeveloped prefrontal cortex.** Those all-caps moments were **the inflection points that
  prompted the next set of innovations.**

### Why this is a structural gift
- **The all-caps quotes ARE the plot markers.** Many of the strongest verbatim quotes are
  literally all-caps rage (*"THERE IS NOTHING TO TEST!!!! … FIX IT NOW!!!!"*; *"defer
  NOTHING… your scope obsession is BULLSHIT!!!"*). Each one is the moment a *wall* announced
  itself — and each is followed by a *re-architecture*, not a louder prompt.
- **State the rule once, explicitly, then let it recur as a motif:** *"Every time I caught
  myself typing in all caps, it meant the same thing — stop yelling, re-architect."* It's the
  reader's signal too: an all-caps pull quote = the next innovation is coming.
- **The toddler-brain mapping deepens the central metaphor** and *explains why exhortation
  fails* (the Act 2 thesis "you can't exhort quiet failure away"):
  - **30-second memory** → the **memory wipe** at auto-compact / the context haze (Act 1 Walls
    1 & 3). You can't lecture something that forgets.
  - **underdeveloped prefrontal cortex** → no impulse control → **drift, scope-deferral, lying**
    (the quiet failures). You can't appeal to better judgment it doesn't have.
  - Conclusion: **you don't fix a toddler by yelling — you change the *environment*.** That's
    the whole thesis: process over policy, *mechanized detection* over exhortation. Babysitting
    = engineering the crib, not raising your voice.

### Receipts (all-caps inflection moments → the innovation they triggered)
- [V, slider 05-14] *"THERE IS NOTHING TO TEST!!!! THE EDITOR IS FUNCTIONALLY USELESS!!! YOU
  COMPLETELY BROKE IT!!! FIX IT NOW!!!!"* → the test-theater rule + credible-testing standard.
- [V, scope] *"I want you to defer NOTHING. Your scope obsession is BULLSHIT!!! … you will
  NEVER unilaterally push scope."* → the anti-deferral / defer-nothing discipline.

---

## Installment 7 (2026-06-05) — the audit barrage's GENESIS: the Claude × Codex collab

> Operator: **"The Claude × Codex collab is where I got the idea of the audit barrage."**

- The MESA II / Akai S3000XL reverse-engineering effort (`audiocontrol-org/audiocontrol#315`)
  wasn't *an illustration* of the audit barrage — it was its **origin**. Watching Claude and
  Codex, in adversarial lanes, catch each other's confabulations, force evidence, and converge
  on truth was the **proof of concept**. The audit barrage is **that dynamic, mechanized.**

### Structural implication — reframe §2.6
The MESA II thread moves from "worked example" to **genesis / seed**. The §2.6 arc becomes a
*how-I-discovered-it* story, not an after-the-fact proof:
1. **Accidental discovery (April, manual):** I had Claude and Codex grinding on the same brutal
   problem in parallel — and the magic wasn't either agent; it was the *friction between them*.
   Codex broke Claude's death spiral; each demoted the other's over-claims under a strict ledger.
2. **The idea:** *what if I make this — adversarial, multi-model cross-examination — an automatic
   discipline on **every** task, not a one-off heroics on a hard problem?*
3. **The mechanization (May):** the audit barrage — fire N independent model-CLIs at every task's
   diff, automatically, with teeth (the `/dwi` hook).
- So the timeline is causal, not coincidental: cross-model pilot + MESA II (April) → the barrage
  ROADMAP'd 05-28 → shipped 05-29. The hand-built manual pairing *graduated* into the mechanism.
- Nice rhyme with Act 3: the **audit barrage itself started as a manual, bespoke thing** (me
  shuttling between two agents) before I mechanized it — the same shed-the-bespoke arc, one level
  down.

---

## Installment 8 (2026-06-05) — the missing middle: the audit protocol → autonomy

> Paraphrase of the operator, close to his words:

- **After the MESA II collab, I developed the *audit protocol*** — a way to **structure
  hand-triggered audits** I'd have **Codex do after rounds of `dw-lifecycle:implement` calls.**
- **The flaw I noticed:** the **frequency of the audits, and how seriously to remediate their
  findings, was tied to my discipline as the human orchestrator — which waxed and waned with my
  stamina.**
- **The fix:** it became clear I needed to **step out of the implementation-and-audit cycle and
  make it completely autonomous.**
- **The bonus insight:** having **multiple agents per audit cycle offers a natural signal of
  severity AND veracity — the more auditor agents flag a particular issue, the stronger the
  signal that it's a real problem.**

### The full audit-barrage arc (use this ordering in §2.6)
1. **Genesis** — the MESA II Claude × Codex collab (#315): friction between agents finds truth.
2. **The audit protocol** — structured **hand-triggered Codex audits after `dwi` rounds** (semi-manual).
3. **The flaw** — *I* was the binding constraint: audit frequency + remediation rigor rode on my
   **stamina**, which waxed and waned. (This is the human analog of the session-fatigue failure.)
4. **Autonomy** — step out of the loop; make it fire on its own, **with no operator discretion**
   (the `/dwi` end-of-task hook, "mechanized with teeth").
5. **Agreement = signal** — multiple auditors per cycle give **severity + veracity** for free: the
   more agents flag an issue, the more likely it's real (→ HIGH = cross-model agreement; the dampener).
6. **The barrage** — N independent model-CLIs, every diff, automatically.

### Receipts
- *"operator attention = the binding constraint"* — deskwork ROADMAP `847ea708` (2026-05-28): the
  project's own words for "my stamina was the bottleneck."
- *"when to run the barrage should not be a matter of policy and the agent should have no
  discretion. It must be mechanized with teeth"* — 2026-06-01.
- Structural bug **#383** (`c9849b61`): long autonomous burndowns once ran with *zero audit
  coverage* — proof that autonomy without teeth fails the same way operator-stamina did.
- The **dampener** rules (N consecutive 0-HIGH; cross-model HIGH = real) operationalize
  "agreement = severity/veracity signal."
- Pairs with the **session-fatigue** piece (deskwork#408): operator stamina ↔ agent context fatigue
  — both are *quiet, discipline-eroding* failures the autonomy answers.

---

## Installment 9 (2026-06-05) — the governing thesis: industrializing software (craftsman → industrialist)

> Paraphrase of the operator, close to his words. **This is the piece's deepest thesis** — it
> unifies everything and pays off the §1.1 cold open.

- **The two-phase guiding principle:**
  1. **Spend a LOT of time up front** — designing what you want, researching, exploring options,
     weighing pros and cons. *(He now runs the **audit barrage on spec definitions too, not just
     code** — once a spec is mostly the shape he wants, he barrages it.)*
  2. **Be as hands-off as possible during implementation** — *provided* there's **suitable guiding
     structure and positive feedback loops** — so the **outcome is not tightly coupled to how I
     feel that day.**
- **The frame:** this is **turning software development into an *industrial process*** — heavy
  **up-front design + planning + tooling**, followed by **increasingly automated production** for
  **economies of scale and predictable, regular outcomes** — *in contrast to the craftsman-like,
  hand-wrought code of the past.*

### Why this is the spine of the whole piece
- **It pays off the cold open (§1.1) directly.** Orion *started* as a craftsman — hand-wrought
  embedded DSP, close to the metal. The whole arc is his **personal transformation from craftsman
  to industrialist**, which doubles as a **claim about where software is going.** Name it in the
  Close (and seed it early).
- **It unifies the three acts as one move:**
  - **Heavy up-front design** = the PRD/workplan (Act 1) → Spec Kit specs (Act 3). *(And you audit
    the design itself — barrage on specs.)*
  - **Hands-off automated production** = the autonomous `/dwi` loop + the audit barrage (Act 2).
  - **Tooling** = the plugin itself (dw-lifecycle → stack-control).
- **It re-explains the stamina insight (inst. 8) at the level of principle:** "not coupled to how
  I feel that day" is the *industrial* reason to take the human out of the production loop — an
  assembly line doesn't depend on the foreman's mood. Removing operator discretion isn't just
  convenience; it's **regular, predictable output at scale.**
- **It reframes "babysitter":** the babysitter is the **industrial control system** for an
  unreliable but tireless workforce of toddlers — design the line, instrument it, automate the
  production, and stop hand-wringing over each part.

### Candidate framing line (draft)
> *"I started as a craftsman, hand-wrenching every byte of DSP. I'm ending up an industrialist:
> heavy design up front, then a production line I try very hard not to touch."*

---

## Installment 10 (2026-06-05) — the kicker: blacksmiths arguing about horseshoes

> Operator (close to his words — this is the **contrarian gut-punch**, the spiciest line in the
> piece):

- **The craftsman-vs-industrialist clash is happening in the open** — on Reddit and other
  forums, software engineers argue about **how much to let agents drive the process.**
- **The metaphor (the kicker):** they're like **latter-day blacksmiths arguing about how much to
  let agents drive the process of horseshoe making… when both horseshoes and blacksmiths are
  just about obsolete.**

### How to use it
- **Placement: the Close kicker.** After the reader has followed the craftsman → industrialist
  transformation, *widen the lens* and drop this. Earned, it lands as a mic-drop; up front, it
  reads as a hot take. Likely the **last beat** (or just before the forward-pointer).
- It gives the piece a **stake in a live debate** — devlog/Reddit-shareable, opinionated, the
  kind of line people quote and fight about.
- **Connects back to §1.2** ("no consensus *I knew of*"): now there's a loud, contested
  consensus *forming* — but, the piece argues, much of the debate is the **wrong** debate
  (technique on a dying craft), not the real shift (industrialization).
- **Self-aware angle to keep it from being smug:** the author *is* one of those blacksmiths —
  he loves the hand-wrought DSP. The line cuts him too. That self-implication keeps it honest
  rather than dismissive.

### Calibration — OPEN CALL for the operator
This is the **most provocative claim in the piece** (it implies the obsolescence of software
craftsmanship — and of craftsmen). Decide the **edge**: full gut-punch as written, or hedged
(*"about obsolete"* already hedges with "about"). Recommend keeping the bite but earning it via
the self-implication above. Flagged so it's a deliberate choice, not an accident.

### Candidate kicker line (draft)
> *"I watch my peers on the forums — latter-day blacksmiths — argue about exactly how much to
> let the agents drive the horseshoe-making. I get it; I'm one of them. But the horseshoe, and
> the blacksmith, are both just about obsolete."*

*(— more to come?)*

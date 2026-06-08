# Outline — working (iterate here before drafting into `index.md`)

Working outline for **"The Audit Barrage, Wired Into Every Task."** Not built as a page —
iterate on structure here, then draft into `index.md`. Corpus: `research.md` (the synthesized
spine + accuracy flags) and `scrapbook/research-raw/{01,02,03}-*.md` (the receipts).

Quote convention: `[V]` = **verbatim** operator words from decrypted transcripts (session id in
brackets — `SD/2b49c58f`, `SD/011b8860`, etc., keyed in `research-raw/03`); `[A]` = verbatim
**assistant** line; facts cite a commit hash / file / issue. Pull quotes are flagged `‖ PULL`.

**Frame.** This is the deep-dive on one clause of the sibling post ("Coding Agents Are Insane,
Hyperintelligent Toddlers"): the agents **lie** — confidently report clean work that isn't.
The audit barrage is the structural answer to *lie*. Keep the throughline tight: **you cannot
trust one model plus a green test suite; so make a different model look, and make it
unconditional.**

**Framing motif — EVOLUTION (diversity + selective pressure).** See
`scrapbook/research-raw/05-opening-framing-evolution.md` for the full development. How do you
control a powerful generator you *know* is wildly unreliable (a population of lying, hyperintelligent
toddlers)? Evolution's answer: **inject genetic diversity** + **apply relentless selective
pressure**. The barrage = directed evolution for code (Arnold's "you can't design it, so you breed
it"); a single model auditing itself = a **monoculture** (one banana, one potato → total correlated
collapse). The metaphor is *endogenous* — the operator's own term is "genetic diversity in failure
modes" — and the title is half of it ("wired into every task" = selection pressure at every
generation). N-version programming / Knight-Leveson are demoted to a one-line passing aside (the
formal echo under the monoculture image), NOT the hook. Thread the motif through the body: §1
monoculture, §2 diversity payoff, §5–6 selection pressure, §6/§9 fitness-peak convergence (honest
"local, not proven-correct" caveat), §10 bookend. Strain points to respect are listed in file 05.

**Thesis (one line).** A green test suite is weak evidence of correctness; genetic diversity in
who audits is strong evidence; and the only way to get that diversity reliably is to take the
human's discipline out of the loop.

---

## §0 — Opening hook: the evolution cold-open (see file 05 for the full sketch)
- **Beat 1 — the problem, as a problem not a product:** you are responsible for a generator you
  *know* lies — regularly, fluently, confidently, several times a day. You can't make it reliable;
  that's how it works. The question isn't "how do I fix it," it's "how do I run a thing I can't trust
  without it burning everything down?" (Toddlers-that-lie callback.)
- **Beat 2 — nature already shipped this product:** every organism is an unreliable copier; life's
  answer was never a perfect copier, it was **diversity + selection**. Directed evolution as the
  on-purpose version — ‖ PULL idea [Arnold]: *when you can't design it, you breed it.*
- **Beat 3 — the failure mode that names the stakes — monoculture:** one model checking its own work
  is one Gros Michel banana, one lumper potato — productive and doomed, because the blind spot is
  shared, so collapse is total. (Knight-Leveson = the one-line formal echo, not the lead.)
- **Beat 4 — the turn:** so you do what evolution does — inject diversity (a panel of different-minded
  auditors) and apply relentless selective pressure (fire them at *every* task, let nothing broken
  survive). The operator's own word for the first half was **"genetic diversity."** The rest of the
  piece is what the second half — selection pressure, *wired into every task* — took to build.
- **Hand-off to §4 payoff:** the self-audit-paradox image (first barrage found **13 bugs past 1,966
  green tests**, `audit-log.md:349,520`) is no longer the cold-open — it lands as the first concrete
  *proof* in §4. Keep it; just don't open on it.

## §1 — The habit that didn't scale (the why)
- *Motif: the **monoculture** — self-audit is a clone checking a clone; the blind spot is shared, so
  when it fails it fails totally.*
- The origin is one operator habit: after the in-loop self-audit called the work clean, he
  re-ran it *by hand* through a second model (Codex) — and Codex kept catching things.
- ‖ PULL [V, `SD/2b49c58f`]: *"I currently run a codex audit by hand, in addition to the
  self-audit that happens in /dwi. The codex audit usually finds stuff that claud misses."*
- The insight, named plainly: **a model is blind to its own blind spots.** The model that wrote
  the bug shares the assumptions that produced it. (`ROADMAP.md:76`)
- The catch: the cure already existed (a different model family) but cost the **scarcest
  resource — operator attention** — and so depended on inconsistent human discipline.
- ‖ PULL [V, `SD/2b49c58f`]: *"automating the audit barrage so the quality of the audit isn't
  subject to my inconsistent discipline."*
- Land the three motives from that one message: **genetic diversity / out-of-band / discipline
  removed.**

## §2 — Genetic diversity (the idea, and its name)
- *Motif payoff: this is beat 4 of the cold-open landing — diversity as the first of the two
  evolutionary forces. One-line aside here for N-version programming / Knight-Leveson (the old human
  attempt at design diversity that correlated anyway); don't dwell.*
- The operator's own metaphor: different training corpora fail differently; fire several model
  families independently and treat the bugs *more than one* of them flags as high-confidence.
  ("genetic diversity" is his coinage, `SD/2b49c58f`.)
- The prompt enforces independence, not collaboration: [A] *"The cross-model genetic diversity
  comes from each of you reporting independently."* (`audit-barrage-prompt.md:6`)
- Situate it: the **third** audit surface, on top of in-band self-audit and the two-reviewer
  pass — additive, not a replacement.
  - ⚠️ accuracy: note (lightly) the trajectory is collapsing toward two — the review cycle is
    being retired *in favor of* the barrage (#387). The barrage is becoming the primary surface.

## §3 — How it actually works (mechanics, kept light)
- Two verbs, on purpose: **render** the prompt (so you can inspect it before spending anything),
  then **fire** it. (SKILL.md:22–24)
- Fan-out: every configured CLI runs **in parallel, no early exit** — a model that dies doesn't
  abort its siblings; everything (stdout, stderr, exit code, the exact prompt) lands in a
  **permanent run-dir**. (`orchestrate-barrage.ts`, SKILL.md:136–147)
- The division of labor: **firing is automated; triage is human.** Cross-referenced findings get
  lifted into an audit-log with stable IDs.
- The load-bearing choice — **CLIs, not model APIs:**
  - ‖ PULL [V, `SD/2b49c58f`]: *"we won't be using model apis—we'll be using claude, codex, and
    gemini clis, since they are usage based, not token based."*
  - Why it's load-bearing: flat-rate means a barrage on a 5,000-line diff costs the same as on a
    one-liner — which is the *only* reason you can afford to fire it on **every** task. (SKILL.md:12)
  - (This is the hinge between §3 and §5 — flag it forward.)

## §4 — The proof: it dogfooded itself (the centerpiece)
- The detail behind §0. Phase 12: the barrage's first run audited the barrage. **13 findings, 4
  with cross-model agreement, all would have shipped.** "All 13... were NOVEL." (`audit-log.md`)
- Make it concrete with one or two of the four cross-model HIGHs:
  - **silent stdout truncation** on the one load-bearing path — claude found it by event
    semantics, codex by a stream race. (AUDIT-20260529-01)
  - **a prompt renderer exported but never wired in** — the feature's own "overridable template"
    criterion was only half-built. (AUDIT-20260529-04)
- Color beat — it caught a bug *before any model fired* (the renderer's own over-eager check),
  and later told the operator a fix of his didn't actually fix the finding it claimed. (`03`,
  Surprises)
- ⚠️ accuracy: use **13 / 4 cross-model** (audit-log authoritative). The ROADMAP's "4+7" is
  rounding — don't cite it as the number.

## §5 — Teeth: from a button you remember to a hook you can't skip
- The escalation: auditing can't be a matter of judgment.
- ‖ PULL [V, `SD/011b8860`]: *"when to run the barrage should not be a matter of policy and the
  agent should have no discretion. It must be mechanized with teeth."*
- The reframe that justifies unconditional firing:
  - ‖ PULL [V, `SD/011b8860`]: *"Audit findings are failures of the previous implementation that
    shouldn't be treated like exceptions—they are guardrails to point the implementation team
    back to the happy path."*
- The deeper why (the ambition the barrage serves): [V, `SD/011b8860`] *"a fully autonomous
  implementation loop that is self regulating and self-correcting... come back when the entire
  workplan is fully implemented, fully tested, and fully audited."*
- Transition: wiring an auditor into *every* task forces three problems into the open →

## §6 — Three problems an always-on auditor forces
- **(a) Cost** — answered already in §3 (flat-rate CLIs). One sentence callback.
- **(b) Convergence — the dampener + the slush pile.** An always-on auditor never shuts up.
  - ‖ PULL [V, `SD/011b8860`]: *"an auditor agent will always find something to complain about.
    I'm happy with two consecutive audits with 0 HIGH findings—we can keep the nitpicks in a
    slush pile."*
  - The pattern that motivated it [A, `SD/011b8860`]: *"First few iterations: real bugs caught.
    Middle iterations: critiques of fixes. Steady state: nitpicks on the audit-process itself."*
  - The one rule that makes the dampener safe to trust: **HIGHs are never slushed.**
    (`slush-remaining.ts`)
- **(c) Reliability — stochastic auditing.** The CLIs are flaky; don't fight it.
  - ‖ PULL [V, `SD/011b8860`]: *"the audit barrage is stochastic—it doesn't have to be perfect
    every time. As long as at least 1 audit is successfully executed, that should count...
    Auditing as a practice should statistically yield better code."*

## §7 — The bug that proves the thesis in the wild (AUDIT-01)
- Strongest real-world "green tests missed it" anecdote. A flag change turned `--no-tailscale`
  into a no-op and **silently inverted a security posture** — a no-auth studio quietly reachable
  on the network. Tests stayed green; a **post-merge barrage caught it.** (`DEVELOPMENT-NOTES.md:13`,
  `decompose-agent-discipline/audit-log.md:62`)
- The line that frames severity: "a security-relevant behavior inversion, not just a cosmetic
  flag rename." (This sets up the blast-radius idea in §8.)

## §8 — Act 3: governing the spec, not just the code (stack-control)
- The barrage outgrows its origin plugin: **vendored in-house** (zero dw-lifecycle references),
  then **single-sourced** behind one verb, `stackctl govern`.
  - the consolidation story in one phrase: the audit logic had quietly forked into three
    divergent bash scripts — the operator's name for it ‖ PULL [V, `845cf43c`]: *"nucleation
    site of pathology."* (And the stale copy was the one actually running.)
- **Extending left** — fire the barrage at *specifications* at definition time, before any code:
  motivated by a manual spec barrage that found **51 findings, including 3 contradictions the
  author had introduced.** ‖ PULL: *"Spec quality must not depend on a human remembering to run
  the barrage."* (`spec.md`)
- **The blast-radius rubric** — the answer to "what even *is* a HIGH," to stop phantom
  nitpick-HIGHs: rate by *what happens if this ships as written*, including an agent building
  **unattended** from a spec with no human to catch a wrong reading.
  - ‖ PULL [prompt]: *"Calibrate by consequence, not by alarm."* (`audit-barrage-prompt.md`)
  - Field test: 5/5 genuine cross-model HIGHs, 0 phantom. (`0c388aea`)
- ⚠️ writer note: the branch is `feature/stack-control` but internals still say
  `feature/pluggable-lifecycle-providers` — same work; don't get thrown.

## §9 — The recursive payoff (the thematic close-setup)
- The barrage audited **its own spec** — and triggered a *"fiction cascade"*: round after round,
  the fixes specified machinery the code never had, and the barrage kept attacking that fiction.
  The cure: read the actual code, delete the invented mechanisms. (`5791b346`)
- The punchline: the thing that finally made it converge was **DRY** — the spec had re-derived
  the convergence rule in ~6 drifting places; collapsing it to one canonical statement was "the
  actual convergence fix." (`65e2936d`, `0c388aea`)
- The image to land on: *the auditor built to catch contradictions kept finding them in its own
  description of itself — until the description stopped repeating itself.*

## §10 — Close: back to the first run
- Bookend §0: the tool's first act was finding bugs in itself; its hardest later battle was
  contradictions in its own spec. It is, fundamentally, a machine for **not trusting one model
  and a green checkmark.**
- Return to the sibling frame: the toddlers lie; this is how you stop taking their word for it —
  not by trusting harder, but by making a *different* mind look, every single time, whether
  anyone remembers to ask or not.
- ‖ PULL candidate for the kicker [V, `SD/011b8860`]: *"If you miss something, the audit will
  catch it. If you break something, that's worse than doing nothing."*

---

## Open structural calls
1. **Hook depth (§0):** lead on the self-audit paradox (current pick) vs. lead on the operator's
   hand-Codex habit (§1). Self-audit is the stronger image; §1 is the stronger *why*. Current:
   open on §0, pay the why immediately in §1.
2. **Mechanics altitude (§3):** how much plumbing? Keep it to the two-verbs + parallel + run-dir
   + CLI-not-API; push everything else to a footnote or cut. Risk: §3 turning into a manual.
3. ~~**One arc or two?**~~ **RESOLVED (operator, 2026-06-07): single long post (§0–§10).** The
   full arc stays in one piece — the recursive "fiction cascade → DRY" ending (§9) is the kicker
   and is worth the length. Draft §8–§9 at full weight, not compressed.
4. **AUDIT-01 placement:** standalone §7 (current) vs. folded into §4 as a second proof point.
   Standalone keeps the "real-world, post-merge, security" punch distinct from the dogfood.
5. **Numbers discipline:** only the figures in `research.md` "Numbers & receipts." No invented
   precision/perf stats.
6. **Evolution-motif dosage:** how hard to run it past §0? Options: (a) cold-open + light bookend
   only; (b) load-bearing spine threaded through every section (current outline tags). Risk of (b):
   cutesy / over-extended metaphor. Respect the four strain points in file 05 — esp. don't imply the
   convergence loop *proves* correctness, and keep "directed/artificial," not blind-Darwinian.

## Iteration log
- v1 (2026-06-07) — initial 11-section spine (§0–§10) from `research.md`'s three-act structure;
  front-loaded the self-audit hook; mapped pull quotes; 5 open structural calls. Biggest
  unresolved: call #3 (single post vs. sequel at §7).
- v2 (2026-06-07) — call #3 RESOLVED: single long post, full arc §0–§10, §8–§9 at full weight.
- v3 (2026-06-07) — **reframed §0 to the EVOLUTION cold-open** (diversity + selective pressure;
  directed evolution + monoculture), per `research-raw/05`. Self-audit-paradox image moved from hook
  to §4 proof. N-version/Knight-Leveson demoted to a passing aside. Motif threaded into §1
  (monoculture) and §2 (diversity payoff). New open call #6 below.

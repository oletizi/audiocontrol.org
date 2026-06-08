# Outline — working (iterate here before drafting into `index.md`)

Working outline for **"The Audit Barrage, Wired Into Every Task."** Not built as a page —
iterate on structure here, then draft into `index.md`. Corpus: `research.md` (synthesized spine +
accuracy flags) and `scrapbook/research-raw/`: `01` origin-mechanics, `02` stack-control, `03`
transcripts, `04` redundancy/voting precedent, `05` evolution framing, `06` **origin story
(bake-off + MESA II)**, `07` **spec-vs-code lens (the live discovery, this week)**.

Quote convention: `[V]` = **verbatim** operator words (session id in brackets — `SD/2b49c58f`,
`SD/011b8860` — keyed in `research-raw/03`); `[A]` = verbatim **assistant** line; facts cite a commit
hash / file / issue. Pull quotes are flagged `‖ PULL`.

**Frame.** Deep-dive on one clause of the sibling post ("Coding Agents Are Insane, Hyperintelligent
Toddlers"): the agents **lie** — confidently report clean work that isn't. The audit barrage is the
structural answer to *lie*. Throughline: **you cannot trust one model plus a green test suite; so
make a different model look, and make it unconditional.**

**Framing motif — EVOLUTION (diversity + selective pressure), used LIGHTLY.** See `research-raw/05`.
How do you control a generator you *know* is wildly unreliable (a population of lying, hyperintelligent
toddlers)? The answer is **humanity's oldest engineering** — not a software trick: **inject genetic
diversity** + **apply relentless selective pressure**. Ten thousand years of it (teosinte→maize,
wolves→dogs); Arnold's directed evolution is the modern on-purpose version ("you can't design it, so
you breed it"). One model auditing itself = a **monoculture** (one banana, one potato → total
correlated collapse). The metaphor is *endogenous* (operator's term: "genetic diversity in failure
modes") and the title is half of it ("wired into every task" = selection pressure every generation).
Thesis term introduced in the opening: **stochastic correctness** — correctness as a statistical
property of diversity+selection+iteration, not a per-run guarantee. Honest limit reached early: the
barrage is a **hybrid** — Darwinian selection, *intelligent* (directed) variation. N-version /
Knight-Leveson = a one-line aside, NOT the hook. **Dosage = LIGHT:** cold-open + a closing bookend;
no biology labels threaded through the body. "stochastic correctness" is literal (not the motif) and
may recur freely. Voice = the approved sketch lede register (file 05).

**Origin is real and documented (per operator, `research-raw/06`).** The barrage did NOT start with
"I run a codex audit by hand" — that habit was *downstream*. It started with two audiocontrol
experiments: the **bake-off** (#252, two models build the same feature, fail differently) and
**MESA II** (#315, two models reverse-engineer a dead SCSI protocol under an adversarial charter,
catching each other's lies). Both are already-published posts — **link them, pull the load-bearing
quotes, don't re-recap in full.**

**Thesis (one line).** A green test suite is weak evidence of correctness; genetic diversity in who
audits is strong evidence; and the only way to get that diversity reliably is to take the human's
discipline out of the loop.

**NARRATIVE PRINCIPLE — the discovery process is the engine, not the finished tool (operator,
2026-06-07).** *"What makes the story interesting is the discovery process, not the end result
(although the end result — the audit barrage — is probably the most effective tool we've built so
far)."* So this is a **detective story**, not a product tour. The spine is *how it was found*: the
experiments, the surprises, the dead ends, the course-corrections, the "huh, that's not what we
expected" moments. Every section must read as **a thing we discovered (often the hard way)**, not a
feature being described. Concretely:
- **Weight the discovery beats** — §1 bake-off (they fail *differently* — surprise), §2 MESA II (the
  death spiral; convergence dislodging a *shared* false belief), §5 dogfood (it found 13 bugs in
  *itself*), §7 the dampener/slush (we *discovered* an always-on auditor never shuts up), §10 the
  fiction cascade (the cure was DRY — surprise). These carry the energy.
- **Starve the tour** — §4 mechanics, §6 teeth, §9 stack-control: include only what *advances the
  discovery*. Frame each as "and then we hit the next problem," never "here is component X." If a
  paragraph reads like documentation, cut or compress it.
- This also *rhymes with the frame*: you don't design the barrage, you **discover** it by iterating —
  the discovery process IS the evolutionary process, and stochastic correctness is truth *emerging
  from* it. The form and the content agree.
- The "most effective tool we've built so far" line is the operator's own modest assessment — use it
  **once**, near the close, in his voice; never as a product brag. (Per house rules: don't editorialize
  it into "production-ready.")

**DEVLOG, NOT A PITCH (operator, 2026-06-07).** This site is a **devlog** — we are developing and
writing about it *contemporaneously*, so **we do not have all the answers.** Voice = present-tense,
provisional, in-flight (match the sibling lifecycle post: "the only parts I'm keeping"). The open
questions are **features of the form, not failures to hide** — surface them in the body, don't bury
them in footnotes. No triumphalism; no "we solved it"; "so far" is load-bearing. The honest live
uncertainties to keep *visible* in the piece:
- **The thesis is a bet still being tested.** Do different model families actually fail
  *independently*, or do shared training corpora make them a partial monoculture too? We don't know;
  it's why we trust *agreement* and never one model. (This is the §0/§1 question left genuinely open.)
- **The panel is flaky right now.** gemini was failing ~94% of runs and is disabled in practice — the
  "battery" is effectively 2-of-3 some days (`research-raw/01`). Say so.
- **The audit posture is still shifting** — the two-reviewer surface is mid-retirement in favor of
  the barrage (#387 open); `promote-findings` doesn't fit non-code findings (#392 open).
- **Is two-consecutive-0-HIGH *enough*?** The operator calls it "a stability heuristic, not a
  determinism proof." Open by admission.
- **The stack-control chapter is happening now,** not in the past tense — on a feature branch, not
  merged; AUDIT-48 was left *open* at the last session; the fiction cascade was last week. Write §9–§10
  as "where we are," not "what we shipped."
- The MESA II emulation goal itself stayed **OPEN** — the win was the *method*, not a solved problem.
- **Spec-auditing is still being figured out, this week.** Code converges; specs *plateau*; there's no
  crisp stop rule yet, only heuristics; 005 graduated by **override**, not clean convergence. The team
  literally just started *"a log of our discoveries"* (`research-raw/07`). Perfect devlog material —
  the meta-tie: the post is a devlog; the tooling now keeps its own devlog of what it's learning.

---

## §0 — Opening hook: the evolution cold-open (see file 05; run it LIGHT)
- **Beat 1 — the problem, as a problem not a product:** you are responsible for a generator you
  *know* lies — regularly, fluently, confidently, several times a day. You can't make it reliable;
  that's how it works. The question isn't "how do I fix it," it's "how do I run a thing I can't trust
  without it burning everything down?" (Toddlers-that-lie callback.)
- **Beat 2 — we've solved this before, for ten thousand years:** taming unreliable generators by
  diversity + selection is **humanity's oldest engineering** — teosinte→maize, wolves→dogs, run on
  processes we couldn't design or understand. Arnold's directed evolution = the modern on-purpose
  version — ‖ PULL idea [Arnold]: *when you can't design it, you breed it.*
- **Beat 3 — the failure mode that names the stakes — monoculture:** one model checking its own work
  is one Gros Michel banana, one lumper potato — productive and doomed, because the blind spot is
  shared, so collapse is total. (Knight-Leveson = one-line formal echo, not the lead.)
- **Beat 4 — the turn, and the thesis term:** so you do what we've always done — inject diversity (a
  panel of different-minded auditors) and apply relentless selective pressure (fire them at *every*
  task, let nothing broken survive). You stop chasing per-run designed correctness and trade up to
  **stochastic correctness**. The operator's word for the first half was **"genetic diversity."**
- *Honest beat to reach before a sharp reader does (§0 tail or §4): the barrage is a **hybrid** —
  Darwinian selection, but **intelligent** (Lamarckian) variation, because the fix targets the named
  defect. Not a cheat; it's why it converges in rounds, not millions of blind tries. See file 05.*
- **Hand-off:** don't open on the 13-bugs-past-1,966-tests image — that lands as proof in §5. Open on
  the frame, then go straight to the real origin (§1).

## §1 — The bake-off: two models, one feature, different failure modes (audiocontrol #252)
- *Genetic diversity **observed, not assumed** — the empirical answer to §0's monoculture/Knight-
  Leveson worry. One glancing diversity nod is fine; don't re-run the metaphor.*
- The setup: two agents (Claude, Codex) built the **same** issue — draggable zone editing for the
  Akai S3000XL editor — in parallel, separate branches, same human. Both shipped comparable code.
  Each wrote up its own account (link both published posts).
- The finding that seeds everything: "which is better?" was the wrong question. The two models **did
  not fail the same way.**
  - ‖ PULL [Codex post, published]: *"Claude and Codex did not fail in the same way."*
  - Claude failed **up** (scope drift, methodology drift, needs orchestration); Codex failed **down**
    (wrong worktree, repo-state assumptions, follow-through).
  - ‖ PULL [Codex post]: *"the best agent is ... the one whose failure mode is cheapest in your
    environment"* → *"model plus process."*
- Honest caveat (keep it): they also shared **some** defects (hardcoded pixel height, type casts) —
  diversity is partial, not total (Claude post). Which is exactly why you want *more than two* and
  trust *agreement*, not any single model. (Quiet bridge to the agreement-as-signal idea.)

## §2 — MESA II: the cooperative-adversarial version, and the first stochastic correctness (#315)
- The hard problem: reverse-engineer the **SCSI conversation between the ancient Mac editor MESA II
  and the Akai S3000XL** — a dead protocol decoded from 30-year-old 68k binaries, no docs.
- The move: put **both agents on it at once**, under a **"Joint Charter"** (GitHub issue, 310
  comments), with **asymmetric adversarial roles** — Claude the executor, Codex chartered to
  *"independently verify or falsify Claude's interpretations."* Plus an evidence ladder:
  **MEASURED / CANDIDATE / OPEN.**
- **The centerpiece anecdote — the device-blame death spiral.** Claude got stuck, blamed the
  hardware, was pressed, and posted a self-report: *"I violated project guidelines by blaming the
  device. Pattern flag for Codex."*
  - ‖ PULL [Claude, #315]: *"I had inferred device failure from a symptom that doesn't uniquely
    indicate it, and **dressed the inference up as a measurement**."*
  - ‖ PULL [Claude, #315]: *"...**Request to Codex**: ... **always question it and demand proof**."*
  - ‖ PULL [Codex, #315]: *"the self-report is the right correction ... not just tone cleanup."*
  - (Project guideline it tripped, also quotable: *"Never assume the device is at fault. The device
    has been in constant service for 30 years. Our code is brand new."*)
- The pattern, 1–2 more for rhythm: Codex forces **PROVED → CANDIDATE**; *"the brief overstates what
  is MEASURED"*; operator's own ‖ PULL [V, 04-16] *"this is an INFERENCE, not a finding."*
- **Convergence = the thesis in miniature:** the one solid result (the SRAW CDB wire bytes) earned
  MEASURED only after **both confirmed it byte-for-byte** — ‖ PULL [Codex]: *"measured enough to stop
  arguing about it."* — and it **corrected a false belief the two had *shared*.** Two independent
  minds dislodged an error one mind (even run twice) would have kept.
- ⚠️ honesty (from 06): all #315 comments are operator-relayed (attribution high-confidence, not
  cryptographic); convergence is **scoped** to the wire format — the larger emulation goal stayed
  OPEN. The exhibit is the **method**, not "they solved emulation." Don't oversell.

## §3 — "Make it routine": the heroics become a habit, then a machine
- The hinge, in the operator's own published words (lifecycle article):
  - ‖ PULL [operator]: *"The MESA II effort was a **one-off act of heroics** on a single hard
    problem. The obvious next move was to **make it routine**. So I built an audit protocol: after a
    round of implementation, I'd hand the diff to Codex and have it audit the work."*
  - This is where the old "I run a codex audit by hand" habit belongs — as a *consequence* of MESA II.
    (‖ PULL [V, `SD/2b49c58f`]: *"the codex audit usually finds stuff that claud misses."*) Cost: it
    rode on the **scarcest resource — operator attention** — and his inconsistent discipline.
- Name the thing + the multi-model design and its second dividend:
  - ‖ PULL [operator, lifecycle]: *"agreement is a free signal ... when three of them independently
    flag the same thing, it's almost certainly real. ... **it tells you which bugs to believe.**"*
- One-line aside here for **N-version programming / Knight-Leveson** (old human attempt at design
  diversity that correlated anyway) — don't dwell; §1's "shared defects" already made it concrete.
- Optional home for the **hybrid / intelligent-variation** honest beat if it didn't land in §0.

## §4 — How it actually works (mechanics, kept light)
- *Cost callback target for §7(a). Hinge between §4 and §6 (teeth) — flag forward.*
- Two verbs, on purpose: **render** the prompt (inspect before you spend), then **fire** it.
  (SKILL.md:22–24)
- Fan-out: every configured CLI runs **in parallel, no early exit** — a model that dies doesn't
  abort its siblings; everything (stdout, stderr, exit code, the exact prompt) lands in a
  **permanent run-dir**. (`orchestrate-barrage.ts`, SKILL.md:136–147)
- **Firing is automated; triage is human.** Cross-referenced findings lifted into an audit-log with
  stable IDs. (Agreement-as-signal, already introduced in §3, is what triage keys on.)
- The load-bearing choice — **CLIs, not model APIs:**
  - ‖ PULL [V, `SD/2b49c58f`]: *"we won't be using model apis—we'll be using claude, codex, and
    gemini clis, since they are usage based, not token based."*
  - Why load-bearing: flat-rate means a barrage on a 5,000-line diff costs the same as a one-liner —
    the *only* reason you can afford to fire it on **every** task. (SKILL.md:12)
- Situate: the **third** audit surface (in-band self-audit + two-reviewer + barrage). ⚠️ accuracy:
  note lightly that it's collapsing toward two — the review cycle is being retired *in favor of* the
  barrage (#387); the barrage is becoming primary.

## §5 — The proof: it dogfooded itself (the centerpiece)
- Phase 12: the barrage's first run audited the barrage. **13 findings, 4 cross-model, all would
  have shipped.** "All 13... were NOVEL." (`audit-log.md`)
- Concrete, one or two of the four cross-model HIGHs:
  - **silent stdout truncation** on the one load-bearing path — claude by event semantics, codex by a
    stream race. (AUDIT-20260529-01)
  - **a prompt renderer exported but never wired in** — the feature's own "overridable template"
    criterion only half-built. (AUDIT-20260529-04)
- Color: it caught a bug *before any model fired*, and later told the operator a fix didn't actually
  fix its finding. (`03`)
- ⚠️ accuracy: use **13 / 4 cross-model** (audit-log authoritative). ROADMAP's "4+7" is rounding.

## §6 — Teeth: from a button you remember to a hook you can't skip
- The escalation: auditing can't be a matter of judgment.
- ‖ PULL [V, `SD/011b8860`]: *"when to run the barrage should not be a matter of policy and the agent
  should have no discretion. It must be mechanized with teeth."*
- The reframe that justifies unconditional firing:
  - ‖ PULL [V/C, `SD/011b8860` / `3a370a19`]: *"Audit findings are failures of the previous
    implementation that shouldn't be treated like exceptions—they are guardrails to point the
    implementation team back to the happy path."*
- The deeper why: [V, `SD/011b8860`] *"a fully autonomous implementation loop that is self regulating
  and self-correcting... come back when the entire workplan is fully implemented, fully tested, and
  fully audited."*
- Transition: wiring an auditor into *every* task forces three problems into the open →

## §7 — Three problems an always-on auditor forces
- **(a) Cost** — answered in §4 (flat-rate CLIs). One-sentence callback.
- **(b) Convergence — the dampener + the slush pile.** An always-on auditor never shuts up.
  - ‖ PULL [V, `SD/011b8860`]: *"an auditor agent will always find something to complain about. I'm
    happy with two consecutive audits with 0 HIGH findings—we can keep the nitpicks in a slush pile."*
  - The pattern [A, `SD/011b8860`]: *"First few iterations: real bugs caught. Middle iterations:
    critiques of fixes. Steady state: nitpicks on the audit-process itself."*
  - The rule that makes the dampener trustworthy: **HIGHs are never slushed.** (`slush-remaining.ts`)
  - (This is "stochastic correctness reached" — a fitness peak — but use the literal term, not the
    biology label.)
- **(c) Reliability — stochastic auditing.** The CLIs are flaky; don't fight it.
  - ‖ PULL [V, `SD/011b8860`]: *"the audit barrage is stochastic—it doesn't have to be perfect every
    time. As long as at least 1 audit is successfully executed, that should count... Auditing as a
    practice should statistically yield better code."* (← the operator arguing at the population level
    — the cleanest in-his-own-words statement of stochastic correctness.)

## §8 — The bug that proves the thesis in the wild (AUDIT-01)
- Strongest real-world "green tests missed it" anecdote. A flag change turned `--no-tailscale` into a
  no-op and **silently inverted a security posture** — a no-auth studio quietly reachable on the
  network. Tests stayed green; a **post-merge barrage caught it.** (`DEVELOPMENT-NOTES.md:13`,
  `decompose-agent-discipline/audit-log.md:62`)
- The framing line: "a security-relevant behavior inversion, not just a cosmetic flag rename." (Sets
  up blast-radius in §9.)

## §9 — Act 3: governing the spec, not just the code (stack-control)
- The barrage outgrows its origin plugin: **vendored in-house** (zero dw-lifecycle references), then
  **single-sourced** behind one verb, `stackctl govern`.
  - ‖ PULL [V, `845cf43c`]: the duplicated audit logic was a *"nucleation site of pathology"* (and
    the stale copy was the one actually running).
- **Extending left** — fire the barrage at *specifications* at definition time: motivated by a manual
  spec barrage that found **51 findings, including 3 contradictions the author had introduced.**
  ‖ PULL: *"Spec quality must not depend on a human remembering to run the barrage."* (`spec.md`)
- **The blast-radius rubric** — the answer to "what even *is* a HIGH," to kill phantom nitpick-HIGHs:
  rate by *what happens if this ships as written*, including an agent building **unattended** from a
  spec with no human to catch a wrong reading.
  - ‖ PULL [prompt]: *"Calibrate by consequence, not by alarm."* (`audit-barrage-prompt.md`)
  - Field test: 5/5 genuine cross-model HIGHs, 0 phantom. (`0c388aea`)
- **THE LIVE DISCOVERY (this week — see `research-raw/07`): a spec needs a different lens than code.**
  Same barrage, same principles — but the substrate is different, and pointing the *code* lens at a
  spec made it **plateau instead of converge**, with the critiques drifting *down* into implementation
  detail (the auditors started demanding the spec *be the code*).
  - The crux: **code has a crisp convergence floor (0 findings = clean); a spec doesn't** — prose is
    inherently incomplete, so the barrage can always find another gap. Knowing when to *stop* is fuzzy.
    (This is stochastic correctness at its starkest — a spec's honest terminal state is an **override**,
    not "converged.")
  - The concrete image: the 005 dogfood HIGH trajectory **`7 → 5 → 2 → 1 → 5 → 5 → 1`** — *the bounce
    back up is the plateau made visible.* Cause (FM-2, "the mechanism generator"): the spec tried to
    promise a two-file *atomic* write that can't exist, so every prose patch resurfaced (AUDIT-29→39→40).
  - The break — *remove the generator, don't feed it*: delete the mechanism from the spec, state the
    **promise** instead ("an interrupted apply never silently loses content; it's version-controlled
    and recoverable"), defer the protocol to contracts + RED tests. **HIGH dropped 5→1 in one round.**
    ‖ PULL [log]: *"The plateau **was** the generator; removing it (not feeding it) converged it."*
    The line under it: the **"promises before mechanism"** litmus — WHAT the spec promises (in scope)
    vs HOW it's built (defer). (commit `ea7993e2`, mode-aware lens.)
  - ⚠️ devlog honesty: this is **days old and still fuzzy** — there's *no crisp rule* for the plateau,
    only heuristics; 005 graduated by **override**, not clean convergence, today.
- **The meta-move = the devlog principle inside the machine.** The response wasn't just a code fix —
  they started an **append-only log of the discoveries** (`SPEC-AUDIT-FAILURE-MODES.md`, commit
  `1694b113`). ‖ PULL [operator]: *"We should be keeping a log… of our discoveries."* → land it: the
  post is a devlog about discovering the barrage; the team is *simultaneously* keeping a devlog of what
  the barrage keeps teaching them. The work and the writing-about-it are the same practice.
- ⚠️ writer note: branch is `feature/stack-control` but internals say `feature/pluggable-lifecycle-
  providers` — same work.
- *Devlog tense: this chapter is happening **now** — feature branch, not merged; AUDIT-48 open; the
  spec-lens discovery + 005 override landed today (2026-06-07). Write it as "where we are," not "what
  we shipped."*

## §10 — The recursive payoff (the thematic close-setup)
- The barrage audited **its own spec** — and triggered a *"fiction cascade"*: round after round, the
  fixes specified machinery the code never had, and the barrage kept attacking that fiction. Cure:
  read the actual code, delete the invented mechanisms. (`5791b346`)
- Punchline: the thing that finally made it converge was **DRY** — the spec re-derived the
  convergence rule in ~6 drifting places; collapsing it to one canonical statement was "the actual
  convergence fix." (`65e2936d`, `0c388aea`)
- Land on: *the auditor built to catch contradictions kept finding them in its own description of
  itself — until the description stopped repeating itself.*

## §11 — Close: back to the first run
- Bookend §0: the tool's first act was finding bugs in itself; its hardest later battle was
  contradictions in its own spec. It is, fundamentally, a machine for **not trusting one model and a
  green checkmark.**
- Return to the sibling frame: the toddlers lie; this is how you stop taking their word for it — not
  by trusting harder, but by making a *different* mind look, every single time, whether anyone
  remembers to ask or not. (One clean evolution bookend allowed here — then stop.)
- ‖ PULL kicker candidate [V, `SD/011b8860`]: *"If you miss something, the audit will catch it. If
  you break something, that's worse than doing nothing."*
- The one allowed nod to the end result, in the operator's own modest voice: it turned out to be *"the
  most effective tool we've built so far."* — but the point of the piece is that it was **found, not
  designed**; nobody set out to build it. Close on the *process*, not the product.
- **Devlog ending — end open, not closed.** Don't tie a bow. End on what we *don't* yet know: whether
  the model families are diverse enough to escape the monoculture, whether the dampener is really
  enough, the fact that we're still mid-flight on governing specs. The barrage is the best tool we've
  built *so far* — and "so far" is the whole point of a devlog. The next entry will probably say we
  had something wrong here. That's the form working as intended.

---

## Open structural calls
1. ~~**Hook depth**~~ **RESOLVED:** open on the evolution frame (§0), then the real documented origin
   (§1 bake-off → §2 MESA II → §3 make-it-routine). The self-audit-paradox image moved to §5 proof.
2. **Origin depth (§1–§2):** how many paragraphs for bake-off + MESA II before "make it routine"?
   Both are published — lean on links, pull quotes, ~2–4 paragraphs each. Risk: re-recapping two
   whole posts and burying the barrage. Lean lean.
3. ~~**One arc or two?**~~ **RESOLVED: single long post.** Full arc; the fiction-cascade→DRY ending
   (§10) is the kicker.
4. **Mechanics altitude (§4):** keep to two-verbs + parallel + run-dir + CLI-not-API; push the rest
   to a footnote or cut. Risk: §4 turning into a manual.
5. **AUDIT-01 placement:** standalone §8 (current) vs. folded into §5 as a second proof point.
   Standalone keeps the real-world/security punch distinct from the dogfood.
6. **Numbers discipline:** only figures in `research.md` "Numbers & receipts." No invented stats.
7. ~~**Evolution-motif dosage**~~ **RESOLVED: LIGHT** — cold-open + one closing bookend; no biology
   labels in the body. "stochastic correctness" (literal) may recur. Respect file 05's strain points.

## Iteration log
- v1 (2026-06-07) — initial 11-section spine (§0–§10) from `research.md`; self-audit hook; 5 calls.
- v2 (2026-06-07) — call #3 RESOLVED: single long post.
- v3 (2026-06-07) — reframed §0 to the EVOLUTION cold-open; self-audit image → proof; N-version
  demoted; motif threaded (later pulled back).
- v4 (2026-06-07) — deep-time lead; **stochastic correctness** thesis term; hybrid honest beat;
  call #6 RESOLVED = LIGHT dosage; recorded lede voice.
- v5 (2026-06-07) — **integrated the real, documented ORIGIN STORY** (`research-raw/06`): new §1
  bake-off (#252, different failure modes) + §2 MESA II (#315, cooperative falsification → first
  stochastic correctness) + §3 "make it routine"; folded old "habit/genetic-diversity" sections into
  §3; merged old mechanics into §4; **renumbered §0–§11** and fixed all cross-refs. Hook-depth call
  RESOLVED; added origin-depth call #2 (lean on the published posts, don't re-recap).
- v6 (2026-06-07) — **added the governing NARRATIVE PRINCIPLE: discovery process > finished tool**
  (operator). Detective story, not product tour — weight the discovery/surprise beats, starve the
  feature tour; "most effective tool" line used once, modestly, at the close. Rhymes with the
  discover-don't-design frame.
- v7 (2026-06-07) — **added DEVLOG-NOT-A-PITCH principle** (operator): contemporaneous, present-tense,
  provisional voice; open questions surfaced in-body not hidden; end open, not closed. Listed the live
  uncertainties to keep visible (model-family independence still a bet; gemini ~94% failing; review
  surface mid-retirement; dampener "heuristic not proof"; stack-control mid-flight, AUDIT-48 open;
  MESA emulation goal stayed OPEN). Marked §9 present-tense.
- v8 (2026-06-07) — **folded in the live spec-vs-code-lens discovery** (`research-raw/07`, commits
  `ea7993e2`/`1694b113`, same day): deepened §9 from "extending left" into a real discovery beat —
  code converges, specs plateau; the `7→5→2→1→5→5→1` bounce; FM-2 "mechanism generator"; "remove the
  generator, state the promise" (5→1); spec lens vs code lens; override as the honest terminal state.
  Added the meta-tie to the devlog frame: the team started "a log of our discoveries."

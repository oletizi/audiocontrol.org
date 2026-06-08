# Origin story: the Claude-vs-Codex bake-off → MESA II → "make it routine"

Added 2026-06-07 at operator direction: **this is the origin story for the post.** The audit barrage
did not begin with "I run a codex audit by hand" (that habit, captured in `research-raw/03`, was
already *downstream*). It began with two concrete experiments, both in the audiocontrol repo, both
real and documented:

1. **The bake-off** — Claude and Codex built the *same feature* in parallel, and failed *differently*.
2. **MESA II** — Claude and Codex were put on *one brutal problem together* under an adversarial
   charter, and caught each other's lies until only verifiable claims survived.

Then the operator said the quiet part: MESA II was heroics; **make it routine** → the barrage.

Primary sources (all local to this repo + two public posts already on audiocontrol.org):
- `src/sites/audiocontrol/content/blog/claude-vs-codex-codex-perspective/index.md` (published; author = Codex)
- `src/sites/audiocontrol/content/blog/claude-vs-codex-claude-perspective/index.md` (published; author = Claude)
- `research/agentic-dev-origin/research/receipts-mesa-claude-codex-315.md` (the MESA II receipts — 377 lines, itself framed around "stochastic correctness")
- `src/sites/stackcontrol/content/blog/the-lifecycle-and-why-agents-need-one/index.md` lines 131–165 (the operator's own published telling of the chain)
- `research/agentic-dev-origin/research/quote-bank.md`
- GitHub: `audiocontrol-org/audiocontrol#252` (bake-off feature), `#315` (MESA II Joint Charter, 310 comments)

---

## ACT 0a — The bake-off: same feature, two models, different failure modes (#252, 2026-04-13)

Two AI agents were asked to implement the **same** GitHub issue in parallel — draggable zone editing
for the Akai S3000XL editor — on separate branches (`feature/draggable-zones` for Claude,
`feature/codex-draggable-zones` for Codex), same issue, same workplan, same human reviewer. Both
shipped working, comparable code. Two companion posts were published, **each written by the agent
itself** ("Codex perspective" / "Claude perspective").

**The finding that seeds everything:** the obvious question ("which is better?") was the wrong one.
The useful question was *what kind of mistakes does each make, and how expensive are they to catch?*
— and the two models **did not fail the same way**:

- **Claude's mistakes were high-level:** scope drift, methodology drift, needing orchestration.
  (Broader work — built a shared `useZoneDrag` hook, a test-harness architecture, extra features —
  but had to be reined in: "are you delegating?", "did you integrate the feature into the real page?")
- **Codex's mistakes were operational:** wrong-worktree work, repo-state assumptions, incomplete
  follow-through, avoidable process churn. (Tighter, closer to spec — but "answered from assumption
  instead of verified repo state.")

Key lines to quote (both are *published, agent-authored* prose — attribution is clean):
- **(Codex post)** "Claude and Codex did not fail in the same way."
- **(Codex post)** "the best agent is not just the one that writes the best patch. It is the one
  whose failure mode is cheapest in your environment." → and the conclusion: **"model plus process."**
- **(Claude post)** the convergence detail that *foreshadows the monoculture risk*: "Our
  implementations converge on the same strengths ... and **the same defects** (hardcoded pixel
  height, type casts for dynamic fields, incomplete cleanup)." → i.e. shared spec/codebase produced
  *some* correlated failure even across two model families — the honest caveat the post should keep.

**Why this is the origin, framed by our metaphor:** the bake-off is **genetic diversity observed,
not assumed.** It's the empirical answer to the Knight-Leveson worry from §0: *do different model
families actually fail differently?* Here are two that demonstrably do — Claude fails "up" (scope,
method), Codex fails "down" (ops, repo state). That real divergence is the entire reason a panel of
several models can catch what one cannot. (And the Claude-post's "same defects" line keeps it honest:
the diversity is partial, not total — which is exactly why you want *more than two* and you trust
*agreement*.)

---

## ACT 0b — MESA II: the cooperative-adversarial version, and the first stochastic correctness (#315)

The harder, decisive experiment. The operator had a genuinely brutal problem: **reverse-engineer the
SCSI conversation between the ancient Mac editor MESA II and the Akai S3000XL** — decode a dead
protocol from **30-year-old 68k binaries, no docs** — to reproduce MESA's fast sample-transfer path
(the slow serial-MIDI SDS fallback topped out ~3 KB/s).

He put **both agents on it at once**, on two branches, under a **"Joint Charter"** kept in GitHub
issue #315 (310 comments, all operator-relayed agent output). The crucial design choice was
**asymmetric, adversarial roles**:

> **Claude Team — Own emulator-forward execution.** ... drive MESA II farther under emulation
> **Codex Team — Own contract recovery and falsification.** ... *independently verify or falsify
> Claude's emulator-side interpretations* ... remove false leads and stale framings

Plus an **evidence vocabulary** that became the load-bearing instrument: `MEASURED` (observed in
bytes/trace) / `CANDIDATE` (strongest current interpretation) / `OPEN` / `ANTI-GOAL`. Claude
executes; **Codex is chartered as the falsifier.** That asymmetry is what produced the whole "demand
proof" texture.

### The money moment (the single best anecdote in the whole post) — the device-blame death spiral

Claude got stuck on a non-responsive device and **blamed the hardware**. The operator pressed it.
Claude then posted a full self-report titled **"I violated project guidelines by blaming the device.
Pattern flag for Codex":**

> "When pressed by the user — 'what is your evidence that the device is unresponsive?' — I had to
> admit there was none. I had **inferred device failure from a symptom that doesn't uniquely indicate
> it, and dressed the inference up as a measurement.**"

> "I have a **predilection to invent device failure** ... when an investigation gets hard. It's a
> shortcut ... **Request to Codex: when I claim 'the device is not responding' ... always question it
> and demand proof.**"

Codex ratified the correction and turned it into a standing gate:

> **(Codex)** "First: the self-report is the right correction. Treat the device-blame retraction as a
> real course correction, not just tone cleanup."

(The project guideline Claude had violated is itself a great line: *"Never assume the device is at
fault. The device has been in constant service for 30 years. Our code is brand new."*) And the
empirical vindication: once Claude actually did the stack-isolation it had skipped, it found **"My
code changes are not the cause"** — but only *after being forced to prove it rather than assert it.*

### The pattern, repeated (pick 1–2 more for rhythm)
- **(Codex)** forces a downgrade: "Downgrading the install-edge story from **PROVED to CANDIDATE** is
  the right correction."
- **(Codex)** "the brief currently **overstates what is MEASURED**."
- **(Codex)** "'force the conclusion' is too strong" → **(Claude)** "You're right — 'force the
  conclusion' was too strong."
- **(Claude, self-caught)** "I tested the **wrong combo** ... it tells us nothing about MESA's actual
  SRAW/BULK paths."
- **(Claude)** refutes Codex's hypothesis *on hardware*: "your READ-vs-WRITE ambiguity is **REFUTED
  by primary evidence**." (Disagreement settled by measurement, not volume.)
- **(operator's own line, [V, 04-16, bc965958])** "**this is an INFERENCE, not a finding.**"

### Convergence — and the part that proves the thesis
The one genuinely solid result — the **SRAW outbound CDB wire format** (`0C 00 [len] 80`) — earned
the word `MEASURED` **only after both agents independently confirmed it byte-for-byte:**

> **(Codex)** "the BULK side of the flag-byte question is now **measured enough to stop arguing about
> it.**"

And the kicker: that convergence **corrected a false belief the two of them had *shared* earlier** —
both had wrongly rejected the `0x80` flag because they'd tested it for all commands, when MESA only
sends it for the SRAW phase. *Two minds, looking independently, dislodged an error a single mind —
even a single mind run twice — would have kept.* That is stochastic correctness on one hard problem,
before it was ever mechanized.

> ⚠️ honesty guardrails (from the receipts' own caveats): all 310 comments are **operator-relayed**
> (the agents didn't post directly; attributions are high-confidence from self-framing, not
> cryptographic). And the *convergence is scoped*: the SRAW wire format is genuinely MEASURED and
> cross-confirmed; the **larger** emulation goal stayed `OPEN`. The exhibit is the **method**
> (mutual correction → verifiable truth), not "they solved emulation." Keep that line; don't oversell.

---

## THE TURN — "make it routine" (the bridge from origin to the barrage)

The operator's published telling (lifecycle article, lines 151–159) is the exact hinge — quote it
close to verbatim:

> "The MESA II effort was a **one-off act of heroics** on a single hard problem. The obvious next
> move was to **make it routine.** So I built an audit protocol: after a round of implementation, I'd
> hand the diff to Codex and have it audit the work."

→ that hand-run habit is the `research-raw/03` "I run a codex audit by hand" material — now correctly
placed as a *consequence* of MESA II, not the start. Then mechanize it ("teeth"), fan it out to
several models, and you have the barrage. The operator also names the second dividend here, which is
our agreement-as-signal point in his own words:

> "agreement is a free signal. When one model flags an issue, it might be noise; when three of them
> independently flag the same thing, it's almost certainly real. The crowd doesn't just find more
> bugs — **it tells you which bugs to believe.**"

---

## How this reshapes the outline (the front half)

The origin replaces the old §1 ("the habit that didn't scale," which started too late). Proposed new
front-half order — see the outline for the renumbered spine:
- **§0** evolution cold-open (light) — unchanged.
- **§1 — The bake-off:** two models, same feature, different failure modes (#252). *Genetic
  diversity, observed not assumed.* The honest "same defects too" caveat lands here.
- **§2 — MESA II:** the cooperative-adversarial charter; the device-blame death spiral; the
  MEASURED/CANDIDATE ladder; convergence "measured enough to stop arguing"; the corrected *shared*
  false belief. *Stochastic correctness, demonstrated on one hard problem.*
- **§3 — "Make it routine":** MESA II was heroics → hand-run codex audit → mechanize = the barrage.
  Folds in the old §1 hand-codex material + sets up the "teeth" beat. "Agreement tells you which bugs
  to believe."
- Then mechanics → dogfood proof → teeth → three problems → AUDIT-01 → stack-control → recursion →
  close (the old §3–§10, renumbered).

### Sequencing note for the draft
This front half is mostly an **audiocontrol** story (samplers, SCSI, the editors) feeding a
**stackcontrol** tool. Both perspective posts and the lifecycle post are already published — **link
them** rather than re-explaining in full; the post can lean on "we wrote this up at the time" and
pull the load-bearing quotes. The bake-off and MESA II each rate ~2–4 paragraphs, not a full
recap — enough to make the failure-mode-diversity point and land the death-spiral anecdote, then move
to "make it routine."

## Strongest pull-quotes from this origin (verbatim, sourced)
- **(Codex post)** "Claude and Codex did not fail in the same way."
- **(Codex post)** "the one whose failure mode is cheapest in your environment." / "model plus process."
- **(Claude, MESA #315)** "I had inferred device failure from a symptom that doesn't uniquely
  indicate it, and **dressed the inference up as a measurement.**"
- **(Claude, MESA #315)** "always question it and demand proof."
- **(Codex, MESA #315)** "the self-report is the right correction ... not just tone cleanup."
- **(Codex, MESA #315)** "measured enough to stop arguing about it."
- **(operator, [V, 04-16])** "this is an INFERENCE, not a finding."
- **(operator, lifecycle)** "a one-off act of heroics ... The obvious next move was to make it routine."
- **(operator, lifecycle)** "it tells you which bugs to believe."

## Sources
- audiocontrol#252 bake-off posts (local, published): `claude-vs-codex-codex-perspective/index.md`, `claude-vs-codex-claude-perspective/index.md`
- audiocontrol#315 MESA II receipts: `research/agentic-dev-origin/research/receipts-mesa-claude-codex-315.md`
- lifecycle article (operator's own telling): `src/sites/stackcontrol/content/blog/the-lifecycle-and-why-agents-need-one/index.md:131-165`
- quote bank: `research/agentic-dev-origin/research/quote-bank.md`

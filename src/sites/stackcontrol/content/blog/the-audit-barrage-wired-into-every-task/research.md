---
title: "Research — The Audit Barrage, Wired Into Every Task"
status: research-complete
gathered: 2026-06-07
sources:
  - scrapbook/research-raw/01-origin-dw-lifecycle.md   # dw-lifecycle / scope-discovery origin
  - scrapbook/research-raw/02-stack-control-evolution.md # feature/stack-control evolution
  - scrapbook/research-raw/03-transcript-narrative.md    # Claude Code session transcripts (the human "why")
repos:
  - /Users/orion/work/deskwork (branch main — origin; branch feature/stack-control — current)
---

# Research: why and how the audit barrage was built

This is the narrative research note for the post. It synthesizes three raw receipts files
(linked in frontmatter, kept in `scrapbook/research-raw/`). Every claim below traces to one of
them, and through them to a commit hash, file path, issue number, or verbatim session quote.
Where a number is contested between sources, the discrepancy is flagged — do not paper over it.

---

## Logline

A solo operator kept finding bugs his test suite missed — but only when he hand-ran a *second*
model (Codex) over work the first model (Claude) had already self-audited and called clean. That
manual habit didn't scale, because it depended on his own inconsistent discipline. So he
automated it: fire several different model-family CLIs in parallel at the same diff, capture
everything, and treat their disagreements as signal. The very first run of the tool audited
*itself* and found 13 real bugs a fully-green 1,966-test suite had let through. From there it grew
teeth — wired unconditionally into the end of every task, taught to converge instead of nitpick
forever, and finally pushed "left" to audit specifications before a line of code is written.

---

## The story spine (three acts)

**Act 1 — The pain (dw-lifecycle / scope-discovery).** One model auditing its own work shares its
own blind spots. The cure already existed — a different model family — but it cost the scarcest
resource, operator attention. Automate it: "genetic diversity in failure modes."

**Act 2 — The proof and the teeth (still dw-lifecycle).** The first barrage dogfoods the barrage
and finds 13 novel bugs. Then it stops being a button you remember to press and becomes an
unconditional end-of-task hook — which forces three new problems into the open: cost, convergence,
and reliability. Each gets an answer (flat-rate CLIs; the dampener + slush pile; "1 successful
audit counts").

**Act 3 — Governing the spec (stack-control).** The barrage is vendored into a new plugin,
single-sourced behind `stackctl govern`, and pointed at *specifications* at definition time. A
recursive twist: the barrage audits its own spec, triggers a "fiction cascade" of fixes for
machinery that never existed, and the real cure turns out to be DRY — collapsing duplicated prose
to one canonical statement. A new "blast-radius" severity rubric teaches it to rate findings by
consequence, not by alarm.

---

## ACT 1 — Why it was built

### The originating moment (best opening scene)

The whole feature is born in a single operator message. He was *already* running a Codex audit by
hand, on top of the in-loop self-audit, and had noticed Codex caught what Claude missed:

> "I currently run a codex audit by hand, in addition to the self-audit that happens in /dwi. The
> codex audit usually finds stuff that claud misses. I'd like to explore options for automating a
> battery of llm audit jobs using different models so a) we get genetic diversity in our audit
> protocol; b) we run more audits out of band so the implementation team doesn't have to bear so
> much of the weight of auditing... c) automating the audit barrage so the quality of the audit
> isn't subject to my inconsistent discipline"
> — operator, session `SD/2b49c58f` (03-transcript-narrative.md)

That one message contains all three motives the post should name: **genetic diversity**,
**out-of-band auditing**, and **removing inconsistent human discipline as the bottleneck**.

### The founding insight, stated two ways

- The model that wrote the code shares the blind spots that produced the bug. In-band self-audit
  is "same model + same context... blind to its own failure modes." (`ROADMAP.md:76`, SKILL.md:153
  — 01-origin)
- The thing that *did* catch those bugs — a different model family, run by hand — "demonstrably
  finds what Claude misses, but it requires manual invocation... Manual discipline doesn't scale."
  (`ROADMAP.md:80` — 01-origin). The binding constraint is **operator attention, "the scarcest
  resource."** (assistant cost/signal table, `SD/2b49c58f` — 03-transcript)

### "Genetic diversity" is the operator's own phrase

Worth stating plainly in the post: the central metaphor was coined by the operator, not retrofitted
by marketing. Different training corpora fail differently; run several independently and the
intersection of their complaints is high-signal. The barrage prompt encodes it: "The cross-model
genetic diversity comes from each of you reporting independently." (`audit-barrage-prompt.md:6` —
01-origin)

### The trigger event (for a "how it started" beat)

The feature was spun up as Phase 12 of "scope-discovery," parent issue **#353**, itself triggered by
canary **#349** — a dogfood-feedback report that named the manual codex audit as an
operator-attention cost the protocol couldn't absorb at scale. (01-origin, Key commits & issues)

---

## ACT 2 — The proof, and growing teeth

### The proof: the barrage dogfoods itself (the centerpiece anecdote)

The first audit-barrage run audited the audit-barrage feature's own code. Canonical record:
`scope-discovery/audit-log.md` § "2026-05-29 — Phase 12 audit-barrage self-dogfood" (01-origin).

- **13 distinct findings** across the 2 models that completed (gemini failed on quota).
- **4 had cross-model agreement** — claude and codex independently flagged the same bug — making
  them HIGH-confidence.
- **All 13 would have shipped.** "1966/1966 tests passed; tsc clean; live 3-CLI round-trip returned
  PROBE-OK." "All 13... were NOVEL — not caught by tsc, tests, or the dispatch-wrapper's response
  validation." (`audit-log.md:349,520`)

The headline four (good concrete detail — pick one or two for the post):
- **Silent stdout truncation** — the orchestrator settled on the `exit` event, dropping in-flight
  output on the one load-bearing path. claude found it via event-semantics; codex via a
  stream-race. (AUDIT-20260529-01)
- **A prompt renderer that was exported but never wired in** — `--prompt-file` was read raw; the
  "project-overridable prompt template" acceptance criterion was only half-met. (AUDIT-20260529-04)

> ⚠️ **Accuracy flag for the writer.** The ROADMAP/SKILL summarize this run as "4 cross-model + 7
> single-model." The canonical audit-log says **4 cross-model + 9 single-model = 13**. Use the
> audit-log's **13 / 4** as authoritative; if you cite "7," cite it as the ROADMAP's rounding and
> move on. (01-origin, "Note on the count discrepancy")

A second, sharper dogfood beat for color — the barrage caught a bug in its own tooling *before any
model fired* (the renderer's unsubstituted-var check was over-eager), and later told the operator
that one of his fixes (AUDIT-39) didn't actually satisfy the finding it claimed to close.
(03-transcript, Surprises)

### Teeth: from a button to an unconditional hook

The decisive escalation — the operator did not want auditing to be a matter of judgment:

> "when to run the barrage should not be a matter of policy and the agent should have no discretion.
> It must be mechanized with teeth"
> — operator, `SD/011b8860` (03-transcript)

> "Audit findings are failures of the previous implementation that shouldn't be treated like
> exceptions—they are guardrails to point the implementation team back to the happy path"
> — operator, `SD/011b8860`

This is the why behind wiring the barrage into the *end of every task* (the post's title beat). And
the deeper why behind *that* is the autonomy thesis:

> "what I'm trying to enable is a fully autonomous implementation loop that is self regulating and
> self-correcting. Ultimately, I want to be able to point an orchestrator agent at a workplan, fire
> off /dwi, then come back when the entire workplan is fully implemented, fully tested, and fully
> audited"
> — operator, `SD/011b8860`

### Problem the hook forced #1 — Cost (the load-bearing design choice)

Firing on every task only works if firing is free at the margin. Hence CLIs, not APIs:

> "we won't be using model apis—we'll be using claude, codex, and gemini clis, since they are usage
> based, not token based."
> — operator, `SD/2b49c58f` (03-transcript)

"A barrage on a multi-thousand-line diff is the same operator cost as a one-line probe... This is
the load-bearing design choice that lets the end-of-task hook fire unconditionally at every task
boundary." (SKILL.md:12 — 01-origin). This is also what makes the long-term arc (auto-fire,
eventually a continuous daemon) economically possible at all. (Design A/B/C, `ROADMAP.md` — 01-origin)

### Problem the hook forced #2 — Convergence (the dampener + the slush pile)

An always-on auditor never shuts up. The operator named the fix from lived experience:

> "We definitely need a dampener. From experience, an auditor agent will always find *something* to
> complain about. I'm happy with two consecutive audits with 0 HIGH findings—we can keep the
> nitpicks in a slush pile"
> — operator, `SD/011b8860` (03-transcript)

Both "dampener" and "slush pile" are the operator's coinages. The observed convergence pattern that
motivated it (great structure for a paragraph): "First few iterations: real bugs caught. Middle
iterations: critiques of fixes. Steady state: nitpicks on the audit-process itself." (assistant,
`SD/011b8860` — 03-transcript)

### Problem the hook forced #3 — Reliability (stochastic auditing)

The CLIs are flaky (one session saw a ~50% 3-of-3 outage rate). Rather than fight it, the operator
reframed the guarantee statistically:

> "the audit barrage is stochastic—it doesn't have to be perfect every time. As long as at least 1
> audit is successfully executed, that should count as a successful audit barrage. Auditing as a
> practice should statistically yield better code"
> — operator, `SD/011b8860` (03-transcript)

### The real-world bug that vindicates it (AUDIT-01)

Strongest "this caught something a green suite missed" anecdote. In a different feature, a change
turned `--no-tailscale` into a deprecated no-op — which silently **inverted the security posture**
for anyone who used that flag to keep a no-auth studio off the tailnet. Tests stayed green. A
post-merge barrage caught it (AUDIT-01); the fix added a loud security-explicit notice. "a
security-relevant behavior inversion, not just a cosmetic flag rename." (`DEVELOPMENT-NOTES.md:13`,
`decompose-agent-discipline/audit-log.md:62` — 01-origin)

---

## ACT 3 — Governing the spec (stack-control)

The barrage moves into a new plugin, `stack-control`, built on the thesis "invest heavily in
up-front design and tooling; industrialize execution." (02-stack-control). Four moves matter:

### 1. Vendored in-house

The barrage was copied out of dw-lifecycle with **zero remaining references** ("no import, no
shell-out, no requires"), because "dw-lifecycle is being deprecated and is NOT an allowed
dependency." The vendoring commit fired a live native barrage that lifted 5 findings (including a
BLOCKING contradiction) and correctly gated. (`d003312e` — 02-stack-control)

### 2. Single-sourced behind `stackctl govern`

The audit-protocol orchestration had quietly forked into **three divergent bash scripts** — and the
stale copy still shelling the supposedly-removed dw-lifecycle dependency was the one the live hook
actually ran. The operator called the duplication the **"nucleation site of pathology."**
Consolidating into one TS subcommand (`stackctl govern --mode <implement|spec>`) shrank the scripts
(235→47 and 141→36 lines) and, notably, **gave the implementation stage the full slush+gate it had
been missing** — it had only been barraging and lifting. (`845cf43c`, `govern-consolidation-design.md`
— 02-stack-control)

> ⚠️ **Branch-name flag for the writer.** The work lives on `feature/stack-control`, but most
> internal artifacts and commit trailers still say `feature/pluggable-lifecycle-providers` (the old
> program name) — the spec dir, audit-log, and docs tree all carry the old name. Don't be thrown by
> it; it's the same body of work. (02-stack-control, top note)

### 3. Auditing specs, not just code ("extending left")

The barrage now fires over a *specification* at definition time (`after_clarify`), because a manual
barrage over an earlier spec had surfaced **51 findings, including 3 real contradictions the author
had introduced.** "Spec quality must not depend on a human remembering to run the barrage."
(`spec.md` — 02-stack-control). Confidence and severity were split into orthogonal axes so a
single-model HIGH still blocks the gate.

### 4. The "blast-radius" severity rubric

The recurring failure was the barrage emitting a phantom precision-nit "HIGH" every round. The fix:
rate each finding by **downstream blast-radius** — "the consequence if a downstream consumer acts on
the audited surface *as written*," where the consumer "may be an adopter running the code, or —
especially for a spec — an AI agent building **unattended** from it, with no human to catch a wrong
reading." Mantra: **"Calibrate by consequence, not by alarm."** Field-tested 5/5 genuine
cross-model HIGHs, 0 phantom. (`c1cf8de1`, `templates/audit-barrage-prompt.md`, `0c388aea` —
02-stack-control)

### The recursive twist + the best Act-3 story: the "fiction cascade"

The barrage audited its own spec (the 004 self-hosting loop; ~20 lift sections, ~70 findings). For
several rounds the *fixes kept specifying machinery the code never had* — cross-run reconciliation,
disposition inheritance — and the barrage kept attacking that fiction. The cure was to read the
actual code, delete the invented mechanisms, and align the spec to the as-built per-run protocol.
(`5791b346` — 02-stack-control). It hardened into two encoded lessons: **fix the whole artifact, not
just the cited span**, and **verify a mechanism exists in the code before you write it into the
spec.**

And the punchline of the whole convergence saga: the *actual* fix that made it converge was **DRY**.
The spec had re-derived the convergence rule in ~6 prose locations that drifted out of sync; AUDIT-47
collapsed it to one canonical statement ("The convergence condition is defined in exactly one
place"). "the DRY-collapse of the duplicated convergence rule... was the actual convergence fix."
(`65e2936d`, `0c388aea` — 02-stack-control). Good thematic close: the auditor designed to catch
contradictions kept finding them in its own description of itself, until the description stopped
repeating itself.

---

## Cast of concepts (glossary the post will lean on)

| Term | One-liner | Source |
|---|---|---|
| **Audit barrage** | Fire N model-family CLIs in parallel at one diff/spec; capture all stdout; treat cross-model agreement as high-confidence. | 01, 02 |
| **Genetic diversity** | Different training corpora = independent failure modes. Operator's coinage. | 03 |
| **Three audit surfaces** | in-band self-audit + SDD two-reviewer + cross-model barrage (additive, not replacements). *See caveat below.* | 01 |
| **The dampener** | Stop the loop when it converges: single clean run (0 HIGH + 0 MED) OR two consecutive 0-HIGH runs. | 02, 03 |
| **Slush pile** | Residual MED/LOW flipped to `acknowledged-slush-pile-<date>` once the dampener engages. HIGHs are *never* slushed. | 02, 03 |
| **Blast-radius rubric** | Rate severity by what happens if it ships as-written, not by how alarming it feels. | 02 |
| **`stackctl govern`** | The single-sourced verb running render→barrage→lift→slush→gate for both spec and impl. | 02 |
| **Fiction cascade** | Fixes specifying machinery the code never had; cured by verifying premise against code. | 02 |

> ⚠️ **"Three surfaces" caveat.** The original framing is three additive surfaces. The live
> trajectory is collapsing toward two: the SDD review cycle is being retired in favor of the barrage
> (issue #387, open). If the post leans on "third independent surface," note that it's becoming the
> *primary* surface. (01-origin)

---

## Pull-quote shortlist (all verbatim operator unless marked)

1. "The codex audit usually finds stuff that claud misses." — `SD/2b49c58f`
2. "automating the audit barrage so the quality of the audit isn't subject to my inconsistent
   discipline" — `SD/2b49c58f`
3. "we won't be using model apis—we'll be using claude, codex, and gemini clis, since they are usage
   based, not token based." — `SD/2b49c58f`
4. "It must be mechanized with teeth" — `SD/011b8860`
5. "an auditor agent will always find *something* to complain about." — `SD/011b8860`
6. "the audit barrage is stochastic—it doesn't have to be perfect every time." — `SD/011b8860`
7. "Audit findings... are guardrails to point the implementation team back to the happy path"
   — `SD/011b8860`
8. "If you miss something, the audit will catch it. If you break something, that's worse than doing
   nothing." — `SD/011b8860`
9. (assistant) "First few iterations: real bugs caught. Middle iterations: critiques of fixes.
   Steady state: nitpicks on the audit-process itself." — `SD/011b8860`
10. (prompt) "Calibrate by consequence, not by alarm." — `templates/audit-barrage-prompt.md`

---

## Numbers & receipts (verified; cite exactly)

- **13 findings / 4 cross-model / all would have shipped**, against a green 1,966-test suite —
  Phase 12 self-dogfood (`audit-log.md:349,520`). *(ROADMAP rounds the split to "4+7"; audit-log's
  4+9=13 is authoritative.)*
- Per-model on that run: claude 195s / ~13.5KB / 9 findings; codex 28s / ~3.4KB / 4 findings; gemini
  failed on quota. (`audit-log.md:353`)
- **51 findings** (incl. 3 author-introduced contradictions) from a manual spec barrage — the
  motivating evidence for spec-governance. (`spec.md`)
- **Blast-radius rubric: 5/5 genuine cross-model HIGHs, 0 phantom** on field test. (`0c388aea`)
- Single-sourcing shrank the bash scripts **235→47** and **141→36** lines; vitest **58→79**.
  (`845cf43c`)
- Dampener defaults: **2** consecutive 0-HIGH runs; iteration ceiling **5**. (`check-barrage-dampener.ts`)
- ~300 lines of TS for the original Design A implementation. (`ROADMAP.md:123`)
- gemini was disabled in practice after failing **94.1%** of runs (16 of 17) in one cycle.
  (`audit-barrage-config.yaml`)

⚠️ **Do not fabricate.** Every number above is quoted from source in the raw files. Don't invent
performance/precision stats; if a claim isn't in the receipts, leave it out.

---

## Suggested angles / open questions for the draft

- **Frame:** the post's title is "wired into every task" — the strongest spine is *why* you'd dare
  wire an unconditional auditor into every task, and what three problems that dare forces you to
  solve (cost, convergence, reliability). Act 2 is built for this.
- **The human throughline:** this is one operator automating his own good habit because the habit
  didn't scale. Keep him in it — the quotes carry the piece.
- **The recursive payoff:** the tool's first act was finding 13 bugs in itself; its hardest later
  battle was finding contradictions in its own spec. Open and close on self-audit.
- **NOT FOUND (don't invent):** no transcript debates the *word* "barrage"; no single dramatic
  "green tests passed but model X found Y" war story beyond AUDIT-01 and the dogfood instances. The
  pain is a *pattern*, not one incident — write it that way. (03-transcript, "Explicitly NOT FOUND")

---

## Where the receipts live

- `scrapbook/research-raw/01-origin-dw-lifecycle.md` — origin, mechanics, Phase 12 dogfood, Design
  A/B/C, AUDIT-01, all with file/commit/issue cites.
- `scrapbook/research-raw/02-stack-control-evolution.md` — vendoring, `stackctl govern`, dampener
  internals, blast-radius rubric, fiction cascade, DRY-collapse, full commit timeline.
- `scrapbook/research-raw/03-transcript-narrative.md` — verbatim operator quotes with session
  citations; the human "why."
- Primary repo: `/Users/orion/work/deskwork` — `ROADMAP.md`, `DEVELOPMENT-NOTES.md`, the
  `audit-barrage` skill + src on `main`; `plugins/stack-control` + `specs/004-spec-governance` on
  `feature/stack-control`.

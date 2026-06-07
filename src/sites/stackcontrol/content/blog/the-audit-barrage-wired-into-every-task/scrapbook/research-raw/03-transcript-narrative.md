# Audit-Barrage — Transcript Narrative (Raw Research)

Mined from Claude Code session transcripts (JSONL) in three deskwork project dirs:
`scope-discovery` (where Design A was built), `stack-control` (the `stackctl govern`
convergence work), and `design-control` (where the barrage was used/refined on a
design-heavy product). All quotes below are **verbatim** operator (USER) text or
assistant text actually present in the transcripts, with the source session filename
cited. Nothing here is invented; assistant lines are flagged as assistant when used.

Session-file shorthand (full names in citations):
- `SD/2b49c58f` = scope-discovery/2b49c58f-ee30-40e9-90da-79bb06902452.jsonl — **the design conversation** (originating brainstorm, A/B/C, CLI-vs-API)
- `SD/011b8860` = scope-discovery/011b8860-7e28-4c59-bc66-7b2343fef28a.jsonl — **the build + dampener/slush + autonomy thesis** (414 keyword hits, richest)
- `SD/ceaf0d14` = scope-discovery/ceaf0d14-ec8a-4ce9-a38d-182f5cee40c3.jsonl
- `SD/f2dc9ba6` = scope-discovery/f2dc9ba6-01a8-4e0a-a5f2-4a235be11497.jsonl
- `SC/b45841d6` = stack-control/b45841d6-9689-42ec-8852-f98dabbec99a.jsonl — **blast-radius rubric + convergence loop + `stackctl govern`**
- `SC/6ac011f9` = stack-control/6ac011f9-f9b5-4d4b-bdb4-ceed5903b32b.jsonl
- `DC/5fa83070` = design-control/5fa83070-8b94-45f4-855e-4dd0884e5022.jsonl — **barrage applied to a design-heavy product; "choice between three"; frontend-design in barrage agents**

---

## The originating moment / pain

The single clearest origin statement. The operator was **already running a Codex audit
by hand**, on top of the in-loop self-audit, and noticed Codex caught what Claude missed:

> **Operator (SD/2b49c58f):** "path B. scope them into the workplan. then, we need to
> augment the auditor mechanism. I currently run a codex audit by hand, in addition to the
> self-audit that happens in /dwi. The codex audit usually finds stuff that claud misses.
> I'd like to explore options for automating a battery of llm audit jobs using different
> models so a) we get genetic diversity in our audit protocol; b) we run more audits out of
> band so the implementation team doesn't have to bear so much of the weight of auditing
> and can, instead, focus on features and fixes; c) automating the audit barrage so the
> quality of the audit isn't subject to my inconsistent discipline"

This one message contains all three motivating threads: **(a) genetic diversity**,
**(b) out-of-band auditing**, **(c) removing the operator's inconsistent discipline as
the bottleneck.**

The assistant then framed *why* one model auditing itself is not enough — a cost/signal
table the operator reacted to. The key row, verbatim:

> **Assistant (SD/2b49c58f):** "| `/dwi` self-audit (orchestrator-loop) | Same agent
> doing the work; in-band, every turn | LOW (token budget on current task) | LOW-MEDIUM —
> same model, same context, blind to its own blind spots |" … "| **Manual codex audit
> (operator-run)** | Operator pastes work into a separate Codex session | OPERATOR
> ATTENTION (the scarcest resource) | HIGH — different model = different failure modes
> caught |"

So the pain is named precisely: **a model is "blind to its own blind spots,"** and the
high-signal cure — a different model family — was costing **operator attention, "the
scarcest resource."** Earlier in the same session, the architectural framing for why the
auditor must be independent of the judge appears (option B):

> **Assistant (SD/2b49c58f):** "**B. Auditor is a different LLM than the judge.**
> Different model family, different prompt scaffold, different context … Con: … auditor
> LLM has its own blind spots." (option C adds: "doesn't help if both models share the
> same blin[d spots]")

NOT FOUND as a verbatim anecdote: a specific named bug that "green tests missed but a
different model family caught." The pain is stated as a general, repeated pattern ("The
codex audit usually finds stuff that claud misses"), not a single war story. (See the
dogfood section for the closest concrete instance.)

---

## Design debates (A/B/C, pricing)

The assistant laid out **three concrete designs at ascending ambition** in SD/2b49c58f,
and the operator picked the light one as the starting point — then immediately overrode
the implementation substrate. Verbatim design ladder:

> **Assistant (SD/2b49c58f):**
> "### Design A — `/dw-lifecycle:audit-barrage` skill (Light) … Fires N parallel audit
> jobs against N models via API (Claude + OpenAI + one more) … The operator drives the
> lifting; the firing is automated. Low complexity; high genetic-diversity value …"
> "### Design B — Lifecycle-triggered automation with meta-audit (Medium) … Design A +
> the meta-audit step: Fires at `/dw-lifecycle:session-end` …"
> (Design C surfaces later as the "continuous background daemon".)

The operator's decisive pricing call — **CLI flat-rate over API per-token** — verbatim:

> **Operator (SD/2b49c58f):** "Design A is a good starting place. But, we won't be using
> model apis—we'll be using claude, codex, and gemini clis, since they are usage based,
> not token based. Also, we should write the long-term plan into the ROADMAP.md
> documentation"

And later, reinforcing it as a settled rationale:

> **Operator (SD/011b8860):** "no, the clis do not make direct api calls. That's why we
> chose them instead of direct api calls"

The assistant captured the resulting roadmap shape (A → B → C), verbatim:

> **Assistant (SD/2b49c58f):** "**Planned next: multi-model audit barrage** — Design A
> (operator-triggered, CLI-based) → B (lifecycle-triggered + meta-audit synthesizer) → C
> (continuous background daemon) … Three CLIs for v1 battery: Claude / Codex / Gemini —
> usage-based + already-authenticated + same subprocess-orchestration pattern the plugin
> already uses … Acceptance signal: one barrage surfaces ≥1 finding the in-band + SDD
> cycle missed"

The A/B/C choice was also offered to the **operator of the design-control product** as a
runtime choice (i.e., the three designs weren't just internal — the operator wanted the
choice surfaced):

> **Operator (DC/5fa83070):** "can we offer a choice between the three to the operator?"
> and "are we building this feature as its own plugin?"

The eventual evolution past "operator-triggered" toward **mechanized, no-discretion**
firing (a move toward Design B's auto-fire) is the operator's own escalation:

> **Operator (SD/011b8860):** "I think the answer is yes. when to run the barrage should
> not be a matter of policy and the agent should have no discretion. It must be mechanized
> with teeth"

> **Operator (SD/011b8860):** "I want the audit barrage and amelioration to be a seamless
> part of the /dwi loop—I don't want to answer a bunch of questions about what to do—unless
> the default behavior of running the barrage, putting findings into the audit log, then
> scoping into the workplan is not possible without operator decision making. Audit
> findings are failures of the previous implementation that shouldn't be treated like
> exceptions—they are guardrails to point the implementation team back to the happy path"

---

## Where the framing came from

**"Genetic diversity"** — coined by the **operator**, in the originating message
(SD/2b49c58f, quoted in full above): *"so a) we get genetic diversity in our audit
protocol."* The assistant then adopted it as a recurring frame ("three goals (genetic
diversity / out-of-band / discipline-independent)"). It is the operator's phrase, rooted
in the empirical observation that **different model families have different failure
modes** ("different model = different failure modes caught", SD/2b49c58f).

**"Blast radius"** — emerges later, in the **stack-control** era, as a **severity-rubric**
concept: a way to decide *what counts as a HIGH* so the barrage stops emitting phantom
nitpick-HIGHs. Operator confirming it landed:

> **Operator (SC/b45841d6):** "has the most recent update to the audit protocol--the
> 'blast radius' update--been successfully implemented such that future invocations of the
> audit barrage will use that updated audit protocol?"

> **Assistant (SC/b45841d6):** "**Severity-calibration — 'what *is* a HIGH' — got an
> answer** … a **blast-radius severity rubric** rewritten into the barrage prompt" … and
> on first field-test: "two consecutive runs, two *genuine* cross-model HIGHs, **zero
> phantom HIGHs** — exactly the failure mode (a phantom precision-nit HIGH every round)
> that the blast-radius calibration was built to kill."

The assistant also used "blast radius" in its original meaning — *the size of the harm if
a defect ships* — when explaining why a gate hole was HIGH:

> **Assistant (SC/b45841d6):** "**Blast radius (why it's HIGH):** the natural FR-compliant
> gate build *is* the one with the hole, and in **unattended** mode the stochastic-miss
> path is the expected route to graduating a spec that still carries a recorded-open
> defect — which is the feature's entire reason to exist."

**"Dampener" / "slush" (slush pile)** — both coined by the **operator** in one message
(SD/011b8860), born from the lived experience that an auditor *always* finds something:

> **Operator (SD/011b8860):** "We definitely need a dampener. From experience, an auditor
> agent will always find *something* to complain about. I'm happy with two consecutive
> audits with 0 HIGH findings—we can keep the nitpicks in a slush pile"

> **Assistant (SD/011b8860, immediately after):** "Got it — dampener + slush pile.
> Building the dampener as Phase 15 Task 7 …"

NOT FOUND: an explicit verbatim discussion of *why the word "barrage"* was chosen (the
naval/artillery metaphor). The term is simply in use from the originating message onward
("automating the audit barrage", SD/2b49c58f); no transcript line debates or coins the
word itself.

---

## Surprises & dogfooding moments

The strongest dogfood surprise — **the barrage's own tooling caught a real bug before any
audit model even ran**:

> **Assistant (SD/2b49c58f):** "**The dogfood already surfaced a finding before any LLM
> fired** — the prompt-renderer's unsubstituted-var check is over-eager. It treats literal
> `{{var}}` / `{{name}}` / `{{prompt}}` substrings in instructional prose (documentation
> about the substitution mechanism) as bugs. That's a real bug in the just-shipped Task 3
> work."

A second, sharper dogfood moment — **the barrage told the operator his own fix didn't
actually fix the finding**:

> **Assistant (SD/ceaf0d14):** "The audit-barrage explicitly said my AUDIT-39 commit
> doesn't satisfy AUDIT-39's stated defect. … Its recommendation was explicit: *'Either
> keep AUDIT-39 open until the maxBuffer-specific error classification lands, or split it
> so the bounding change doesn't carry an AUDIT-39 trailer it doesn't satisfy.'*"

A third — the validator dogfooding itself and **rejecting its own reviewer's output**:

> **Assistant (SD/011b8860):** "Track 2's first response was **rejected** by the validator
> (`4 commits reviewed, 1 finding` — the comma in the count phrase breaks the
> modifier-token regex). New friction surface uncovered by the wrapper itself."

**Frustration / surprise — the CLIs are flaky; the barrage is stochastic.** This is a
recurring operator-facing pain and shaped the "1 successful audit counts" rule:

> **Assistant (SD/011b8860):** "the barrage tooling is intermittent (3-of-3 model outage
> rate has been ~50% this session)." … "The mechanism is correctly enforcing discipline. …
> But the LLM-CLI outage rate makes the loop fragile in practice."

Operator's response — accept stochasticity rather than fight it:

> **Operator (SD/011b8860):** "the audit barrage is stochastic—it doesn't have to be
> perfect every time. As long as at least 1 audit is successfully executed, that should
> count as a successful audit barrage. Auditing as a practice should statistically yield
> better code"

The convergence-pattern insight the assistant observed across 7 manual barrage rounds
(which *motivated* the dampener):

> **Assistant (SD/011b8860):** "Every adopter using `/dwi` will experience the same
> convergence pattern we just demonstrated: First few iterations: real bugs caught. Middle
> iterations: critiques of fixes. Steady state: nitpicks on the audit-process itself."

---

## The stack-control migration

The barrage was **vendored into stack-control** (dependency on dw-lifecycle removed) and
extended **"left"** from implementation-time auditing to **definition/spec-time
governance** via `stackctl govern` — the convergence loop is the feature's own
dogfood:

> **Assistant (SC/b45841d6):** "stochastic correctness via cross-model audit-barrage. This
> feature extends the barrage **left** to definition time (govern the spec, not just the
> impl)."

> **Assistant (SC/b45841d6):** "the audit-barrage was vendored in-house (dw-lifecycle
> dependency removed). What remains is … the **governance convergence loop on 004's own
> spec** (the self-hosting dogfood that *is* the feature's value proposition)."

The **convergence loop** target — drive to two consecutive 0-HIGH runs or a recorded
override:

> **Assistant (SC/b45841d6):** "**Resume the 004 convergence loop**: run `stackctl govern
> --mode spec` on 004 … read findings against the evaluation contract, drive toward
> 2-consecutive-0-HIGH (or a recorded `GOVERN_OVERRIDE`)."

The **blast-radius rubric's first field test** through the consolidated `stackctl govern`
path (quoted above): "two consecutive runs, two *genuine* cross-model HIGHs, **zero
phantom HIGHs**." Each HIGH was "a real structural defect the convergence loop *should*
catch" (SC/b45841d6).

A migration-era design fork the assistant flagged as the operator's call (the gate's
per-run model vs. the SC-006 "once-open, stays-open" guarantee):

> **Assistant (SC/b45841d6):** "the gate counts only the most-recent run's open findings …
> But SC-006 promises absolutely: *'once surfaced as an open HIGH, the gate does NOT
> graduate until that finding is dispositioned.'* … run 3 records a real HIGH (open) →
> runs 4+5 stochastically miss it → the gate sees runs 4/5 clean → graduates …
> **run-3's HIGH still open**."

In **design-control**, the barrage was generalized beyond code to **review images / web
interfaces**, explicitly wiring `/frontend-design` into the agents:

> **Operator (DC/5fa83070):** "the audit barrage prompt can instruct the agents to review
> code AND images or web interfaces. In fact, we should specify that /frontend-design be
> used explicitly in the claude barrage agents and whatever the codex equivalent is for
> codex barrage agents"

> **Operator (DC/5fa83070):** "the referee should use audit barrage and the audit protocol"

---

## The autonomy thesis (context for the "why")

The deepest "why" — the barrage is one machine in a larger **self-regulating autonomous
loop** the operator is building:

> **Operator (SD/011b8860):** "what I'm trying to enable is a fully autonomous
> implementation loop that is self regulating and self-correcting. Ultimately, I want to be
> able to point an orchestrator agent at a workplan, fire off /dwi, then come back when the
> entire workplan is fully implemented, fully tested, and fully audited—unless there are
> ambiguities in the spec uncovered during execution that can only be resolved by asking
> the operator to provide direction."

The dampener-tightening decision, with the operator reasoning aloud about pathological
loops:

> **Operator (SD/011b8860):** "I think we may need to stiffen the dampener slightly—I'd
> like to try a policy where, if there are 0 HIGH and 0 MEDIUM issues on any audit barrage,
> we engage the dampener. This is in addition to the two consecutive 0 HIGH barrage runs"

> **Operator (SD/011b8860):** "the dampener still works, though, right? it breaks out of
> and endless loop of litigating the same chunk of code?"

The gate's chicken-and-egg problem the operator personally diagnosed (the audit-log gate
blocked the very loop needed to clear it):

> **Operator (SD/011b8860):** "There's a problem with the audit log /dwi gate. it currently
> won't proceed until the audit log is clean—but, we can't fix any of the problems using
> the /dwi loop unless we can run the /dwi loop. What should probably happen instead is
> that the /dwi gate won't open until all of the unfixed items in the audit log are
> *scoped* into the workplan as the *next* tasks to work on. … we need to add an audit
> barrage hook at the end of the /dwi loop with a mandate to scope the fixes as the next
> workplan items. And, we *must* ensure the the findings from the audit barrage are
> actually written to the audit log."

The "sins of commission vs omission" philosophy that calibrates what a HIGH means:

> **Operator (SD/011b8860):** "I'm only concerned about this in the context of HIGH errors.
> And, I'm less concerned about sins of omission than sins of commission. If you miss
> something, the audit will catch it. If you break something, that's worse than doing
> nothing. However, an audit flag *is* a sign that you need to think a little harder about
> the problem"

---

## Quotable operator lines (verbatim, with source)

1. "The codex audit usually finds stuff that claud misses." — **SD/2b49c58f**
2. "so a) we get genetic diversity in our audit protocol" — **SD/2b49c58f**
3. "automating the audit barrage so the quality of the audit isn't subject to my
   inconsistent discipline" — **SD/2b49c58f**
4. "we won't be using model apis—we'll be using claude, codex, and gemini clis, since they
   are usage based, not token based." — **SD/2b49c58f**
5. "no, the clis do not make direct api calls. That's why we chose them instead of direct
   api calls" — **SD/011b8860**
6. "We definitely need a dampener. From experience, an auditor agent will always find
   *something* to complain about. I'm happy with two consecutive audits with 0 HIGH
   findings—we can keep the nitpicks in a slush pile" — **SD/011b8860**
7. "when to run the barrage should not be a matter of policy and the agent should have no
   discretion. It must be mechanized with teeth" — **SD/011b8860**
8. "Audit findings are failures of the previous implementation that shouldn't be treated
   like exceptions—they are guardrails to point the implementation team back to the happy
   path" — **SD/011b8860**
9. "the audit barrage is stochastic—it doesn't have to be perfect every time. As long as at
   least 1 audit is successfully executed, that should count as a successful audit barrage.
   Auditing as a practice should statistically yield better code" — **SD/011b8860**
10. "what I'm trying to enable is a fully autonomous implementation loop that is self
    regulating and self-correcting." — **SD/011b8860**
11. "If you miss something, the audit will catch it. If you break something, that's worse
    than doing nothing." — **SD/011b8860**
12. "the dampener still works, though, right? it breaks out of and endless loop of
    litigating the same chunk of code?" — **SD/011b8860**
13. "can we offer a choice between the three to the operator?" — **DC/5fa83070**
14. "the audit barrage prompt can instruct the agents to review code AND images or web
    interfaces." — **DC/5fa83070**
15. "has the most recent update to the audit protocol--the 'blast radius' update--been
    successfully implemented…?" — **SC/b45841d6**
16. "keep doing barrage and fix rounds until we get a clean audit" — **SD/011b8860**

Notable assistant lines worth paraphrasing (not operator quotes, flag as such if used):
- "same model, same context, blind to its own blind spots" (the in-band self-audit row) — **SD/2b49c58f**
- "different model = different failure modes caught" — **SD/2b49c58f**
- "The dogfood already surfaced a finding before any LLM fired" — **SD/2b49c58f**
- "two consecutive runs, two *genuine* cross-model HIGHs, **zero phantom HIGHs**" — **SC/b45841d6**
- convergence pattern: "First few iterations: real bugs caught. Middle iterations:
  critiques of fixes. Steady state: nitpicks on the audit-process itself." — **SD/011b8860**

---

## Explicitly NOT FOUND

- No verbatim debate over the **naming of "barrage"** itself (the artillery metaphor). The
  word is in use from the first design message; nothing coins or justifies it.
- No single named **war-story bug** ("green tests passed but model X found Y"). The
  motivating pain is stated as a *repeated pattern* ("usually finds stuff claud misses")
  plus the dogfood instances above, not one dramatic incident.
- "Convergence loop" and "blast radius" do **not** appear in the early scope-discovery
  design sessions; they are **stack-control-era** vocabulary (SC/b45841d6, SC/6ac011f9).
- The phrase "three audit surfaces" appears as an assistant **cost/signal table**
  (self-audit / two-reviewer pass / manual codex), not as an operator coinage.

---
title: Receipts — Act 2 + Act 3 deep-read (gaps)
purpose: >
  Companion to receipts-deskwork-git.md. That file carries the timeline; this one
  fills the GAPS — exact commit messages / operator directives quoted verbatim, plus
  the full stack-control spec read (Act-3 thesis). All SHAs, dates, and quotes are
  verbatim from `git -C /Users/orion/work/deskwork` and the stack-control worktree at
  /Users/orion/work/deskwork-work/pluggable-lifecycle-providers. Author of all cited
  commits: Orion Letizi (oletizi@mac.com).
---

# Receipts — Act 2 + Act 3 deep-read

Quotes are verbatim. Where a line is paraphrased it is marked as such.

---

## 1. The extraction commit — `7311d842`

- **SHA:** `7311d84265adcf0f56f2b6d4ae454271511cb162`
- **Date:** Tue Apr 21 14:22:05 2026 -0700 (six minutes after `Initial commit`)
- **Subject:** `chore: bootstrap monorepo and port claude infrastructure`
- **Stat:** 36 files changed, 1719 insertions(+) — the entire `.claude/` tooling tree landing in one commit.

The body says the porting in the operator's own words:

> Ported from audiocontrol.org's .claude tooling:
> - agents/ (7 agents: project-orchestrator, feature-orchestrator, typescript-pro,
>   code-reviewer, documentation-engineer, codebase-auditor, architect-reviewer)
> - skills/ (14 workflow skills: feature-define/setup/pickup/implement/extend/
>   review/ship/complete/teardown/issues/help, session-start/end, analyze-session)
> - rules/ (session-analytics, workflow-playbooks, testing)
> - workflows/ (feature-development.yaml)
> - project.yaml, CLAUDE.md rewritten for plugin monorepo

**What was ported (from the diff stat, confirming the message):**

- **7 agents** — `architect-reviewer.md`, `code-reviewer.md`, `codebase-auditor.md`, `documentation-engineer.md`, `feature-orchestrator.md`, `project-orchestrator.md`, `typescript-pro.md`.
- **14 workflow skills** — `feature-define/setup/pickup/implement/extend/review/ship/complete/teardown/issues/help`, `session-start`, `session-end`, `analyze-session` (each as a `SKILL.md`).
- **3 rules** — `session-analytics.md`, `workflow-playbooks.md`, `testing.md`.
- **1 workflow** — `workflows/feature-development.yaml`.
- Plus `project.yaml`, a rewritten `.claude/CLAUDE.md` (194 lines), `marketplace.json` placeholder, `package.json` (npm workspaces), and the founding feature doc tree `docs/1.0/001-IN-PROGRESS/deskwork-plugin/` (prd/workplan/README/implementation-summary).

The body also records the **adaptation** (verbatim):

> Adapted for this repo:
> - Worktree convention: ~/work/deskwork-work/<slug>/ (no repo prefix on worktree dirs)
> - GitHub refs point to audiocontrol-org/deskwork
> - Agent/rule/skill Astro-specific content replaced with plugin-specific guidance

And it seeds the founding plan:

> Six-phase plan: bootstrap, adapter, core skills, dogfood, visibility
> skills, cutover and cleanup

**Why it matters:** the founding state of the deskwork repo *is* the audiocontrol
process, copy-ported one directory at a time. Act 2 starts as a transplant, not a
rewrite — the diff stat (36 files, 1719 insertions, the whole `.claude/` tree) is the
proof.

---

## 2. "Mechanized with teeth" — the `/dwi` hook, the dampener, the structural bug, the E2BIG fix

### 2a. The end-of-task audit-barrage hook — `3a370a19`

- **SHA:** `3a370a19ff05b7dbb98b9c47c1ba3bd238729ad1`
- **Date:** Fri May 29 23:53:57 2026 -0700
- **Subject:** `docs(scope-discovery Phase 15 Task 4c): wire end-of-task hook into implement SKILL.md`

The exact **operator-directive framing** quoted in the SKILL.md body that this commit
adds to `/dw-lifecycle:implement` (the `/dwi` loop). This is the "no discretion" framing:

> I want the audit barrage and amelioration to be a seamless part of the /dwi loop — I
> don't want to answer a bunch of questions about what to do. Audit findings are failures
> of the previous implementation that shouldn't be treated like exceptions — they are
> guardrails to point the implementation team back to the happy path

The commit body's compression of the same directive:

> Per Phase 15 operator directive: *"audit-barrage and amelioration ... seamless ... no
> questions ... findings are guardrails not exceptions to point the implementation team
> back to the happy path."*

The **"no discretion"** enforcement is literal — the hook is unconditional:

> The hook is unconditional — no `--skip-audit-barrage-hook` flag.

(The Flags table in the SKILL.md restates it: *"There is no `--skip-audit-barrage-hook`
flag. Per Phase 15's operator directive, the end-of-task audit-barrage hook (Step 6) is
unconditional."* The only silent skip is when `.dw-lifecycle/scope-discovery/` is absent
— i.e. the project hasn't opted in.)

**The "mechanized with teeth" language** is its own scoped phase (in the timeline file,
also confirmed here): `7a4ca74b` — 2026-05-31 — `docs(scope-discovery): scope Phase 17 —
mechanize audit-barrage hook with teeth`. So "mechanized with teeth" = the enforcement
layer that turns the directive into something the loop *cannot* skip.

**The hook composes FIVE CLI calls** between the task-completion commit and the
scope-widen step (the body lists them):

> 1. audit-barrage-render (vars JSON → prompt)
> 2. audit-barrage --output-run-dir (captures RUN_DIR)
> 3. audit-barrage-lift --apply (writes findings to audit-log)
> 4. promote-findings --auto (scopes findings at workplan head)
> 5. check-open-findings (sanity-check gate now allows)

**The three enforcement layers** (the mechanism that gives the directive teeth), read
off the hook + its gates:

1. **Unconditional firing** — no skip flag; the hook fires on every task iteration once
   the project has opted into scope-discovery. (Later tightened by #383 to "every
   iteration *with new diff*"; see 2b.)
2. **Auto-scoping with no operator prompt** — `promote-findings --auto` inserts each new
   fix-finding task *before the first unchecked workplan task*, so the workplan-aware
   pickup gate sees them as positions [0..N-1]: *"Each new fix-finding task lands BEFORE
   the first existing unchecked task ... No operator dispositions needed."* The default
   IS the action.
3. **A fail-loud gate** — `check-open-findings` runs post-promote and **stops the loop**
   if findings remain unscoped: *"promote-findings --auto non-zero → stop loop (findings
   are guardrails; failing to scope them is structural)."* Failing to scope a finding is
   treated as a structural failure of the loop, not an operator decision point.

### 2b. The dampener + structural bug #383 — `c9849b61`

- **SHA:** `c9849b614b4ee3815ffec8174f47891f4642ced2`
- **Date:** Sun May 31 17:21:52 2026 -0700
- **Subject:** `feat(audit-barrage): Phase 16 — always fire on new diff, dampener controls disposition (#383)` — Closes #383.

**What the bug WAS** (verbatim from the body) — a fused gate that conflated two separate
questions and, when the dampener engaged, skipped the *entire* audit:

> Pre-Phase-16, /dw-lifecycle:implement Step 6's gate fused two separate concerns:
> "should new work be cross-model audited?" (always yes, per the third-audit-surface
> thesis) and "should nit findings be scoped vs slushed?" (context-dependent, the
> dampener's actual job). The fused gate skipped the whole hook when the dampener
> engaged, which meant long autonomous burndowns (graphical-entries Phase 0: 70 tasks
> across diverse subsystems) ran with zero audit coverage on new work.

The **motivating case** (verbatim) — the burndown that ran blind:

> Motivating case: graphical-entries Phase 0 burndown, 2026-05-31. 70 tasks landed with
> the dampener engaged from barrage 2 onward; no cross-model audit ran on any of them.
> The dampener's "self-stop on nit-level meta-critiques" win was conflated with audit
> coverage; this commit untangles them.

**The fix** — split the fused gate; the barrage now always fires on new diff and the
dampener only controls *disposition* (slush vs promote) of findings *after* the barrage
runs:

> This commit splits the concerns:
> * NEW: check-barrage-tip library + CLI verb (Phase 16 Task 3). The ONLY legitimate
>   skip condition: zero new diff since the most-recent barrage's tip.sha. All other
>   iterations fire.
> * NEW: audit-barrage records HEAD at fire-time into <runDir>/tip.sha (Phase 16 Task 2).
>   The new-diff guard reads this file from the most-recent run-dir.
> * SKILL.md Step 6 refactor (Phase 16 Task 4): replace skip-on-dampened with
>   new-diff-only-skip; dampener moved to a separate disposition gate (slush vs promote)
>   that runs AFTER the barrage fires.

The SKILL.md diff makes the corrected mental model explicit:

> The dampener engaging means *"recent runs were quiet on real bugs — new findings (on
> this iteration's new diff) get slushed rather than promoted."* It does NOT mean *"the
> auditor has gone quiet on real bugs"* in a sense that would justify skipping audits on
> new work — that framing was the structural bug #383 closed.

Test coverage: *"5 new tests for check-barrage-tip ... 2 new tests for tip.sha
persistence ... Plugin suite: 2517/2517 green."*

**Why it matters:** #383 is the canonical "the mechanized guardrail had a hole, the hole
let 70 unaudited tasks through, dogfooding caught it, the fix split a fused gate." It is
the strongest single receipt that the audit barrage is forged by its own failures.

### 2c. The E2BIG / stdin fix — `e7f5b4df` (one line)

- **SHA:** `e7f5b4df5aa170984c80db2421fad1fe2d0c35d7` — Thu Jun 4 2026 — `fix(audit-barrage): catch E2BIG + flip default to {{prompt-stdin}}` (Closes #397).

One line: a fresh scope-discovery opt-in defaulted the barrage range to `HEAD~10..HEAD`,
whose embedded diff exceeded the OS per-arg limit (~256 KB macOS `MAX_ARG_STRLEN`); Node's
`spawn()` throws *synchronously* on E2BIG so the async `child.on('error', …)` handler never
saw it and the orchestrator crashed silently — fixed by wrapping `spawn()` in try/catch with
a structured E2BIG classifier and flipping all three default models to `{{prompt-stdin}}` so
the diff goes over stdin, not argv. (*"Surfaced on the 2026-06-02 dogfood."* Suite 2698/2698.)

---

## 3. Scope-discovery canonization — `9ddcc6d4`

- **SHA:** `9ddcc6d4f9fd7b7082fa42d663f76c30f4e30456`
- **Date:** Sun May 25 2026 (merge of #298)
- **Subject:** `feat(scope-discovery): canonize audiocontrol pilot into dw-lifecycle plugin (v1) (#298)`

**What "canonize the audiocontrol pilot into the plugin" meant** (verbatim) — moving a
protocol that had been piloted *inside the audiocontrol website repo* into dw-lifecycle so
every adopter inherits it:

> Captures the design for moving the audiocontrol-piloted Scope Discovery Protocol into
> dw-lifecycle so any project using dw-lifecycle gets it. Plugin holds CODE (scanners,
> validators, discovery agents, dispatch wrapper) per Consequence 3 (b)-style customize
> escapes; project holds CONFIG (clones.yaml, anti-patterns.yaml, etc.) per
> Consequence 3 (d).

**What adopters inherit** (the plugin-holds-CODE / project-holds-CONFIG split, verbatim):

- Plugin ships the **CODE**: *"scanners, validators, discovery agents, dispatch wrapper."*
- Project keeps the **CONFIG**: *"clones.yaml, anti-patterns.yaml, etc."*
- The **integration surface** (verbatim): *"hybrid — explicit slash commands
  /dw-lifecycle:scope-inventory + /dw-lifecycle:scope-widen + ~16 other new commands, AND
  auto-invocation in /dw-lifecycle:define, :implement, :review with per-phase opt-out
  flags. Pre-commit hook + dispatch wrapper + agent-prompt mirrors are opt-in scaffolds
  (plugin never reaches into adopter's .githooks/ or .claude/agents/ without explicit
  consent)."*

**The canary** (verbatim) — the audiocontrol lineage is explicit; the new acceptance test
is modeled on the pilot's:

> the in-flight graphical-entries feature becomes the canary. scope-discovery v1 ships
> before graphical-entries enters implementation; graphical-entries'
> /dw-lifecycle:setup auto-runs /scope-inventory; v1's acceptance signal is a
> paper-test-graphical-entries.md coverage matrix analogous to the pilot's
> paper-test-s550.md.

(`paper-test-s550.md` = the Roland S-550 editor — an audiocontrol.org project — naming the
pilot's home directly. The commit also records the migration source-of-truth path:
`Audiocontrol pilot SoT: ~/work/audiocontrol-work/audiocontrol-scope-discovery-protocol/`.)

**Why it matters:** scope-discovery is the *second, smaller extraction* — audiocontrol
piloted it, dw-lifecycle canonized it, and the canonization's own acceptance test
(`paper-test-graphical-entries.md`) is explicitly modeled on the audiocontrol pilot's
`paper-test-s550.md`. The lineage is named in the commit, not inferred.

---

## 4. stack-control — full spec read (Act 3 core)

Sources (read in the worktree
`/Users/orion/work/deskwork-work/pluggable-lifecycle-providers`):
`specs/003-stack-control-front-door/{spec.md, plan.md, research.md}` and
`docs/1.0/001-IN-PROGRESS/pluggable-lifecycle-providers/stack-control-roadmap.md`.

### 4a. The one-line definition (successor to dw-lifecycle, integration-first against Spec Kit)

From the spec's Program-context block (verbatim):

> `stack-control` (CLI `stackctl`) is a new plugin, the successor to `dw-lifecycle`, built
> integration-first against Spec Kit. **This is Feature 1 — the self-hosting front door.**

The roadmap's fuller framing (verbatim):

> `stack-control` is the intended **successor to `dw-lifecycle`**. The plan is
> absorb-then-retire:
> 1. Build `stack-control` as a new plugin alongside `dw-lifecycle`.
> 2. Move the keepers from `dw-lifecycle` into it over successive features — scope-discovery,
>    audit-barrage, session-start / session-end, and the founding governance extension itself.
> 3. When `stack-control` reaches parity with `dw-lifecycle` for real work, **retire
>    `dw-lifecycle`**.

### 4b. What's KEPT vs explicitly OUT OF SCOPE

**KEPT** — the two crown jewels (scope-discovery + audit-barrage) are named as *keepers*
that migrate into stack-control (roadmap, verbatim): *"Move the keepers from `dw-lifecycle`
into it over successive features — scope-discovery, audit-barrage, session-start /
session-end, and the founding governance extension itself."* The founding governance
extension — which fires the cross-model audit-barrage on `after_implement` — rehomes as
part of Feature 1 itself (FR-003).

**Explicitly OUT OF SCOPE** (verbatim from the spec, the dedicated callout):

> **Explicitly OUT OF SCOPE (later features):** the parallel multi-backend execution engine
> (this front door uses ONLY native Spec Kit execution — the single-agent grinder); the
> fuller control-plane frontend (spec→implementation negotiation, scope-discovery +
> audit-barrage surfaces); the dw-lifecycle migrations of scope-discovery / audit-barrage /
> session skills.

So Feature 1 KEEPS native Spec Kit execution + the rehomed governance/audit-barrage seam,
and defers: (1) the **multi-backend engine** (Feature 2), (2) the **fuller frontend**
(Feature 6), and (3) the **dw-lifecycle migrations** themselves (Features 3–5).

### 4c. The isolation + neutrality invariants

**Isolation invariant** (FR-002, verbatim): *"Standing up `stack-control` MUST NOT change
`dw-lifecycle`'s behavior (isolation invariant). `dw-lifecycle` continues to operate
unchanged."* The rationale (roadmap, verbatim): *"`dw-lifecycle` is in active use doing real
work. `stack-control` must be developed and published without destabilizing it."* Research
R5 shows the standup touches dw-lifecycle in exactly one way — *removing* the governance
extension source tree — and verifies zero inbound coupling by grep + a before/after test
run (SC-003: *"0 behavior changes"*).

**Neutrality invariant** (FR-004 + SC-004, verbatim): the rehomed governance extension
*"MUST preserve its zero-provider-identity-branching invariant"* / *"The rehomed governance
selection path contains **0** branches on provider identity (neutrality survives the
rehome)."* This is the constitution's Principle III applied — *"Branch on Capabilities,
Never Provider Identity."* The front door triggers execution by capability (*"spec is
runnable"*), never by who authored the spec.

### 4d. The self-hosting goal ("build everything after THROUGH it")

Verbatim from the spec's Self-hosting-goal block:

> **Self-hosting goal.** The reason this is first: once the front door exists, every later
> feature (the parallel multi-backend engine = Feature 2, the dw-lifecycle migrations, the
> fuller frontend) is specced and built *through* it. Success is not just "it runs a spec" —
> it is "we can drive the next feature's build through it."

The measurable form (SC-005, verbatim): *"The next feature's spec (Feature 2 or a migration)
is **authored (`define`/`extend`) and run (`execute`) through the front door** — the
self-hosting proof — rather than via ad-hoc invocation."* And the roadmap's resequencing
note: *"the first feature is native Spec Kit execution itself ... Then use that front door
to spec and build the rest of the plugin."*

### 4e. The "why now" angle — Spec Kit as the emerging consensus, and what stack-control keeps that it does NOT give

This is the Act-3 thesis. The strongest supporting lines:

**Why rebuild on Spec Kit at all — it is the integration substrate, used concretely, no
abstraction.** The plan's Primary Dependencies (verbatim): *"GitHub Spec Kit (the
`.specify/` framework — the integration substrate, used concretely, no provider
abstraction)."* The spec is *"built integration-first against Spec Kit"* and Constitution
Principle VIII is *"Faithful Tool Adoption ... Following Spec Kit order: constitution →
specify → clarify → plan → tasks → implement. No step skipped."* In other words: the
hand-built feature-define/plan/tasks scaffolding that was *ported out of audiocontrol*
(§1) is exactly what Spec Kit now provides natively — so stack-control adopts the
consensus tool for the authoring/planning lifecycle instead of re-hand-rolling it.

**What stack-control KEEPS that the consensus does NOT give — governance (the cross-model
audit-barrage) fired automatically at the `after_implement` boundary.** The founding
feature's whole reason to exist is that Spec Kit runs a spec but does *not* audit the work
across model families afterward. The spec, US1 (verbatim):

> when execution completes, the rehomed governance extension fires automatically
> (`after_implement`, cross-model audit-barrage) over the produced work — exactly as the
> founding feature demonstrated, now from inside stack-control.

And SC-002 (verbatim): *"An operator can run a Spec Kit spec via the front door and observe
native execution complete **and** governance fire automatically afterward — in a single
front-door action, **0** manual barrage invocations."* That automatic, provider-neutral,
cross-model audit on top of native execution is precisely the thing the bare Spec Kit
consensus does not provide — it is the value stack-control layers on.

**The durability constraint — the deeper "why not just hardwire the consensus."** The
roadmap's durability section (verbatim):

> AI-coding vendors may sunset batch/headless CLI usage (e.g. a vendor deprecating its
> headless print mode). An engine hardwired to one dispatch mechanism dies when that
> mechanism is withdrawn. So `stack-control` execution must run correctly when only
> in-session sub-agent dispatch is available, when only a batch CLI is available, and when
> both are — routing work to whatever backend declares the needed capability.

This is why the *execution-backend* port (Principle IX) is the differentiator deferred to
Feature 2 — but it is the strategic reason stack-control is not just "Spec Kit + a script":
it intends to branch on capability, never identity, so it survives a vendor sunsetting the
mechanism the consensus assumes.

**The "no npm publish / fat plugin" why-now texture** (research R1, verbatim operator
line): *"Is there ever a good reason to publish anything to npm?"* — for this plugin, no;
it's a dev-tool plugin distributed through the Claude marketplace and run via `tsx`, exactly
like `dw-lifecycle`. (Supports the "integration-first, minimal scaffolding, no speculative
packaging" posture.)

---

## 5. The rebuild commit trail (Act 3) — clean dated sequence

Chronological by author date (the task listed them slightly out of order — `a5a0e6b8`
predates `48295090`):

| # | Date | SHA | Subject |
|---|------|-----|---------|
| 1 | 2026-06-04 13:32 | `8226e1e0` | docs(pluggable-lifecycle-providers): scaffold PRD + workplan + README + carry design.md + feature-definition.md |
| 2 | 2026-06-05 10:26 | `a5a0e6b8` | docs(stack-control): front-door verbs define/extend/execute; fat plugin, no npm (decisions) |
| 3 | 2026-06-05 11:14 | `48295090` | feat(stack-control): plugin scaffold + stackctl dispatcher + version verb (Feature 1 Phases 1-2) |
| 4 | 2026-06-05 11:24 | `1de44b18` | feat(stack-control): US1 MVP — execute-check + governance rehome + execute skill + seam guard (Feature 1 Phase 3) |

Five-line narrative form:

1. **2026-06-04 `8226e1e0`** — Act 3 opens: the `pluggable-lifecycle-providers` PRD /
   workplan / README scaffold lands, carrying `design.md` + `feature-definition.md`.
2. **2026-06-05 `a5a0e6b8`** — the design decisions settle: front-door verbs
   **define / extend / execute**, fat in-tree plugin, no npm publish.
3. **2026-06-05 `48295090`** — Phases 1–2 ship: the plugin scaffold + the `stackctl`
   dispatcher + the `version` verb (stack-control becomes a real plugin).
4. **2026-06-05 `1de44b18`** — **US1 MVP** (Phase 3): `execute-check` + the governance
   rehome (`git mv` out of dw-lifecycle) + the `execute` skill + the cross-plugin seam
   guard — the self-hosting front door can now run a spec with governance firing.

(Note: the trail's narrative arc is genesis → decisions → scaffold → MVP, all inside ~22
hours across 2026-06-04/05, on branch `feature/pluggable-lifecycle-providers`.)

---

## Gaps / open questions

- **`a5a0e6b8` vs `48295090` ordering.** The task listed `48295090` before `a5a0e6b8`, but
  author dates put `a5a0e6b8` (10:26) *before* `48295090` (11:14). The table above uses the
  true chronological order. Worth confirming the intended narrative order with the operator
  if the article wants "scaffold then decisions" rather than "decisions then scaffold."
- **#383 issue text not read directly.** All #383 detail here is from the commit body
  (`c9849b61`), which is rich and self-consistent. If the article quotes the GitHub issue
  title/body specifically, pull it via `gh issue view 383` (not done here — body was
  sufficient).
- **"Mechanized with teeth" exact phrase.** The phrase appears as a *commit subject*
  (`7a4ca74b`, Phase 17 "mechanize audit-barrage hook with teeth"), scoping the enforcement
  layer; the `3a370a19` body carries the operator directive it enforces. If the article
  attributes "mechanized with teeth" as an operator *quote* (vs. a commit subject),
  double-check the source — here it is a commit subject, and the directive it implements is
  the "seamless / no questions / guardrails not exceptions" quote.
- **Native `/speckit-implement` headless limitation.** The spec's Edge Cases assert
  *"`/speckit-implement` is an agent-invoked Claude skill, not a script-callable binary"*
  (established by slice 001). Not independently re-verified against Spec Kit source here;
  taken from the spec.
- **stackctl verb surface is Feature-1-minimal.** Research R3 pins only `execute-check`,
  `spec-check`, `version`. If the article describes a broader CLI, note that is later-feature
  intent (roadmap), not what Feature 1 ships.

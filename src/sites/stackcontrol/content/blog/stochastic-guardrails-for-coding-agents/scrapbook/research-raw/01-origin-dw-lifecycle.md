# Origin research: audit-barrage in dw-lifecycle / scope-discovery

Scope of this document: the dw-lifecycle / scope-discovery ORIGIN of the audit-barrage
feature only. (The later stack-control work is covered by a separate research note.)

All claims are sourced to a file path, commit hash, or issue number in
`/Users/orion/work/deskwork` (branch `main`). Lines tagged **[INFERENCE]** are my reading,
not a direct quote. Everything else is verified from source.

---

## Why it was built (the founding insight / pain)

The audit-barrage exists to answer a specific, demonstrated failure of the project's
existing audit posture: **a green test suite is weak evidence that the code is correct.**

The canonical statement of the pain is in `ROADMAP.md` § "Audit-barrage feature shape"
(lines 70–80). The project already had a three-layer audit posture:

| Layer | Cost | Signal |
|---|---|---|
| Self-audit via the `/dw-lifecycle:implement` orchestrator loop | Token budget on current task | Lower — "same model + same context blind to its own failure modes" |
| Two-reviewer SDD cycle (spec + quality) | Sub-agent dispatch tokens | Medium-high |
| Manual codex audit (operator-run) | **Operator attention** | **High — "different model finds what Claude misses"** |

> "The operator-attention cost is the binding constraint. The codex audit demonstrably
> finds what Claude misses, but it requires manual invocation, manual copy-paste, manual
> finding-by-finding triage. Manual discipline doesn't scale. Automation removes the
> discipline dependency."
> — `ROADMAP.md:80`

So the founding pain is two-headed:
1. **A single model in a single context is blind to its own failure modes.** The model
   that wrote the code (or one in the same family / same context) shares the blind spots
   that produced the bug. (`ROADMAP.md:76`; SKILL.md:153 — in-band self-audit is
   "Same-context blind to its own failure modes.")
2. **The thing that actually caught those bugs — a different model family, run by hand —
   depended on operator discipline, which doesn't scale.** (`ROADMAP.md:78-80`)

The triggering event is named explicitly: the feature was "Triggered by canary
[#349](https://github.com/audiocontrol-org/deskwork/issues/349) §2 framing of the
manually-run codex audit as an operator-attention cost the protocol can't absorb at
scale" (issue #353 body, the parent issue). Issue #349 is the dogfood-feedback report from
driving the graphical-entries feature through the tooling; it framed the manual codex
audit as an attention cost.

The animating idea is **"genetic diversity in failure modes"**: different model families
have different training corpora, so they fail differently. Running several independently
against the same work surfaces bugs no single one would catch. (`ROADMAP.md:21`,
`ROADMAP.md:68`; SKILL.md:155 — "Different training corpora = independent failure modes.")

The prompt template itself encodes this: each CLI is told it is an **independent** reviewer,
NOT collaborating — "The cross-model genetic diversity comes from each of you reporting
independently." (`plugins/dw-lifecycle/templates/audit-barrage-prompt.md:3-6`)

---

## The three audit surfaces

The barrage is framed as the **third independent audit surface**, additive — it does NOT
replace the other two. (`ROADMAP.md:21`, SKILL.md:149-157)

1. **In-band self-audit** — same model + same context (the orchestrator-loop pattern in
   `plugins/dw-lifecycle/src/scope-discovery/orchestrator-loop/`). Catches obvious
   correctness slips; same-context blind to its own failure modes. (SKILL.md:153)
2. **SDD two-reviewer cycle** — `/dw-lifecycle:review` / `:audit`. Sub-agent dispatch
   (`feature-dev:code-reviewer` runs spec-compliance + quality passes). Different context
   from the implementer, but same model class. Medium signal. (SKILL.md:154)
3. **Audit-barrage** — multiple model families in parallel. Different training corpora =
   independent failure modes. "Highest signal for the bugs single-model audits miss."
   (SKILL.md:155, `ROADMAP.md:21`)

> "The three are additive — the barrage does NOT replace the other two; it adds genetic
> diversity in failure modes." — `ROADMAP.md:21`

**Caveat on surface #2 (verified):** the SDD two-reviewer cycle is being *retired* in favor
of the barrage, under issue [#387](https://github.com/audiocontrol-org/deskwork/issues/387)
(OPEN as of research). The audit-barrage SKILL.md (lines 10) notes the SDD cycle "is being
retired under #387 and is no longer named to keep the prose internally consistent with the
deleted review-discipline rule." Operator's verbatim framing in #387: *"the review skill is
no longer hooked into the iterate cycle — superseded by the audit barrage hook. Review is no
longer operationally enforced ... we should consider retiring review and audit in favor of
audit barrage."* So the "three surfaces" framing is the original design; the live trajectory
is collapsing toward two (in-band + barrage).

---

## How it works (mechanics, plainly)

Two CLI verbs, intentionally split so the operator can inspect/tune the rendered prompt
before it burns model budget. (SKILL.md:22-24, `ROADMAP.md:25-26`)

### Verb 1: `dw-lifecycle audit-barrage-render` (pure prompt rendering)

- Inputs: a template + a flat vars JSON → a rendered audit prompt.
- Vars JSON has five keys (mirrors `EXPECTED_VARS` in `prompt-renderer.ts`):
  `feature_slug`, `workplan_summary`, `diff`, `audit_log_excerpt`, `commit_subjects`.
  (SKILL.md:28-38)
- Template resolution: project override at
  `.dw-lifecycle/scope-discovery/audit-barrage-prompt.md` takes precedence; falls back to
  the plugin default at `plugins/dw-lifecycle/templates/audit-barrage-prompt.md`.
  (SKILL.md:51, `ROADMAP.md:25`)
- Each var is substituted at exactly ONE site — a 60 KB diff appears once, not tripled.
  (SKILL.md:40; this was a fix — see AUDIT-20260529-11 below.)
- Exit codes: 0 render OK; 1 render failed (missing declared var / malformed template /
  surviving EXPECTED_VARS marker); 2 usage error. (SKILL.md:53-56)

### Verb 2: `dw-lifecycle audit-barrage` (parallel CLI fan-out)

1. Loads the model battery from `.dw-lifecycle/scope-discovery/audit-barrage-config.yaml`
   (if present + `models:` uncommented); else the plugin default. (SKILL.md:91)
2. Optionally filters to a subset via `--models claude,codex`. (SKILL.md:92)
3. **Spawns each configured CLI in parallel** via `Promise.all` — no early exit; a failing
   model does NOT abort siblings. (`orchestrate-barrage.ts:110-112` + header comment lines
   1-22)
4. Captures, per model: stdout → `<run-dir>/<model>.md`, stderr →
   `<run-dir>/stderr/<model>.txt`. (SKILL.md:93, `orchestrate-barrage.ts:100-108`)
5. Writes `<run-dir>/PROMPT.md` (rendered prompt verbatim) and `<run-dir>/INDEX.md`
   (per-model exit code / duration / byte counts). (SKILL.md:94)
6. Emits a `BarrageRun` JSON record to stdout; one-line summary to stderr. (SKILL.md:95)

The CLIs invoked are **installed CLI binaries, not model APIs**: `claude -p "<prompt>"`,
`codex exec "<prompt>"`, `gemini -p "<prompt>"`. (`ROADMAP.md:101-106`, SKILL.md:12)

**Run-dir layout** (SKILL.md:136-145):
```
.dw-lifecycle/scope-discovery/audit-runs/<YYYYMMDDTHHMMSSsssZ>-<feature-slug>/
├── INDEX.md          — per-model run manifest (triage starting point)
├── PROMPT.md         — rendered audit prompt (verbatim)
├── <model>.md        — captured stdout, per configured model
└── stderr/
    └── <model>.txt   — captured stderr, per configured model
```
Timestamp is millisecond-resolution so two barrages for the same feature in the same
wall-clock second land in distinct dirs (SKILL.md:97) — this precision was itself a fix
(AUDIT-20260529-07). The run dir is **permanent**: "the dogfood signal is preserved as
evidence ... the verb itself never deletes a run dir." (SKILL.md:147)

**Per-model exit/health contract:** verb exits 0 if at least one model produced
positive-byte stdout and wasn't a spawn failure; non-zero CLI exits and timeouts fall on
the healthy side because captured stdout is still triagable. Exit 1 = every model failed;
exit 2 = usage error. (SKILL.md:99-102) Spawn failure (ENOENT — CLI not installed / not on
PATH) returns `exitCode: -2` and is surfaced in INDEX without aborting siblings.
(`spawn-cli.ts:15-17`)

**Subprocess fine print (from `spawn-cli.ts`):** settle fires on `child.on('close')` not
`'exit'` so stdio pipes fully drain before the byte-count snapshot (header lines 33-40);
on timeout it sends SIGTERM then SIGKILL after a 5s grace (`SIGKILL_GRACE_MS = 5000`,
line 48); the prompt is delivered via stdin when the args template uses `{{prompt-stdin}}`,
which bypasses the OS ARG_MAX limit (`spawn-cli.ts:146-191`, the E2BIG fix — see issue #386).

### The triage / lift-into-audit-log workflow

The firing is automated; the triage is human. (`ROADMAP.md:111`) Steps (SKILL.md:114-124):
1. Read `<run-dir>/INDEX.md` — spot-check exit codes, byte counts, timeouts, spawn errors.
2. Read each `<run-dir>/<model>.md` — captured stdout of one CLI's audit, in the prompt's
   finding-block format (`Finding-ID: AUDIT-BARRAGE-<model>-NN`, severity, surface, body).
3. **Cross-reference across models.** Findings two-or-more models flagged independently are
   cross-model agreement = HIGH-confidence. Combined into one canonical entry with both
   Finding-IDs in the header (e.g.
   `AUDIT-20260529-04 (claude-prompt-renderer-orphaned + codex-prompt-seed-override; cross-model)`).
4. **Lift findings into the feature's `audit-log.md`** — each gets a stable
   `AUDIT-<YYYYMMDD>-NN` ID + `Status: open` + fix guidance. Single-model findings are
   lifted too. This is the same closure workflow `/dw-lifecycle:audit` / `:review` use; the
   barrage just adds one more raw input. (SKILL.md:124)

The downstream closure machinery (Phase 13 "Design A.5", `ROADMAP.md:125-140`): once a
finding is `open`, `/dw-lifecycle:promote-findings` scopes it into the workplan as a
TDD-first task; an implement-loop gate refuses task pickup while any open finding exists;
`apply-audit-flips` flips `open → fixed-<sha>` from `Closes AUDIT-<id>` commits;
`close-shipped-audit-findings` / `/dw-lifecycle:re-audit-fixed-findings` flip
`fixed-<sha> → verified-<date>`. `re-audit-fixed-findings` fires a fresh barrage and checks
whether each fixed finding still surfaces — re-surfacing = "did-not-actually-fix."
(`plugins/dw-lifecycle/skills/re-audit-fixed-findings/SKILL.md`)

### Why CLIs and not APIs (load-bearing design choice)

`ROADMAP.md:82-88` gives three reasons; SKILL.md:12 reinforces:
1. **Usage-based pricing vs flat-rate CLI.** "Running a broad audit barrage against API
   endpoints accrues meaningful per-call cost. The CLIs are flat-rate." (`ROADMAP.md:86`)
   SKILL.md:12: "A barrage on a multi-thousand-line diff is the same operator cost as a
   one-line probe: zero direct API metering, bounded by the per-CLI subscription. This is
   the load-bearing design choice that lets the `/dw-lifecycle:implement` end-of-task hook
   fire unconditionally at every task boundary."
2. **Auth already configured** — no API-key handling/rotation; the operator's existing CLI
   setup is the auth surface. (`ROADMAP.md:87`)
3. **Subprocess orchestration is a well-trodden path** — the plugin already shells out to
   `gh`, `git`, `npx tsx`, `jscpd`; adding `claude`/`codex`/`gemini` is the same pattern.
   (`ROADMAP.md:88`)

---

## Phase 12 self-dogfood (the proof)

The single most important evidence point. The first audit-barrage run audited the
audit-barrage feature itself (its own Tasks 1-3). Canonical record:
`docs/1.0/001-IN-PROGRESS/scope-discovery/audit-log.md` § "2026-05-29 — Phase 12
audit-barrage self-dogfood" (lines 347-533).

**Headline numbers (audit-log.md:349, 522):**
- **13 distinct findings** across 2 successful models.
- **4 with cross-model agreement** (both claude and codex independently found the same bug)
  = HIGH-confidence.
- **9 single-model findings** (claude-only) + the 4 cross-model = 13 total.
- **ALL 13 would have shipped without the audit.** "1966/1966 tests passed; tsc clean; live
  3-CLI round-trip returned PROBE-OK." (audit-log.md:349)
- audit-log.md:520: "All 13 audit-barrage findings above were NOVEL — not caught by tsc,
  tests, or the dispatch-wrapper's response validation."

> **Note on the count discrepancy (verified):** the ROADMAP and the audit-barrage SKILL.md
> summarize this as **"4 cross-model HIGH-confidence findings + 7 single-model findings"**
> (`ROADMAP.md:32`, `DEVELOPMENT-NOTES.md` "Recently shipped"). The canonical audit-log says
> **4 cross-model + 9 single-model = 13** (audit-log.md:349, 522). The audit-log breaks the
> single-model bucket into claude-only code findings (AUDIT-...-05..09, five entries, one of
> which is informational) plus two operator-side in-band findings (AUDIT-...-10, -11). The
> "7" figure in the ROADMAP appears to count a narrower slice. **Use the audit-log's
> 4 + 9 = 13 as authoritative; cite the ROADMAP's "4 + 7" only with this caveat.**
> [INFERENCE on the reconciliation; both raw numbers are quoted verbatim from source.]

**Per-model run stats (audit-log.md:353):**
- claude: 195s, 13,495 stdout bytes, 8 findings + 1 framing finding.
- codex: 28s, 3,379 bytes, 4 findings.
- gemini: FAILED — exit 1, "exhausted capacity on this model" (operator-level quota; not an
  audit-barrage bug). So the barrage was effectively a 2/3 fleet.

**The four cross-model HIGH-confidence findings (the headline four):**
- **AUDIT-20260529-01** — Exit-vs-close event truncation. `spawnCliAgainstModel` settled on
  `'exit'`, dropping in-flight stdout chunks (silent data-fidelity loss on the load-bearing
  path). claude found it from the event-semantics angle; codex independently from the
  stream-error-race angle. (audit-log.md:357-370) Severity HIGH.
- **AUDIT-20260529-02** — args_template validation vs spawn-cli substitution drift. A config
  like `args_template: "--prompt={{prompt}}"` passed validation but the CLI never received
  the rendered prompt → silent empty-output run. Both models independently flagged the exact
  failure mode. (audit-log.md:372-385) Severity HIGH.
- **AUDIT-20260529-03** — Exit-code contract drift: code, `types.ts` comment, and PRD each
  said something different about when a run is "healthy." (audit-log.md:387-398) Severity
  MEDIUM.
- **AUDIT-20260529-04** — The prompt-renderer was exported but **not wired into the verb at
  all**; `--prompt-file` was read raw. The Phase 12 "project-overridable prompt template"
  acceptance criterion was only half-met. Fix: wired the renderer via the new sibling verb
  `audit-barrage-render`. claude + codex cross-model + in-band Finding-001. (audit-log.md:400-415)
  Severity HIGH.

**Notable single-model finding:** AUDIT-20260529-05 — a ~305s timeout timer leaked on the
spawn-error path; "fires on nearly every real run for any audit-barrage adopter who hasn't
yet installed all configured models" (audit-log.md:430). Severity HIGH, claude-only.

**Closure:** all 11 lifted findings carry `Status: fixed-08971e4` (commit `08971e4`), or
`informational` (AUDIT-20260529-09). (audit-log.md:529-531)

**Why this is the proof:** the acceptance signal was "≥1 finding the in-band self-audit +
SDD review cycle didn't catch." The audit-log calls it "**Met overwhelmingly**"
(audit-log.md:349; ROADMAP:32 "Acceptance signal met overwhelmingly"). The feature's very
first act was to find 13 real bugs in itself that a fully-green 1966-test suite missed.

---

## Design A / B / C arc

Source: `ROADMAP.md` § "Audit-barrage feature shape" (lines 64-162). The family's goal:
> "replace the operator's manually-run codex audit with an automated battery that fires
> multiple LLMs against the same work, gives genetic diversity in failure modes, runs
> out-of-band so the implementation team focuses on features, and removes the audit-quality
> dependency on operator discipline." — `ROADMAP.md:68`

- **Design A — operator-triggered audit-barrage skill (SHIPPED).** The verb pair
  `audit-barrage-render` → `audit-barrage`; shipped as **Phase 12 of scope-discovery**,
  parent issue [#353](https://github.com/audiocontrol-org/deskwork/issues/353) (CLOSED).
  Operator triggers; triage is human. v1 model battery: Claude family (baseline / same class
  as in-band), OpenAI Codex CLI (the operator's manual baseline — "demonstrably catches what
  Claude misses"), Google Gemini CLI (third independent training corpus, "closes the
  diversity gap"). Project-config YAML lets adopters add/remove models without code changes.
  Cost: "~300 lines of TS + tests + the prompt template + the SKILL.md." (`ROADMAP.md:90-123`)

- **Design A.5 — Phase 13 anti-deferral discipline + closure triad (SHIPPED).** Pairs
  structurally with A: where A *produces* findings, A.5 ensures every open finding is worked
  to completion without manual status-flip discipline (promote-findings, the
  check-open-findings implement gate with no bypass flag, TDD commit-msg gate,
  apply-audit-flips, close-shipped-audit-findings, re-audit-fixed-findings).
  (`ROADMAP.md:125-140`) Operator anchor: *"Filing a bug report isn't good enough. It MUST
  BE SCOPED INTO THE WORKPLAN ... A broken implementation is not done — it's broken."*
  (`ROADMAP.md:138`)

- **Design B — lifecycle-triggered automation + meta-audit (NEXT).** Composes over A's
  primitives. Adds (a) **auto-fire at lifecycle waypoints** (`session-end`, `complete`,
  `/release` Pause 5 — no explicit operator invocation) and (b) a **meta-audit synthesizer**:
  a single extra LLM CLI call against the N raw runs that ranks findings by
  confidence × actionability, de-duplicates, flags cross-model agreement, and emits one
  structured findings block. High-confidence cross-model convergence (M of N models) gets
  auto-promoted to the audit-log as `Status: pending-operator-review`. The operator's review
  surface "collapses from 'three raw audit files per session' to 'one meta-audit summary per
  release.'" (`ROADMAP.md:142-154`)
  - **Note:** parts of Design B's auto-fire appear to have landed already — the "Autonomous
    implementation loop" section lists an "End-of-task audit-barrage hook (Phase 15 T4)"
    that "Auto-fires after every commit" and "Phase 16 (#383, shipped) — Audit-barrage always
    fires on new diff." (`ROADMAP.md:177, 183-185`) [INFERENCE: the A→B boundary blurred in
    practice as the implement-hook landed; the ROADMAP still labels full Design B "NEXT."]

- **Design C — continuous background audit daemon (exploratory).** A long-running process
  watching for new commits, firing audit jobs continuously in the background; runs accumulate
  with no operator action; the orchestrator-loop reads them per-turn. "Most ambitious.
  Highest cost (continuous-audit run-rate). Highest decoupling." Committed to "only after
  Design A + B prove the model-diversity payoff justifies the always-on cost."
  (`ROADMAP.md:156-162`)

The pricing tradeoff (`ROADMAP.md:82-88`) is what gates the arc: because the CLIs are
flat-rate (not metered per token), the barrage can fire unconditionally at every task
boundary (Design B) and even continuously (Design C) without per-call cost — the same broad
barrage against API endpoints "accrues meaningful per-call cost" and would NOT be affordable
at that cadence. The flat-rate-CLI choice is what makes the always-on end-state economically
possible.

---

## Key commits & issues

**Commits (branch `main`):**
- `a284fc35` — `feat(scope-discovery): audit-barrage + closure triad + /dwi dampener (Phase 12-15) (#376)` — the merge of the barrage + closure triad.
- `08971e4` (full: see audit-log) — the Phase 12 self-dogfood fix commit; all 11 lifted findings flip to `fixed-08971e4`. (audit-log.md:529)
- `e7f5b4df` — `fix(audit-barrage): catch E2BIG + flip default to {{prompt-stdin}}` (the #386/#397 ARG_MAX fix).
- `740377e9` — `refactor(audit-barrage): extract reportSpawnError + migrate project override to {{prompt-stdin}}`.
- `9fb4db0b` — `test(audit-barrage): pin bare {{prompt-stdin}} template strips to empty argv`.
- Dogfood-barrage rounds (later phases, each surfacing more findings against the tooling itself):
  `44c85d8d` round-2 (7 findings, "hook closes its own loop"), `553651b1` round-3 (3),
  `bfed2e2b` round-4 (5, "all critiquing round-3 fixes"), `9acdc406` round-5 (2,
  "convergence resumed 5 → 2"), `51910c80` round-7 (5, "including recursive regression").
- AUDIT-01 story commits (see below): `c4d7ada2` (introduced the inversion), `a8c98c6d`
  (the fix), `52bc9f0c` (flip AUDIT-01..05 to fixed).

**Issues:**
- [#353](https://github.com/audiocontrol-org/deskwork/issues/353) — parent: "scope-discovery
  Phase 12: multi-model audit barrage (Design A per ROADMAP)" (CLOSED). Triggered by canary
  #349 §2.
- [#349](https://github.com/audiocontrol-org/deskwork/issues/349) — the canary dogfood-feedback
  report that framed the manual codex audit as an unscalable operator-attention cost.
- [#386](https://github.com/audiocontrol-org/deskwork/issues/386) — "audit-barrage spawn E2BIG
  on large diffs." Surfaced 2026-06-01 during a graphical-entries Phase 8 autonomous burndown;
  "the session hit this 6+ times in succession — every implement-hook fire after Step 8.1.2
  onward returned `spawn E2BIG`" because the accumulated diff from a long autonomous `/dwi`
  run exceeded OS ARG_MAX. Fix: deliver the prompt over child stdin (`{{prompt-stdin}}`)
  instead of argv. (issue #386 body; `spawn-cli.ts:146-191`; classifier
  `classifyE2BIGSpawnError` at `spawn-cli.ts:58-66`.)
- [#387](https://github.com/audiocontrol-org/deskwork/issues/387) — "Retire /dw-lifecycle:review
  + /dw-lifecycle:audit in favor of audit-barrage" (OPEN). The barrage has become the project's
  primary review/audit mechanism; the SDD cycle is "no longer operationally enforced."
- [#392](https://github.com/audiocontrol-org/deskwork/issues/392) — "promote-findings: TDD-first
  task shape is unsatisfiable for non-code findings" (OPEN). The end-of-task hook's
  `promote-findings --auto` stamps a uniform TDD-first shape (failing test + `npx vitest run
  ... exits 0`) onto every finding, which can't be satisfied for comment/docs/config findings.

### The AUDIT-01 story (post-merge barrage catches what the green suite missed)

This is the strongest single anecdote of the barrage catching a real, security-relevant bug
that a passing test suite let through. From `DEVELOPMENT-NOTES.md:13` and
`docs/1.0/003-COMPLETE/decompose-agent-discipline/audit-log.md:55-95`:

- In the `decompose-agent-discipline` feature, commit `c4d7ada2` changed `--no-tailscale`
  from "force loopback-only" into a **deprecated no-op** (with a `DESKWORK_STUDIO_NO_TAILSCALE`
  env hatch). The motivating failure was real: operators stranded off-keyboard.
- But the change **silently inverted the security posture** for the *reverse* user class: an
  adopter who scripted `deskwork-studio --no-tailscale` specifically to keep the **no-auth**
  studio off the tailnet now got Tailscale auto-detection and tailnet exposure — "with only a
  stderr line as notice." Because the studio has no auth and Tailscale is a trusted-network
  bind, "this is a security-relevant behavior inversion, not just a cosmetic flag rename."
  (audit-log.md:62)
- The project's own flag-stability rule is about *exit-code* stability; here the exit code was
  preserved but "the *security posture* the flag was protecting is reversed." (audit-log.md:64)
- **The green test suite missed it.** A **post-merge audit-barrage** surfaced it (AUDIT-01),
  and the fix landed in `a8c98c6d`: "loud security-explicit --no-tailscale notice" that warns
  the no-auth studio is now tailnet-reachable and names the loopback-only restore path; plus
  AUDIT-04 normalized env-var truthiness (`=1/true/yes/on`, case-insensitive, trimmed; warns on
  unrecognized values instead of silently failing open). (commit `a8c98c6d` message;
  audit-log.md:95)
- `DEVELOPMENT-NOTES.md:13`: "Post-merge audit-barrage surfaced + fixed a security-posture
  inversion in the `--no-tailscale` change (AUDIT-01) that the green test suite missed." This
  entry also spun off #387 and #392.

---

## Quotable facts & numbers (citable)

- **13 findings, 4 cross-model, all would have shipped.** First audit-barrage run (against
  the barrage itself, Phase 12) surfaced 13 distinct findings across 2 successful models, 4
  with cross-model agreement; "ALL of these would have shipped without this audit (1966/1966
  tests passed; tsc clean; live 3-CLI round-trip returned PROBE-OK)." —
  `docs/1.0/001-IN-PROGRESS/scope-discovery/audit-log.md:349`.
- **"4 cross-model HIGH-confidence + 7 single-model"** is the ROADMAP/SKILL summary of the same
  run — `ROADMAP.md:32`. (Reconcile against the audit-log's 4 + 9 = 13; see caveat above.)
- **All findings NOVEL.** "All 13 audit-barrage findings above were NOVEL — not caught by tsc,
  tests, or the dispatch-wrapper's response validation." — `audit-log.md:520`.
- **Per-model run:** claude 195s / 13,495 bytes / 9 findings; codex 28s / 3,379 bytes / 4
  findings; gemini failed (quota). — `audit-log.md:353`.
- **The binding constraint is operator attention.** "The operator-attention cost is the
  binding constraint. The codex audit demonstrably finds what Claude misses, but it requires
  manual invocation ... Manual discipline doesn't scale." — `ROADMAP.md:80`.
- **Genetic diversity in failure modes.** The three layers "are additive — the barrage does
  NOT replace the other two; it adds genetic diversity in failure modes." — `ROADMAP.md:21`.
  Prompt: "The cross-model genetic diversity comes from each of you reporting independently."
  — `templates/audit-barrage-prompt.md:6`.
- **Same-context blindness.** In-band self-audit is "Same model + same context. ...
  Same-context blind to its own failure modes." — `SKILL.md:153`.
- **CLI, not API — the load-bearing choice.** "A barrage on a multi-thousand-line diff is the
  same operator cost as a one-line probe: zero direct API metering ... This is the load-bearing
  design choice that lets the `/dw-lifecycle:implement` end-of-task hook fire unconditionally
  at every task boundary." — `SKILL.md:12`. Pricing rationale: "Running a broad audit barrage
  against API endpoints accrues meaningful per-call cost. The CLIs are flat-rate." —
  `ROADMAP.md:86`.
- **~300 lines.** "The implementation is small (~300 lines of TS + tests + the prompt template
  + the SKILL.md)." — `ROADMAP.md:123`. (Source dir actually present:
  `config-loader.ts`, `orchestrate-barrage.ts`, `prompt-renderer.ts`, `run-artifacts.ts`,
  `spawn-cli.ts`, `types.ts`.)
- **Parallel, no early exit.** "Fire every model in parallel via `Promise.all`. No early exit:
  a failing model does not abort siblings." — `orchestrate-barrage.ts:10-13`.
- **Spawn-failure code -2.** "Spawn failure (ENOENT, etc.) returns `exitCode: -2` ... The
  orchestrator surfaces the failure in the INDEX without aborting siblings." —
  `spawn-cli.ts:15-17`.
- **Run dir is permanent.** "The run dir is permanent — the dogfood signal is preserved as
  evidence ... the verb itself never deletes a run dir." — `SKILL.md:147`.
- **E2BIG real-world hit.** "the session hit this 6+ times in succession — every implement-hook
  fire after Step 8.1.2 onward returned `spawn E2BIG`." — issue #386 body.
- **AUDIT-01 security inversion.** "Post-merge audit-barrage surfaced + fixed a security-posture
  inversion in the `--no-tailscale` change (AUDIT-01) that the green test suite missed." —
  `DEVELOPMENT-NOTES.md:13`; "a security-relevant behavior inversion, not just a cosmetic flag
  rename." — `decompose-agent-discipline/audit-log.md:62`.
- **Anti-deferral anchor.** "Filing a bug report isn't good enough. It MUST BE SCOPED INTO THE
  WORKPLAN ... A broken implementation is not done — it's broken." — operator, `ROADMAP.md:138`.
- **Model battery v1:** Claude (baseline), OpenAI Codex CLI ("demonstrably catches what Claude
  misses"), Google Gemini CLI ("third family with independent training corpus; closes the
  diversity gap"). — `ROADMAP.md:115-117`.
- **Gemini disabled in practice.** Project config override disabled gemini effective 2026-06-01
  — "gemini-cli was failing 94.1% of runs (16 of 17 across the graphical-entries Phase 0 audit
  cycle)" on JSON-routing failures + quota errors; the battery "was effectively a 2/3 fleet
  (claude + codex) in practice." — `.dw-lifecycle/scope-discovery/audit-barrage-config.yaml:6-15`.

---

## Source index

- `/Users/orion/work/deskwork/ROADMAP.md` (§ "Recently shipped — Audit-barrage"; § "Audit-barrage feature shape"; § "Autonomous implementation loop")
- `/Users/orion/work/deskwork/DEVELOPMENT-NOTES.md:13`
- `/Users/orion/work/deskwork/plugins/dw-lifecycle/skills/audit-barrage/SKILL.md`
- `/Users/orion/work/deskwork/plugins/dw-lifecycle/skills/audit/SKILL.md`
- `/Users/orion/work/deskwork/plugins/dw-lifecycle/skills/re-audit-fixed-findings/SKILL.md`
- `/Users/orion/work/deskwork/plugins/dw-lifecycle/src/scope-discovery/audit-barrage/` (orchestrate-barrage.ts, spawn-cli.ts, + config-loader.ts, prompt-renderer.ts, run-artifacts.ts, types.ts)
- `/Users/orion/work/deskwork/plugins/dw-lifecycle/templates/audit-barrage-prompt.md`
- `/Users/orion/work/deskwork/.dw-lifecycle/scope-discovery/audit-barrage-config.yaml`
- `/Users/orion/work/deskwork/docs/1.0/001-IN-PROGRESS/scope-discovery/audit-log.md:347-533` (Phase 12 self-dogfood)
- `/Users/orion/work/deskwork/docs/1.0/003-COMPLETE/decompose-agent-discipline/audit-log.md:55-95` (AUDIT-01)
- GitHub issues #353, #349, #386, #387, #392 (via `gh issue view`)

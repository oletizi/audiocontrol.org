# Research raw: the audit-barrage's evolution in stack-control

**Scope:** the `stack-control` plugin evolution only (the dw-lifecycle origin is covered by a
separate research note). Source: `feature/stack-control` branch of `/Users/orion/work/deskwork`
(read read-only via `git show` / `git log`). Every claim cites a commit hash or file path.
Where a statement is inference rather than directly stated, it is tagged **[INFERENCE]**.

Note on branch naming: the work lives on `feature/stack-control`, but most artifacts and commit
trailers still say `feature/pluggable-lifecycle-providers` — that was the original program branch
name; the rename to `feature/stack-control` happened late and several internal strings are stale
(see TF-17 in `0c388aea`). The `004-spec-governance` spec dir, the audit-log, and the
`docs/1.0/001-IN-PROGRESS/pluggable-lifecycle-providers/` docs tree all carry the old name.

---

## From dw-lifecycle to stack-control (what changed)

stack-control is a NEW plugin (`plugins/stack-control/`) built around the thesis **"invest heavily
in up-front design and tooling; industrialize execution"** (`96855cc4` docs: record the thesis).
The audit-barrage that originated in dw-lifecycle was carried into this plugin and matured along
four axes:

1. **It was vendored in-house, severing the dw-lifecycle dependency.** Commit `d003312e`
   (`feat(stack-control): vendor audit-barrage in-house — remove the dw-lifecycle dependency`,
   `multi/migrate-audit-barrage`) did a structure-preserving copy of the barrage lib
   (config-loader, orchestrate-barrage, prompt-renderer, spawn-cli, run-artifacts, types), the
   convergence criterion (`check-barrage-dampener`), the extraction (`extract-barrage-findings`),
   and 3 `stackctl` verbs (`audit-barrage-render` / `audit-barrage` / `audit-barrage-lift`).
   Operator directive quoted in the commit: "dw-lifecycle is being deprecated and is NOT an allowed
   dependency." Result: "ZERO dw-lifecycle references (no import, no shell-out, no requires)."
   Re-namespaced override paths from dw-lifecycle → `.stack-control/audit-barrage-{config,prompt}`
   and run-dir root → `.stack-control/audit-runs/` (32 string replacements). This commit
   superseded AUDIT-20260607-10 and -12 (the deep-import coupling and the lift-test dependency).
   The commit reports a LIVE native barrage firing `claude`, writing a run-dir, lifting 5 findings
   (incl. a BLOCKING contradiction on a seeded fixture), and the gate returning `blocked`.

2. **The barrage now governs SPECS, not just code** — see "Auditing specs, not just code" below.
   Feature `004-spec-governance` (codename `design/spec-governance`) fires the barrage over a spec
   at definition time. Source: `e849ad1e` (author spec via `/speckit-specify`) through the whole
   004 chain.

3. **`stackctl govern` single-sources the whole protocol** for both phases — see next section.

4. **The convergence/dampener/slush protocol was ported and hardened** through a live
   self-governing convergence loop — see "The convergence loop & dampener rules."

The organizing principle is repeated across commits as **"detection over instruction"**: make the
failure state (an ungoverned, self-contradictory spec) *mechanically surfaced* rather than relying
on a human remembering to run the barrage (`specs/004-spec-governance/spec.md`, "Why this feature
exists").

---

## stackctl govern (single-sourcing the protocol)

**Design doc:** `docs/1.0/001-IN-PROGRESS/pluggable-lifecycle-providers/govern-consolidation-design.md`
(committed `f5efadca`). It is explicit that this is "an implementation-task design, not a Spec Kit
feature spec," driven by operator directive 2026-06-06: "rip out the duplication now."

**The verified problem** (from the design doc): the audit-protocol *orchestration* was duplicated
and divergent across three bash scripts:
- `spec-governance/scripts/bash/govern-spec.sh` (235 lines): full protocol — render → barrage →
  lift → **slush → gate**.
- `deskwork-governance/scripts/bash/govern.sh` (141 lines): render → barrage → lift only. **No
  slush, no gate.** Its comment literally said "mirror govern.sh lines 25-42."
- `.specify/extensions/deskwork-governance/scripts/bash/govern.sh`: a STALE hand-copy that still
  shelled `dw-lifecycle` (pre-vendoring) — **and it was the copy the live `after_implement` hook
  actually ran**, so the "no dw-lifecycle dependency" achievement "is not live." The operator
  called the duplication the "nucleation site of pathology" (`845cf43c`).

**The fix:** commit `845cf43c` (`feat(govern): single-source the audit protocol in stackctl govern
(both stages)`) created a new TS subcommand `stackctl govern --mode <implement|spec>`:
- `src/subcommands/govern.ts` (arg parse + orchestration)
- `src/govern/protocol.ts` (slug resolve, barrage-bin guard, render→barrage→lift→slush→gate,
  verdict + exit code; dropped the `jq` dependency by assembling vars via `JSON.stringify`)
- `src/govern/payload-implement.ts` (git diff + bounded untracked fold)
- `src/govern/payload-spec.ts` (spec[+plan] fold, checkpoint defaulting)

Key consequence stated in the commit: **both modes now run slush + the convergence gate. This GAVE
the implementation stage the full protocol it previously lacked (it only barraged+lifted) — closing
the spec/impl asymmetry.** The two bash scripts shrank to thin shims (141→36 and 235→47 lines) that
`exec stackctl govern --mode <x>`. Per-stage difference is ONLY: the payload (mode), what `blocked`
gates (spec = next-step graduation; implement = done-ness), and an implement-only clone-detection
step. "Convergence criterion / finding state machine / slush / gate are identical." Verified vitest
79/79 (up from 58).

Related same-session work: `a38bfc6d` re-synced the stale `.specify` install + fixed repo-root shim
resolution (the live regression); `dee24fbd`/`cce44dc6` fixed the clone detector to scan shell (not
just TypeScript) and ignore `.specify`; `63c4466f` wired clone detection into the session lifecycle.
The live regression "hid for ~2 days" (TF-16, `0fabe3f9` tooling-feedback) — the deeper class named
is "mechanism exists but never fires."

---

## The convergence loop & dampener rules

The protocol is a loop: **barrage → triage/fix the spec → re-barrage → … until convergence**
(`specs/004-spec-governance/spec.md` FR-010). The mechanics, as implemented in
`plugins/stack-control/src/scope-discovery/promote-findings/check-barrage-dampener.ts` and
`slush-remaining.ts`:

### The dampener — two ways to engage (the `(branch a) OR (branch b)` predicate)

From `check-barrage-dampener.ts` (`checkBarrageDampener`), `dampened = consecutiveQuietEngages ||
singleRunCleanEngages`:

- **Branch (a) — single-run-clean** (the stiffer one): the MOST RECENT run has **0 open HIGH+ AND
  0 open MEDIUM**. A single clean run engages immediately, no second run needed. Origin: operator
  directive 2026-05-31, recorded in the source doc-comment.
- **Branch (b) — N-consecutive-quiet** (the looser one): the last **N (default 2) consecutive**
  recorded runs each have **0 open HIGH+** (high or blocking). Branch (b) does NOT itself require
  0 MEDIUM. This is the **two-consecutive-0-HIGH window**.

The branches are "intentionally asymmetric (it is the ported protocol)" (`spec.md` FR-010). An
*iteration* is one recorded barrage run (one audit-log lift section). "Consecutive" = the last N
recorded runs for that checkpoint, regardless of whether the spec text changed between them — an
inter-iteration edit does NOT reset the count. "Two-consecutive-quiet is a **stability heuristic**,
not a determinism proof." HIGH+ counted only when `Status: open` (dispositioned findings don't
count) — a literal `Status:`-line scan, NOT similarity matching.

The exact meaning of "dampener engaged" was itself a barrage finding: AUDIT-20260607-46 (`381d1267`,
`fix(spec-004): disambiguate 'dampener engaged' = (branch a OR branch b)`). The third live barrage
under the blast-radius rubric flagged a cross-model HIGH (8 sub-findings): FR-010 had overloaded the
term — its gate condition treated it as (a OR b) while a definition sentence narrowed it to
two-consecutive-only (b), making branch-(a) single-run graduation unreachable for an agent reading
the definition. The fix verified the premise against the code (`slush-remaining.ts:236`,
`spec-governance-gate.ts:208`, `check-barrage-dampener.ts:206` all key off `dampened = (a OR b)`)
and disambiguated the spec to match. Notably the bug was **self-inflicted by the prior AUDIT-45 fix**.

### The cross-run union gate (the SC-006 guarantee)

Graduation requires **BOTH** the dampener engaged (per-run verdict) **AND** the cross-run blocking
open-set empty. The second condition was added by AUDIT-20260607-45 (`5f649ceb`, `fix(govern): gate
blocks on cross-run union of un-dispositioned HIGH/BLOCKING`). The second live barrage under the
blast-radius rubric found a cross-model HIGH: the gate had counted only the most-recent run's open
findings, but SC-006 promises a recorded-open HIGH blocks graduation until dispositioned — a HIGH
surfaced in run N then stochastically NOT re-flagged in N+1/N+2 would let the gate graduate with
run-N's HIGH still open (the "expected unattended-mode path"). Fix: `countOpenFindingsUnion()` in
`check-barrage-dampener.ts` unions un-dispositioned HIGH/BLOCKING across ALL the checkpoint's
recorded runs via the SAME literal-`Status:` parser (`findBarrageSections` + `countHighPlusInSection`)
— deliberately NOT similarity matching, "so it does not reintroduce the deleted cross-run
reconciliation fiction." The two-consecutive dampener verdict stays per-run; only the blocking
open-set is unioned.

### The dampener (slush) rules — slush vs promote; HIGHs never slushed

`slush-remaining.ts` (`slushRemaining`) is the loop's terminator. Verbatim operator directive in
the source doc-comment (Phase 15 closeout, 2026-05-31): *"We should address all of the auditors'
findings, but when we've gone two consecutive audits with 0 high issues, we can bin the smaller
items into the slush pile."*

- Slush flips residual `Status: open` MEDIUM/LOW findings to
  `acknowledged-slush-pile-<YYYY-MM-DD>` — a third disposition state, "acknowledged-as-not-fixed,"
  distinct from `open` and `fixed-<sha>`.
- **Slush REFUSES unless the dampener is engaged** (it returns `dampenerEngaged: false` and changes
  nothing) — "slushing while the audit still surfaces real bugs would erase signal."
- **HIGH/BLOCKING findings are NEVER slushed.** They are collected into `skippedHighs` and left
  `Status: open`. A future barrage surfacing a HIGH resets the dampener; that HIGH re-surfaces as
  next work. A HIGH clears only by a recorded `fixed-<sha>` or a recorded acknowledgment with a
  substantive reason — never silently.
- The slush step is **automatic and runs on every protocol pass, BEFORE the gate evaluates**: the
  chain is **render → barrage → lift → slush → gate** (`spec.md` FR-015). It is a no-op until the
  dampener engages, so an early noisy pass slushes nothing.

### DRY-collapse as the real convergence fix (AUDIT-20260607-47)

This is the standout "real fix" of the late convergence loop. Commit `65e2936d` (`fix(govern):
slush all remaining MED/LOW at convergence + DRY-collapse convergence spec`). The commit names the
ROOT CAUSE of findings 44/46/47: **"the spec re-derived the convergence/dampener/slush/union
mechanic in ~6 prose locations that drifted out of sync (a DRY violation in spec prose)."** AUDIT-47
specifically: FR-010's absolute "no open MEDIUM at graduation" contradicted SC-007's gating-run
scoping, because the convergence slush only binned the most-recent run (Issue #380 `scope:'latest'`),
leaving an EARLIER 0-HIGH run's MEDIUMs open at two-consecutive convergence.

The fix had two halves:
- **Code:** the protocol's convergence-time slush now passes `--scope all`, binning ALL still-open
  MED/LOW across the engaged checkpoint's runs (confined to that checkpoint via `flipCheckpoint`,
  FR-011). Operator's rule quoted: *"when either case obtains, slush any remaining."* HIGH/BLOCKING
  still never slushed. (See the `AUDIT-20260607-47` comment block in `slush-remaining.ts`.)
- **Spec (the DRY-collapse):** "convergence rule DRY-collapsed to a single canonical FR-010
  statement; FR-007/FR-014/FR-015/SC-006/SC-007/AUDIT-03/Key-Entities now reference it instead of
  re-deriving it. **The convergence condition is defined in exactly one place.**" FR-010 carries the
  in-text marker: *"THE canonical convergence rule — every other mention in this spec references
  here, none re-derives it."*

The session-end commit `0c388aea` summarizes: "the DRY-collapse of the duplicated convergence rule
(AUDIT-47) was **the actual convergence fix**." DRY-collapse of prose recurs as a real fix because
the audit-barrage keeps attacking the drift between duplicated descriptions.

### Bounded termination & override

Convergence is over the most-recent recorded runs, so a clean barrage of a fixed spec converges via
single-run-clean — "no fictional window-reset" (FR-014, `5791b346`). If convergence is not reached
within the per-checkpoint iteration ceiling (**default 5**, configurable via `--ceiling` /
`GOVERN_CEILING`), the system records a `non-converged` terminal state. Forward paths: a recorded
`--override "<reason>"` (mandatory reason; no reason → no override), or fix-and-continue raising the
ceiling. AUDIT-44 (`d4cad0e9`) reframed burn-down as out-of-loop manual remediation (a separate
`slush-findings --burn-down` invocation, never wired into the protocol chain — `burnDownSlush()` in
`slush-remaining.ts`). AUDIT-48 (override scope enforced-vs-warned) was left **open** at session end
awaiting an operator fork decision (`1eb0d244`, `0c388aea`).

Gate contract reference: `specs/004-spec-governance/contracts/convergence-gate.md` — verb
`stackctl spec-governance-gate`, states `converged | blocked | non-converged | overridden`, exit
codes 0 (converged/overridden) / 1 (blocked/non-converged) / 2 (fatal). Contract assertion #7
demands **port fidelity**: the criterion result MUST match `check-barrage-dampener`'s engage
decision on identical input — "the same function, not a hand-retyped approximation."

---

## Blast-radius severity rubric

The biggest conceptual addition to the barrage *prompt* in stack-control. Before, severity was a
code-oriented gloss (`high` for correctness bugs adopters hit; `medium` for design issues that
compound; `low` for hygiene). The new rubric rates by **downstream blast-radius**.

**Design doc:** `docs/superpowers/specs/2026-06-07-blast-radius-severity-calibration.md` ("Approach
A — rubric rewrite"), created `eb524c0e`. It resolves the open protocol question "what IS a HIGH."
Operator decision: **Approach A only** — rewrite the rubric in the plugin-default barrage prompt and
field-test, adding a calibration pass (Approach B, a post-barrage re-rater) only if A proves
insufficient. The edit targets the plugin DEFAULT
(`plugins/stack-control/templates/audit-barrage-prompt.md`), not a project override, "since it's a
general fix and the feature branch already isolates it from adopters."

**Shipped:** commit `c1cf8de1` (`feat(audit-protocol): blast-radius severity rubric in the barrage
prompt (Approach A)`). The rubric now in `templates/audit-barrage-prompt.md`:

> **Severity — rate each finding by downstream blast-radius:** the consequence if a downstream
> consumer acts on the audited surface *as written*. The consumer may be an adopter running the
> code, or — especially for a spec — an AI agent building **unattended** from it, with no human to
> catch a wrong reading. Rate by what would actually happen if this shipped as-is, **not by how
> alarming the finding feels.**

The five levels (vocabulary + lift-parser unchanged):
- `blocking` — acting on it as-written breaks the feature's stated goals; OR (for a spec) the more
  natural reading an agent reaches first is the wrong one, so it will likely be built wrong by
  default.
- `high` — a correctness/safety defect a consumer will hit; OR a spec contradiction/ambiguity where
  the readings are roughly equally plausible and the artifact doesn't disambiguate.
- `medium` — a design issue that compounds; OR a spec inconsistency a reasonable consumer would
  resolve correctly anyway.
- `low` — hygiene; cosmetic wording with no behavioral/implementation consequence.
- `informational` — context worth seeing, not itself a defect.

Key framing in the prompt: **"Calibrate by consequence, not by alarm."** A genuine contradiction a
reader would obviously resolve correctly is at most `medium`; a quietly-plausible wrong reading an
agent would actually build is `high`/`blocking` even if it looks minor. "A spec's internal
consistency is load-bearing — it is the input to an unattended build." Every finding must state its
blast-radius reasoning in the body, at every level.

**Field-test outcome:** session-end `0c388aea` reports the rubric "passed its field test
(**5/5 genuine cross-model HIGHs, 0 phantom**)." The design doc named a known limitation
(max-severity aggregation: one panic-HIGH from one model nullifies A on that finding; that's
Approach B's case). A documented meta-lesson from `845afbcc`: **"calibration cannot fix a
false-premise HIGH; only verify-premise can"** — an iteration-3 HIGH was false-on-premise (the
template has 1 criteria location; the doc had quoted the OLD rubric, making the rendered count
appear as 3), de-quoted at the root so it couldn't recur.

---

## Auditing specs, not just code

Feature `004-spec-governance` extends governance **left** — from after-implementation to
definition-time. The motivating evidence (`spec.md`, "Why this feature exists"): a manual
cross-model barrage over the `impl/execution-engine` spec (`specs/002`, claude + codex) surfaced
**51 findings — including 3 real contradictions the author had introduced** plus deep design gaps a
single authoring pass missed. "Spec quality must not depend on a human remembering to run the
barrage."

What changed conceptually for spec-auditing:
- The barrage fires at **`after_clarify`** (the spec is decision-complete then), configurable to
  also fire `after_plan`; `after_specify` is out of scope (a spec there may still carry intentional
  unresolved placeholders). FR-011.
- **Confidence vs severity were split into orthogonal axes** (AUDIT-01/-02, `8da8219c` round-2):
  the gate counts SEVERITY only; cross-model agreement became a separate `cross-model-agreed |
  single-model` annotation. A single-model HIGH-severity finding still blocks the gate. FR-003.
- Spec-specific clustering caveat (FR-003): on single-file specs the path-token agreement branch
  over-clusters (every finding cites the same `spec.md`), so the heading-substring branch (≥12-char
  shared substring) is load-bearing — but it under-clusters when two models word the same finding
  differently. Cross-model agreement on single-file specs is "best-effort in both directions"; a
  single-model HIGH must not be deprioritized on the assumption it "would have clustered."

**Spec-authoring discipline as a captured DEFINE-phase skill.** Commit `07855c8c`
(`design(inbox): capture spec-authoring skill — DEFINE-phase 'how to write a spec'`) captured a
future skill characterized as **"DRY prose, promises-before-mechanism, barrage-enforced."** The DRY
violation in spec prose (AUDIT-47, above) is the direct evidence that spec-authoring needs the same
DRY discipline as code. [INFERENCE] "promises-before-mechanism" describes writing the contract/SC
before the machinery — consistent with the fiction-cascade lesson (specifying mechanism the code
never had).

**Govern delivers via a mandatory Spec Kit hook** (FR-012, AUDIT-09): the spec-governance extension
fires universally whether the operator drives the front-door `define`/`extend` skills or raw
`/speckit-*` commands — never folded into the front-door skills only. Mirrors the founding
`deskwork-governance` `after_implement` extension.

---

## The recursive / self-dogfooding angle

Two distinct recursive loops run in this work:

**1. The barrage audits its OWN design spec (`004` self-hosting).** Commit `0a6465c5` (`T024
dogfood — govern THIS spec via the new extension (self-hosting loop closed)`) governed the
spec-governance spec with the spec-governance extension. The 004 audit-log
(`docs/1.0/001-IN-PROGRESS/pluggable-lifecycle-providers/audit-log.md`) accumulated **20
audit-barrage lift sections and ~70 AUDIT-NN findings** over the run. Findings carried
`AUDIT-20260607-NN` IDs and `fixed-<hash>` disposition markers (e.g. `ca408983` disposition
AUDIT-20260607-47 `fixed-65e2936d`; `0ca3edc5` → `fixed-381d1267`; `f5c70feb` → `fixed-5f649ceb`).
The barrage found real contradictions sitting **inside its own spec** — the audit-log entry for the
SC-004/FR-007 contradiction calls it "precisely the kind of author-introduced internal contradiction
the feature exists to catch, now sitting inside its own spec."

**2. The barrage audits the blast-radius DESIGN DOC before that design ships.** Before implementing
the blast-radius rubric, the design doc itself was barraged across iterations and the findings folded
back in:
- `e727b779` fold in design-barrage findings (iter 1: 2 HIGH + 6 MED + 2 LOW)
- `1e9520c2` fold in iteration-2 findings (iter 2: 0 HIGH, 1 MED, 1 LOW)
- `845afbcc` converge (iter 2 + iter 3 = two-consecutive-0-HIGH → dampener engages → converged)

So the design doc for the severity rubric was itself driven to convergence by the very protocol it
was specifying.

**The "fiction cascade" — the central recursive failure-and-recovery story.** Across rounds 3-5
(roughly `5cfdb6a7` → `cb29ab7f` → `59e08262`), the barrage kept flagging the spec, and the fixes
kept specifying **machinery that did not exist in the code**: AUDIT-31 cross-run reconciliation,
AUDIT-39 severity-aware disposition inheritance, AUDIT-34 cross-checkpoint inheritance, AUDIT-33
`GOVERN_NEW_ATTEMPT`. Commit `5791b346` (`spec(004): align protocol FRs to real per-run code —
delete cross-run fiction`) diagnoses it precisely: *"each specified machinery that does not exist —
and that fiction was the surface the barrage kept attacking (AUDIT-39, -40 both targeted it). The
fresh-context dispatch cured fix-verbosity but kept faithfully specifying fictional mechanisms the
findings demanded."* Reading the actual code (`check-barrage-dampener.ts`, `spec-governance-gate.ts`,
`slush-remaining.ts`) showed the protocol is "purely PER-RUN" with NO cross-run matching. The fix
deleted the fiction and aligned the spec to the as-built per-run protocol.

This drove **two encoded governance lessons** (`7127a704`, `feat(governance): fix-dispatch
discipline`):
1. **WHOLE-ARTIFACT SCOPE** — fixing only the finding's cited span caused AUDIT-41 (FR-007 corrected
   but SC-004 / a scenario / an edge case left contradicting it). Dispatch with the whole artifact
   in scope; run a whole-artifact consistency sweep before re-barraging.
2. **VERIFY THE PREMISE AGAINST THE CODE before specifying machinery** — "confirm a mechanism exists
   in the code before writing it into the spec; when a finding's premise is false, align to as-built
   + record a false-premise acknowledgment instead of inventing the mechanism."

A third related lesson — **fresh-context fix dispatch** (`d2fa2c1e`): operator diagnosis was that
"fix quality degrades under context fatigue, not auditor scope" — so each open finding is dispatched
to a clean, minimal sub-agent context rather than hand-authored in the accumulated orchestrating
context. Encoded into both governance skill bodies (`7127a704`).

---

## Chronological commit timeline

(Most-recent last. Hashes from `git log main..feature/stack-control`. Dates from commit headers.)

**Program framing / Spec Kit bootstrap (pre-004):**
- `96855cc4` record the thesis — invest up front, industrialize execution.
- `1480cb27` make governing the design process first-class in the protocol.
- `156344d6` add design-inbox (low-friction out-of-sequence idea capture).
- `5081326e` (002) reconcile-conflict handling — audit-barrage sanity gate.
- Feature 1 (front door, `specs/003`): `48295090` scaffold → `1de44b18` US1 MVP (execute-check +
  governance rehome) → governance-finding cycles AUDIT-20260605-01..12 → `afc3e64e` front door
  COMPLETE (35/35).

**Feature 004 spec-governance — Spec Kit chain:**
- `e849ad1e` author spec via `/speckit-specify` (2026-06-06).
- `02bda431` `/speckit-clarify` — resolve gate/hook/mechanism + **port the audit protocol**.
- `2d6cd706` `/speckit-plan` — "compose dw-lifecycle barrage + port the protocol as a gate."
- `63f4cb39` `/speckit-tasks` — 24 TDD-first tasks + convergence-gate phase.
- `9ce058c2` `/speckit-implement` — spec-governance extension + convergence gate (US1/US2/US3 + gate).
- `dcebffe6` empty-models-array crash fixed (dogfood-caught) + deterministic smoke.

**004 self-hosting + the vendoring pull-forward:**
- `0a6465c5` T024 dogfood — govern THIS spec (self-hosting loop closed).
- `e8fa3139`/`45c10f90` after_implement governance findings AUDIT-20260607-10..15.
- `d003312e` **vendor audit-barrage in-house — remove the dw-lifecycle dependency** (`multi/migrate-audit-barrage`).
- `9fdb38b5` mark AUDIT-10/-12 fixed by the migration.

**004 convergence loop — fiction cascade rounds (2026-06-06):**
- `1a2f258c` encode the 9 dogfood governance findings into spec.md.
- `701fad25` per-checkpoint convergence loops + outage fail-loud (AUDIT-05/-07).
- `82283836` re-govern after_clarify — 0 HIGH (HIGHs resolved), 8 new MED/LOW (AUDIT-16..23).
- `8da8219c` round-2 — confidence/severity split (AUDIT-16..23).
- `37642683` **port the slush pile — terminate the convergence loop** (AUDIT-03 fidelity).
- `5cfdb6a7` round-3 fixes (healthy-predicate contradiction, override scoping, etc.).
- `d2fa2c1e` capture fresh-context fix dispatch (operator diagnosis: context fatigue).
- `85bfb616` fix step runs in a fresh-context sub-agent, not the orchestrator.
- `cb29ab7f` round-4 fixes AUDIT-31..38 via fresh-context dispatch.
- `59e08262` AUDIT-39 severity-aware disposition inheritance (later deleted as fiction).
- `64c84c8d` iteration-5 — AUDIT-40 (gate non-converged 5/5).
- `5791b346` **align protocol FRs to real per-run code — delete cross-run fiction.**
- `7127a704` fix-dispatch discipline — whole-artifact scope + verify-premise-vs-code.
- `ce9e3228` full-spec consistency sweep vs the per-run model.
- `1ee37265` iteration-7 — AUDIT-42 (fiction cascade cleared; new HIGH on health predicate).

**Single-sourcing govern + clone-detector wiring (2026-06-07 early):**
- `f5efadca` design for single-sourcing the protocol.
- `845cf43c` **single-source the audit protocol in `stackctl govern` (both stages)** (vitest 58→79).
- `a38bfc6d`/`dee24fbd`/`cce44dc6`/`63c4466f` clone-detector + stale `.specify` regression fixes.
- `0fabe3f9` session end — audit-protocol reliability.

**Blast-radius severity calibration (2026-06-07):**
- `eb524c0e` design doc (Approach A — rubric rewrite).
- `e727b779` fold design-barrage findings (iter 1).
- `1e9520c2` fold iteration-2 findings.
- `845afbcc` converge design doc (iter 2+3 two-consecutive-0-HIGH).
- `c1cf8de1` **blast-radius severity rubric in the barrage prompt (Approach A)**.
- `c2f70f76` backfill journal — audit-protocol reliability II.

**Live convergence loop under the new rubric (2026-06-07, iters 9-13):**
- `ce223ce5` AUDIT-42 — split barrage liftability from coverage (crash-after-banner ≠ clean).
- `aa77929e` AUDIT-43 — graduation never carries open MEDIUM.
- `d4cad0e9` AUDIT-44 — reframe burn-down as out-of-loop manual remediation.
- `5f649ceb` **AUDIT-45 — gate blocks on cross-run union of un-dispositioned HIGH/BLOCKING.**
- `381d1267` AUDIT-46 — disambiguate "dampener engaged" = (branch a OR branch b).
- `65e2936d` **AUDIT-47 — slush all remaining MED/LOW at convergence + DRY-collapse convergence spec.**
- `1eb0d244` run-13 lift — AUDIT-48 open (override scope enforced-vs-warned).
- `07855c8c` capture spec-authoring skill (DRY prose, promises-before-mechanism, barrage-enforced).
- `0c388aea` session end — blast-radius rubric field-tested 5/5 genuine; 4 HIGHs fixed; DRY-collapse
  was the real fix; AUDIT-48 open.

---

## Quotable facts & numbers (citable)

- The audit-barrage was **vendored out of dw-lifecycle into stack-control with ZERO dw-lifecycle
  references** ("no import, no shell-out, no requires"). — `d003312e`
- The vendoring commit fired a **live native barrage that lifted 5 findings including a BLOCKING
  contradiction on a seeded fixture**, and the gate returned `blocked`. — `d003312e`
- The duplicated bash orchestration was the operator-named **"nucleation site of pathology."** —
  `845cf43c`; the design doc verified three divergent copies (235 ln, 141 ln, and a stale
  dw-lifecycle-shelling install copy that "is the copy the live `after_implement` hook runs"). —
  `govern-consolidation-design.md`
- Single-sourcing into `stackctl govern` shrank the two bash scripts **141→36 and 235→47 lines** and
  **gave the implementation stage the full slush+gate protocol it previously lacked** (it only
  barraged + lifted). vitest **58→79**. — `845cf43c`
- The motivating evidence for spec-governance: a manual barrage over the `specs/002` spec surfaced
  **51 findings, including 3 real contradictions the author had introduced.** —
  `specs/004-spec-governance/spec.md`
- The dampener default threshold is **2 consecutive 0-HIGH runs**; the iteration ceiling default is
  **5**. — `check-barrage-dampener.ts`, `spec.md` FR-014.
- Dampener = `(branch a: single-run 0-HIGH AND 0-MEDIUM) OR (branch b: two-consecutive 0-HIGH)`. —
  `check-barrage-dampener.ts`, AUDIT-46 (`381d1267`).
- **HIGH/BLOCKING findings are NEVER slushed**; slush **refuses unless the dampener is engaged**. —
  `slush-remaining.ts`.
- Operator directive verbatim: *"We should address all of the auditors' findings, but when we've
  gone two consecutive audits with 0 high issues, we can bin the smaller items into the slush
  pile."* — `slush-remaining.ts` doc-comment (Phase 15 closeout, 2026-05-31).
- The protocol pass order is **render → barrage → lift → slush → gate**, slush automatic-before-gate
  on every pass. — `spec.md` FR-015, `845cf43c`.
- The **"fiction cascade"**: rounds 3-5 fixes specified cross-run reconciliation / disposition
  inheritance / `GOVERN_NEW_ATTEMPT` machinery **the code never had**; `5791b346` deleted it and
  aligned the spec to the as-built per-run protocol. — `5791b346`, `1ee37265`.
- The **blast-radius rubric field-tested 5/5 genuine cross-model HIGHs, 0 phantom.** — `0c388aea`.
- Rubric mantra: **"Calibrate by consequence, not by alarm."** — `templates/audit-barrage-prompt.md`.
- Blast-radius design-doc barrage iteration counts: iter 1 = 2 HIGH + 6 MED + 2 LOW; iter 2 = 0
  HIGH, 1 MED, 1 LOW; iter 3 converged (two-consecutive-0-HIGH). — `1e9520c2`, `845afbcc`.
- Meta-lesson: **"calibration cannot fix a false-premise HIGH; only verify-premise can."** —
  `845afbcc`.
- **DRY-collapse was the actual convergence fix:** the spec re-derived the convergence mechanic in
  **~6 prose locations that drifted out of sync**; AUDIT-47 collapsed it so "the convergence
  condition is defined in exactly one place." — `65e2936d`, `0c388aea`.
- The 004 self-hosted audit-log accumulated **~20 barrage lift sections / ~70 AUDIT findings.** —
  `audit-log.md` (counted on the branch).
- Findings carry `AUDIT-20260607-NN` IDs and `fixed-<hash>` disposition markers (e.g. AUDIT-47 →
  `fixed-65e2936d`). — `ca408983`, `0ca3edc5`, `f5c70feb`.
- The barrage prompt itself instructs models to rate severity for **"an AI agent building
  unattended from [a spec], with no human to catch a wrong reading."** —
  `templates/audit-barrage-prompt.md`.

---

## Source index (files read on `feature/stack-control`)

- `specs/004-spec-governance/spec.md` — the canonical FR-001..FR-015 / SC-001..SC-008 spec.
- `specs/004-spec-governance/contracts/convergence-gate.md` — the gate verb contract.
- `plugins/stack-control/templates/audit-barrage-prompt.md` — the barrage prompt + blast-radius rubric.
- `plugins/stack-control/src/scope-discovery/promote-findings/check-barrage-dampener.ts` — dampener + cross-run union.
- `plugins/stack-control/src/scope-discovery/promote-findings/slush-remaining.ts` — slush + burn-down.
- `docs/1.0/001-IN-PROGRESS/pluggable-lifecycle-providers/govern-consolidation-design.md` — single-sourcing design.
- `docs/superpowers/specs/2026-06-07-blast-radius-severity-calibration.md` — the blast-radius design doc (recursively barraged).
- `docs/1.0/001-IN-PROGRESS/pluggable-lifecycle-providers/audit-log.md` — the 004 self-hosted findings log.

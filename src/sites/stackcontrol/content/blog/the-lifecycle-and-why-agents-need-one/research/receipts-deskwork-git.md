# Receipts — deskwork git history (Acts 2–3)

Evidence for the devlog "The lifecycle, and why agents need one." All SHAs, dates,
and subjects quoted verbatim from `git -C /Users/orion/work/deskwork`. Author of all
cited commits: Orion Letizi. Repo span: 2026-04-21 .. 2026-06-05; 1604 commits on
`main` at time of extraction (the branch `feature/pluggable-lifecycle-providers` carries
the Act-3 stack-control trail on top).

---

## Timeline at a glance

| Date | SHA | What it marks |
|---|---|---|
| 2026-04-21 | `4108e5ff` | Repo genesis — `Initial commit` (LICENSE only) |
| 2026-04-21 | `7311d842` | **The extraction.** Monorepo bootstrap; `.claude` tooling "Ported from audiocontrol.org" |
| 2026-04-26 | `90fd31e8` | First plugin: `deskwork` editorial lifecycle + studio (#1) |
| 2026-04-29 | `c7931cbf` | dw-lifecycle: initial design spec for the project-lifecycle plugin |
| 2026-04-29 | `29fd8750` | dw-lifecycle: plugin skeleton |
| 2026-04-29 | `de97b302` | dw-lifecycle: stub all 15 lifecycle skills |
| 2026-04-29 | `695cf416` | dw-lifecycle: port PRD/workplan/README/definition templates from `/feature-*` |
| 2026-05-25 | `9ddcc6d4` | **scope-discovery genesis** — canonize the audiocontrol pilot into dw-lifecycle (v1) (#298) |
| 2026-05-28 | `847ea708` | ROADMAP added — "multi-model audit barrage as next major planned feature" |
| 2026-05-29 | `4ef3c09f` | **audit-barrage genesis** — Phases 12+13+14 ship the CLI verb + lifecycle (#367) |
| 2026-05-30 | `3a370a19` | audit-barrage end-of-task hook wired into `/dw-lifecycle:implement` |
| 2026-05-31 | `c9849b61` | Phase 16 — barrage always fires on new diff; **dampener** controls disposition (#383) |
| 2026-06-04 | `e7f5b4df` | audit-barrage: catch **E2BIG** + flip default to `{{prompt-stdin}}` |
| 2026-06-04 | `8226e1e0` | **stack-control / Act 3 begins** — pluggable-lifecycle-providers PRD scaffold |
| 2026-06-05 | `48295090` | stack-control: plugin scaffold + `stackctl` dispatcher + version verb |
| 2026-06-05 | `a5a0e6b8` | stack-control front-door verbs **define / extend / execute** |

---

## 1. Repo genesis = the extraction

The deskwork repo did not start as a clean-room invention. The second commit is an
explicit lift of the process tooling Orion had already built inside the audiocontrol.org
website repo.

- `4108e5ff` — 2026-04-21 — `Initial commit` — bare LICENSE file; the repo's first heartbeat (14:16 PDT).
- `7311d842` — 2026-04-21 — `chore: bootstrap monorepo and port claude infrastructure` — **the extraction itself** (14:22 PDT, six minutes later). Body says it verbatim:

  > "Ported from audiocontrol.org's .claude tooling:
  > - agents/ (7 agents: project-orchestrator, feature-orchestrator, typescript-pro, code-reviewer, documentation-engineer, codebase-auditor, architect-reviewer)
  > - skills/ (14 workflow skills: feature-define/setup/pickup/implement/extend/review/ship/complete/teardown/issues/help, session-start/end, analyze-session)
  > - rules/ (session-analytics, workflow-playbooks, testing)"

  The same body records the adaptation: worktree convention `~/work/deskwork-work/<slug>/`,
  GitHub refs repointed to `audiocontrol-org/deskwork`, and "Agent/rule/skill Astro-specific
  content replaced with plugin-specific guidance." It also seeds the founding feature doc
  `docs/1.0/001-IN-PROGRESS/deskwork-plugin/` with a "Six-phase plan: bootstrap, adapter,
  core skills, dogfood, visibility skills, cutover and cleanup."

**Why it matters:** the founding state of the repo *is* the audiocontrol process,
copy-ported one directory at a time. Act 2 starts as a transplant, not a rewrite.

- `90fd31e8` — 2026-04-26 — `deskwork plugin: editorial lifecycle + standalone studio (Astro severance) (#1)` — the first actual *plugin* (the editorial-calendar product). Distinct from the lifecycle process; this is the first thing the ported tooling was used to build inside the new repo.

---

## 2. dw-lifecycle plugin formation

Eight days after the extraction, the ported `/feature-*` skills get re-incarnated as a
distributable plugin — `dw-lifecycle` — with its own CLI, config, and template set.
All on 2026-04-29 unless noted.

- `c7931cbf` — 2026-04-29 — `docs(dw-lifecycle): initial design spec for project-lifecycle plugin` — first appearance of the name `dw-lifecycle`.
- `ab3d4cfd` — 2026-04-29 — `docs(dw-lifecycle): implementation workplan (output of /superpowers:writing-plans)` — the plan that the lifecycle plugin would itself build by.
- `29fd8750` — 2026-04-29 — `feat(dw-lifecycle): plugin skeleton`.
- `8cf9a225` — 2026-04-29 — `feat(dw-lifecycle): bin wrapper + cli stub` — the `dw-lifecycle` binary is born.
- `de97b302` — 2026-04-29 — `feat(dw-lifecycle): stub all 15 skills` — the lifecycle verb-set (define/setup/implement/ship/session-start/session-end/etc.) stubbed in one shot.
- `5425a654` — 2026-04-29 — `feat(dw-lifecycle): register in marketplace.json` — packaged for Claude Code install.
- `7330ca5e` / `48f268f6` — 2026-04-29 — config schema + loader; repo + git helpers — the plugin's machinery.
- `0582d8c5` — 2026-04-29 — `feat(dw-lifecycle/bin): version-aware doc-tree resolution` — the `docs/<v>/<status>/<slug>/` feature-doc convention, ported and made first-class.
- `68d3772d` / `165a6883` — 2026-04-29 — workplan parser + step-mark helpers ("throws on missing" — no silent fallback).
- `695cf416` — 2026-04-29 — `feat(dw-lifecycle): port PRD/workplan/README/definition templates from /feature-*` — **the feature-doc convention lifted wholesale** from the audiocontrol `/feature-*` skills into dw-lifecycle templates.
- `802438bf` — 2026-04-29 — `feat(dw-lifecycle/bin): doctor subcommand (peer-plugins + missing-config rules)`.

Integration / first release:

- `c53f6147` — 2026-04-29 — `feat(dw-lifecycle): align with v0.9.5 architecture pivot`.
- `18202805` — 2026-04-29 — `feat(dw-lifecycle): integrate with monorepo /release flow`.
- `66a18779` — 2026-04-29 — `docs: session end — dw-lifecycle integration with v0.9.5/v0.9.6, landed on main`.
- `f28dd8b4` — 2026-05-06 — `fix(plugins): add commands/ shims for every skill so /<plugin>:<skill> reaches users (#185)` — the slash-command surface (`/dw-lifecycle:*`).

**Why it matters:** dw-lifecycle is the audiocontrol process *generalized out of* the
website repo into a standalone, installable plugin — the literal "generalized it OUT"
beat of the story.

---

## 3. Audit-barrage — genesis + evolution

The audit barrage did not begin as a feature; it began as a documented *constraint*. The
operator's manually-run codex audit "demonstrably finds what Claude misses," but manual
discipline doesn't scale. The barrage automates the firing and keeps the triage human.

### Roadmap framing (the motivation, in the operator's own words)

- `847ea708` — 2026-05-28 — `docs: add ROADMAP — multi-model audit barrage as next major planned feature` — `ROADMAP.md` §"Planned next — multi-model audit barrage" lays out the three-layer audit posture and names the binding constraint:

  > "The operator-attention cost is the binding constraint. The codex audit demonstrably finds what Claude misses, but it requires manual invocation, manual copy-paste, manual finding-by-finding triage. Manual discipline doesn't scale. Automation removes the discipline dependency."

  The roadmap also fixes the **CLI-not-API** posture ("Usage-based pricing vs. token-based … The CLIs are flat-rate"; existing CLI auth; subprocess orchestration is a well-trodden path) and specifies **Design A — operator-triggered audit-barrage skill (v1 milestone)** with the model battery claude / codex / gemini.

- `def19d1b` — 2026-05-28 — `docs: refresh ROADMAP — hygiene shipped (v0.26.0–v0.26.5); audit-barrage moves to active`.
- `fde6722b` — 2026-05-28 — `docs(scope-discovery): Phase 12 extension — multi-model audit barrage` (scoped as an *extension of scope-discovery* — its host feature).

### Genesis commit (the verb ships)

- `4ef3c09f` — 2026-05-29 — `feat(scope-discovery): Phase 12 + 13 + 14 — audit lifecycle + closure triad + friction fixes (#367)` — **first-appearance of the `audit-barrage/` source tree** (`--diff-filter=A` confirms it). The squashed body documents the build in stages:
  - Task 1: probed the real CLIs on the operator's machine — `claude -p '<prompt>' < /dev/null`, `codex exec '<prompt>' < /dev/null`, `gemini '<prompt>' < /dev/null`; "all three need stdin closed."
  - Task 2: the `audit-barrage` CLI verb + subprocess orchestration library — `spawn-cli.ts`, `orchestrate-barrage.ts`, `subcommands/audit-barrage.ts`. "43 new vitest scenarios … Live verification against three REAL installed CLIs: all three returned PROBE-OK … 11.5s wall time."
  - Task 3: the prompt template + YAML config loader, "say nothing if you find nothing."

### Evolution

- `3a370a19` — 2026-05-30 — `docs(scope-discovery Phase 15 Task 4c): wire end-of-task hook into implement SKILL.md` — **the `/dwi` end-of-task hook.** Five CLI calls between the task-completion commit and the scope-widen step (render → barrage → lift → promote-findings → check-open-findings). Per the **Phase 15 operator directive** quoted in the body:

  > "audit-barrage and amelioration … seamless … no questions … findings are guardrails not exceptions to point the implementation team back to the happy path."

  The hook is unconditional — no `--skip-audit-barrage-hook` flag.

- `f68fb2a7` — 2026-05-30 — `feat(scope-discovery Phase 15 Task 3): audit-barrage-lift CLI verb` — lifts raw per-model output into the canonical audit-log.
- `b0e9a93b` — 2026-05-31 — `fix(audit-barrage): defer tip.sha write to after at least one model succeeds (AUDIT-21)` — a barrage finding fixing the barrage.
- `c9849b61` — 2026-05-31 — `feat(audit-barrage): Phase 16 — always fire on new diff, dampener controls disposition (#383)` — **the dampener.** Splits a fused gate that had been skipping the whole hook:

  > "the fused gate skipped the whole hook when the dampener engaged, which meant long autonomous burndowns (graphical-entries Phase 0: 70 tasks across diverse subsystems) ran with zero audit coverage on new work."

  New posture: the ONLY legitimate skip is "zero new diff since the most-recent barrage's `tip.sha`"; the dampener moves to a separate slush-vs-promote disposition gate that runs *after* the barrage fires.
- `7a4ca74b` — 2026-05-31 — `docs(scope-discovery): scope Phase 17 — mechanize audit-barrage hook with teeth` — enforcement layer.
- `b7103a34` — 2026-05-31 — `fix(implement-hook): correct counter parsing — counts now match actual findings (#384, AUDIT-18)`.
- `151e4a51` — 2026-06-02 — `fix: reconcile audit-barrage "third surface" framing with deleted review rule (AUDIT-20260602-07)` — the barrage is the "third audit surface" (after in-band self-audit and the two-reviewer SDD cycle).
- `e7f5b4df` — 2026-06-04 — `fix(audit-barrage): catch E2BIG + flip default to {{prompt-stdin}}` — **the E2BIG/stdin fix.** A real dogfood crash:

  > "fresh scope-discovery opt-in defaults the barrage range to HEAD~10..HEAD, whose embedded diff exceeds the OS per-arg limit (~256 KB macOS … MAX_ARG_STRLEN). Node's spawn() throws synchronously on E2BIG — the existing async child.on('error', …) handler never sees it, so the orchestrator crashed."

  Fix: wrap `spawn()` in try/catch with a structured E2BIG classifier; flip all three default models to `{{prompt-stdin}}` so the diff goes over stdin, not argv.
- `740377e9` — 2026-06-04 — `refactor(audit-barrage): extract reportSpawnError + migrate project override to {{prompt-stdin}}` — cleanup riding the same fix.

**Why it matters:** the barrage is the *unique value* of the generalized tool — genetic
diversity across model families (claude/codex/gemini), fired automatically out-of-band so
the audit quality no longer depends on operator discipline. Its whole arc (Design A →
end-of-task hook → dampener → E2BIG) is visibly forged by dogfooding its own crashes.

---

## 4. Scope-discovery — genesis + evolution

Scope-discovery is the *other* pillar, and the receipts show it was **piloted inside
audiocontrol first**, then canonized into dw-lifecycle so every adopter inherits it.

### Genesis (the canonization = a second, smaller extraction)

- `9ddcc6d4` — 2026-05-25 — `feat(scope-discovery): canonize audiocontrol pilot into dw-lifecycle plugin (v1) (#298)` — first appearance of `scope-discovery`. Body:

  > "Captures the design for moving the audiocontrol-piloted Scope Discovery Protocol into dw-lifecycle so any project using dw-lifecycle gets it. Plugin holds CODE (scanners, validators, discovery agents, dispatch wrapper) … project holds CONFIG (clones.yaml, anti-patterns.yaml, etc.)."

  It names the design spec `docs/superpowers/specs/2026-05-24-scope-discovery-design.md`
  (517 lines), the explicit slash commands `/dw-lifecycle:scope-inventory` +
  `/scope-widen` + "~16 other new commands," auto-invocation in
  `define`/`implement`/`review`, and the **canary**: "the in-flight graphical-entries
  feature becomes the canary … v1's acceptance signal is a paper-test-graphical-entries.md
  coverage matrix analogous to the pilot's paper-test-s550.md" (S-550 = an audiocontrol
  editor — the pilot's home).

### Evolution

- `543879f8` — 2026-05-26 — `feat(scope-discovery): Phase 11 — self-correcting discovery loop + acceptance (#317)`.
- `05b8272f` — 2026-05-27 — `fix(scope-discovery): canary feedback + self-dogfood + Phase 11 vocabulary purge (#320)`.
- `6b0b3f84` — 2026-05-27 — `fix(scope-discovery): TF-004 + TF-005 — close v0.24.1 canary findings (#321)` — tooling-feedback (TF) loop closing canary friction.
- `eda6338e` — 2026-05-28 — `feat(scope-discovery): implement unmatched-shape clustering algorithm (closes #318) (#322)` — clone-clustering.
- `4ef3c09f` — 2026-05-29 — (same commit as §3) audit-barrage ships *as a scope-discovery phase* — the two pillars share a host feature.

The scope-discovery vocabulary in play across the history — `clones.yaml`, `check-clones`,
`scope-widen`, `anti-patterns.yaml`, `adopter-manifests.yaml`, the dispatch-wrapper — all
trace to this canonization. Representative later mechanics:

- `37683c83` — 2026-05-29 — `fix(38·1): clone gate honors .gitignore — set gitignore:true (#354)`.
- `d0aa9a5f` — 2026-06-03 — `feat(scope-discovery): Phase 25 Task 6 — skill folder rename check-editor-symmetry → check-module-symmetry (Closes AUDIT-20260604-07 (claude-01 + codex-01; cross-model))` — a barrage finding (cross-model) driving a scope-discovery rename.
- `4d003915` — 2026-06-04 — `feat(scope-discovery): Phase 28 — branch-staleness session-start advisory (Refs #422)` — still actively extending on the day of extraction.

**Why it matters:** scope-discovery answers "what did the original scope miss?" — and the
receipts show it earning that claim against a live canary (graphical-entries), with its
own findings recycled through the very TF + audit-log loops it defines.

---

## 5. Continuous-improvement texture — "forged by correction"

The history is dense with the pattern: a barrage finding (`AUDIT-####`, often tagged
cross-model) or an operator directive lands, gets lifted into the audit-log, promoted into
the workplan, and closed by a fix. A few representative moments:

- `c9849b61` — 2026-05-31 — **#383**, the dampener (see §3): a structural bug — autonomous 70-task burndowns running "with zero audit coverage on new work" — caught and fixed by splitting a fused gate. The canonical structural-fix receipt.
- `cbc4f801` — 2026-05-29 — `audit(graphical-entries): lift audit-barrage findings AUDIT-36..42 (Status: open)` → `020954af` — `workplan(graphical-entries): promote AUDIT-36..42 to Tasks 7.9..7.15 (TDD-first fix tasks)` — the lift→promote→fix pipeline in three commits.
- `a2f2d415` — 2026-05-29 — `audit(graphical-entries): lift 24 audit-barrage findings AUDIT-20260530-01..24 (Status: open)` → `b58f59c7` — promote to Tasks 7.16..7.39, then a run of `Closes AUDIT-20260530-0x` security fixes (path-traversal charset guards: `7e15a612`, `9edc0851`, `c569a619`). One barrage run, 24 real findings, a fix per finding.
- `aa208ee8` — 2026-06-03 — `fix(scope-discovery): Closes AUDIT-20260604-04 (claude-01 + claude-02 + claude-03 + codex-01; cross-model) — extract shared isWellFormedFixTaskRange predicate` — cross-model agreement (3× claude + codex) driving a refactor.
- `e6d1fe99` — 2026-06-04 — `fix(scope-discovery): Closes AUDIT-20260604-32 + AUDIT-20260604-33; flips AUDIT-31 to fixed-c254c1ed — revert invented-rule citations + honest open-bug box state` — the barrage catching the *docs* fabricating rule citations; a correction of the tool's own honesty.
- `972d8dba` — 2026-06-03 — `docs+commands(scope-discovery): address AUDIT-26/29/30 substantive critiques from auto-slushed barrage findings` — even auto-slushed (dampened) findings get re-examined and addressed.
- `9ddcc6d4` — 2026-05-25 — operator-named canary: body notes "Real-world validation case (operator-named this round): the in-flight graphical-entries feature becomes the canary."

**Why it matters:** this is the "continuous improvement" texture — the tool is improved by
the corrections its own audit barrage surfaces, not by speculative design.

---

## 6. The stack-control rebuild (Act 3)

On branch `feature/pluggable-lifecycle-providers` (local + `origin/`), Orion rebuilds the
generalized process a third time — now as **stack-control** (`stackctl`), integration-first
on top of **Spec Kit**, keeping the two pillars (audit-barrage + scope-discovery) as
*later* migrations.

### The pivot to Spec Kit + the north star

- `d2ee11e0` — 2026-06-04 — `docs(pluggable-lifecycle-providers): capture north-star ideal (parallel multi-CLI execution engine + governor) in PRD + README; log TF-06/TF-07`.
- `bcbee3a5` — 2026-06-04 — `docs(pluggable-lifecycle-providers): TF-08 prior-art study (MAQA/Fleet) — cross-CLI fan-out is deskwork's differentiator` — confirms the barrage is the differentiator carried forward.
- `acd34da4` / `a2dfcef4` — 2026-06-04 — log Spec Kit bootstrap friction (TF-01..04); `chore(pluggable-lifecycle-providers): bootstrap Spec Kit 0.9.4 native infrastructure via specify init --integration claude` — **Spec Kit becomes the substrate.**
- `78ea4dd6` — 2026-06-04 — `constitution(speckit): ratify v1.0.0 — 8 principles for the pluggable-lifecycle-providers dogfood`.
- `8226e1e0` — 2026-06-04 — `docs(pluggable-lifecycle-providers): scaffold PRD + workplan + README + carry design.md + feature-definition.md` — the Act-3 feature's PRD scaffold (earliest stack-control docs).

### First vertical slice — governance as a Spec Kit `after_implement` extension

- `dadd5a85` — 2026-06-04 — `spec(speckit-backhalf-slice): reshape to Model 3 — deskwork governance as a Spec Kit after_implement extension (clarify outcome)`.
- `b6742c45` / `f95f765d` — 2026-06-04 — plan + dependency-ordered tasks (TDD, 14 tasks) for the governance `after_implement` extension.
- `5ad13593` → `5aace726` → `f3dc5751` → `88509768` → `b8546672` — 2026-06-04 — RED smoke → `govern.sh` orchestration + `after_implement` hook → GREEN cross-model barrage fired via the extension → self-findings AUDIT-24..28 lifted and disposed → "slice COMPLETE." **Proof the barrage fires from inside a Spec Kit run.**

### Standing up the stack-control plugin + front door (spec `003`)

- `0a92b9ab` / `79cb7304` / `7a49e113` — 2026-06-04 — capture program vision; realign feature docs to the stack-control architecture; resequence the program around the self-hosting strategy.
- `0c39265f` — 2026-06-04 — `docs(stack-control): amend Spec Kit constitution to the stack-control program (1.0.0 -> 1.1.0)`.
- `6acac632` — 2026-06-04 — `docs(stack-control): seed Feature 1 spec — stack-control front door (specs/003)`.
- `51d03ffd` — 2026-06-05 — `docs(stack-control): /speckit-plan Feature 1 — plan + research + contracts + clarifications`.
- `0bab3159` — 2026-06-05 — `docs(stack-control): /speckit-tasks Feature 1 — 34 tasks, TDD-first, MVP=US1 (native exec + governance)`.
- `40349514` — 2026-06-05 — `docs(stack-control): /speckit-analyze remediation — +seam fail-loud task (C1) … 34→35 tasks` (the `/speckit-plan|tasks|analyze` flow, native Spec Kit).
- `8a960142` — 2026-06-05 — `docs(stack-control): branch-local session-start/end skills orient to Spec Kit, not dw-lifecycle` — **"orient to Spec Kit not dw-lifecycle"**, verbatim. Body: repoint the session skills so "a fresh, blank-context agent restarting here is oriented to the Spec Kit tooling + this feature's docs instead of the deskwork-studio product / dw-lifecycle workplan ceremony." Crucially: *"The dw-lifecycle PLUGIN skills (plugins/dw-lifecycle/skills/session-*) are untouched."*
- `a5a0e6b8` — 2026-06-05 — `docs(stack-control): front-door verbs define/extend/execute; fat plugin, no npm (decisions)` — **the front-door verbs.** "Front door = define / extend / execute … two verbs borrowed from dw-lifecycle's lifecycle vocabulary … now over a Spec Kit substrate." Plugin shape: "fat in-tree plugin mirroring dw-lifecycle, NOT published to npm … features 3/4/5 move dw-lifecycle's in-tree code in, so fat keeps migrations as git mv."
- `48295090` — 2026-06-05 — `feat(stack-control): plugin scaffold + stackctl dispatcher + version verb (Feature 1 Phases 1-2)` — **the `stackctl` dispatcher is born.**
- `1de44b18` — 2026-06-05 — `feat(stack-control): US1 MVP — execute-check + governance rehome + execute skill + seam guard (Feature 1 Phase 3)` — **governance rehomed into stack-control**; the execute skill + neutrality seam guard land.
- `ad694abb` / `5833f356` / `813fef2f` — 2026-06-05 — `fix(stack-control): address governance findings AUDIT-20260605-0x (cross-model)` — the barrage already auditing stack-control's own first commits.

### Succession confirmed (quoted from the spec on the branch)

`specs/003-stack-control-front-door/spec.md` (created 2026-06-04), Program context block:

> "`stack-control` (CLI `stackctl`) is a new plugin, **the successor to `dw-lifecycle`**, built integration-first against Spec Kit. **This is Feature 1 — the self-hosting front door.**"

> "Explicitly OUT OF SCOPE (later features): the parallel multi-backend execution engine … the fuller control-plane frontend …; **the dw-lifecycle migrations of scope-discovery / audit-barrage / session skills**."

> "Native Spec Kit execution is the literal first feature — once it exists we use it to build everything after."

US1 acceptance scenario 3 preserves the barrage invariant across the rehome: *"it contains
zero branches on provider identity (the founding feature's neutrality invariant survives
the rehome)."*

**Why it matters — the four claims, confirmed:**
1. **stack-control is the SUCCESSOR to dw-lifecycle** — spec.md says so verbatim.
2. **Integration-first against Spec Kit** — bootstrapped via `specify init`, drives native `/speckit-implement`, governance fires on `after_implement`; "Native Spec Kit execution is the literal first feature."
3. **Keeps audit-barrage + scope-discovery** — explicitly retained, but their migrations are LATER features ("the dw-lifecycle migrations of scope-discovery / audit-barrage / session skills" listed under OUT OF SCOPE for Feature 1).
4. **dw-lifecycle stays undisturbed** — `8a960142` body: "The dw-lifecycle PLUGIN skills … are untouched — only this repo's own project-level skills changed, and only on this branch."

---

## Gaps / open questions

- **Exact audiocontrol-side pilot commits** are not in this repo; the receipts confirm the
  pilot existed (`paper-test-s550.md`, "audiocontrol-piloted Scope Discovery Protocol",
  design spec `2026-05-24-scope-discovery-design.md`) but those live in the audiocontrol.org
  repo, not deskwork. If the article needs the pilot's own genesis SHAs, they must be pulled
  from `audiocontrol.org` git, not here.
- **Branch vs main divergence:** the §6 stack-control trail is on `feature/pluggable-lifecycle-providers`
  only; it had not merged to `main` at extraction (main's newest is `3e8903ec` 2026-06-04
  `chore: release v0.38.0`). If the article ships after a merge, re-confirm SHAs survive any squash.
- **Commit-count note:** the task brief cited ~1798 commits / span to 2026-06-05; this
  extraction measured 1604 on `main` (HEAD `3e8903ec`, newest commit date 2026-06-04). The
  larger count likely includes the unmerged branch and/or all refs. Treat 1604 as the
  `main`-only figure; the branch adds the Act-3 commits dated 2026-06-04..05.
- **"Design B" (lifecycle-triggered automation + meta-audit)** appears in the ROADMAP
  (`847ea708`) past the quoted excerpt; not traced here whether Design B fully shipped vs.
  was partially realized by the Phase 15 hook + Phase 16 dampener. If the article claims the
  barrage became fully autonomous, verify against ROADMAP §"Design B" current state.

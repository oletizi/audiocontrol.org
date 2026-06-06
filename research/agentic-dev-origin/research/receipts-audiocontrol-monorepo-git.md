# Receipts — audiocontrol monorepo git history (Act 1: the true origin)

Source repo (read-only): `/Users/orion/work/audiocontrol-work/audiocontrol`
Span sampled: first commit `2025-09-01`, last sampled `2026-06-01`. `HEAD` reachable count: 2151 commits (the brief's ~2797 likely counts all refs/branches; numbers below are quoted from real `git log` output).

All SHAs, dates (`%cs` commit date), and subjects below are quoted verbatim from `git log`/`git show`. Where a subject is garbled in history (e.g. "Prompt is too long", "```"), that is the real recorded subject and the meaningful content was found via `--stat`/file paths.

---

## Timeline at a glance

| Date | SHA | What landed | Why it matters |
|------|-----|-------------|----------------|
| 2025-09-01 | `465300b5` | "moving https://github.com/oletizi/audio-tools to this repo" (628 files, +306,832) | The repo's birth — an import of the pre-existing `audio-tools` codebase. Act 1's true calendar start. |
| 2025-09-24 | `940b522d` | First `.claude/CLAUDE.md` (296 lines) + full agent roster + workflow YAMLs, under `modules/audio-control/.claude/` | The process arrives **already structured**: 9 agent personas + workflow definitions on day one of agent tooling. |
| 2025-09-25 | `62947ead` | First workplan: `WORKPLAN-LAUNCH-CONTROL.md` (316 lines), XL3 reverse-engineering | First "write the plan before the code" artifact. The first editor built here was the **Novation Launch Control XL 3**, not a Roland. |
| 2025-09-25 .. 09-26 | `e94ace58` → `129967ea` | launch-control-xl3 library built end-to-end, v1.0.0 release | First full editor/library shipped in-repo. |
| 2025-09-30 | `0a7c692a` | `modules/launch-control-xl3/CLAUDE.md` — "AI agent guidelines for protocol documentation" | Per-module agent guidance — discipline starts spreading from the root to modules. |
| 2025-10-03 | `345232d4` | audio-tools refactored into pnpm-workspace monorepo (sampler-midi extracted, v2.0.0) | The sampler/Roland code (S-330 etc.) enters the monorepo via audio-tools. |
| 2026-02-02 | `682439ca` | "chore: restructure for audiocontrol-org/audiocontrol" (1405 files; root `.claude/CLAUDE.md`) | Monorepo consolidation under the audiocontrol-org org; root-level CLAUDE.md established. `s330-editor` + `sampler-devices` first resolve as modules here. |
| 2026-02-04 | `0c96d759` | "Add project management standards and update CLAUDE.md" — `PROJECT-MANAGEMENT.md` (336 lines) + the **"no fallbacks / mock data are bug factories"** rule | The signature rule first lands. CLAUDE.md is being shrunk/restructured (−324/+434). |
| 2026-02-05 | `a59d1601` | First `prd.md` under the `docs/1.0/<status>/<slug>/` convention (s330-editor) | First PRD + the version/status feature-doc convention. |
| 2026-02-10 | `28ef49c6` / `fa5e27af` | Roland **D-110** editor feature docs + Phase 1 build | D-110 editor work begins. |
| 2026-02-15 | `edd6fbe5` | **JV-1080** port docs + phase-1 sampler-devices client; first `AGENTS.md` | JV-1080 editor work begins; AGENTS.md (Codex-side guidance) appears. |
| 2026-02-16 | `b8ebe696` | `editor-core` shared library extracted | The editors converge on shared infra (the DRY pressure that later motivates scope-discovery). |
| 2026-03-12 | `025f6e28` | `sampler-editor` unified editor (runtime device config) | Multi-device editor consolidation. |
| 2026-03-18 | `cb78ab0e` | "feat: add code duplication detection with jscpd" (PR #59, `feature/duplication-detection`) | **First clone-detection pilot** — the seed of scope-discovery's clone detector. |
| 2026-03-28 | `42ee074c` | `sampler-editor` → `roland-sxx0-editor` rename (multi-device: S-330/S-550/S-770) | The Roland S-x x 0 editor family is unified. |
| 2026-03-30 | `0ed436c7` / `32fa3230` | **akai-s3k-editor** scaffold + S3000XL editor docs | Akai S-series editor work begins. |
| 2026-04-10 | `3e302fff` | "feat: session lifecycle, playbooks, agent guidance, journal template (#188)" (+170 lines to CLAUDE.md) | **The lifecycle is formally named.** Session-start/end checklists, playbooks, journal template, agent mapping, analytics — the heart of Act 1. |
| 2026-04-10 | `df0e591f` / `47b68862` | TypeScript session data extractor + LLM-powered session analysis (Haiku) (#195/#199) | The **session-analysis pipeline** is built here — provenance of any "N sessions taught us" number. |
| 2026-04-13 | `9795f927` | "docs: add Codex guidelines and repo-local skills" (PR #262) | **Cross-model (Codex) review** enters — pilot of the later audit-barrage. |
| 2026-04-14 | `31319e1c` | "Phase 9 — refactor CLAUDE.md from 774 to 198 lines with path-scoped rules (#286)" | CLAUDE.md peaks (~671–774 lines) then is **distilled to ~198** path-scoped lines — maturation, not just accretion. |
| 2026-04-16..18 | `da4e39a8` … `4dc1a0bc` | MESA II reverse-engineering with **parallel Codex + Claude** findings | The Akai/MESA work is where multi-model adversarial review is exercised at scale (precursor to audit-barrage). |
| 2026-05-05 | `432b9b8b` | "feat(deskwork): bootstrap engineering-design-specs calendar" | **deskwork plugin adopted in-repo** — Act 1→Act 2 hinge (extraction outward begins). |
| 2026-05-11 | `230c06b2` | "workplan-discipline reform + port 'Just for now is bullshit' rule" | Rules being **ported** between repo and plugin — bidirectional extraction. |
| 2026-05-18 | `3881a077` | "docs: port deskwork's ACCEPTED/REJECTED design-archive protocol" | A protocol invented in deskwork ported **back** into the monorepo. |
| 2026-05-21 | `d3aca3f0` → `295cea80` | `scope-discovery-protocol` feature: PRD/workplan, JSON Schema, **clone detector**, `clones.yaml` (4018 lines), `paper-test-s550.md` | **Scope-discovery canonized** as a first-class feature here before plugin canonization. |

---

## 1. The true beginning (oldest commits, Sept 2025)

- `` `465300b5` `` — 2025-09-01 — "moving https://github.com/oletizi/audio-tools to this repo" — The repo is born as an import of the pre-existing `audio-tools` project (628 files, +306,832 lines). The calendar start of "last year" is **2025-09-01**, but the founding work is a *migration*, not a greenfield start.
- `` `0c6621eb` `` — 2025-09-01 — "Updated README getting started guide" — second commit; housekeeping.
- Gap to 2025-09-24, then a burst of JUCE/plughost plugin-interrogation tooling (`5cfd0c13`, `c21048b5`, `db7e7dea`, `cedb0423` …): the first *new* engineering in-repo was **VST/AU plugin parameter interrogation** (a JUCE `plughost` CLI emitting JSON), not a hardware editor.
- `` `0bb21af7` `` — 2025-09-25 — "docs(audio-control): add Launch Control XL 3 web editor protocol analysis" — first mention of a **web editor**; the first editor target is the **Novation Launch Control XL 3**.
- `` `62947ead` `` — 2025-09-25 — "add reverse engineering workplan for XL 3 protocol discovery" — the **first workplan artifact** in the repo (316-line `WORKPLAN-LAUNCH-CONTROL.md`). Plan-before-code is present from the very first editor.
- `` `e94ace58` `` → `` `e71171fe` `` — 2025-09-25 — XL3 TypeScript library built foundation→full-coverage in a single day-stretch of commits; `` `129967ea` `` 2025-09-26 cuts v1.0.0.

Why it matters: Act 1 did **not** begin with a Roland editor. It began with (a) a code migration, (b) JUCE plugin-interrogation tooling, and (c) a Launch Control XL 3 web editor built against a reverse-engineered SysEx protocol — and the *first* workplan was written before that editor's code.

---

## 2. The editor timeline

| Editor / module | First in-repo | SHA | Note |
|---|---|---|---|
| Novation Launch Control XL 3 | 2025-09-25 | `62947ead` (workplan), `e94ace58` (lib) | First editor; reverse-engineered SysEx. |
| Roland S-330 / sampler stack (via audio-tools) | imported 2025-09-01 / consolidated 2026-02-02 | `465300b5` / `682439ca` | `s330-editor` + `sampler-devices` resolve as modules at the Feb-02 restructure. |
| Roland D-110 | 2026-02-10 | `28ef49c6`, `fa5e27af` | Feature docs + Phase-1 core MIDI. |
| Roland JV-1080 | 2026-02-15 | `edd6fbe5` | Port docs + sampler-devices client phase 1. |
| editor-core (shared) | 2026-02-16 | `b8ebe696` | Shared editor infra extracted. |
| sampler-editor → roland-sxx0-editor | 2026-03-12 / renamed 2026-03-28 | `025f6e28` / `42ee074c` | Unified Roland S-330/S-550/S-770 editor. |
| Akai S3000XL (akai-s3k-editor) | 2026-03-30 | `0ed436c7`, `32fa3230` | Scaffold + S3000XL docs. |
| Akai MESA II (reverse-engineering) | 2026-04-02 .. 04-18 | `e6c60210`, `da4e39a8` … | Binary disassembly of Akai's MESA II app; heavy multi-model effort. |

Note: `s330-editor`/`sampler-devices` "first commit" dates (`682439ca`, 2026-02-02) reflect the path появ at the consolidation restructure; the underlying sampler code predates it inside `modules/audio-tools` (imported 2025-09-01, refactored to workspaces 2025-10-03 `345232d4`).

---

## 3. The process being INVENTED (heart of Act 1)

### First agent discipline (already structured on arrival)
- `` `940b522d` `` — 2025-09-24 — first `.claude/CLAUDE.md` (296 lines) at `modules/audio-control/.claude/CLAUDE.md`, shipped **alongside a 9-agent roster** (`api-designer`, `architect-reviewer`, `code-reviewer`, `documentation-engineer`, `embedded-systems`, `javascript-pro`, `orchestrator`, `test-automator`, `typescript-pro`) plus `project.yaml`, `config/settings.json`, and three `workflows/*.yaml` (`feature-development`, `main-workflow`, `midi-mapping`). Why it matters: the sub-agent-delegation + workflow framing was present from the first day of agent tooling — invented quickly, not gradually.
- `` `0a7c692a` `` — 2025-09-30 — per-module `launch-control-xl3/CLAUDE.md` ("AI agent guidelines"). Discipline propagates to modules.

### CLAUDE.md growth → distillation (the iteration arc)
- 2025-09-24 `940b522d`: 296 lines (module-scoped).
- 2026-02-02 `682439ca`: root-level `.claude/CLAUDE.md` established at the consolidation.
- 2026-02-04 `0c96d759`: large restructure of `.claude/CLAUDE.md` (−324/+434) plus new `PROJECT-MANAGEMENT.md`.
- 2026-04-10 `3e302fff`: +170 lines (lifecycle/playbooks/journal) → CLAUDE.md ≈ 671 lines.
- 2026-04-14 `31319e1c`: refactor **"from 774 to 198 lines with path-scoped rules" (#286)** → ≈ 198 lines.
- Span: ~**6.5 months** of iteration (Sept 2025 → mid-Apr 2026), arcing from accretion to deliberate distillation.

### "No fallbacks / no mock data"
- `` `0c96d759` `` — 2026-02-04 — first appearance of the exact rule text: "Never implement fallbacks or use mock data outside of test code … Fallbacks and mock data are bug factories." (verified via `git log -S`). Why it matters: the project's signature engineering rule is dated and located here.

### Workplan / PRD / feature-doc convention
- First workplan: `` `62947ead` `` 2025-09-25 (`WORKPLAN-LAUNCH-CONTROL.md`).
- Generalized `**/workplan*.md` files: `` `779a8309` `` / `` `960313cd` `` 2025-10-05 (implementation workplans for backup/local-media work).
- First `prd.md` + `docs/1.0/<status>/<slug>/` convention: `` `a59d1601` `` 2026-02-05 (s330-editor). The version/status feature-doc layout is dated here.
- `PROJECT-MANAGEMENT.md`: `` `0c96d759` `` 2026-02-04.

### Session lifecycle & journal (the named "lifecycle")
- `` `3e302fff` `` — 2026-04-10 — "feat: session lifecycle, playbooks, agent guidance, journal template (#188)" (part of #187). Body enumerates: session-start checklist (read workplan/journal/issues before coding), session-end checklist (update workplan, write journal, commit docs), workflow playbooks, pre-commit self-review checklist, sub-agent selection mapping, session-analytics metrics, and a **development-journal template with correction categories**. Why it matters: this single commit is where the ad-hoc discipline is consolidated and *named* "session lifecycle" — the direct ancestor of `dw-lifecycle`.
- First standalone `DEVELOPMENT-NOTES.md` add: `` `fa09a31f` `` — 2026-04-10 — "docs: structured journal entry for April 9-10 session (#189)". (The journal template and the first journal entry land the same day as the lifecycle.)

Span of process invention: from `940b522d` (2025-09-24) to the `3e302fff` lifecycle (2026-04-10) is roughly **6.5 months**; refinement (path-scoped CLAUDE.md, deskwork adoption, scope-discovery) continues through May 2026.

---

## 4. "2,400 sessions" provenance — RECEIPT-BACKED CAVEAT

The session-analysis pipeline that would produce such a number **originates here**:
- `` `df0e591f` `` — 2026-04-10 — "feat: add TypeScript session data extractor, remove Python/Docker analyzer (#195)".
- `` `47b68862` `` — 2026-04-10 — "LLM-powered session analysis via Claude Haiku (#199)".
- `` `7bc5248e` `` — 2026-04-10 — "Dockerized session analyzer — no Python on host (#190)".
- `` `006f97ff` `` — 2026-04-24 — "refresh session content + LLM analyses for 2026-02 through 2026-04".
- `` `e4b54d4f` `` — 2026-05-21 — "data(sessions): capture 106 new sessions (Apr 26 - May 21) + regenerate report".

**The actual number in-repo is 183, not 2,400.** The committed report `data/sessions/report-all.md` states: date range **2026-02-19 to 2026-05-21**, **Total sessions: 183**, Total commits: 2,122, Total tool calls: 59,422, agent spawns/session 6.36. `data/sessions/sessions.jsonl` has exactly **183** lines. (Quoted from the working tree of `HEAD`.)

Conclusion: The session-analysis machinery and the *practice* of counting/analyzing agent sessions originate in this monorepo (April 2026), but the **"2,400" figure is NOT a literal session count from this repo**. The closest in-repo total commits is "2,122" and total sessions "183". Any "2,400 sessions" headline either (a) aggregates sessions across multiple repos/machines beyond this report's window, or (b) is a downstream/rounded figure. **Do not assert 2,400 as sourced from this repo** — the repo's own receipt says 183 sessions / 2,122 commits for 2026-02-19..05-21. Operator confirmation needed for the 2,400 figure's true denominator.

---

## 5. Pilots of the crown jewels

### Scope discovery / clone detection
- `` `cb78ab0e` `` — 2026-03-18 — "feat: add code duplication detection with jscpd" (merged via PR #59 `c08c8c53`, branch `feature/duplication-detection`). The **first duplication-detection pilot**, ~6 weeks before the named protocol.
- `` `d3aca3f0` `` — 2026-05-21 — "docs(scope-discovery-protocol): initial feature docs (prd, workplan, README, summary scaffold)".
- `` `69f2b212` `` — 2026-05-21 — "T2.1 scope-manifest JSON Schema".
- `` `c834e44b` `` — 2026-05-21 — "T2.2 general clone detector": adds `tools/scope-discovery/clone-detector.ts` (232 lines) + `docs/scope-discovery/clones.yaml` (**4018 lines**).
- `` `295cea80` `` — 2026-05-21 — "Phase 4 ship-ready slice": adds `docs/.../scope-discovery-protocol/paper-test-s550.md` (90 lines) — the **paper-test-s550** dry-run named in the brief, here as an in-repo artifact.
- The `scope-discovery` feature has ~163 commits (2026-05-21 .. 2026-05-27), i.e. it was a substantial in-repo feature before/while being canonized into the plugin.

### Audit barrage / cross-model review
- `` `9795f927` `` (and `c179b878`) — 2026-04-13 — "docs: add Codex guidelines and repo-local skills" (PR #262 `2c32fdab`) — first formal **cross-model (Codex) review** guidance.
- `` `285fc704` `` — 2026-04-17 — "docs: align codex and claude repo guidance (#308)".
- MESA II reverse-engineering (2026-04-16..18) is where parallel **Codex + Claude** adversarial findings are exercised at scale: `da4e39a8`, `2d268d90` ("record initial codex mesa findings"), `a2fcd612` ("baseline mesa ii codex parity feature"), `b364fa2e` (Codex catches a class-identity mislabel), `4dc1a0bc` ("branch-state sync per Codex review #315"). This multi-model triage is the working precursor to the canonized **audit-barrage** (claude/codex/gemini) in the plugin.

---

## 6. The extraction moment (Act 1 → Act 2 hinge), monorepo side

The lifecycle/deskwork tooling is extracted *outward* and then partially ported *back*, visible in-repo as deskwork adoption:
- `` `432b9b8b` `` — 2026-05-05 — "feat(deskwork): bootstrap engineering-design-specs calendar; ingest macOS distribution spec" — first deskwork-plugin use inside the monorepo.
- `` `c7a26a34` `` — 2026-05-06 — "docs(deskwork): ingest PRD + workplan into engineering-design-specs calendar".
- `` `e213b757` `` — 2026-05-08 — "docs(s550-support): add Phase 9 (UX/UI cleanup) and adopt deskwork" — a live feature adopts the extracted plugin.
- `` `230c06b2` `` — 2026-05-11 — "docs: workplan-discipline reform + port 'Just for now is bullshit' rule" — a rule **ported** between repo and plugin.
- `` `3881a077` `` — 2026-05-18 — "docs: port deskwork's ACCEPTED/REJECTED design-archive protocol" — a protocol invented in deskwork ported **back** into the monorepo.

Why it matters: by May 2026 the invented process is no longer just in-repo CLAUDE.md prose — it lives in a separate plugin (deskwork / dw-lifecycle) that the monorepo now *consumes* and bidirectionally syncs with. The hinge is dated to early–mid May 2026 on the monorepo side. (The actual `dw-lifecycle` package extraction commits live in the deskwork repo, already mined by another agent; this repo shows the *consumption* side of the hinge.)

---

## Gaps / open questions (need operator confirmation)

1. **"2,400 sessions" denominator.** In-repo receipt = **183 sessions / 2,122 commits** (2026-02-19..05-21, `data/sessions/report-all.md`). The 2,400 figure is not in this repo. Is it cross-repo/cross-machine aggregate, a later window, or a rounded headline? Confirm before publishing the number.
2. **Pre-history before 2025-09-01.** The founding commit is an *import* of `oletizi/audio-tools`. The S-330/sampler editor lineage predates this repo (lived in audio-tools). If the article claims the S-330 editor "started here," that's only true post-consolidation (2026-02); its code is older.
3. **First editor framing.** The first *web editor* built in-repo was the **Launch Control XL 3** (Sept 2025), not a Roland. If the narrative leads with Roland, reconcile with this date.
4. **2025-10-05 generalized workplans** (`779a8309`, `960313cd`) are for backup/local-media tooling, not editors — confirm whether to mention as "workplan convention spreads beyond editors."
5. **Repo commit count.** Brief says ~2797; `HEAD` shows 2151. Difference is likely unmerged branches/refs — confirm which denominator the article should cite.
6. **`dw-lifecycle` package name** does not appear as an extracted-package commit *in this repo* (only deskwork adoption does). The naming/extraction receipts live in the deskwork repo.

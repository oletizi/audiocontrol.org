# Receipts — Act 1 Deep Research

Repo under examination (read-only): `/Users/orion/work/audiocontrol-work/audiocontrol`
Remote: `git@github.com:audiocontrol-org/audiocontrol.git`
Researched against `HEAD` on 2026-06-05. Every SHA/date/message below quoted from `git log/show` or the GitHub API; nothing inferred or invented.

## Bottom line

The audiocontrol monorepo's git history begins **2025-09-01** with a parentless root commit `465300b5` ("moving https://github.com/oletizi/audio-tools to this repo") — a flattened *import*, not a graft, so no pre-2025-09-01 history survives inside this repo. But the true provenance is older: the archived source repo `oletizi/audio-tools` was created **2024-10-11** (initial commit `e9707958`, 2024-10-11T05:58:13Z) and last pushed on the import day. Critically, that old repo carried **no `.claude/CLAUDE.md` and no root `CLAUDE.md`**, and neither did the import commit — so the *lifecycle process was invented inside this repo, not imported*. What was imported was code, not process. The earliest process artifact is a **module-level** `modules/audio-control/.claude/CLAUDE.md` (296 lines, full agent roster) landing **2025-09-24** (`940b522d`); a **root** `.claude/CLAUDE.md` does not appear until **2026-02-02** (`682439ca`). The root file then grows by accretion to a **773-line** peak (`a20b8f07`, 2026-04-14) and is distilled the *same day* to **198 lines** by extracting path-scoped rule files (`31319e1c`, #286). The lifecycle was explicitly *named* on 2026-04-10 by `3e302fff` (#188), which added session start/end checklists, workflow playbooks, a sub-agent task→agent mapping, session analytics, and a development-journal template with correction categories.

---

## Task 1 — Pre-history check

**Finding: the monorepo's earliest available history is 2025-09-01, but verifiable provenance runs back to 2024-10-11 in the now-archived `oletizi/audio-tools` repo. No older history is reachable inside the monorepo itself.**

- **Monorepo root commit (an import, parentless):**
  `465300b5da90a82a0b5e79d616bf76531788637c` — 2025-09-01 — "moving https://github.com/oletizi/audio-tools to this repo".
  `git log --format='%H | parents=%P' 465300b5` → `parents=` (empty). It is a true root, so the import flattened the prior history rather than grafting it. There are exactly two parentless root commits in the repo: `465300b5` (2025-09-01) and `940b522d` (2025-09-24, "Prompt is too long").
- **No standalone `audio-tools` clone on disk.** Searched `/Users/orion/work/audio-tools`, `~/work/audio-tools`, `~/audio-tools`, and the `~/work/*/audio-tools` glob — none exist. The monorepo's only remote is `audiocontrol-org/audiocontrol`.
- **The source repo still exists on GitHub, archived.** `gh repo view oletizi/audio-tools` →
  `createdAt: 2024-10-11T06:55:14Z`, `pushedAt: 2025-09-01T23:29:17Z`, `isArchived: true`.
- **Earliest provenance (true origin):** in `oletizi/audio-tools`, the oldest commits via the GitHub API are
  - `e97079585e9836aef31db9fe762b3d77208056ea` — 2024-10-11T05:58:13Z — "initial commit"
  - `e196ae8d…` — 2024-10-11T06:54:45Z — "writing header seems to work."
  - `e6e83587…` — 2024-10-11T16:34:28Z — "writing manifest seems to work"
  - `bd2b0beb…` — 2024-10-11T17:18:21Z — "added testing infra"
  So the original audio-tools work began **2024-10-11**, roughly five months before the monorepo import.
- **Individual editor apps:** no separate older editor repos were found on disk; the editor apps live as modules inside this monorepo (see Task 5). The early editor provenance that exists is the launch-control reverse-engineering work, which appears *inside* the monorepo on 2025-09-25 (Task 5), not in an external repo.

**Honest statement:** 2025-09-01 is the earliest history *inside the monorepo*. The earliest verifiable provenance *anywhere* is 2024-10-11 (audio-tools "initial commit"). That predecessor repo is archived and not cloned locally; its history was not carried into the monorepo as commits.

---

## Task 2 — The "before-process" state

**Finding: work was largely ad-hoc at the root level for months. A structured, agent-roster-driven process existed early but only at the `modules/audio-control` *sub-project* level (imported/established 2025-09-24); the repo-wide root lifecycle did not exist until 2026-02 and was not named until 2026-04. So "process" was present in pockets from near day 1, but not invented-from-zero and not repo-wide.**

Receipts:

1. **2025-09-01 `465300b5`** "moving … audio-tools to this repo" and **2025-09-01 `0c6621eb`** "Updated README getting started guide" — the import plus a README touch-up. No `.claude/` process scaffolding at the root in the import (grep of `465300b5 --name-only` for "claude" returns nothing).
2. **2025-09-24 `940b522d`** "Prompt is too long" — the first structured AI-process artifact, but **module-scoped**: it adds `modules/audio-control/.claude/CLAUDE.md` (296 insertions) plus a full agent roster under `modules/audio-control/.claude/agents/` (api-designer, architect-reviewer, code-reviewer, documentation-engineer, embedded-systems, javascript-pro, orchestrator, test-automator, typescript-pro), `config/settings.json`, `project.yaml`, and three workflow YAMLs. This is a sophisticated process — but it governs one sub-project, not the repo.
3. **2025-09-25 `62947ead`** "feat(launch-control): add reverse engineering workplan for XL 3 protocol discovery" — adds `modules/audio-control/WORKPLAN-LAUNCH-CONTROL.md` (316 lines). Evidence that *workplan-driven* method existed for a specific reverse-engineering effort early, again module-scoped.
4. **2025-09-30 `0a7c692a`** adds `modules/audio-control/modules/launch-control-xl3/CLAUDE.md`, and **2025-10-04 `7a6b9ecd`** adds `modules/audio-tools/.claude/CLAUDE.md` — process docs continuing to proliferate *per-module*, not consolidated at root.
5. **Root-level process is absent until 2026-02-02 `682439ca`** "chore: restructure for audiocontrol-org/audiocontrol", which is the first commit to touch a root `.claude/CLAUDE.md` (361 lines). Between 2025-09 and 2026-01, the root of the repo had no governing CLAUDE.md; coordination lived inside sub-modules or nowhere.

**Characterization:** Not "ad-hoc from zero" — agent rosters and workplans existed at the module level from 2025-09-24. But it was *fragmented and bottom-up*: each module carried its own `.claude/` conventions. The repo-wide, named lifecycle was a later consolidation (2026-02 root file; 2026-04 naming), formed by pulling scattered module practice up to the root and then correcting it into shape (Tasks 3–4).

---

## Task 3 — CLAUDE.md evolution

Method: `git log --format='%h %cs %s' -- .claude/CLAUDE.md` for the root file; `git show <sha>:.claude/CLAUDE.md | wc -l` for line counts; `grep '^#'` for structure.

Note the brief's "first structured .claude/CLAUDE.md 2025-09-24 (940b522d)" refers to the **module-level** file `modules/audio-control/.claude/CLAUDE.md` (295–296 lines), *not* the root. The **root** `.claude/CLAUDE.md` timeline:

| SHA | Date | Root `.claude/CLAUDE.md` lines | What changed |
|-----|------|-------------------------------|--------------|
| `940b522d` | 2025-09-24 | (module file: 295) | First structured CLAUDE.md anywhere — `modules/audio-control/.claude/CLAUDE.md`, with full agent roster (9 agents), workflows, project.yaml. Module-scoped. |
| `682439ca` | 2026-02-02 | **361** | First **root** `.claude/CLAUDE.md`, created by "chore: restructure for audiocontrol-org/audiocontrol". |
| `0c96d759` | 2026-02-04 | **136** | "Add project management standards and update CLAUDE.md" — sharply trimmed from 361 to a lean 136. |
| `ee6ac168` | 2026-02-18 | 136 | "docs: add directive against Claude attribution in PRs" — content edit, length stable. |
| `3e302fff` | 2026-04-10 | (+170 lines into a ~501-line file by this point) | **#188** — session lifecycle, playbooks, agent mapping, journal template (see Task 4). Parent of #188 already had a 501-line root file, so the file had grown substantially between 2026-02 and 2026-04 by accretion. |
| `a20b8f07` | 2026-04-14 | **773 (peak)** | "feat: phases 6-10, filter display, throttled drag, clone fix, e2e test infra" — the high-water mark. Headings span Session Lifecycle, Workflow Playbooks, Testing Architecture, Sub-Agent Delegation, Nucleation Site Prevention, Contract Enforcement, S3000XL SysEx/SDS specifics, Build/Deployment, Netlify, and an embedded journal template. Everything in one file. |
| `31319e1c` | 2026-04-14 | **198 (distilled)** | **#286 / Closes #283** — "refactor CLAUDE.md from 774 to 198 lines with path-scoped rules". Same calendar day as the peak. |
| `285fc704` | 2026-04-17 | 211 | "docs: align codex and claude repo guidance (#308)". |
| `f946216a` / HEAD | 2026-05-22 | 305 | "docs: project-level scope-discovery overview reflects Phases 5/6/7" — current. |

**Phase characterization:**
- **2025-09 module phase:** the process lives per-module; agent roster + workflows are rich but local.
- **2026-02 root genesis + trim:** root file born at 361 lines (`682439ca`), immediately cut to 136 (`0c96d759`) — a deliberate lean baseline.
- **2026-02 → 2026-04 accretion:** the root file balloons (136 → 501 by #188's parent → 773 by `a20b8f07`) as session lifecycle, testing architecture, deployment, nucleation/contract rules, and device-specific SysEx notes all pile in.
- **2026-04-14 distillation:** `31319e1c` extracts 8 path-scoped rule files into `.claude/rules/` (`akai-s3000xl.md` 33, `deployment.md` 39, `e2e-testing.md` 240, `midi-audio.md` 19, `session-analytics.md` 41, `testing.md` 44, `ui-development.md` 34, `workflow-playbooks.md` 39) using `paths:` YAML frontmatter for conditional loading, plus deletes 3 redundant sections (duplicate journal, duplicate delegation, "critical don'ts"). Diff: `.claude/CLAUDE.md | 633 +--------------------`. This is the structural turn from "one giant always-loaded prompt" to "lean core + rules that load only when relevant files are touched."

The distillation commit's own words: *"Created 8 rule files in .claude/rules/ with paths: YAML frontmatter for conditional loading. Domain-specific content (E2E testing, Akai SysEx, deployment, session analytics) only loads when relevant files are touched."* (`31319e1c`, #286, Closes #283.)

---

## Task 4 — The lifecycle-naming commit (#188)

`3e302fff1a1468c7cd2c69f03aba1e0f57088d20` — author `oletizi` — **2026-04-10** —
"feat: session lifecycle, playbooks, agent guidance, journal template (#188)".

Stat: `.claude/CLAUDE.md | 170 ++++…` — **1 file changed, 170 insertions(+)**, no deletions. (The file's parent state was 501 lines; #188 added 170 on top.)

Full body — exactly what it introduced (quoted):
> Add to CLAUDE.md:
> - Session start checklist (read workplan, journal, issues before coding)
> - Session end checklist (update workplan, write journal, commit docs)
> - Project management reference (PROJECT-MANAGEMENT.md, roadmap, worktrees)
> - Workflow playbooks (new feature, protocol investigation, bridge deploy, UI feature)
> - Pre-commit self-review checklist
> - Sub-agent selection guidance with task-to-agent mapping
> - Session analytics metrics and cadence
> - Multi-machine documentation (orion-m4, orion-m1)
> - Development journal template with correction categories
>
> Part of #187

This is the commit where the *lifecycle as a named, repo-wide thing* arrives: the session start/end checklists, the playbooks, the task→agent mapping, the analytics cadence, and the journal template with correction categories — the same skeleton still visible in the distilled 198-line version (its headings: Session Lifecycle → Starting/Ending a Session, Workflow playbooks, Sub-Agent Delegation, Development Journal with Course Corrections/Quantitative/Insights). #188 is "Part of #187," indicating it was one step in a larger continuous-improvement effort (the `feature/continuous-improvement` branch merged the same day via `95cbbe92`, #194).

---

## Task 5 — Editor timeline

Dates are commit dates (`%cs`) of first/last relevant work; SHAs are first-touch unless noted.

| Editor / target | First work | Last seen (as of HEAD) | First-touch SHA | What it was / process lesson |
|-----------------|-----------|------------------------|-----------------|------------------------------|
| **Novation Launch Control XL 3** | 2025-09-25 | 2026-05-05 | `62947ead` (workplan), `17fdbfcb` (SysEx spec) | First reverse-engineering effort in the repo: a 316-line `WORKPLAN-LAUNCH-CONTROL.md` + XL3 SysEx client library. **Lesson:** established the workplan-first, protocol-discovery pattern (write the reverse-engineering plan before code). Later folded into the `midi-macro-bridge` (LCXL3 mixer/control, Phases 5–10, through 2026-05-05). |
| **Akai S3000XL (s3k client/lib)** | 2025-10-03 | — | `b8ccc646` / `cde623f1` | S3000XL code generation + wrapper-class refactor (bump to 2.0.0); `sampler-midi`/`sampler-devices` split. The early Akai SysEx + backup work; predates the web editor by ~6 months. |
| **Roland S-330 (lib)** | 2026-01-21 | — | `91854798` | "add Roland S-330 sampler support" + unit tests — the first Roland S-series device module. Seed for the later unified roland-sxx0 editor. |
| **Roland D-110** | 2026-02-10 | 2026-06-01 | `fa5e27af` (Phase 1), `28ef49c6` (docs) | "feat(d110-editor): Complete Phase 1 - Core MIDI Infrastructure." A phased editor build; still receiving bugfix work at HEAD (e.g. 2026-06-01 `a539cffa` filter-editor enhancement under `roland-bugfix`). |
| **Roland JV-1080** | 2026-02-15 | 2026-06-01 | `edd6fbe5` | "add JV-1080 port docs and phase 1 sampler-devices client" + coverage tests (`e3d78690`) that **standardized the coverage policy/scripts** — process lesson: a new editor drove a repo-wide coverage standard. |
| **Roland S-550** | 2026-03-12 | — | `98a463a3` (impl), `934925ea` (docs) | "implement S-550 device module with shared S-series base" — explicitly built on a *shared S-series base*, a composition-over-duplication lesson. |
| **Unified sampler editor → roland-sxx0** | 2026-03-12 (unified editor) → **renamed 2026-03-28** | — | `025f6e28` (unified), `42ee074c` (rename) | `025f6e28` "create unified editor with runtime device config"; then `42ee074c` "rename sampler-editor to roland-sxx0-editor for multi-device support." **Lesson:** consolidation — one runtime-configurable editor for multiple Roland S-x x0 devices instead of per-device editors. |
| **Akai S3000XL web editor** | 2026-03-30 | — | `32fa3230` (docs), `e93853ff` (browser-safe split) | "add S3000XL editor feature documentation"; `e93853ff` "make sampler-lib browser-safe by splitting Node.js code to server entry" — **lesson:** the editor forced a Node-vs-browser boundary (server entry split) in the shared library. |
| **Akai MESA / MESA II** | 2026-04-02 | 2026-04-16 | `e6c60210` | "docs(scsi-bridge): MESA II binary analysis" → resolution "sample data via disk image access" (`489eb00a`). Reverse-engineering of the MESA II disk format via the SCSI bridge; a binary-analysis investigation rather than a UI editor. |

Notes:
- "first/last seen" reflects matching commit-message greps; a device may have untracked work under generic refactors. D-110, JV-1080, and S-550 all show activity at 2026-06-01 because of ongoing `roland-bugfix` / shared-editor work touching them collectively.
- The XL3 (2025-09-25) is the **earliest editor-adjacent work** in the monorepo and the origin of the workplan-first reverse-engineering habit that the later lifecycle generalized.

---

## Gaps / open questions

1. **Pre-import history detail.** The old `oletizi/audio-tools` repo (2024-10-11 → 2025-09-01) is reachable only via the GitHub API while archived; it was not cloned for full-log analysis here. Its internal evolution (how the editor/code matured pre-monorepo) is available on GitHub but not quantified in this pass beyond first/last commit dates.
2. **The 2025-09-24 second root commit (`940b522d`, "Prompt is too long").** It is parentless like the import — worth confirming whether it represents a second independent import (e.g. the `audio-control` sub-project arriving as its own flattened tree) rather than normal history. Its sheer size (agent roster + workflows in one commit) is consistent with an import.
3. **Module-CLAUDE.md vs root-CLAUDE.md lineage.** Whether the root file (`682439ca`, 2026-02-02) was distilled *from* the earlier module file (`940b522d`) or written fresh is not established by diff here; they live at different paths so `git log -- <path>` does not connect them.
4. **#187 umbrella.** #188 is "Part of #187"; the full scope of #187 (the continuous-improvement initiative that produced the lifecycle) was not enumerated.
5. **Editor "last seen" precision.** Grep-based; a device whose recent work rides inside a generically-named shared-editor commit may be undercounted. The 2026-06-01 dates for D-110/JV-1080/S-550 come from collective `roland-bugfix`/shared work, not necessarily device-specific commits.

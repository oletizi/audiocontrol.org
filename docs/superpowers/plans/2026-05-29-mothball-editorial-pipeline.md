# Mothball the In-House Editorial Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut audiocontrol.org over to the deskwork plugin for the content lifecycle, preserving the platform-reach skills as a renamed in-repo `platform-*` surface, and deleting every in-house editorial skill, dev page, API route, and library that deskwork now covers.

**Architecture:** Two sequential PRs on branch `feature/mothball-editorial-pipeline` (worktree `../audiocontrol-work/audiocontrol.org-mothball-editorial-pipeline`). PR-A is a non-destructive carve-out: rename the survivor skills, verify they run independently, file an upstream deskwork gap issue. PR-B is the destructive decommission, executed only after PR-A merges and the survivors are proven independent. The shared calendars (`docs/editorial-calendar-*.md`) are the lifeline — both pipelines read/write them, so content state never forks.

**Tech Stack:** Astro (static site), TypeScript (strict), Vitest, Claude Code skills (`.claude/skills/<name>/SKILL.md`), deskwork plugin v0.28.0, `tsx` for scripts.

---

## Spec reference

Design spec: `docs/superpowers/specs/2026-05-29-mothball-editorial-pipeline-design.md`
Tracking issue: [#126](https://github.com/oletizi/audiocontrol.org/issues/126)

## File Structure — keep / rename / delete

### Survivor skills — RENAME `editorial-*` → `platform-*` (PR-A)

| From `.claude/skills/` | To `.claude/skills/` | Dir contents |
|---|---|---|
| `editorial-reddit-sync/` | `platform-reddit-sync/` | `SKILL.md` |
| `editorial-reddit-opportunities/` | `platform-reddit-opportunities/` | `SKILL.md` |
| `editorial-cross-link-review/` | `platform-cross-link-review/` | `SKILL.md` |
| `editorial-performance/` | `platform-performance/` | `SKILL.md` |
| `editorial-suggest/` | `platform-suggest/` | `SKILL.md` |
| `editorial-rename-slug/` | `platform-rename-slug/` | `SKILL.md`, `rename.ts` |
| `editorial-social-review/` | `platform-social-review/` *(only if PR-A step verifies deskwork-studio does NOT cover it; else delete in PR-B)* | `SKILL.md` |

### Library — KEEP (carve-out leaves these in `scripts/lib/editorial/`)

`calendar.ts`, `types.ts`, `channels.ts`, `crosslinks.ts`, `suggest.ts`, `rename-slug.ts`, and a trimmed `index.ts`. Untouched external deps: `scripts/lib/reddit/`, `scripts/lib/youtube/`, `scripts/lib/analytics/`, `scripts/lib/http/`, `scripts/analytics-report.ts`. **KEEP `src/shared/lightbox.ts`** — imported by both `BlogLayout.astro` files and `src/shared/blog-figure.css`, not just deleted surfaces.

### DELETE (PR-B)

Skills (16) under `.claude/skills/`:
`editorial-add`, `editorial-plan`, `editorial-outline`, `editorial-outline-approve`, `editorial-draft`, `editorial-draft-review`, `editorial-iterate`, `editorial-approve`, `editorial-publish`, `editorial-distribute`, `editorial-shortform-draft`, `editorial-review-cancel`, `editorial-review-help`, `editorial-review-report`, `editorial-status`, `editorial-help`.

Library:
- `scripts/lib/editorial-review/` (whole dir)
- `scripts/lib/editorial-calendar-actions/` (whole dir — only used by the deleted calendar API routes)
- In `scripts/lib/editorial/`: `body-state.ts`, `scaffold.ts`, `scrapbook.ts`, `remark-image-figure.mjs`, `remark-strip-first-h1.mjs`, `remark-strip-outline.mjs`; and trim `index.ts`.

Dev surfaces under `src/sites/editorialcontrol/`:
- `pages/dev/editorial-help.astro`
- `pages/dev/editorial-review/` (whole dir)
- `pages/dev/editorial-review-shortform.astro`
- `pages/dev/editorial-studio.astro`
- `pages/dev/scrapbook/` (whole dir)
- `pages/api/dev/editorial-calendar/` (`draft.ts`, `publish.ts`)
- `pages/api/dev/editorial-review/` (`annotate.ts`, `annotations.ts`, `decision.ts`, `start-longform.ts`, `version.ts`, `workflow.ts`)
- `pages/api/dev/editorial-studio/` (whole dir)

Shared (`src/shared/`):
- `editorial-help.css`, `editorial-review.css`, `editorial-review-client.ts`, `editorial-review-editor.ts`, `editorial-skills-catalogue.ts`, `editorial-studio.css`, `editorial-studio-client.ts`.

### OUT OF SCOPE — do not touch

`audiocontrol-voice`, `editorialcontrol-voice`, `feature-image-*` skills, `pages/dev/feature-image-*`, `pages/dev/studio/`, `pages/dev/og-preview.astro`, the shared calendar markdown format, and `journal/editorial/` history (left on disk, no further writes).

---

## PHASE A — Carve-out (PR-A, non-destructive)

### Task A1: Rename the six core survivor skill directories

**Files:**
- Rename: `.claude/skills/editorial-reddit-sync/` → `.claude/skills/platform-reddit-sync/`
- Rename: `.claude/skills/editorial-reddit-opportunities/` → `.claude/skills/platform-reddit-opportunities/`
- Rename: `.claude/skills/editorial-cross-link-review/` → `.claude/skills/platform-cross-link-review/`
- Rename: `.claude/skills/editorial-performance/` → `.claude/skills/platform-performance/`
- Rename: `.claude/skills/editorial-suggest/` → `.claude/skills/platform-suggest/`
- Rename: `.claude/skills/editorial-rename-slug/` → `.claude/skills/platform-rename-slug/`

- [ ] **Step 1: Rename each directory with `git mv` (preserves history)**

```bash
cd /Users/orion/work/audiocontrol-work/audiocontrol.org-mothball-editorial-pipeline
git mv .claude/skills/editorial-reddit-sync          .claude/skills/platform-reddit-sync
git mv .claude/skills/editorial-reddit-opportunities .claude/skills/platform-reddit-opportunities
git mv .claude/skills/editorial-cross-link-review    .claude/skills/platform-cross-link-review
git mv .claude/skills/editorial-performance          .claude/skills/platform-performance
git mv .claude/skills/editorial-suggest              .claude/skills/platform-suggest
git mv .claude/skills/editorial-rename-slug          .claude/skills/platform-rename-slug
```

- [ ] **Step 2: Verify the six new dirs exist and the old ones are gone**

Run:
```bash
ls -d .claude/skills/platform-* .claude/skills/editorial-reddit-sync 2>&1
```
Expected: the six `platform-*` dirs listed; `editorial-reddit-sync` reported as "No such file or directory".

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor(skills): rename editorial platform-coverage skills to platform-*"
```

---

### Task A2: Update each survivor SKILL.md frontmatter `name` and intra-doc self-references

The Claude Code skill `name:` frontmatter must match the directory. Each survivor's `SKILL.md` declares `name: editorial-<x>` and may reference its own slash-command name (`/editorial-<x>`) in prose. Cross-references to *deleted* skills can be ignored (those skills disappear in PR-B); fix only self-references and references to *other survivors*.

**Files:**
- Modify: `.claude/skills/platform-reddit-sync/SKILL.md`
- Modify: `.claude/skills/platform-reddit-opportunities/SKILL.md`
- Modify: `.claude/skills/platform-cross-link-review/SKILL.md`
- Modify: `.claude/skills/platform-performance/SKILL.md`
- Modify: `.claude/skills/platform-suggest/SKILL.md`
- Modify: `.claude/skills/platform-rename-slug/SKILL.md`

- [ ] **Step 1: List current `name:` frontmatter and self-references**

Run:
```bash
for s in reddit-sync reddit-opportunities cross-link-review performance suggest rename-slug; do
  echo "### $s"
  grep -nE '^name:|/editorial-'"$s"'|editorial-'"$s" .claude/skills/platform-$s/SKILL.md
done
```
Expected: each file shows `name: editorial-<s>` and possibly `/editorial-<s>` prose mentions.

- [ ] **Step 2: In each `SKILL.md`, change `name: editorial-<s>` → `name: platform-<s>`**

Use the Edit tool on each file. Example for `platform-reddit-sync/SKILL.md`:
- old: `name: editorial-reddit-sync`
- new: `name: platform-reddit-sync`

Repeat for all six, substituting the slug. Then replace any prose `/editorial-<s>` → `/platform-<s>` and bare `editorial-<s>` self-mentions → `platform-<s>` in the same file (Edit with `replace_all: true` per file).

- [ ] **Step 3: Verify no survivor SKILL.md still names itself `editorial-`**

Run:
```bash
grep -rnE '^name: editorial-' .claude/skills/platform-*/SKILL.md ; echo "exit=$?"
```
Expected: no output, `exit=1` (grep found nothing).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/platform-*/SKILL.md
git commit -m "refactor(skills): point platform-* SKILL.md name + self-refs at new slugs"
```

---

### Task A3: Update kept cross-references to the renamed skills

Only surfaces that SURVIVE the cutover need updating. From the repo inventory the sole kept non-journal surface that references a survivor name is `.claude/skills/editorialcontrol-voice/SKILL.md`. Deleted skills (`editorial-distribute`, `editorial-help`, `editorial-plan`, `editorial-publish`) also reference survivors but are removed in PR-B, so skip them. Journal files under `journal/editorial/history/` are historical records — do NOT rewrite them.

**Files:**
- Modify: `.claude/skills/editorialcontrol-voice/SKILL.md` (only if it references a renamed survivor)

- [ ] **Step 1: Find live references in kept surfaces**

Run:
```bash
grep -rnE 'editorial-(reddit-sync|reddit-opportunities|cross-link-review|performance|suggest|rename-slug)' \
  .claude/skills/editorialcontrol-voice/SKILL.md .claude/skills/audiocontrol-voice/SKILL.md \
  .claude/CLAUDE.md .claude/rules/ 2>/dev/null
```
Expected: zero or a small number of hits. If zero, skip Steps 2–3 and proceed to Task A4.

- [ ] **Step 2: For each hit in a kept file, Edit `editorial-<x>` → `platform-<x>`**

Use the Edit tool per file/match.

- [ ] **Step 3: Commit (only if changes were made)**

```bash
git add -A
git commit -m "refactor: update kept cross-references to renamed platform-* skills"
```

---

### Task A4: Verify each survivor runs green against the live shared calendar

Each survivor reads the shared calendar / external APIs read-only. Confirm none broke from the rename. These are dry-run/read invocations — they must not mutate the calendar.

**Files:** none (verification only).

- [ ] **Step 1: Confirm survivor lib imports still resolve (lib path unchanged)**

Run:
```bash
grep -rhoE "scripts/lib/[a-zA-Z/-]+" .claude/skills/platform-*/SKILL.md .claude/skills/platform-rename-slug/rename.ts | sort -u
```
Expected: paths like `scripts/lib/editorial/channels`, `scripts/lib/editorial/crosslinks`, `scripts/lib/editorial/suggest`, `scripts/lib/reddit/client`, `scripts/lib/youtube/client`, `scripts/lib/http/fetch-page` — all still present on disk (the lib did not move).

- [ ] **Step 2: Type-check the survivor TS helper and the kept lib modules**

Run:
```bash
npx tsx --check scripts/lib/editorial/channels.ts scripts/lib/editorial/crosslinks.ts scripts/lib/editorial/suggest.ts scripts/lib/editorial/calendar.ts scripts/lib/editorial/rename-slug.ts .claude/skills/platform-rename-slug/rename.ts 2>&1 | tail -20
```
Expected: no type errors. (If the project lacks `tsx --check`, substitute `npx tsc --noEmit` scoped per the repo's tsconfig.)

- [ ] **Step 3: Run the analytics-backed survivors' read path**

Run:
```bash
npx tsx scripts/analytics-report.ts --help 2>&1 | head -5 || true
```
Expected: the report script loads without an import/resolution error (a usage message or report output is fine; an import error is a failure).

- [ ] **Step 4: Build the site to confirm nothing regressed**

Run:
```bash
npm run build 2>&1 | tail -15
```
Expected: build succeeds. (Skill files are not part of the Astro build, but this confirms no shared-lib import broke.)

- [ ] **Step 5: Commit (no-op safe — records the verification point if any incidental fixes were needed)**

```bash
git add -A
git commit -m "chore: verify platform-* survivors resolve after rename" --allow-empty
```

---

### Task A5: Resolve the `editorial-social-review` keep-vs-delete question

Per the spec, `social-review` is a pending survivor: keep it as `platform-social-review` ONLY if deskwork-studio's shortform coverage matrix does not already cover the use case.

**Files:**
- Possibly rename: `.claude/skills/editorial-social-review/` → `.claude/skills/platform-social-review/`

- [ ] **Step 1: Inspect deskwork-studio's shortform coverage matrix**

The studio is running (or launch it): visit `http://localhost:47321/dev/editorial-studio` and inspect the "shortform coverage matrix" surface. Compare against what `editorial-social-review` produces:
```bash
cat .claude/skills/editorial-social-review/SKILL.md
```

- [ ] **Step 2a: If studio does NOT cover it — rename to keep**

```bash
git mv .claude/skills/editorial-social-review .claude/skills/platform-social-review
```
Then apply Task A2's Step 2 to `.claude/skills/platform-social-review/SKILL.md` (`name: editorial-social-review` → `name: platform-social-review`).

- [ ] **Step 2b: If studio DOES cover it — leave for PR-B deletion**

Add `editorial-social-review` to the PR-B deletion list (Task B1) and record the decision in a one-line note in the spec's "Open question still pending" section via the Edit tool.

- [ ] **Step 3: Commit the decision**

```bash
git add -A
git commit -m "refactor(skills): resolve social-review (keep as platform-* | defer to PR-B delete)"
```

---

### Task A6: File the deskwork upstream gap issue for `rename-slug`

**Files:** none (GitHub issue).

- [ ] **Step 1: Create the issue on the deskwork repo**

```bash
gh issue create --repo audiocontrol-org/deskwork \
  --title "Gap: no slug-rename equivalent for /editorial-rename-slug" \
  --body-file /tmp/deskwork-rename-slug-gap.md
```
Where `/tmp/deskwork-rename-slug-gap.md` (create with the Write tool) describes: deskwork has no skill to rename a published entry's slug across the calendar + content file + frontmatter id; audiocontrol.org keeps `platform-rename-slug` in-house until deskwork offers one. Link back to audiocontrol.org issue #126.

- [ ] **Step 2: Record the upstream issue link in #126**

```bash
gh issue comment 126 --repo oletizi/audiocontrol.org --body "Filed upstream rename-slug gap: <issue URL from Step 1>. Keeping platform-rename-slug in-house meanwhile."
```

---

### Task A7: Open PR-A and stop

**Files:** none.

- [ ] **Step 1: Push and open the PR**

```bash
git push -u origin feature/mothball-editorial-pipeline
gh pr create --title "Mothball pt 1: carve out platform-* survivors (non-destructive)" \
  --body-file /tmp/pr-a-body.md
```
Create `/tmp/pr-a-body.md` (Write tool) summarizing: renamed 6–7 survivors to `platform-*`, lib unchanged, survivors verified independent, rename-slug filed upstream. Reference #126. No deletions yet.

- [ ] **Step 2: STOP. Do not start Phase B until PR-A is merged.**

The operator owns merge (per project convention). Phase B is gated on PR-A landing on `main`.

---

## PHASE B — Decommission (PR-B, destructive — AFTER PR-A merges)

### Task B0: Rebase onto main

**Files:** none.

- [ ] **Step 1: Update the branch**

```bash
cd /Users/orion/work/audiocontrol-work/audiocontrol.org-mothball-editorial-pipeline
git fetch origin
git rebase origin/main
```
Expected: clean rebase (PR-A already merged; no overlap with deletions).

---

### Task B1: Delete the 16 deskwork-covered skills

**Files:** delete the 16 skill directories listed below.

- [ ] **Step 1: Remove the directories**

```bash
git rm -r \
  .claude/skills/editorial-add \
  .claude/skills/editorial-plan \
  .claude/skills/editorial-outline \
  .claude/skills/editorial-outline-approve \
  .claude/skills/editorial-draft \
  .claude/skills/editorial-draft-review \
  .claude/skills/editorial-iterate \
  .claude/skills/editorial-approve \
  .claude/skills/editorial-publish \
  .claude/skills/editorial-distribute \
  .claude/skills/editorial-shortform-draft \
  .claude/skills/editorial-review-cancel \
  .claude/skills/editorial-review-help \
  .claude/skills/editorial-review-report \
  .claude/skills/editorial-status \
  .claude/skills/editorial-help
```
*(If Task A5 deferred `editorial-social-review` to deletion, append `.claude/skills/editorial-social-review` here.)*

- [ ] **Step 2: Verify only survivors + voice skills remain on the `editorial`/`platform` axis**

Run:
```bash
ls .claude/skills/ | grep -E 'editorial|platform'
```
Expected: `platform-*` survivors plus `editorialcontrol-voice` (and `audiocontrol-voice` if listed) — no other `editorial-*`.

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor: delete in-house editorial lifecycle skills (deskwork covers them)"
```

---

### Task B2: Delete the in-house dev review/studio/scrapbook surfaces and API routes

**Files:** delete the pages, API routes, and shared assets listed in the File Structure section.

- [ ] **Step 1: Remove the dev pages and API routes**

```bash
git rm -r \
  src/sites/editorialcontrol/pages/dev/editorial-help.astro \
  src/sites/editorialcontrol/pages/dev/editorial-review \
  src/sites/editorialcontrol/pages/dev/editorial-review-shortform.astro \
  src/sites/editorialcontrol/pages/dev/editorial-studio.astro \
  src/sites/editorialcontrol/pages/dev/scrapbook \
  src/sites/editorialcontrol/pages/api/dev/editorial-calendar \
  src/sites/editorialcontrol/pages/api/dev/editorial-review \
  src/sites/editorialcontrol/pages/api/dev/editorial-studio
```

- [ ] **Step 2: Remove the shared CSS/TS for the deleted surfaces (KEEP `lightbox.ts`)**

```bash
git rm \
  src/shared/editorial-help.css \
  src/shared/editorial-review.css \
  src/shared/editorial-review-client.ts \
  src/shared/editorial-review-editor.ts \
  src/shared/editorial-skills-catalogue.ts \
  src/shared/editorial-studio.css \
  src/shared/editorial-studio-client.ts
```

- [ ] **Step 3: Confirm `lightbox.ts` is still present and still imported by the blog layouts**

Run:
```bash
ls src/shared/lightbox.ts && grep -rln lightbox src/sites/*/layouts/BlogLayout.astro
```
Expected: `lightbox.ts` exists; both `BlogLayout.astro` files match.

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor: delete in-house editorial review/studio/scrapbook dev surfaces"
```

---

### Task B3: Delete pipeline-only libraries and trim the editorial barrel

**Files:**
- Delete: `scripts/lib/editorial-review/`, `scripts/lib/editorial-calendar-actions/`
- Delete: `scripts/lib/editorial/body-state.ts`, `scaffold.ts`, `scrapbook.ts`, `remark-image-figure.mjs`, `remark-strip-first-h1.mjs`, `remark-strip-outline.mjs`
- Modify: `scripts/lib/editorial/index.ts`

- [ ] **Step 1: Inspect the barrel before trimming**

Run:
```bash
cat scripts/lib/editorial/index.ts
```
Note which `export ... from './<module>'` lines reference the to-be-deleted modules (`body-state`, `scaffold`, `scrapbook`, the `remark-*` files).

- [ ] **Step 2: Remove the pipeline-only libraries**

```bash
git rm -r scripts/lib/editorial-review scripts/lib/editorial-calendar-actions
git rm scripts/lib/editorial/body-state.ts \
       scripts/lib/editorial/scaffold.ts \
       scripts/lib/editorial/scrapbook.ts \
       scripts/lib/editorial/remark-image-figure.mjs \
       scripts/lib/editorial/remark-strip-first-h1.mjs \
       scripts/lib/editorial/remark-strip-outline.mjs
```

- [ ] **Step 3: Edit `scripts/lib/editorial/index.ts` to drop re-exports of the deleted modules**

Use the Edit tool to remove each `export * from './body-state...'` / `'./scaffold...'` / `'./scrapbook...'` / `'./remark-*'` line identified in Step 1. Keep re-exports of `calendar`, `types`, `channels`, `crosslinks`, `suggest`, `rename-slug`.

- [ ] **Step 4: Verify no remaining import references a deleted module**

Run:
```bash
grep -rnE "lib/editorial/(body-state|scaffold|scrapbook|remark-)" .claude/skills/ scripts/ src/ 2>/dev/null | grep -v node_modules ; echo "exit=$?"
grep -rnE "lib/editorial-review|lib/editorial-calendar-actions" .claude/skills/ scripts/ src/ 2>/dev/null | grep -v node_modules ; echo "exit=$?"
```
Expected: no output, `exit=1` for both (all importers were the deleted surfaces).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: delete pipeline-only editorial libs; trim editorial barrel"
```

---

### Task B4: Update CLAUDE.md / rules references to the editorial workflow

**Files:**
- Modify: `.claude/CLAUDE.md` (Sub-Agent Delegation table / editorial workflow mentions, if any name specific deleted skills)
- Modify: `.claude/rules/workflow-playbooks.md` (the "Add a Blog Post" playbook references the in-house flow)

- [ ] **Step 1: Find references to the deleted editorial workflow in instruction files**

Run:
```bash
grep -rnE '/editorial-(add|plan|outline|draft|iterate|approve|publish|distribute|status|help|review|shortform)|editorial-review|editorial-studio' \
  .claude/CLAUDE.md .claude/rules/ 2>/dev/null
```
Expected: a handful of references in `workflow-playbooks.md` and possibly `CLAUDE.md`.

- [ ] **Step 2: Rewrite each to point at the deskwork equivalent**

Use the Edit tool. Map per #126's parity table, e.g. `/editorial-add` → `/deskwork:add`, `/editorial-draft` → `/deskwork:draft`, `/editorial-publish` → `/deskwork:publish`, the review/studio surfaces → `/deskwork-studio:studio`. Note the surviving `platform-*` skills for reddit/analytics/cross-link/suggest reach.

- [ ] **Step 3: Verify no instruction file still references a deleted skill**

Run:
```bash
grep -rnE 'editorial-(add|plan|outline|draft|iterate|approve|publish|distribute|status|help|review|shortform)' \
  .claude/CLAUDE.md .claude/rules/ 2>/dev/null ; echo "exit=$?"
```
Expected: no output, `exit=1`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: point CLAUDE.md/rules at deskwork + platform-* after mothball"
```

---

### Task B5: Mark the editorial-calendar feature deskwork-replaced

**Files:**
- Modify: `docs/1.0/001-IN-PROGRESS/editorial-calendar/README.md`
- Modify: `docs/1.0/001-IN-PROGRESS/editorial-calendar/workplan.md`

- [ ] **Step 1: Add a deskwork-replaced note to the feature README status table**

Use the Edit tool to add a status row/line stating the in-house editorial pipeline was mothballed in favor of the deskwork plugin (link #126), with the `platform-*` survivors retained.

- [ ] **Step 2: Annotate the workplan**

Add a closing note to `workplan.md` that the lifecycle skills are superseded by deskwork; only platform-reach survivors remain in-repo.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs(editorial-calendar): mark in-house pipeline deskwork-replaced"
```

---

### Task B6: Full build + residual-reference sweep

**Files:** none (verification).

- [ ] **Step 1: Build the site**

```bash
npm run build 2>&1 | tail -20
```
Expected: build succeeds with all deleted routes gone and no dangling import errors.

- [ ] **Step 2: Run the test suites**

```bash
npm test 2>&1 | tail -15
npm run test:integration 2>&1 | tail -15
```
Expected: pass. If a test targeted a deleted surface, delete that test (and note it in the commit).

- [ ] **Step 3: Sweep for any residual reference to deleted skills/surfaces (excluding historical journal + this plan/spec)**

Run:
```bash
grep -rnE 'editorial-review|editorial-studio|editorial-skills-catalogue|/editorial-(add|plan|draft|publish|iterate|approve|distribute|status|help)' \
  src/ scripts/ .claude/skills/ .claude/CLAUDE.md .claude/rules/ 2>/dev/null \
  | grep -v node_modules ; echo "exit=$?"
```
Expected: no output, `exit=1`.

- [ ] **Step 4: Confirm the shared calendar still parses via the kept `calendar.ts`**

Run:
```bash
npx tsx -e "import {readFileSync} from 'fs'; const m = await import('./scripts/lib/editorial/calendar.ts'); console.log('calendar module loaded:', Object.keys(m));"
```
Expected: the module loads and prints its exports without error.

- [ ] **Step 5: Commit any test cleanups**

```bash
git add -A
git commit -m "test: drop tests for deleted editorial surfaces; green build" --allow-empty
```

---

### Task B7: Open PR-B

**Files:** none.

- [ ] **Step 1: Push and open the PR**

```bash
git push
gh pr create --title "Mothball pt 2: decommission in-house editorial pipeline" \
  --body-file /tmp/pr-b-body.md
```
Create `/tmp/pr-b-body.md` (Write tool): summarize the deletions (16 skills, review/studio/scrapbook surfaces + API routes, pipeline-only libs), the kept `platform-*` survivors and `lightbox.ts`, green build/tests, and "Closes #126". The operator owns merge.

---

## Self-Review (completed by plan author)

**Spec coverage:** Every spec section maps to a task — survivor rename (A1–A2), kept cross-refs (A3), survivor verification (A4), social-review gate (A5), rename-slug upstream (A6), skill deletions (B1), dev-surface deletions (B2), lib carve/trim (B3), CLAUDE.md/rules (B4), feature-doc update (B5), build/test/sweep (B6). The plan EXPANDS the spec's deletion set with three items the spec under-listed: `pages/api/dev/editorial-calendar/`, `scripts/lib/editorial-calendar-actions/`, and `src/shared/{editorial-help.css,editorial-studio-client.ts}` — all confirmed self-contained via import-graph inventory.

**Resolved spec open items:** `lightbox.ts` → KEEP (shared by both blog layouts, not deletion-only) — the spec's conditional is settled. `social-review` remains a runtime gate (A5) because it depends on visual inspection of the studio matrix.

**Placeholder scan:** No TBD/TODO/"handle edge cases" steps. Every code/command step shows the exact command. The few content-authoring steps (PR bodies, doc notes, upstream issue) specify exact file paths and required content.

**Type/path consistency:** Skill slugs are consistent `platform-<x>` throughout; lib paths reference `scripts/lib/editorial/` consistently (unmoved); deletion lists match the File Structure tables.

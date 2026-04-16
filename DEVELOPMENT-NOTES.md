# Development Notes

Session journal for audiocontrol.org. Each entry records what was tried, what worked, what failed, and course corrections.

---

## 2026-04-15: Infrastructure Port — Project Management & Agent Process
### Feature: infrastructure

**Goal:** Port project management infrastructure (feature lifecycle skills, agent profiles, status-organized docs, session journal) from the audiocontrol monorepo to audiocontrol.org.

**Accomplished:**
- Created `.claude/CLAUDE.md` with session lifecycle, delegation table, and project conventions
- Created `.claude/project.yaml` with Astro/Netlify stack config and agent roster
- Migrated `docs/1.0/palette-redesign/` to `docs/1.0/003-COMPLETE/`
- Migrated `docs/seo-roland-s-series/` to `docs/1.0/001-IN-PROGRESS/`
- Created `docs/1.0/ROADMAP.md` with feature index
- Created 13 feature lifecycle skills adapted for this project
- Created 7 agent profiles, 3 domain rules, 1 workflow definition
- Created `.agents/` Codex compatibility mirror
- Added feature lifecycle reference to PROJECT-MANAGEMENT.md

**Didn't Work:**
- N/A (port, not implementation)

**Course Corrections:**
- [PROCESS] Adapted all monorepo-specific references (pnpm, make, module filters) to single-project equivalents (npm)
- [PROCESS] Dropped hardware-specific agents, rules, and skills (deploy-bridge, SCSI, MIDI)
- [PROCESS] Simplified analyze-session to journal-based analysis (no tools pipeline)

**Quantitative:**
- Files created: ~30
- Files migrated: 6 (two feature doc sets)

**Insights:**
- The feature lifecycle is project-agnostic enough to port with mostly mechanical substitutions
- Hardware-specific infrastructure (agents, rules, playbooks) was cleanly separable

---

## 2026-04-15: Feature Definition Sprint — Three Features Defined & Tracked
### Features: feature-image-generator, automated-analytics, editorial-calendar

**Goal:** Define, set up infrastructure (branches, worktrees, docs), and create GitHub issues for three new features: feature image generator (#31), automated analytics (#30), and editorial calendar (#29).

**Accomplished:**
- Defined all three features via `/feature-define` interviews
- Created feature branches and worktrees for all three
- Created PRD, workplan, README, and implementation summary for automated-analytics and editorial-calendar
- Created GitHub issues: 11 total (3 parent issues updated + 4 phase issues for image generator + 4 for analytics + 3 for editorial calendar)
- Linked all phase issues to parent issues with tracking tables
- Researched AI image generation APIs (DALL-E 3, FLUX, Stability, Replicate) for feature-image-generator
- Analyzed existing site design tokens for brand-consistent image generation
- Identified feature dependencies: editorial-calendar depends on automated-analytics for Phase 3

**Didn't Work:**
- Wrote feature docs to main worktree instead of feature worktrees — had to copy them over
- Overwrote existing feature-image-generator docs (which had Phases 1-3 progress) with blank templates during the copy
- Attempted destructive cleanup (`rm` + `git checkout --`) instead of using `git restore`

**Course Corrections:**
- [PROCESS] Feature docs must be created in the feature worktree, not the main worktree — the implementation team needs to find them on the feature branch
- [PROCESS] Always check for existing content before writing/copying files into a worktree
- [PROCESS] Use `git restore` (least destructive) to undo accidental overwrites, not `rm` or `git checkout --`
- [PROCESS] Never delete version-controlled files without explicit user approval

**Quantitative:**
- Messages: ~25
- Commits: 4 (2 on automated-analytics, 2 on editorial-calendar)
- Corrections: 4
- GitHub issues created: 11
- Features defined: 3

**Insights:**
- Feature worktrees may already have significant prior work — never assume a worktree is empty just because you created it in this session
- The feature lifecycle workflow (define → setup → issues) works well for batch planning sessions
- Three interconnected features (image gen, analytics, editorial calendar) form a coherent content automation strategy

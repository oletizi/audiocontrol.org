# Development Notes

Session journal for audiocontrol.org. Each entry records what was tried, what worked, what failed, and course corrections.

---

## 2026-04-15: Editorial Calendar — Full Implementation (Phases 1-3)
### Feature: editorial-calendar
### Worktree: audiocontrol.org-editorial-calendar

**Goal:** Implement all three phases of the editorial calendar feature: calendar structure, post scaffolding, and analytics integration.

**Accomplished:**
- Defined calendar entry types and 5-stage lifecycle (Ideas, Planned, Drafting, Review, Published)
- Implemented markdown calendar parser/writer with round-trip fidelity
- Created initial calendar pre-populated with all 8 existing published blog posts
- Created 8 composable `/editorial-*` skills following UNIX-style design (help, add, plan, review, draft, publish, suggest, performance)
- Implemented scaffold.ts for blog post directory/frontmatter generation
- Implemented suggest.ts with analytics integration types (throws until #30 is ready)
- Updated PRD from monolithic `/editorial` to composable `/editorial-*` skill design
- All phases marked complete; Phase 3 blocked on automated-analytics (#30) for live data

**Didn't Work:**
- N/A

**Course Corrections:**
- [PROCESS] User redirected from implementing skills immediately to updating PRD/workplan first — design before code
- [PROCESS] User requested composable `/editorial-*` skills instead of monolithic `/editorial` — better matches existing `/feature-*` pattern

**Quantitative:**
- Messages: ~15
- Commits: 3 (one per phase)
- Corrections: 2
- Files created: 12

**Insights:**
- The UNIX-style composable skill pattern (small, focused, composable) is a strong fit for editorial workflows — each skill does one thing and the user chains them
- Designing the skill interface (SKILL.md) before the library code would have been more efficient — we built the library first and then pivoted the skill design
- Phase 3 analytics integration is cleanly separable: types and skill definitions are ready, only the data pipeline is missing

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

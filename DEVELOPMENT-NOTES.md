# Development Notes

Session journal for audiocontrol.org. Each entry records what was tried, what worked, what failed, and course corrections.

---

## 2026-04-16: Editorial Calendar — Analytics Wiring & Documentation
### Feature: editorial-calendar
### Worktree: audiocontrol.org-editorial-calendar

**Goal:** Wire editorial calendar to the newly-merged analytics pipeline, add CONTENT-CALENDAR.md documentation, create PR.

**Accomplished:**
- Rewrote `suggest.ts` from stub functions to live analytics integration (Umami, GA4, Search Console)
- `getContentSuggestions()` extracts striking-distance and CTR opportunities from Search Console, deduplicates against existing calendar entries
- `getPostPerformance()` matches published posts to metrics across all data sources, surfaces recommendations
- Updated `/editorial-suggest` and `/editorial-performance` skills to remove dependency warnings
- Created CONTENT-CALENDAR.md documenting the full workflow, skills reference, and file layout
- Added content calendar reference to top-level README
- Created PR oletizi/audiocontrol.org#46

**Didn't Work:**
- N/A

**Course Corrections:**
- None this session

**Quantitative:**
- Messages: ~10
- Commits: 4
- Corrections: 0
- Files changed: 7

**Insights:**
- Wiring to an existing analytics pipeline was straightforward — the types and interfaces aligned naturally since suggest.ts was designed with the analytics dependency in mind
- Writing documentation (CONTENT-CALENDAR.md) after the full system exists produces clearer docs than writing during implementation — the workflow is settled and the edge cases are known

---

## 2026-04-16: Automated Analytics — Full Implementation
### Feature: automated-analytics
### Worktree: audiocontrol.org-automated-analytics

**Goal:** Implement all four phases of the automated analytics pipeline: Umami data pipeline, Search Console integration, actionable report with recommendations, and /analytics Claude Code skill.

**Accomplished:**
- Implemented Umami Cloud API client (pageviews, visitors, bounce rate, time on page by path)
- Implemented GA4 Data API client via direct REST + JWT auth (no googleapis dependency)
- Implemented Google Search Console client via direct REST + JWT auth
- Shared JWT auth module (`google-auth.ts`) for both Google APIs
- Content scorecard with period-over-period trends (Umami + GA4)
- Search performance analysis: top queries, CTR opportunities, striking distance (position 5-20)
- Content-to-editor funnel computation (GA4-preferred, Umami fallback)
- Recommendation engine: CTR, bounce, engagement, funnel, and ranking recommendations ranked by impact
- CLI entry point with --days and --json flags
- /analytics Claude Code skill
- PR created: oletizi/audiocontrol.org#45

**Didn't Work:**
- GA4 permissions took multiple attempts — the service account needed to be added via GA4 Admin > Property Access Management, not just at the GCP level
- googleapis npm package was initially installed (836 packages) but replaced with direct REST calls
- Umami date range returned empty data when endAt was midnight — fixed by using end-of-day timestamps
- Google Analytics initially attempted as sole analytics source; switched to Umami as primary after persistent permission issues, then added GA4 back once permissions resolved

**Course Corrections:**
- [PROCESS] Switched from GA4-only to Umami-primary at user's request — GA4 permissions were frustrating and Umami is simpler
- [PROCESS] Dropped googleapis dependency in favor of direct REST + JWT — much lighter (0 vs 836 packages)
- [PROCESS] Added GA4 back as supplementary data source (best-effort) after user realized permissions just needed GA4 console setup

**Quantitative:**
- Messages: ~40
- Commits: 4 (on feature branch)
- Corrections: 3
- Files created: 13

**Insights:**
- Direct REST + JWT for Google APIs is dramatically simpler than the googleapis npm package — one shared auth module serves both GA4 and GSC
- Umami Cloud API is straightforward but the response shapes differ from their docs in subtle ways (flat stats vs nested, totaltime units)
- GA4 permission errors are misleading — "insufficient permissions" covers both "API not enabled" and "service account not added as viewer in GA4 console"
- The content-to-editor funnel reveals a 0% conversion rate — blog content isn't driving editor usage at all, which is a clear actionable finding

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

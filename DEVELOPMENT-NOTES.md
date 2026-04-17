# Development Notes

Session journal for audiocontrol.org. Each entry records what was tried, what worked, what failed, and course corrections.

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

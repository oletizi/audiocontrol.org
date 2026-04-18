# Development Notes

Session journal for audiocontrol.org. Each entry records what was tried, what worked, what failed, and course corrections.

---

## 2026-04-17: Feature Image Generator — Workflow Pipeline (Phase 6 ship) + Prompt Library (Phase 11)
### Feature: feature-image-generator
### Worktree: audiocontrol.org-feature-image-generator

**Goal:** Land Phase 6 (preview gallery + workflow pipeline) on main, then scope and ship Phase 11 (prompt library with fitness-ranked selection).

**Accomplished:**
- Updated FEATURE-IMAGES.md to document the Phase 6 two-way workflow pipeline (agent enqueues → gallery iteration → user decision → agent applies)
- Added `/feature-image-help` skill (user pointed out it was missing — it should report current pipeline state)
- Opened PR #62 for Phase 6 + workflow pipeline; merged after Netlify checks went green
- Closed issues #48 (Phase 6) and #35 (Phase 4 — `.env.example` was the last task)
- Validated the new flow end-to-end on a real post (`reverse-engineering-akai-s3000xl-midi-over-scsi`): `/feature-image-blog` enqueued → user iterated in gallery → submitted decision → `/feature-image-apply` copied files, wired frontmatter and blog index
- Scoped Phase 11 with the user's "evolution by artificial selection" framing: templates + 1-5 star ratings + fitness rollup + lineage via `parent` field + fork mechanic. Created issue #63, updated PRD/workplan/parent-issue checklist
- Shipped Phase 11 in full this same session:
  - `scripts/feature-image/templates.ts` — YAML CRUD, fork/archive helpers, fitness computation (recent-weighted average, Laplace-smoothed by usage count)
  - Extended `LogEntry` with `rating` and `templateSlug`; threaded both through `pipeline.ts`, `/api/dev/feature-image/log`, and `/api/dev/feature-image/generate`
  - New `GET /POST /api/dev/feature-image/templates` endpoint (list with computed fitness, create/update/fork/archive)
  - Gallery UI: template picker (with fitness in option labels), fork button, star widgets on every history entry, "Save as template" button (interactive prompts for slug/name/description/tags), candidate-template pills surfaced from workflow context
  - New `/feature-image-prompts` skill for browsing the library by tag/fitness/lineage
  - `/feature-image-blog` updated to read post tags from blog index, query templates, and add `suggestedTemplateSlug` + `candidateTemplates` to the workflow context
  - Seeded `docs/feature-image-prompts.yaml` with 4 templates (`crystal-teal`, `crystal-amber`, `data-packet-network`, `stacked-panels-receding`); only `data-packet-network` has a real example linked (the reverse-engineering generation), others start at zero usage and float to top to accumulate ratings
  - Added `yaml` devDependency
  - Verified live: rating the reverse-engineering generation 5 stars updated `data-packet-network` to fitness 1.25 (correct dampening from Laplace smoothing)

**Didn't Work:**
- Inserted Phase 11 into the workplan at the wrong position (before Phase 10 instead of after) on first try — had to do a remove + re-insert
- Dev server died multiple times during testing (exit code 143 / SIGTERM) — likely from running multiple instances and the build process competing for ports
- Wrote a `/tmp/pr-body.md` file with the Write tool without reading it first, hit a tool-use error, had to delete and recreate

**Course Corrections:**
- [DOCUMENTATION] User pointed out FEATURE-IMAGES.md was stale (still described the pre-Phase-6 inline-generation flow) and that `/feature-image-help` didn't exist. Both fixed before opening the PR. Lesson: when changing user-facing flow, update the docs and skill registry in the same commit as the code.
- [PROCESS] Wrong workplan insertion point — should have read the surrounding numbered phases more carefully before inserting Phase 11.
- [PROCESS] Should have read `/tmp/pr-body.md` before re-writing it (Write tool requires Read first when target exists).

**Quantitative:**
- Messages: ~30
- Commits: 4 on the feature branch (`9be0464` reverse-engineering content, `c087f29` docs+help-skill, `720d74b` Phase 11 scoping, `45ab767` Phase 11 implementation), plus the merged PR #62 (`2426246` on main)
- Corrections: 3 (doc staleness, workplan insertion order, PR-body Write-without-Read)
- Files changed: ~25 across the session
- New skills: 3 (`/feature-image-help`, `/feature-image-prompts`, plus `/feature-image-apply` from prior session ratified)
- New API endpoints: 1 (`/api/dev/feature-image/templates`)
- New persisted artifacts: 1 (gitignored `.feature-image-pipeline.jsonl`); 1 checked-in (`docs/feature-image-prompts.yaml`)

**Insights:**
- The two-way workflow pipeline (agent enqueue → user iterate → user decide → agent apply) is a genuinely useful pattern that separates "deliberation in the gallery" from "wiring in the codebase". It matches how the user actually works and the gallery's auto-poll keeps the loop tight without manual refresh.
- Fitness via Laplace-smoothed blend of recent + overall average is the right shape for small-sample template ranking — a single 5-star rating yields fitness 1.25 (not 5.0), which is the correct "promising but unproven" signal.
- Floating new (zero-rating) templates to the top of the picker is a critical UX move; without it, established templates would dominate forever and new prompts would never accumulate signal.
- Updating user-facing docs late is a recurring mistake — Phase 6 had shipped to the gallery and skills before FEATURE-IMAGES.md was updated. Worth a personal heuristic: if the user-facing flow changes, the user-facing docs change in the same commit.
- `/feature-image-blog`'s shift from "do everything" to "enqueue + hand off" was the right call — it lets the user explore freely instead of being railroaded into accepting the agent's first guess. The skill became simpler AND more useful.

---

## 2026-04-17: Editorial Calendar — Phase 4 Social Distribution + GA4 Migration
### Feature: editorial-calendar
### Worktree: audiocontrol.org-editorial-calendar

**Goal:** Implement Phase 4 (social distribution tracking) and ship it as a PR-ready commit on the feature branch.

**Accomplished:**
- Extended PRD (Phase 4 in-scope clarification) and workplan (Phase 4 section, all acceptance criteria checked)
- Added `Platform` union, `DistributionRecord`, `distributions[]` on `EditorialCalendar`; parser/writer for a new `## Distribution` section; `addDistribution()` mutation that refuses non-Published entries
- New skills: `/editorial-distribute` (interactive, no positional args per prior user feedback) and `/editorial-social-review` (post × platform matrix); extended `/editorial-performance`, `/editorial-help`, `/editorial-review`; updated CONTENT-CALENDAR.md and the live `docs/editorial-calendar.md`
- 10 unit tests for Distribution parser/writer round-trip + `addDistribution()` — all pass
- Shipped with an interim Umami-based `getSocialReferrals()` (commit 1), then immediately replaced with GA4 `sessionSource` + `pagePath` (commit 2) to get real per-post attribution
- Verified GA4 live: 10 (slug, platform) records over 90 days, with real traffic across reddit/youtube/linkedin
- Both commits pushed to `feature/editorial-calendar`

**Didn't Work:**
- Umami `/metrics?type=referrer` silently ignores its `url` query parameter on our instance — same response for any path, including nonexistent paths. Made per-post attribution impossible via Umami.
- Umami referrer data is essentially empty anyway (1 bing.com record over 365 days) because social platforms strip the Referer header before sending traffic.
- My initial `UmamiReferrerMetric` interface (`{name, pageviews, visitors, visits}`) was fabricated — Umami actually returns `{x, y}`. The code crashed at runtime the first time I actually called it.

**Course Corrections:**
- [PROCESS] I didn't test the Umami integration before staging the commit. User pushed back ("why didnt you test the umami integration?") — rightly so, since one live call surfaced three separate bugs (interface shape, ignored URL filter, empty dataset). Lesson: any code that calls a third-party API must be exercised live before claiming the task complete.
- [FABRICATION] Made up the Umami referrer response shape from intuition rather than checking a real response. Exactly the class of error the global CLAUDE.md warns about ("never bypass typing"/no mock data); compiler can't catch wrong assumptions about external API shapes.
- [PROCESS] User had flagged "split the file by week if it grows" as a nice-to-have for distribution records but didn't need it yet — resisted the urge to implement splitting as premature optimization. Good.

**Quantitative:**
- Messages: ~25
- Commits: 2 (Phase 4 feat + GA4 switch)
- Corrections: 1 (live testing)
- Files: 18 in commit 1, 6 in commit 2

**Insights:**
- Always run the live path for any analytics/API code before committing. Live data surfaces shape mismatches, silent filter no-ops, and empty-dataset edge cases that tsc and unit tests cannot.
- For social referral attribution on a static site, GA4's `sessionSource` is structurally superior to HTTP-Referer-based approaches. Platforms strip Referer; session sources come from GA4's own attribution heuristics and survive.
- Shipping an honest-but-limited stopgap commit immediately followed by the correct implementation produced a clearer history than trying to get it right in one shot. The interim commit's body documents *why* the approach was wrong, which is useful context for anyone looking at the GA4 code later.
- User's standing feedback about interactive prompts (saved to memory this session) paid off — `/editorial-distribute` was designed interactively from the start, no rework needed.

---

## 2026-04-16: Feature Image Generator — End-to-End + Phase 5 + Phase 6-10 Scoping
### Feature: feature-image-generator
### Worktree: audiocontrol.org-feature-image-generator

**Goal:** Wire API keys, validate both providers end-to-end, ship Phase 5 (filter pipeline), apply images to actual blog posts, and scope out the remaining work.

**Accomplished:**
- Auto-load API keys from `~/.config/audiocontrol/` (no env var setup needed at runtime)
- Both providers verified end-to-end with real generations
- Fixed three FLUX issues: wrong endpoint domain, missing dimension constraints, region-pinned polling URL
- Shipped Phase 5: filter pipeline with `scanlines`, `vignette`, `grain`, `grade`, `phosphor` primitives + 5 presets (`none`, `subtle`, `retro-crt`, `teal-amber`, `heavy-crt`)
- Iterated on prompts and filters to land on a "geometric + retro-crt" house style for AI/agent posts
- Generated and applied feature images to 3 blog posts (agent-workflow + 2 claude-vs-codex perspectives)
- Built `feature-image-blog` skill — end-to-end orchestration for adding feature images to blog posts
- Decoupled inline feature image (`frontmatter.image`) from social card (`frontmatter.socialImage`) in BlogLayout; cropped inline to 21:10 aspect
- Scoped Phases 6-10 (preview gallery + 4 filter expansion phases), created issues #48-#52, updated parent #31 checklist

**Didn't Work:**
- DALL-E and FLUX both produced plausibly-Roland-shaped gear that anyone familiar with the actual S-330 would clock as fake; iterated to abstract/geometric prompts instead
- Initial `retro-crt` was too subtle — scanlines vanished at thumbnail resolution; thickened to 2px lines and added phosphor blur
- First FLUX attempts hit a stack of API quirks (endpoint, dimensions, polling URL) — none documented clearly in BFL docs

**Course Corrections:**
- [UX] Pivoted from photographic gear prompts to abstract/geometric after user pointed out anyone who knows the gear sees the AI artifacts. Rule: don't try to depict identifiable hardware that the audience knows well
- [UX] User wanted thicker scanlines + more phosphor blur on `retro-crt` — initial settings were imperceptible at typical display sizes
- [PROCESS] Inline feature image was tall and odd without the text overlay; introduced `socialImage` to decouple inline from social card
- [PROCESS] Astro dev server defaults to localhost only; needed `--host` to expose it to the user's other devices
- [PROCESS] Bundled the pre-existing `implementation-summary.md` into a docs commit when staging `git add docs/...` — should have been more surgical with staging

**Quantitative:**
- Messages: ~60
- Commits: 10
- Corrections: ~3 (UX feedback on prompts + scanline thickness + commit hygiene)
- Files added: 27 (filter modules, skill, blog images for 3 posts, gallery scoping docs)

**Insights:**
- AI gear photos hit uncanny valley fast for technical audiences; abstract is safer
- Filter pipelines normalize wildly different sources better than prompt tuning alone — `gradient-map` (Phase 8) will probably become the strongest brand-consistency tool
- Inline-vs-social separation is a real distinction: inline supports the article (no text needed), social sells the click (text matters). Worth its own frontmatter field
- The interactive iteration loop is the bottleneck right now — Phase 6 (gallery) is the right next investment because every subsequent filter phase benefits

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

## 2026-04-15: Feature Image Generator — Phases 1-3 Implementation
### Feature: feature-image-generator
### Worktree: audiocontrol.org-feature-image-generator

**Goal:** Set up feature documentation and implement Phases 1-3 of the feature image generator (provider interface, text overlay compositing, Claude Code skill).

**Accomplished:**
- Created feature docs: PRD, workplan, README in `docs/1.0/001-IN-PROGRESS/feature-image-generator/`
- Implemented provider interface with DALL-E 3 and FLUX (BFL API) providers
- Built CLI with support for background-only, overlay-only, and full generation modes
- Implemented text overlay compositing with satori + sharp (branded panel, JetBrains Mono titles, teal accent, logo)
- All three output formats working: OG (1200x630), YouTube (1280x720), Instagram (1080x1080)
- Created `/feature-image` Claude Code skill with frontmatter-driven generation
- Added `openai` dependency and `generate-feature-image` npm script

**Didn't Work:**
- Local woff2 font files not compatible with satori — switched to fetching TTF from Google Fonts (same approach as existing OG generator)

**Course Corrections:**
- [PROCESS] Fixed font loading: satori requires TTF, not woff2. Matched the pattern already used by `scripts/generate-og-images.ts`

**Quantitative:**
- Messages: ~12
- Commits: 0 (uncommitted, pending session-end)
- Corrections: 0
- Files created: 9 (4 scripts, 3 docs, 1 skill, 1 package update)

**Insights:**
- The existing OG image generator (`generate-og-images.ts`) provided a good reference for satori + sharp patterns
- Keeping the feature-image code in its own `scripts/feature-image/` module kept it cleanly separated from the existing OG generator
- Phase 4 (bake-off) is blocked on API keys — all code paths are implemented but untested against real providers

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

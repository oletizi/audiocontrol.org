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

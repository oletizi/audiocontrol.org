# editorialcontrol-site

**Status:** In Progress
**Feature Branch:** `feature/editorialcontrol-site`
**Worktree:** `~/work/audiocontrol-work/audiocontrol.org-editorialcontrol-site`
**GitHub Issue:** oletizi/audiocontrol.org#69

## Overview

Stand up editorialcontrol.org as a sibling site to audiocontrol.org. One repo, two Astro builds, shared component/library code, per-site content and branding. editorialcontrol.org is the home for content-marketing and agent-as-workflow material; audiocontrol.org stays focused on audio / vintage-hardware / sampler content.

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Multi-site source layout + build split | Implementation complete (Netlify UI work deferred to Phase 6) |
| 2 | Multi-site editorial calendar library | Implementation complete |
| 3 | editorialcontrol branding + core pages | Implementation complete |
| 4 | Content migration (2 posts) | Not Started |
| 5 | Reddit / distribution (multi-account) | Not Started |
| 6 | Launch (DNS + HTTPS + sitemap) | Not Started |

## Dependencies

- editorialcontrol.org domain — registered ✓
- Netlify workspace — assumed capable of second site from same repo
- Existing editorial-calendar feature — complete on main (Phases 1-7 shipped)
- Existing feature-image-generator feature — complete on main (Phase 6 shipped)
- New Reddit account under brand-aligned username — TBD

## Open Questions

- Brand-aligned Reddit username for editorialcontrol.org
- ~~Accent palette for editorialcontrol~~ — **Resolved (2026-04-18):** signal-green chartreuse (`hsl(74 82% 58%)`) primary + parchment cream (`hsl(38 32% 82%)`) accent on ink-near-black. Fraunces italic serif wordmark (new font), Inter body + JetBrains Mono meta shared with audiocontrol.
- DEVELOPMENT-NOTES.md and ROADMAP.md — split per-site or repo-wide? (default: repo-wide)
- ~~Default for skills invoked without `--site`~~ — **Resolved (2026-04-18):** default to `audiocontrol` when omitted. Preserves the behavior every existing skill invocation relies on; editorialcontrol operators pass `--site=editorialcontrol` explicitly.

## Documentation

- [PRD](./prd.md) — product requirements and technical approach
- [Workplan](./workplan.md) — implementation phases and task breakdown
- [Implementation summary](./implementation-summary.md) — draft template for post-ship writeup

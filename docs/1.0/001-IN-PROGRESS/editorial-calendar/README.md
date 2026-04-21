# Editorial Calendar

**Status:** Phases 1-15 Complete + Phase 16 in flight (pipeline-drive: skill helpers, voice-skill consultation, body-state detection, first drafted dispatch, session-content archive) + Phase 17 planned (content collections + draft prod gate + outline stage)
**Feature Branch:** `feature/editorial-calendar`
**GitHub Issue:** oletizi/audiocontrol.org#29 (parent)
**Shipped PRs:** #46 (Phases 1-3), #55 (Phase 4), #58 (Phase 5), #60 (Phase 6), #61 (Phase 7), #89 (content edits), #98 (Phases 8-13 editorial-review extension), #101 (editorial-review redesign), #104 (Phase 14 — studio as command center + journal migration), #106 (Phase 15 — UI fixes, dblclick-edit, manual, multi-site consolidation)
**Unshipped commits on branch:** 13 (Phase 16 — see workplan)

## Overview

Structured editorial calendar that tracks content through its lifecycle (idea through publication), automates post scaffolding, and wires into the automated-analytics feature to create a virtuous content improvement cycle.

Phases 8-12 extend the feature with `editorial-review` — an analog of the feature-image-generator pipeline for prose. Dev-only review surface, annotate-and-iterate loop driven by Claude Code + the voice skills, short-form social post drafting, and a feedback signal that identifies which voice-skill principles produce the most drift.

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Calendar Structure & Basic Management | Complete |
| 2 | Post Scaffolding | Complete |
| 3 | Analytics Integration | Complete |
| 4 | Social Distribution Tracking | Complete |
| 5 | Subreddit Tracking & Cross-posting Opportunities | Complete |
| 6 | YouTube as First-Class Content + Cross-link Audit | Complete |
| 7 | Tool Cross-link Audit | Complete |
| 8 | Draft Review Pipeline + Surface Scaffolding | Complete |
| 9 | Longform Annotation UI | Complete |
| 10 | Orchestration Skills for the Review Loop | Complete |
| 11 | Short-form Review (Social Posts) | Complete |
| 12 | Voice-Library Feedback Signal | Complete |
| 13 | Editorial Studio (unified dashboard) | Complete |
| 14 | Studio as calendar command center + journal migration | Complete (PR #104) |
| 15 | Review-UI fixes, dblclick-to-edit, manual, multi-site consolidation | Complete (PR #106) |
| 16 | Pipeline drive-through: skill helpers, voice consultation, body-state gate, session archive | In Flight (unmerged commits) |
| 17 | Content collections + draft prod gate + outline stage | Planned |

## Dependencies

- `automated-analytics` (oletizi/audiocontrol.org#30) — required for Phase 3
- `feature-image-generator` (oletizi/audiocontrol.org#31) — optional integration
- Voice skills (`audiocontrol-voice`, `editorialcontrol-voice`, installed in `.claude/skills/`) — required for Phases 10-11

## Documentation

- [PRD](./prd.md) — Product requirements and technical approach
- [Workplan](./workplan.md) — Implementation phases and task breakdown
- [Implementation summary](./implementation-summary.md) — Phases 1-3 summary from initial ship

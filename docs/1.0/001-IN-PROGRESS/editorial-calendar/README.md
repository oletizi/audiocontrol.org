# Editorial Calendar

**Status:** All Phases Complete — PR #98 open (editorial-review extension 8-13)
**Feature Branch:** `feature/editorial-calendar`
**GitHub Issue:** oletizi/audiocontrol.org#29 (parent)
**Shipped PRs:** #46 (Phases 1-3), #55 (Phase 4), #58 (Phase 5), #60 (Phase 6), #61 (Phase 7), #89 (content edits)
**Open PR:** [#98 — editorial-review pipeline + studio dashboard](https://github.com/oletizi/audiocontrol.org/pull/98) (Phases 8-13)

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

## Dependencies

- `automated-analytics` (oletizi/audiocontrol.org#30) — required for Phase 3
- `feature-image-generator` (oletizi/audiocontrol.org#31) — optional integration
- Voice skills (`audiocontrol-voice`, `editorialcontrol-voice`, installed in `.claude/skills/`) — required for Phases 10-11

## Documentation

- [PRD](./prd.md) — Product requirements and technical approach
- [Workplan](./workplan.md) — Implementation phases and task breakdown
- [Implementation summary](./implementation-summary.md) — Phases 1-3 summary from initial ship

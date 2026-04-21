# Feature Image Generator

**Status:** In Progress
**Feature Branch:** `feature/feature-image-generator`
**Worktree:** `~/work/audiocontrol-work/audiocontrol.org-feature-image-generator`
**GitHub Issue:** #31

## Overview

Automates the creation of feature images for blog posts, pages, and social media. Uses AI image generation (DALL-E 3 / FLUX) for backgrounds and composites branded text overlays in multiple formats (OG 1200x630, YouTube 1280x720, Instagram 1080x1080).

## Documentation

- [PRD](./prd.md) — Product requirements
- [Workplan](./workplan.md) — Implementation phases and task breakdown

## Phase Status

| Phase | Issue | Status |
|-------|-------|--------|
| 1. Infrastructure & Provider Interface | #32 | Complete |
| 2. Text Overlay & Compositing | #33 | Complete |
| 3. Claude Code Skill | #34 | Complete |
| 4. Bake-off & Polish | #35 | Complete |
| 5. Post-Processing Filter Pipeline | #47 | Complete |
| 6. Preview Gallery & Iteration Workflow | #48 | Complete |
| 7. Analog Display Filter Primitives | #49 | Not Started |
| 8. 8-bit / Pixel Filter Primitives | #50 | Not Started |
| 9. Cinematic / Editorial Filter Primitives | #51 | Not Started |
| 10. Utility Filter Primitives | #52 | Not Started |
| 11. Prompt Library & Fitness-Ranked Selection | #63 | Complete |
| 12. DOM Preview & Commit-to-PNG | #67 | Complete |
| 13. Conversation Thread with Claude | #76 | Complete |
| 14. Multi-Site Feature Images | #85 | Complete |
| 15. Journal Records (one file per entry) | #99 | Complete (PR [#100](https://github.com/oletizi/audiocontrol.org/pull/100)) |
| 16. Studio Redesign (service-manual + ProgressTape) | #103 | Complete (PR [#105](https://github.com/oletizi/audiocontrol.org/pull/105)) |

## Studio layout (Phase 16)

The dev-only Feature Image Studio at `/dev/studio` replaces the old 4096-line `/dev/feature-image-preview` page. Five routes under a shared service-manual chrome (Departure Mono + IBM Plex Sans + JetBrains Mono, warm-ink + phosphor-amber + Roland-blue palette):

```
/dev/studio               Gallery — timeline-ordered history wall
/dev/studio/focus/[id]    Focus canvas — image hero + DIP-switch panel + thread
/dev/studio/generate      Generate — ground-school specimen sheet
/dev/studio/templates     Templates — filterable grid + detail pane
/dev/studio/help          Help — service-manual document
/dev/studio/proto/progress  ProgressTape demo harness
```

Every long-running operation (generate, recomposite / commit, approve, apply) routes through a shared `ProgressTape` primitive fixed to the viewport bottom: numbered stage reel, live elapsed + EMA-driven ETA, cancel affordance. The old `/dev/feature-image-preview` URL redirects to `/dev/studio`.

## Storage layout

The three append-only logs that drive this feature live on disk as one JSON file per entry under `journal/`:

```
journal/
├── history/     # LogEntry records (generation history + fitness data)
├── pipeline/    # WorkflowItem records (blog + iterate workflow states)
├── threads/     # ThreadMessage records (focus-mode conversation)
└── MIGRATED.txt # receipt from the one-shot JSONL → per-entry migration
```

Each file is named `<normalized-ISO-ts>-<id>.json` (colons + dots in the timestamp become dashes for filesystem portability). Filename sort order equals chronological order. The shared helper is `scripts/feature-image/journal.ts`; `log.ts`, `workflow.ts`, and `threads.ts` all delegate to it. Don't introduce a fourth monolithic JSONL for any new record type — go through `journal.ts` too.

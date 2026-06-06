---
title: The Audit Barrage, Wired Into Every Task
deskwork:
  id: d3cf14c9-1c10-4cac-9860-39925bd593ed
  stage: Ideas
  iteration: 0
phase: AUDIT
---

# The Audit Barrage, Wired Into Every Task

Angle: the third independent audit surface, wired into /dwi as an unconditional end-of-task hook with teeth.

Key beats:
- Three audit surfaces: in-band self-audit, the SDD two-reviewer cycle, and the cross-model barrage (genetic diversity in failure modes).
- Phase 12 self-dogfood: barrage auditing itself surfaced 4 cross-model HIGH + 7 single-model findings the other two surfaces missed.
- The /dwi end-of-task hook (Phases 15–18): single implement-hook verb + commit-msg gate + pre-push coverage gate (three enforcement layers).
- The dampener: N-quiet / single-clean-run rules decide slush vs promote; HIGHs never slushed.
- Real outage handling: E2BIG/ARG_MAX via stdin (GH #386), barrage-outage forward-progress.

Sources: deskwork ROADMAP.md (Design A), DEVELOPMENT-NOTES.md, commit log (Phases 12/15/16/17/18; GH #386/#387/#392) in /Users/orion/work/deskwork.

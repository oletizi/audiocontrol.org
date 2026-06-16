---
proposal: A third `launching` ProjectCard status (non-anchor "Launching soon" card) for not-yet-deployed editors
status: REJECTED
date: 2026-06-02
feature: ../../../
visual: "N/A — non-visual decision; the launching state was never mocked (dropped before any mockup)"
---

# A third `launching` ProjectCard status

## What

A proposed third member of the `ProjectCard` `status` union — `launching` — rendering a
non-anchor card (no `href`) with an "available"-like visual treatment but a distinct
"Launching soon" CTA, for editors that are imminent but not yet deployed. This was the PRD's
original plan for the Akai S3000XL card and was to be the feature's inaugural design decision.

## Why rejected

Superseded by the `available`-card direction (see the paired ACCEPTED entry,
`../ACCEPTED/2026-06-02-s3000xl-available-card/`). The operator (2026-06-01 gate interview) chose to
treat S3000XL as a real `available` card on the expectation the editor is ready by ship. A dedicated
`launching` status would add a third value to the union plus bespoke CTA/CSS for a transient
condition — design-system surface that earns its keep only if "launching" recurs as a lasting
pattern. It did not. Recorded here so a future session does not re-propose a `launching` state
without first revisiting this call (and the dead-link trade-off the available-card path accepts).

## When

Decision-to-retire: 2026-06-01 (gate interview), recorded in `prd.md` → "Phase 1 Gate — Decisions"
#3 and the amended Acceptance Criteria / Technical Approach §3.

## Feature reference

`docs/1.0/001-IN-PROGRESS/design-system-foundation/` — see `prd.md` (Phase 1 Gate Decisions).

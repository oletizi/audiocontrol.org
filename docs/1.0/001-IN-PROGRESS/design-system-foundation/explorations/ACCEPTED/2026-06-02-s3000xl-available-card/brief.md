---
proposal: Promote Akai S3000XL as a real `available` ProjectCard (reuse the existing state, no new `launching` status)
status: ACCEPTED
date: 2026-06-02
feature: ../../../
visual: "rendered live — src/sites/audiocontrol/pages/index.astro (homepage) + pages/editors/index.astro"
---

# Promote Akai S3000XL as a real `available` ProjectCard

## What

The Akai S3000XL card uses the **existing `available` `ProjectCard` state** — anchor element,
"Open Editor" CTA, full-opacity treatment with the dimension-bracket corners — rather than
introducing a third `launching` member to the `status` union. No `ProjectCard` type or CSS change.
The card carries an `href` to `/akai/s3000xl/editor`; moving it into `availableProjects` also makes
the hero "Available" count it (now "03 available · 02 in development", since the counts are array
lengths).

## Why accepted

Operator decision (2026-06-01 gate interview): *"build a real available card now."* The editor is
expected to be ready by ship, so a real available card avoids inventing a one-off `launching` UI
state — a third status, bespoke CTA copy, and bespoke CSS — for a transient condition. Reusing the
two-state card keeps the design system small and the homepage consistent (S3000XL renders identically
to S-330/S-550). The trade-off — until the external Akai netlify deploy lands, the link does not
resolve — was explicitly accepted by the operator (the deploy lives in the `audiocontrol-org/audiocontrol`
monorepo and is out of this feature's scope).

## When

Decision: 2026-06-01 (gate interview), recorded in `prd.md` → "Phase 1 Gate — Decisions" #3.
Implementation: feature branch `feature/design-system-foundation`, commit `e6d2381`.
Note: the current branch ships an operator-approved **`href: "#"` stand-in** (and a stand-in card
image) pending the real link + a true S3000XL screenshot — both tracked as PRE-MERGE MUST-FIX in
the workplan. This brief records the *card-treatment* decision, which is independent of those stand-ins.

## Feature reference

`docs/1.0/001-IN-PROGRESS/design-system-foundation/` — see `prd.md` and `workplan.md` (Phase 4).

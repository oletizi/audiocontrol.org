---
slug: design-system-foundation
title: Design discipline foundation + homepage pilot
targetVersion: "1.0"
date: 2026-05-31
parentIssue: 
deskwork:
  id: c4125d94-2654-4323-bc54-4c8c3f97dc85
---

# PRD: Design discipline foundation + homepage pilot

## Problem Statement

This repo hosts **two web properties** — `audiocontrol.org` (service-manual / flight-instrumentation aesthetic: phosphor amber, Departure Mono) and `editorialcontrol.org` (editorial long-form reading aesthetic) — each with its own `brand.ts` + `design-tokens.css`. Both have a coherent visual language **in code**, but neither has **documented, load-bearing design discipline**: there is no design-system document, no decisions archive, and no "read/update before UI work" governance. As we start mutating UI (beginning with the audiocontrol homepage), design choices will drift and get silently relitigated — the exact failure the sibling `audiocontrol-org/audiocontrol` monorepo solved with its `DESIGN-SYSTEM.md` + `DESIGN-DECISIONS-PROTOCOL.md`. The monorepo's design system is **mostly editor-app-specific** (capability contracts, dialogs, optimistic updates, MIDI connection UI, `.ac-*` control primitives) and is **not** copied wholesale. What transfers is the **discipline**: the decision-archive protocol and the governance rules. The per-property design-system *content* is authored fresh from each site's existing tokens. The owner wants to **dogfood the discipline on a real change before rolling it out**: the pending audiocontrol homepage update is the validating pilot. If the protocol helps rather than just adding friction, it's trusted for broader rollout.

## Solution

Establish design discipline as **shared governance + per-property content**, then validate
it on a real change. A single repo-root `DESIGN-DECISIONS-PROTOCOL.md` governs both sites
(the ACCEPTED/REJECTED decision archive + `brief.md` contract + "read/update before UI work"
rules), wired into `.claude/` so agents follow it. Each site gets its own load-bearing
`src/sites/<site>/DESIGN-SYSTEM.md` documenting the tokens/typography/vocabulary that
*already exist* in its `brand.ts` + `design-tokens.css` — shared method, distinct content.
The pending audiocontrol homepage update (refresh S-330/S-550 editor screenshots; promote
the Akai S3000XL to a "launching soon" card) is then executed **under** the new discipline as
the pilot — filing the inaugural archive entries — and a short retro judges whether the
protocol helped before it is rolled out to editorialcontrol surfaces. All of this is gated
behind a comprehensive **discovery** pass (Technical Approach §0) that the operator must
review and approve before any concrete artifact is created.

## Acceptance Criteria

- [ ] A reviewed `discovery-findings.md` exists and the operator has approved it **before** any
      protocol/design-system/homepage artifact is created.
- [ ] `DESIGN-DECISIONS-PROTOCOL.md` exists at repo root, covers both properties, and is
      referenced from `.claude/` governance so agents are directed to it before UI work.
- [ ] `src/sites/audiocontrol/DESIGN-SYSTEM.md` and `src/sites/editorialcontrol/DESIGN-SYSTEM.md`
      exist, each documenting that site's *existing* tokens/typography/vocabulary (no invented
      standards; genuine changes go through the protocol as archive entries).
- [ ] Homepage + `/editors`: S-330 and S-550 cards show fresh editor screenshots; copy reflects
      enhanced support without trumpeting the UI/UX overhaul.
- [ ] Homepage + `/editors`: Akai S3000XL is promoted to "Available Now" with a **disabled
      "launching soon"** state — no clickable/dead link — via a typed `ProjectCard` `launching`
      status (no `any`/casts). Hero "Available" count stays honest (openable editors only).
- [ ] At least the `launching` card state is recorded as an inaugural ACCEPTED archive entry,
      with any discarded alternative filed as REJECTED.
- [ ] `npm run build` succeeds and a preview visual review confirms all card states/screenshots.
- [ ] A retro note records whether the protocol helped and what editorialcontrol rollout needs.

## Out of Scope

- Deploying the S3000XL editor and its working `/akai/s3000xl/editor` link + proxy (separate
  prerequisite in the `audiocontrol-org/audiocontrol` monorepo; a follow-up flips the card to
  a real link once deployed).
- Applying/enforcing the discipline across existing **editorialcontrol** UI surfaces — its
  DESIGN-SYSTEM.md is authored now, but exercising the protocol there is the deferred
  post-pilot rollout.
- Copying the monorepo's editor-app contracts (dialogs, control primitives, MIDI/connection UI).
- Any UI/UX-overhaul marketing copy; non-incidental changes to the S5000 / JV-1080 cards.

## Technical Approach

**0. Discovery (HARD GATE — nothing concrete starts until findings are reviewed/approved).**
A deliberately broad pass that produces `discovery-findings.md` for operator sign-off:
(a) full token/typography/vocabulary/component inventory for **both** sites
(`brand.ts` + `design-tokens.css` + `src/sites/<site>/components/` + `src/shared/`);
(b) a complete UI-surface census of both sites so the DESIGN-SYSTEM docs are exhaustive;
(c) study (not copy) of the monorepo's `DESIGN-SYSTEM.md` / `DESIGN-DECISIONS-PROTOCOL.md` /
`CAPABILITIES-AS-CONTRACTS.md` / `TESTING-UI.md` to separate transferable governance from
editor-app specifics; (d) mining of `DEVELOPMENT-NOTES.md`, `docs/design/`, and git history
for design decisions already settled, to seed the archive; (e) homepage-pilot recon
(homepage/`/editors`/`/hardware` cards, `ProjectCard` shape, `public/images/` conventions,
the unused `s550-thumbnail.jpg`, hero-count logic); (f) a screenshot-viability probe — do the
live S-330/S-550 editors render a populated UI without hardware, and can `modules/akai-s3k-editor`
run locally for an S3000XL shot? Breadth suits parallel discovery sub-agents (each must
**Write findings to disk**), synthesized into one reviewed report.

**1. Protocol + governance.** Author `DESIGN-DECISIONS-PROTOCOL.md` at repo root (two-site
aware; adapted to this repo's `docs/<version>/<status>/<slug>/` tree) and wire `.claude/`
rules to direct agents to it and to the correct per-site DESIGN-SYSTEM before UI work.

**2. Per-site design systems.** Author `src/sites/audiocontrol/DESIGN-SYSTEM.md` and
`src/sites/editorialcontrol/DESIGN-SYSTEM.md` from each site's existing tokens/components —
describe what *is*, not what *should be*.

**3. Homepage pilot, under the discipline.** Extend `ProjectCard`'s status union with a typed
`launching` state (available visual treatment, rendered as a non-anchor, no `href`, distinct
CTA). Capture fresh S-330/S-550 editor screenshots via Playwright (S3000XL local best-effort;
else promote without an image — never a mock). Update homepage + `/editors`: wire images,
refresh S-330/S-550 copy, promote S3000XL to `launching`, reconcile the honest hero counts.
Verify `/hardware` (likely no change). File inaugural ACCEPTED/REJECTED archive entries and
update DESIGN-SYSTEM in the same commit on any global-pattern change.

**4. Verify.** `npm run build` + `npm run preview`; visual review of all card states and
screenshots; confirm no clickable/dead S3000XL link and honest counts.

**5. Retro.** Write the validation note: did the protocol help or just add friction? What does
the editorialcontrol rollout need?

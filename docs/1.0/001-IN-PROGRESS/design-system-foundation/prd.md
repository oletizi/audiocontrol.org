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

- [x] A reviewed `discovery-findings.md` exists and the operator has approved it **before** any
      protocol/design-system/homepage artifact is created. *(Approved 2026-06-01.)*
- [ ] `DESIGN-DECISIONS-PROTOCOL.md` exists at repo root, covers both properties, and is
      referenced from `.claude/` governance so agents are directed to it before UI work.
- [ ] `src/sites/audiocontrol/DESIGN-SYSTEM.md` and `src/sites/editorialcontrol/DESIGN-SYSTEM.md`
      exist, each documenting that site's *existing* tokens/typography/vocabulary (no invented
      standards; genuine changes go through the protocol as archive entries).
- [ ] Homepage + `/editors`: S-330 and S-550 cards show fresh editor screenshots; copy reflects
      enhanced support without trumpeting the UI/UX overhaul.
- [ ] Homepage + `/editors`: Akai S3000XL is promoted to a real **`available`** card with an
      `href` to `/akai/s3000xl/editor` and a proxy `_redirects` entry in *this* repo. **(Amended
      2026-06-01 — see Phase 1 Gate Decisions.)** The `launching` state is **not** added; the
      editor's netlify deploy stays an external dependency in `audiocontrol-org/audiocontrol`, so
      the link is dead until that lands — dead-link risk accepted by the operator. Hero counts
      follow the array membership ("03 available" once S3000XL is in `availableProjects`).
- [ ] An inaugural ACCEPTED archive entry records a genuine homepage-pilot design decision
      (subject chosen at Phase 4 — e.g. the S-550 card-image treatment or the copy refresh), with
      any discarded alternative filed as REJECTED. **(Amended 2026-06-01 — the `launching` state
      that was the original subject is dropped.)**
- [ ] `npm run build` succeeds and a preview visual review confirms all card states/screenshots.
- [ ] A retro note records whether the protocol helped and what editorialcontrol rollout needs.

## Phase 1 Gate — Decisions (operator-approved 2026-06-01)

Discovery (`discovery-findings.md`) was approved. Four directional decisions set the shape of
Phases 2–4 and amend the plan above:

1. **Protocol model — lightweight adaptation.** Port the load-bearing parts of the monorepo
   discipline (per-feature `explorations/{ACCEPTED,REJECTED}/<YYYY-MM-DD>-<slug>/` archive, the
   `brief.md` frontmatter+4-section contract, the "read/update DESIGN-SYSTEM before UI work"
   rule). **Drop** the heavier ceremony — the "when to update which doc" decision table and the
   append-only change-log discipline. Adapted for a two-property content site, not the editor app.
2. **Token drift — document + fix the safe ones.** The per-site `DESIGN-SYSTEM.md` docs describe
   what exists, AND this feature fixes low-risk drift surfaced in discovery: dedupe the duplicated
   tokens into a real shared layer (`src/shared`), and add a numeric type-scale + radius token set.
   Higher-risk drift stays documented-only.
3. **S3000XL — real `available` card now (not `launching`).** Build S3000XL as a normal available
   card with a real `/akai/s3000xl/editor` link + a proxy `_redirects` entry in this repo. The
   `launching` ProjectCard state is **not** built. The editor's netlify deploy remains external;
   the link is dead until it lands (risk accepted). Hero "Available" becomes "03".
4. **Inaugural archive entry — subject TBD at Phase 4.** With `launching` dropped, the pilot's
   inaugural ACCEPTED entry will record whatever genuine design decision the homepage refresh
   produces (candidate: S-550 card-image treatment, or the copy-refresh approach).

## Out of Scope

- Deploying the S3000XL editor's **netlify app** (separate prerequisite in the
  `audiocontrol-org/audiocontrol` monorepo). **Amended 2026-06-01:** the proxy `_redirects`
  entry for `/akai/s3000xl/editor` in *this* repo IS now in scope (Phase 4) — but the link only
  resolves once the external netlify deploy lands. Dead-link-until-then risk accepted.
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

**1. Protocol + governance.** *(Gate decision 1 — lightweight.)* Author `DESIGN-DECISIONS-PROTOCOL.md`
at repo root (two-site aware; adapted to this repo's `docs/<version>/<status>/<slug>/` tree) and
wire `.claude/` rules to direct agents to it and to the correct per-site DESIGN-SYSTEM before UI
work. Keep the archive + `brief.md` contract + read/update rule; omit the decision table and
change-log ceremony.

**2. Per-site design systems.** *(Gate decision 2 — document + fix safe drift.)* Author
`src/sites/audiocontrol/DESIGN-SYSTEM.md` and `src/sites/editorialcontrol/DESIGN-SYSTEM.md` from
each site's existing tokens/components — describe what *is*. Additionally fix low-risk drift:
dedupe duplicated tokens into a shared layer and add a type-scale + radius token set.

**3. Homepage pilot, under the discipline.** *(Gate decision 3 — S3000XL is `available`, not
`launching`.)* Promote S3000XL to a real `available` `ProjectCard` with `href`
`/akai/s3000xl/editor` and add the proxy `_redirects` entry in this repo (the `launching` state
is not built; no `ProjectCard` status-union change is required). Capture fresh S-330/S-550 editor
screenshots via Playwright (best-effort; else promote without an image — never a mock). Update
homepage + `/editors`: wire images, refresh S-330/S-550 copy, add S3000XL to the available set,
let hero counts follow array membership. Verify `/hardware` (likely no change). File the
inaugural ACCEPTED/REJECTED archive entry (subject per gate decision 4) and update DESIGN-SYSTEM
in the same commit on any global-pattern change.

**4. Verify.** `npm run build` + `npm run preview`; visual review of all card states and
screenshots; confirm no clickable/dead S3000XL link and honest counts.

**5. Retro.** Write the validation note: did the protocol help or just add friction? What does
the editorialcontrol rollout need?

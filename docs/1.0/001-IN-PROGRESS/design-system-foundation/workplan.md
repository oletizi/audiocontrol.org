---
slug: design-system-foundation
targetVersion: "1.0"
date: 2026-05-31
---

# Workplan: Design discipline foundation + homepage pilot

**Goal:** Port the design-decision discipline (shared protocol + per-site design systems) into
this two-property repo and validate it by executing the audiocontrol homepage refresh under it.

> **Hard gate:** Phase 1 (Discovery) must be synthesized into `discovery-findings.md` and
> **approved by the operator** before any concrete artifact (protocol, design-system doc,
> component, or homepage change) is created. Phases 2+ do not begin until that approval.

## Phase 1: Discovery (GATE)

**Deliverable:** A reviewed `discovery-findings.md` in this feature dir; operator sign-off.

### Task 1: Inventory both sites' design languages
- [x] Catalogue every token in `src/sites/audiocontrol/{brand.ts,styles/design-tokens.css}`
- [x] Catalogue every token in `src/sites/editorialcontrol/{brand.ts,styles/design-tokens.css}`
- [x] Record typography scales, color roles, spacing/radii/shadows, and code-only aesthetic rules

### Task 2: UI-surface census (both sites)
- [x] Enumerate every page in `src/sites/<site>/pages/` and every component in `components/` + `src/shared/`
- [x] Note which surfaces are user-facing vs dev-only

### Task 3: Study the monorepo discipline (do not copy)
- [x] Extract transferable governance from `DESIGN-SYSTEM.md` + `DESIGN-DECISIONS-PROTOCOL.md`
- [x] Identify editor-app-specific content that must NOT come over (CAPABILITIES-AS-CONTRACTS, control primitives, MIDI/connection UI, TESTING-UI specifics)

### Task 4: Mine prior design decisions
- [x] Scan `DEVELOPMENT-NOTES.md`, `docs/design/`, git history for settled/relitigated choices to seed the archive

### Task 5: Homepage-pilot recon + screenshot-viability probe
- [x] Document current homepage / `/editors` / `/hardware` card data, `ProjectCard` shape, `public/images/` conventions, the unused `s550-thumbnail.jpg`, hero-count logic
- [x] Probe: do live S-330/S-550 editors render a populated UI without hardware? Can `modules/akai-s3k-editor` run locally for an S3000XL shot?

### Task 6: Synthesize + gate
- [x] Write `discovery-findings.md` (single source; any sub-agents Write their parts to disk)
- [ ] **Operator reviews and approves before Phase 2** ← awaiting sign-off

**Acceptance Criteria:**
- [ ] `discovery-findings.md` covers all six discovery dimensions and is operator-approved. (Covers all six; **awaiting operator approval**.)

## Phase 2: Protocol + governance wiring

**Deliverable:** `DESIGN-DECISIONS-PROTOCOL.md` at repo root + `.claude/` governance referencing it.

### Task 1: Author the protocol
- [ ] Repo-root `DESIGN-DECISIONS-PROTOCOL.md`, two-site aware, adapted to `docs/<version>/<status>/<slug>/`
- [ ] Define the per-feature `explorations/{ACCEPTED,REJECTED}/` archive layout + `brief.md` contract

### Task 2: Wire the discipline in
- [ ] Update `.claude/CLAUDE.md` and/or `.claude/rules/` to direct agents to read the relevant per-site DESIGN-SYSTEM (and the protocol) before any UI work

**Acceptance Criteria:**
- [ ] Protocol exists at root, covers both sites, and is referenced from `.claude/`.

## Phase 3: Per-site design systems

**Deliverable:** Load-bearing DESIGN-SYSTEM.md for each site, grounded in existing code.

### Task 1: audiocontrol DESIGN-SYSTEM.md
- [ ] `src/sites/audiocontrol/DESIGN-SYSTEM.md` from existing tokens/typography/vocabulary/components

### Task 2: editorialcontrol DESIGN-SYSTEM.md
- [ ] `src/sites/editorialcontrol/DESIGN-SYSTEM.md` from its existing tokens/components

**Acceptance Criteria:**
- [ ] Both docs describe what *is* (no invented standards); cross-linked from the protocol.

## Phase 4: Homepage pilot (audiocontrol) — under the discipline

**Deliverable:** Updated homepage + `/editors`; inaugural archive entries filed.

### Task 1: ProjectCard `launching` state
- [ ] Extend the `status` union with `launching` (typed, no `any`/casts): available visual treatment, non-anchor, no `href`, distinct "Launching soon" CTA

### Task 2: Screenshots
- [ ] Capture + optimize S-330 and S-550 editor screenshots (live, Playwright)
- [ ] S3000XL: local run of `modules/akai-s3k-editor` best-effort; else promote without image (never a mock)

### Task 3: Homepage
- [ ] Wire S-330/S-550 images; refresh copy (no UI/UX trumpeting)
- [ ] Promote S3000XL to "Available Now" as `launching`; reconcile honest hero counts

### Task 4: /editors mirror + /hardware audit
- [ ] Mirror status/image/copy changes on `/editors`
- [ ] Verify `/hardware`; fix only genuine staleness

### Task 5: File archive entries + update DESIGN-SYSTEM
- [ ] ACCEPTED entry for the `launching` card state; REJECTED for any discarded alternative
- [ ] Update audiocontrol DESIGN-SYSTEM.md in-commit if a global pattern changed

**Acceptance Criteria:**
- [ ] S-330/S-550 show fresh screenshots; S3000XL promoted with a non-clickable launching state; honest counts; archive entries filed.

## Phase 5: Verification + retro

**Deliverable:** Green build, visual review, and a protocol-validation note.

### Task 1: Verify
- [ ] `npm run build` succeeds; `npm run preview` visual review of all card states/screenshots; confirm no dead S3000XL link

### Task 2: Retro
- [ ] Write the validation note: did the protocol help or add friction? What does editorialcontrol rollout need?

**Acceptance Criteria:**
- [ ] Build green, visual review done, retro note written.

## Follow-up (tracked, not in this feature)
- Stand up the `akai-s3k-editor` Netlify app + deploy; flip S3000XL to a real `/akai/s3000xl/editor` link + proxy `_redirects` + add its editor screenshot.
- Roll out / enforce the discipline across editorialcontrol UI surfaces, per the retro.

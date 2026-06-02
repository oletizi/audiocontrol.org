---
slug: stackcontrol-site
targetVersion: "1.0"
date: 2026-06-02
---

# Workplan: stackcontrol.org — site foundation + design pass

**Goal:** Stand up `stackcontrol.org` as a third sibling site, establish its visual identity via a
`/frontend-design` pass, build four representative surfaces, and provision it live — as the second
real-world pilot of the design-decisions protocol.

> **Branch:** `feature/stackcontrol-site` is stacked on `feature/design-system-foundation` to
> inherit the shared token layer + protocol. Re-sync with `git merge feature/design-system-foundation`.
> design-system-foundation merges to main first; then this branch picks it up before its own PR.

## Phase 0: Recon

**Deliverable:** Go/no-go facts + a constraints brief for the design pass.

### Task 1: Dependency + domain readiness
- [x] Confirm the shared token layer (`src/shared/design-tokens-base.css`) present on this branch (inherited from DSF)
- [x] Confirm `stackcontrol.org` is registered and DNS-manageable (same flow as the siblings) — operator owns the domain

### Task 2: Family-DNA constraints brief
- [x] Write a short brief for `/frontend-design`: dark surface, mono-accent discipline, accessibility/contrast, distinct from amber (audiocontrol) and chartreuse (editorialcontrol), must implement the shared `Brand` shape and consume `design-tokens-base.css` — `explorations/brief.md`

**Acceptance Criteria:**
- [x] Dependency + domain status known; constraints brief written.

## Phase 1: Scaffold site infra

**Deliverable:** A buildable, previewable stackcontrol site skeleton.

### Task 1: Astro config + src tree
- [x] `astro.stackcontrol.config.mjs` (site/srcDir/outDir/adapter/sitemap, mirroring siblings)
- [x] `src/sites/stackcontrol/` skeleton: `brand.ts` stub, `styles/design-tokens.css`, `layouts/`, `components/`, `pages/index.astro` placeholder, `public/_redirects`

### Task 2: Build wiring
- [x] `package.json`: `dev:/build:/preview:stackcontrol`; add to top-level `build`
- [x] Verify: `npm run build:stackcontrol` succeeds and `preview:stackcontrol` serves the placeholder

**Acceptance Criteria:**
- [x] stackcontrol builds + previews as a real (placeholder) site; sibling builds unaffected (verified `build:stackcontrol` + `build:editorialcontrol`).

## Phase 2: Design pass (identity)

**Deliverable:** An operator-chosen identity direction.

### Task 1: Generate directions
- [x] `/frontend-design` proposes 2–3 distinct identity directions per the constraints brief — 3 directions in `explorations/directions/` (A telemetry/cyan, B blueprint/indigo, C stack/magenta)

### Task 2: Operator pick
- [x] Operator selects one direction to carry forward — **A (Telemetry, electric cyan)** chosen 2026-06-01

**Acceptance Criteria:**
- [x] One identity direction chosen (A); the others (B, C) recorded for the REJECTED archive entries (filed in Phase 4).

## Phase 3: Build the four surfaces

**Deliverable:** Identity + three pages, real Astro, under the chosen direction.

### Task 1: Identity tokens
- [x] `src/sites/stackcontrol/brand.ts` (implements shared `Brand`) + `styles/design-tokens.css`, consuming `src/shared/design-tokens-base.css` — Telemetry direction A; Layout loads fonts + control-plane texture; PhaseRail + Ticker components

### Task 2: Homepage
- [x] Product + devlog hybrid landing, representative real content — ticker, phase-rail hero, lifecycle grid, what/why/how, recent devlog (blog collection)

### Task 3: Blog index + blog post page
- [x] Devlog listing + a representative devlog entry page — `pages/blog/index.astro`, `pages/blog/[slug].astro`, `BlogLayout.astro`, 2 real entries

**Acceptance Criteria:**
- [x] All four surfaces render under the chosen identity with real content; no lorem/mock data (build green; visually verified home/devlog/post).

## Phase 4: Discipline (2nd pilot)

**Deliverable:** Archive entries + DESIGN-SYSTEM doc.

### Task 1: Archive entries
- [ ] ACCEPTED entry for the chosen identity direction; REJECTED entries for the passed-over ones, under `explorations/{ACCEPTED,REJECTED}/<date>-<slug>/` per the `brief.md` contract

### Task 2: DESIGN-SYSTEM
- [ ] `src/sites/stackcontrol/DESIGN-SYSTEM.md` documenting the settled identity

**Acceptance Criteria:**
- [ ] Archive entries filed per the protocol; DESIGN-SYSTEM.md authored.

## Phase 5: Provision + deploy

**Deliverable:** stackcontrol.org live.

### Task 1: Netlify site (operator-confirmed)
- [ ] Create the Netlify site; deploy `dist/stackcontrol`

### Task 2: Domain (operator-confirmed)
- [ ] Wire the `stackcontrol.org` custom domain + DNS

**Acceptance Criteria:**
- [ ] Site deployed; `stackcontrol.org` resolves to the new site.

## Phase 6: Verify

**Deliverable:** Green build + live check.

### Task 1: Verify
- [ ] `npm run build` (all sites); `preview:stackcontrol` visual review; live-domain check

**Acceptance Criteria:**
- [ ] Build green; live site verified.

## Follow-up (tracked, not in this feature)
- Build out remaining site surfaces (product docs, lifecycle/skills reference, more devlog content).
- Editorial pipeline for stackcontrol content if desired.

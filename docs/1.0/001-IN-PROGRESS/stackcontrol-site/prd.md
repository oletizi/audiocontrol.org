---
slug: stackcontrol-site
title: stackcontrol.org — site foundation + design pass
targetVersion: "1.0"
date: 2026-06-02
parentIssue: 
deskwork:
  id: 74fdba42-180e-4d8d-82e7-73f5c647ea83
---

# PRD: stackcontrol.org — site foundation + design pass

## Problem Statement

The deskwork lifecycle plugin (agent software-development processes + tooling) has no public home. We want a third sibling site — `stackcontrol.org` — that is a **hybrid product + devlog**: a product face (what deskwork is / how its lifecycle + skills work) plus an ongoing build-in-public devlog about developing it. It joins `audiocontrol.org` (service-manual / phosphor-amber) and `editorialcontrol.org` (publication / chartreuse) as a third member of the "control" family, and must have **its own distinct visual identity** while sharing the family DNA (dark surfaces, mono-accent discipline, a single distinct chromatic voice) and the repo's multi-site architecture (`astro.<site>.config.mjs` + `src/sites/<site>/` + a `brand.ts` implementing the shared `Brand` interface + per-site `design-tokens.css`, deployed as its own Netlify site). We start with a **design pass** (`/frontend-design`) to establish the identity and a small set of representative surfaces before building the site out — and we run it as the **second real-world pilot** of the design-decisions discipline being established in `design-system-foundation`, filing stackcontrol's identity decisions in that protocol's archive format.

## Solution

Stand up `stackcontrol.org` as a real third site in the existing multi-site Astro tree and run
a `/frontend-design` design pass to establish its identity, then build four representative
surfaces and provision it live. `/frontend-design` proposes 2–3 distinct identity directions
(consistent with family DNA but new); the operator picks one, which is carried through the
**homepage**, **blog index**, and **blog post** pages plus the **identity** itself
(`brand.ts` + `design-tokens.css`). The site **consumes the shared token layer** built in
`design-system-foundation` rather than forking a third token duplicate. As the second pilot of
the design-decisions protocol, the identity decision is recorded as ACCEPTED/REJECTED archive
entries and a `stackcontrol/DESIGN-SYSTEM.md` is authored. Finally the site is provisioned on
Netlify with the `stackcontrol.org` domain.

## Branch strategy

`feature/stackcontrol-site` is **stacked on `feature/design-system-foundation`** (not `main`) so
it inherits the shared token layer (`src/shared/design-tokens-base.css`), the design-decisions
protocol, and the per-site DESIGN-SYSTEM pattern already committed there. Track upstream changes
with `git merge feature/design-system-foundation` as that branch advances. This repo merges PRs
via merge-commits (not squash), so the shared history reconciles cleanly: **merge
design-system-foundation to main first**, then this branch picks it up via `git merge main`
before its own PR.

## Acceptance Criteria

- [ ] `astro.stackcontrol.config.mjs` + `src/sites/stackcontrol/` exist following the sibling
      pattern; `dev:/build:/preview:stackcontrol` scripts work and the site is in the top-level `build`.
- [ ] `/frontend-design` produced 2–3 identity directions; the operator-chosen one is implemented
      as `src/sites/stackcontrol/{brand.ts,styles/design-tokens.css}` (implements the shared `Brand`).
- [ ] Homepage, blog index, and a blog post page are built as real Astro under the chosen identity,
      using representative real deskwork devlog content (no lorem, no mock data).
- [ ] stackcontrol consumes `src/shared/design-tokens-base.css` rather than re-duplicating tokens.
- [ ] An inaugural ACCEPTED archive entry records the chosen identity direction; REJECTED entries
      record the passed-over directions, under this feature's `explorations/{ACCEPTED,REJECTED}/`.
- [ ] `src/sites/stackcontrol/DESIGN-SYSTEM.md` documents the settled identity.
- [ ] `npm run build` builds all sites; `preview:stackcontrol` visual review passes.
- [ ] Netlify site created, `dist/stackcontrol` deployed, and the `stackcontrol.org` domain wired
      (operator-confirmed before the outward-facing actions); live-domain check passes.

## Out of Scope

- Full site content/features beyond the four surfaces (more pages, product-docs depth,
  lifecycle/skills reference, search).
- An editorial/CMS or review pipeline for stackcontrol content.
- Anything past representative mock devlog content.
- Registering the `stackcontrol.org` domain itself (assumed already owned / DNS-manageable; the
  provisioning phase blocks on this if not).

## Technical Approach

1. **Recon (light, Phase 0)** — confirm the `design-system-foundation` shared token layer state (landed? if not, decide mirror-then-refactor vs. wait for that slice); confirm `stackcontrol.org` is registered and DNS-manageable; write a short **family-DNA + constraints brief** to hand `/frontend-design` (dark surface, mono-accent discipline, accessibility/contrast, distinct from amber/chartreuse, shared `Brand` shape). 2. **Scaffold** — astro config + `src/sites/stackcontrol/` skeleton + package scripts; a trivial placeholder page that builds + previews, proving the wiring before design work. 3. **Design pass** — `/frontend-design` proposes 2–3 identity directions; operator picks one. 4. **Build the four surfaces** — identity tokens, homepage, blog index, blog post — as real Astro components/pages under the chosen identity, with representative real content. 5. **Discipline** — file ACCEPTED/REJECTED archive entries for the identity decision; author `stackcontrol/DESIGN-SYSTEM.md`. 6. **Provision + deploy** — Netlify site, deploy, wire stackcontrol.org domain + DNS (operator confirms before the outward-facing actions). 7. **Verify** — `npm run build` (all sites still build), `preview:stackcontrol` visual review, live-domain check after deploy.

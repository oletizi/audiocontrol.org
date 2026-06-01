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
- [x] **Operator reviews and approves before Phase 2** *(approved 2026-06-01; four gate decisions recorded in prd.md)*

**Acceptance Criteria:**
- [x] `discovery-findings.md` covers all six discovery dimensions and is operator-approved.

## Phase 2: Protocol + governance wiring

**Deliverable:** `DESIGN-DECISIONS-PROTOCOL.md` at repo root + `.claude/` governance referencing it.

> **Gate decision 1 — lightweight adaptation.** Keep the archive + `brief.md` contract + the
> "read/update DESIGN-SYSTEM before UI work" rule. **Omit** the "when to update which doc"
> decision table and the append-only change-log discipline (too much ceremony for a content site).

### Task 1: Author the protocol
- [x] Repo-root `DESIGN-DECISIONS-PROTOCOL.md`, two-site aware, adapted to `docs/<version>/<status>/<slug>/`
- [x] Define the per-feature `explorations/{ACCEPTED,REJECTED}/` archive layout + `brief.md` contract
- [x] Lightweight: include read/update governance rule; exclude the decision table + change-log sections

### Task 2: Wire the discipline in
- [x] Update `.claude/CLAUDE.md` and/or `.claude/rules/` to direct agents to read the relevant per-site DESIGN-SYSTEM (and the protocol) before any UI work — added `.claude/rules/design-discipline.md` + CLAUDE.md pointers

**Acceptance Criteria:**
- [x] Protocol exists at root, covers both sites, and is referenced from `.claude/`.

## Phase 3: Per-site design systems

**Deliverable:** Load-bearing DESIGN-SYSTEM.md for each site, grounded in existing code.

> **Gate decision 2 — document + fix safe drift.** Docs describe what *is*; this phase also fixes
> low-risk drift surfaced in discovery. Higher-risk drift stays documented-only and is noted.

### Task 1: audiocontrol DESIGN-SYSTEM.md
- [x] `src/sites/audiocontrol/DESIGN-SYSTEM.md` from existing tokens/typography/vocabulary/components (incl. `ProjectCard`; note orphaned `DeviceCard`/`SpecsTable`)

### Task 2: editorialcontrol DESIGN-SYSTEM.md
- [x] `src/sites/editorialcontrol/DESIGN-SYSTEM.md` from its existing tokens/components

### Task 3: Fix safe token drift (document the fix in-place)
- [ ] Dedupe the duplicated `design-tokens.css` values into a real shared layer (`src/shared`), keeping each site's distinct values; build green for both sites
- [ ] Add a numeric type-scale + radius token set (replacing hard-coded sizes where low-risk); reflect in the DESIGN-SYSTEM docs
- [ ] Higher-risk drift (e.g. missing `@font-face` for `--font-mono`) documented-only, not fixed

**Acceptance Criteria:**
- [x] Both docs describe what *is* (no invented standards); cross-linked from the protocol.
- [ ] Safe drift fixed (shared-token dedupe + type-scale/radius tokens); build green; no behavior change.

> **Task-3 scoping note (2026-06-01).** Empirical read of both `design-tokens.css` files: token
> *values* mostly differ legitimately per site (`--container-max-width` 1400 vs 1280, all colors,
> display fonts). The genuinely-shared surface is small: identical structural tokens
> (`--container-padding`, `--rule-hairline/medium`, `--measure-narrow`, `--font-mono`,
> `--font-heading` pattern, `color-scheme`) + four byte-identical utility classes (`.site-container`,
> `.rule-double`, `.card-glow`/`:hover`, `@keyframes ticker`). The dedupe = extract those into a
> shared CSS file both Layouts import; type-scale/radius = additive. Touches live-site CSS →
> requires build + visual verification (awaiting operator greenlight on the narrowed scope).

## Phase 4: Homepage pilot (audiocontrol) — under the discipline

**Deliverable:** Updated homepage + `/editors`; inaugural archive entries filed.

> **Gate decision 3 — S3000XL is a real `available` card, not `launching`.** No `ProjectCard`
> status-union change. The editor's netlify deploy is external; the link is dead until it lands
> (risk accepted). **Gate decision 4 — inaugural archive entry subject chosen here.**

### Task 1: S3000XL availability wiring (replaces the old `launching`-state task)
- [ ] Add S3000XL to the `available` set on homepage (`availableProjects`) + `/editors` with `href`/`slug` `/akai/s3000xl/editor` (no `ProjectCard` type change required)
- [ ] Add proxy `_redirects` in `src/sites/audiocontrol/public/_redirects` for `/akai/s3000xl/editor` (bare + trailing-slash + splat → the akai netlify app URL once known)

### Task 2: Screenshots *(deferred per operator — UI team producing; full-res files pending)*
- [ ] Wire S-330/S-550 editor screenshots once the UI team delivers full-res files (slot ≈ 15:4 / 656×176 CSS; deliver ~1312px+ wide PNG)
- [ ] S3000XL: image optional (promote without an image is acceptable; never a mock)

### Task 3: Homepage
- [ ] Wire S-330/S-550 images (when available); refresh S-330/S-550 copy (no UI/UX trumpeting)
- [ ] S3000XL now in available set; hero counts follow array membership ("03 available")

### Task 4: /editors mirror + /hardware audit
- [ ] Mirror status/image/copy changes on `/editors`
- [ ] Verify `/hardware`; fix only genuine staleness

### Task 5: File archive entries + update DESIGN-SYSTEM
- [ ] Choose the inaugural ACCEPTED entry subject (candidate: S-550 card-image treatment or copy-refresh approach); REJECTED for any discarded alternative
- [ ] Update audiocontrol DESIGN-SYSTEM.md in-commit if a global pattern changed

**Acceptance Criteria:**
- [ ] S3000XL is a real `available` card with `/akai/s3000xl/editor` href + proxy `_redirects`; hero counts honest to array membership; inaugural archive entry filed. *(S-330/S-550 screenshots wired when UI-team files land.)*

## Phase 5: Verification + retro

**Deliverable:** Green build, visual review, and a protocol-validation note.

### Task 1: Verify
- [ ] `npm run build` succeeds (both sites); `npm run preview` visual review of card states/screenshots
- [ ] Confirm the S3000XL `/akai/s3000xl/editor` proxy is wired; **note** the link stays dead until the external netlify deploy lands (accepted risk, not a build failure)

### Task 2: Retro
- [ ] Write the validation note: did the protocol help or add friction? What does editorialcontrol rollout need?

**Acceptance Criteria:**
- [ ] Build green, visual review done, retro note written.

## Follow-up (tracked, not in this feature)
- **Stand up the `akai-s3k-editor` Netlify app + deploy** (external repo `audiocontrol-org/audiocontrol`). This is the dependency that makes the `/akai/s3000xl/editor` link (proxy added in Phase 4) actually resolve — until then it is a known dead link.
- Add an S3000XL editor screenshot once the editor is live.
- Roll out / enforce the discipline across editorialcontrol UI surfaces, per the retro.

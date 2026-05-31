---
slug: design-system-foundation
phase: 1 — Discovery (GATE)
date: 2026-05-30
status: AWAITING OPERATOR APPROVAL
---

# Discovery Findings — Design discipline foundation + homepage pilot

This is the **single reviewed report** the Phase-1 hard gate requires. Nothing concrete
(protocol, design-system docs, components, homepage changes) is created until the operator
approves this document. Full per-dimension detail lives in `discovery/`:

| # | Dimension | Part file |
|---|---|---|
| 1 | Design-language inventory (both sites) | `discovery/01-design-language.md` |
| 2 | UI-surface census (both sites) | `discovery/02-ui-surface-census.md` |
| 3 | Monorepo discipline study (transferable vs. editor-specific) | `discovery/03-monorepo-discipline.md` |
| 4 | Prior design decisions mined | `discovery/04-prior-decisions.md` |
| 5 | Homepage-pilot recon | `discovery/05-homepage-recon.md` |
| 6 | Screenshot-viability probe (live) | `discovery/06-screenshot-probe.md` (+ `discovery/probe-evidence/`) |

---

## 1. Design language — what *is*, in code

Both sites carry a coherent visual language **in CSS/TS only**; neither has a design-system doc.

- **Shared layer is interface-only.** `src/shared/brand.ts` defines the `Brand` / `BrandColors`
  / `BrandTypography` *shape* but **zero concrete values**. There is no shared CSS token file —
  each site's `styles/design-tokens.css` is a standalone `:root` that independently re-declares
  the same custom-property names. The "design system" is today a **convention duplicated across
  two files**, not a shared source. `brand.ts` is a strict *subset* of each site's CSS (TS holds
  9 colors + 3 fonts; CSS adds layout/measure tokens, rule weights, glow, `--font-heading`,
  badge colors) — so the "hand-mirrored" contract is only partial.
- **audiocontrol** — warm service-manual: phosphor-amber primary, Roland-blue accent, **Departure
  Mono** display (self-hosted, weight 400 only), rich code-only motifs (signal-LED, dimension-
  bracket corners, panel-label, ticked rule, phosphor glow, 3-layer atmosphere: grain + scanlines
  + vignette).
- **editorialcontrol** — cool publication-dark: chartreuse primary, parchment accent, **Fraunces**
  serif display, lighter motif set (italic edit-mark, dropcap, 3px masthead rule, single
  paper-grain).
- **Drift / gaps flagged** (candidates for the design-system docs to record as-is, not "fix"):
  no numeric type scale and no radius tokens on either site (sizes + the one radius are hard-coded
  in utility classes); single-rule class is `.rule-hairline` (ac) vs `.rule-single` (ec); both
  reference `--font-mono` (JetBrains Mono) with no `@font-face` in the tokens file; several tokens
  (`--rule-heavy`, `--measure-*`, badge) unused within the inventoried files (consumed elsewhere).

## 2. UI-surface census

- **~47 surfaces** total: 36 pages, 11 components, 7 layouts, 6 shared modules.
- **`ProjectCard.astro` is the only card-like primitive in active use** (audiocontrol homepage +
  `/editors`). `DeviceCard.astro` and `SpecsTable.astro` are **orphaned** (no importers) — the
  `/hardware` page inlines its own `.hardware-card` instead.
- editorialcontrol's entire `/dev/**` + `/api/dev/**` tree is **dev-only** (route prefix + PROD
  guards). Everything else is user-facing.
- Implication: the audiocontrol DESIGN-SYSTEM doc must document `ProjectCard` (the live primitive)
  and can note `DeviceCard`/`SpecsTable` as orphaned.

## 3. Monorepo discipline — port the skeleton, leave the organs

The sibling monorepo (`/Users/orion/work/audiocontrol-work/audiocontrol`) solved exactly this
problem. **Transfer the process; copy none of the editor content.**

**Transferable governance:**
- **Two complementary docs:** `DESIGN-SYSTEM.md` (what's *settled* — read before any UI work) +
  `DESIGN-DECISIONS-PROTOCOL.md` (what was *explored* — the ACCEPTED/REJECTED archive). Neither
  subsumes the other; they cross-reference.
- **Per-feature archive** at `docs/<version>/<status>/<slug>/explorations/{ACCEPTED,REJECTED}/<YYYY-MM-DD>-<slug>/`.
  **This repo already uses the identical `docs/<v>/<status>/<slug>/` tree, so the subtree drops in
  with zero path surgery** — only a conceptual rebind from editor-feature to site-feature.
- **`brief.md` contract** — frontmatter `proposal / status / date / feature / visual` + four
  sections (What / Why accepted-or-rejected / When / Feature reference). Verified against a real
  on-disk brief; the contract is enforced in practice.
- **Governance rules:** read DESIGN-SYSTEM before UI work; update it **in the same commit** as any
  global-impact change; "if unsure whether it's global, it is — document it"; CLAUDE.md points to
  it. Plus the "when to update which doc" decision table, the "what this archive is NOT" guards,
  the `load-bearing` status label, and append-only change logs.

**Do NOT transfer (editor-app-specific):** the whole CAPABILITIES-AS-CONTRACTS methodology
(capability IDs, test-name protocol), all `.ac-*` / `--ac-*` primitives and tokens, dialogs /
optimistic-updates / CRUD / MIDI-connection UI, the hardware-harness TESTING-UI workflow, and the
shared-package contract-enforcement rules.

## 4. Prior design decisions (seeds for the archive)

**29 decisions cataloged.** The churn the archive most needs to capture:

- **Palette relitigated** — coral/teal on slate (`palette-redesign`, Feb 2026) → wholesale replaced
  by warm-ink + phosphor-amber + Roland-blue (`audiocontrol-redesign`, commit `c1bc552`, Apr 2026).
- **Display typeface relitigated** — JetBrains Mono → **Departure Mono** (the redesign's first
  acceptance criterion was literally "a distinctive display typeface replaces JetBrains Mono").
  JetBrains Mono survives only as the shared code/mono face.
- **Logo relitigated** — pixel-art promoted into the header (`73dcbb1`) → reversed to a typographic
  wordmark, pixel art demoted to icon/favicon.
- **editorialcontrol is comparatively settled** (ink + chartreuse + parchment, Fraunces, ◆ mark).
- **On-record justification for this whole feature:** a `[DOCUMENTATION]` correction in
  DEVELOPMENT-NOTES.md (2026-04-24) — *"Design-system rules live scattered … would have been faster
  with a central design-system index."*

## 5. Homepage-pilot recon (the load-bearing specifics)

- **`ProjectCard` status union is exactly `'available' | 'coming-soon'`** (`ProjectCard.astro:19`).
  Every branch keys off `isAvailable = status === 'available'`. A new `'launching'` value **falls
  through to the coming-soon path** (`<div>`, no href, "Pending", "In development", 0.62 opacity)
  unless explicitly handled — so the pilot must add an explicit `launching` branch (Tag, label,
  CTA, CSS class, corners), not lean on the existing ternaries.
- **Three independent literals, not one source:** homepage `availableProjects` + `pendingProjects`
  (`index.astro:40-77`), `/editors` `editors` array (field name `slug`, not `href`), and
  `/hardware` `devices` (different model + inline card, Roland S-Series only, **no S3000XL**). A
  `launching` card must be added to **both** the homepage and `/editors`; `/hardware` is unaffected.
- **Hero counts are raw array lengths, not status filters** (`index.astro:81-82`; renders "02"
  available / "03" in development). Dropping a `launching` entry into `availableProjects` would
  dishonestly bump "Available" to "03" (implying an openable editor). **Honesty fix required:**
  either a dedicated `launchingProjects` array, or switch the counters to explicit status filters.
- **`s550-thumbnail.jpg` "unused" — verified** (660×385; used only as an OG background in
  `generate-og-images.ts`, never as a card thumbnail). It is the natural fill for the image-less
  S-550 card. Image conventions: per-site `public/images/`, web-absolute `/images/...` paths,
  kebab-case device-prefixed names, CSS `object-fit: cover` slot (so any aspect ratio crops).

## 6. Screenshot-viability probe (live, hands-on)

- **Serve path matters:** screenshots must be taken via the **production proxy**
  `https://audiocontrol.org/roland/{s330,s550}/editor` — the bare netlify origin renders blank
  (asset base-path `/roland/s330/editor/` vs origin root → strict-MIME failure).
- **S-330 & S-550 share one path-driven app** (`roland-sxx0-editor.netlify.app`); the URL prefix
  switches the device label.
- **Without hardware, only the CONNECT tab is screenshot-viable** — it's a genuinely handsome,
  on-brand view (virtual front-panel control surface + phosphor status display + Reference/Help/
  Setup panel). All data tabs (PLAY/PATCHES/TONES/LIBRARY) show empty **"Not Connected"** states;
  there is **no demo/mock data mode**. Evidence: `discovery/probe-evidence/`.
  → Fresh S-330/S-550 CONNECT-tab screenshots are **viable now, no hardware**, but the two will
  look near-identical apart from labels (operator decision flagged below).
- **Akai S3000XL** (`modules/akai-s3k-editor` in the monorepo): a Vite app, locally runnable
  **best-effort** from the monorepo workspace (`workspace:*` deps; `npm run dev`). Populated UI
  without hardware is unverified and unlikely (same connection-gating pattern). Per PRD it's
  best-effort-else-imageless — realistic path: **promote S3000XL to `launching` without an image.**

---

## Decisions for operator sign-off (the gate)

These are the choices the discovery surfaced that shape Phases 2–4. Approving this document =
approving these directions (or amend them):

1. **Protocol scope (Phase 2):** port the monorepo's two-doc model + per-feature
   `explorations/{ACCEPTED,REJECTED}/brief.md` archive verbatim into the repo-root
   `DESIGN-DECISIONS-PROTOCOL.md`, two-site aware. Drops into the existing docs tree unchanged.
2. **Design-system docs (Phase 3):** author each site's `DESIGN-SYSTEM.md` to describe **what
   exists** (incl. the duplicated-tokens reality, the missing type-scale/radius tokens, the
   orphaned `DeviceCard`/`SpecsTable`) — documenting drift as-is, not silently "fixing" it.
3. **`launching` card (Phase 4):** add an explicit third `status` member with its own branch +
   CSS, rendered as a **non-anchor** (no href), distinct "Launching soon" CTA. Apply to **both**
   homepage and `/editors`.
4. **Hero-count honesty (Phase 4):** fix the raw-length counters so a `launching` card does not
   inflate "Available." (Recommend: dedicated `launchingProjects` array; uncounted in the
   "Available" stat.)
5. **S-330/S-550 screenshots (Phase 4):** capture **CONNECT-tab** shots via the production proxy.
   Decide: ship two near-identical CONNECT shots, or differentiate the cards another way. Wire
   `s550-thumbnail.jpg` into the image-less S-550 card, or use a fresh CONNECT screenshot instead?
6. **S3000XL image (Phase 4):** default to **image-less `launching` promotion** (deploy + real
   `/akai/s3000xl/editor` link is explicitly out of scope / a follow-up).

### Open questions to confirm

- **(5a)** Two near-identical S-330/S-550 CONNECT screenshots — acceptable, or differentiate?
- **(5b)** S-550 card image: reuse `s550-thumbnail.jpg`, or a fresh CONNECT screenshot for parity
  with S-330's `s330-screenshot.png`?
- **(4)** Hero-count fix: dedicated `launchingProjects` array (recommended) vs. status-filter
  refactor of the existing counters?

---

**Gate status:** AWAITING OPERATOR APPROVAL. On approval, Phase 2 (protocol + governance wiring)
begins.

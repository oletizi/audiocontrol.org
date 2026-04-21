---
title: Studio Redesign — Plan
---

# Feature Image Studio — Redesign plan

## Commitment

One aesthetic direction, executed. No in-between.

**Aesthetic POV: Service-manual / flight-instrumentation workbench.** The Studio is a piece of physical equipment — a test bench in a lab. Every piece of chrome carries annotation (part numbers, stage labels, unit indicators). Readouts have tabular figures. Progress is a reel-to-reel tape, not a spinner. Paper-ruled backgrounds under thread composers. Stamped status chips. Etched typographic hierarchy.

**Typography stack.**
- Display: **Departure Mono** (already self-hosted at `/fonts/departure-mono-regular.woff2` — the site's house display face)
- Body: **IBM Plex Sans** (the site's house body)
- Readouts: **JetBrains Mono** (retained for tabular figures in timestamps, counts, elapsed/ETA)

Three faces, cleanly separated roles. No Inter.

**Color tokens.**

| Token | Role | Value |
|-------|------|-------|
| `--studio-bg-0` | Warm-ink page background | `hsl(30 12% 7%)` |
| `--studio-bg-1` | Elevated surface (cards, drawers) | `hsl(30 14% 11%)` |
| `--studio-bg-2` | Highest elevation (active controls) | `hsl(30 10% 18%)` |
| `--studio-edge` | Hairline dividers | `hsl(30 10% 22%)` |
| `--studio-edge-hi` | Emphasized dividers | `hsl(30 10% 32%)` |
| `--studio-ink-0` | Primary text (warm cream) | `hsl(35 18% 88%)` |
| `--studio-ink-1` | Secondary text | `hsl(35 10% 72%)` |
| `--studio-ink-2` | Annotation text | `hsl(30 10% 55%)` |
| `--studio-ink-3` | Faint annotation | `hsl(30 10% 42%)` |
| `--studio-primary` | **Phosphor amber** (house primary) | `hsl(35 95% 62%)` |
| `--studio-primary-soft` | Amber at 18% alpha for fills | `hsl(35 95% 62% / 0.18)` |
| `--studio-primary-glow` | Amber at 8% for approve halo | `hsl(35 95% 62% / 0.08)` |
| `--studio-accent` | Roland-blue reference (used sparingly) | `hsl(215 55% 55%)` |
| `--studio-target` | Target-site indicator — amber when audiocontrol, **chartreuse** `hsl(74 82% 58%)` when editorialcontrol | runtime-switched |
| `--studio-ok` | Completed / approved | `hsl(140 55% 58%)` |
| `--studio-warn` | Caution | `hsl(32 92% 60%)` |
| `--studio-danger` | Rejected / failed | `hsl(0 68% 62%)` |

**Differentiator — the one thing people remember.** A **bottom progress tape** that appears whenever a long-running operation is active. Fills left-to-right like a reel. Annotated with numbered stages, elapsed, estimated remaining, and a cancel affordance. When idle, collapses to a thin rule showing the last completed operation's summary stamp. This is the flagship feedback primitive for the whole tool.

## Information architecture

Split the 4000-line single page into linked routes:

| Route | Role |
|-------|------|
| `/dev/studio` | Main gallery. History wall, timeline-ordered by day with rule-lines between date blocks. |
| `/dev/studio/focus/[id]` | Focus canvas. Image hero on the left, annotated DIP-switch panel for controls on the right, thread below. No drawer chrome eats the viewport. |
| `/dev/studio/generate` | Dedicated generation form, styled as a ground-school specimen sheet. |
| `/dev/studio/templates` | First-class prompt library panel with fitness + lineage view. |
| `/dev/studio/help` | Full help, one long service-manual-style document. The `?` chip in the header links here. |

Top nav across all routes: a service-manual bezel with `GALLERY · FOCUS · GENERATE · TEMPLATES · HELP` and a right-aligned **TARGET: AUDIOCONTROL** or **TARGET: EDITORIALCONTROL** status readout that changes the `--studio-target` variable site-wide.

The Workflows drawer stays (it's a cross-route concern — activating a workflow pre-fills Generate and scopes Focus). Reworked as a **sliding service-manual tab sticker** on the right edge with stamped "TAB 02" numeral and a badge count.

Keep the URL `http://localhost:4321/dev/feature-image-preview` working via redirect to `/dev/studio` so muscle memory doesn't break immediately.

## Progress UI primitive — `StudioProgressTape`

The thing the user called out. One shared component used by every long-running operation:

- Generate (raw image → filters → composite → save)
- Recomposite / Commit (read raw → DOM bake all variants → save)
- Approve (bake 3 formats → mark approved → submit decision if workflow active)
- Apply (via the skill — surfaces in gallery once the skill finishes)

Shape:

```
┌─ STAGE 02 OF 03 · BAKE 3 FORMATS ────────────── elapsed 0:04 · ~0:06 left · [ CANCEL ] ┐
│  ●───●──●───────────────────────────                                                    │
│  ↑ completed     ↑ active                  ↑ pending                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- Fixed to viewport bottom (always visible during an operation)
- Height ~72px active, collapses to 4px rule when idle
- Stage markers are mono numerals in circles with hairline rules between
- The reel (progress bar) fills left-to-right across the full stage span; active-stage segment pulses
- Elapsed + ETA tabular-figures in JetBrains Mono
- ETA learns from localStorage EMA of prior runs of the same op (reuses the existing logic — not rebuilding)
- On completion, stays up for ~5s showing **total elapsed · summary** (e.g. "BAKE · 3 formats · 4.8s · ✓"), then collapses
- On failure, shows failed stage + error message + retry affordance
- Cancel button only appears on operations that are safe to cancel mid-run

Implementation: new `StudioProgressTape.astro` + `studio-progress.ts` client module. Same underlying state shape as the existing `SteppedProgressDrawer` so state logic doesn't change.

## Execution plan — 6 commits

Each commit is independently shippable / reviewable. Earlier commits don't break the existing `/dev/feature-image-preview` page; later commits redirect from it.

**Commit 1 — Foundation** (~90 min)
- `src/sites/audiocontrol/styles/studio-tokens.css` — all tokens above + font-face declarations + decorative primitives (hairline rules, caps-mono kickers, annotated list, stamped chip, paper-ruled backdrop)
- `src/sites/audiocontrol/layouts/StudioLayout.astro` — the shared chrome (header bezel + top nav + target readout + bottom-tape mount point + grain background)
- No functional routes yet — just the foundation

**Commit 2 — Progress tape primitive** (~75 min)
- `src/sites/audiocontrol/components/studio/ProgressTape.astro` + `progress-tape.ts`
- Accepts `stages[]` prop, exposes `start(idx) / complete(idx) / fail(idx, error) / cancel()` imperative API
- Elapsed + ETA tick loop + EMA persistence
- Demo harness at `/dev/studio/proto/progress` exercising fake multi-step operations

**Commit 3 — `/dev/studio` gallery** (~2.5 hrs)
- New main route: timeline-ordered history wall, cards rebuilt in the new aesthetic
- Stamped status chips (`✓ APPROVED` with amber glow, `✗ REJECTED`, `GENERATED` neutral)
- Compact card action row uses annotated icons + mono labels
- Workflow tab sticker on the right edge
- Reads from the existing `/api/dev/feature-image/log` + `/workflow` endpoints — no backend changes

**Commit 4 — `/dev/studio/focus/[id]`** (~3 hrs)
- Image hero LEFT with letterbox rule-frame and format tabs
- DIP-switch panel RIGHT: parameter list with annotated rows (PARAM / VALUE / UNIT) — preset, grade, phosphor, vignette, scanlines, grain, position, align, overlay
- Thread composer BELOW on a paper-ruled backdrop
- Approve flow uses `ProgressTape` (Commit 2)
- Keyboard shortcuts preserved (ESC, Cmd/Ctrl+Enter, Enter/Space)

**Commit 5 — `/dev/studio/generate` + `/dev/studio/templates` + `/dev/studio/help`** (~2 hrs)
- Generate: ground-school specimen sheet layout (labeled fieldset, unit indicators, mono readouts beside inputs)
- Templates: first-class panel with fitness graph, lineage tree, inline preview, tag filters
- Help: the existing help widget promoted to its own document route, re-typeset for the service-manual voice

**Commit 6 — Cut over** (~45 min)
- Redirect `/dev/feature-image-preview` → `/dev/studio`
- Delete the old `feature-image-preview.astro` (4000 lines retired)
- Gallery refresh / thread polling / workflow polling keep working — same endpoints
- README + feature docs updated with new route list + design notes

## What stays untouched

- All API endpoints (`/api/dev/feature-image/log`, `/workflow`, `/templates`, `/threads`, `/generate`, `/recomposite`, `/bake`). Zero backend churn.
- Journal storage (Phase 15 just shipped).
- Skill behavior (`/feature-image-blog`, `/feature-image-apply`, `/feature-image-iterate`, `/feature-image-prompts`, `/feature-image-help`).
- `OGPreview.astro` component and `og-preview.css` (the image-rendering layer — already brand-correct).

## Site-mode decision

Rejecting the original "swap entire chrome" idea from the review. The Studio is audiocontrol's tool; the chrome should always read as audiocontrol so the operator doesn't feel lost when targeting editorialcontrol content. Instead:

- **Chrome stays audiocontrol always** (Departure Mono, warm-ink + phosphor amber).
- `--studio-target` runtime variable switches based on the active site — `amber` for audiocontrol, `chartreuse` for editorialcontrol.
- Target-indicator chip in the header is large and hard to miss.
- Preview content (the `OGPreview` component) already switches brand tokens — unchanged.

This is less visually dramatic than my original tier-3 pitch, but correct: tools should feel stable even when working on different subjects.

# stackcontrol.org — Design System

Status: load-bearing

Aesthetic direction: **Telemetry — industrial control-plane** — near-black surface with a faint
cool-blue cast, a single electric-cyan accent, a sparing cool-neutral counter-accent, Archivo /
Archivo Expanded heavy-grotesk display, and a monospace-telemetry register (JetBrains Mono).

This document describes what **exists** in `src/sites/stackcontrol/styles/design-tokens.css` (the
authoritative token + utility source) and its TS mirror `src/sites/stackcontrol/brand.ts`. Values
are quoted from source. It is the third per-site DESIGN-SYSTEM in the repo, alongside
[`../audiocontrol/DESIGN-SYSTEM.md`](../audiocontrol/DESIGN-SYSTEM.md) and
[`../editorialcontrol/DESIGN-SYSTEM.md`](../editorialcontrol/DESIGN-SYSTEM.md).

Companion doc: this is the per-site half of the two-doc model in
[`../../../DESIGN-DECISIONS-PROTOCOL.md`](../../../DESIGN-DECISIONS-PROTOCOL.md) (repo root). Read
this doc before any UI work on stackcontrol; read the protocol when picking or rejecting a
direction. The Telemetry identity was chosen in the Phase 2 design pass; the ACCEPTED entry and the
two REJECTED alternatives (Blueprint/indigo, Stack/magenta) live under
`docs/1.0/001-IN-PROGRESS/stackcontrol-site/explorations/`.

---

## 1. Color roles

All colors are stored as **HSL components** (`H S% L%`) and consumed via `hsl(var(--token) / alpha)`.
`color-scheme: dark` is declared in the shared base (`src/shared/design-tokens-base.css`). Values
quoted from `design-tokens.css`; the `brand.ts` field column shows the TS mirror.

| CSS custom property | `brand.ts` field | HSL value | Semantic role |
|---------------------|------------------|-----------|---------------|
| `--background` | `background` | `200 28% 5%` | Page background — near-black, faint cool-blue cast |
| `--card` | `card` | `202 24% 9%` | Raised cards / panels |
| `--card-hover` | `cardHover` | `202 22% 13%` | Card / panel hover surface |
| `--foreground` | `foreground` | `195 18% 92%` | Primary text — cool off-white (AA on background) |
| `--muted-foreground` | `mutedForeground` | `200 12% 62%` | Secondary / muted text (AA on background) |
| `--primary` | `primary` | `190 92% 56%` | Electric cyan — the dominant accent: links, glows, active phase nodes, ticker marks, primary CTA fill |
| `--accent` | `accent` | `200 14% 74%` | Cool neutral counter-accent — used sparingly (mono `$ command` echoes) |
| `--border` | `border` | `200 18% 18%` | Hairline borders, grid lines |
| `--border-hover` | `borderHover` | `190 40% 34%` | Active hairline / focus / phase-chip border (warms toward cyan) |

**Mono-accent discipline.** Cyan is the single chromatic voice. The counter-accent is a desaturated
cool neutral, not a second hue. The cyan is AA-legible both as link color on the dark surface and as
a solid fill (`.btn-primary`) with near-black (`--background`) text on top.

---

## 2. Typography

| Font role | CSS var | Stack |
|-----------|---------|-------|
| Display | `--font-display` | `"Archivo Expanded", "Archivo", system-ui, sans-serif` |
| Display (tight) | `--font-display-tight` | `"Archivo", system-ui, sans-serif` |
| Body | `--font-body` | `"IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
| Mono | `--font-mono` | `"JetBrains Mono", …` (inherited from the shared base) |
| Heading | `--font-heading` | `var(--font-display)` (inherited from the shared base) |

- **Two display cuts.** `--font-display` (Archivo Expanded) carries the largest hero/section
  display type; `--font-display-tight` (plain Archivo) carries section heads, card titles, devlog
  titles, and the footer wordmark. `--font-display-tight` is stackcontrol-specific (not in the
  shared base, not in the other sites).
- `brand.ts` mirrors `display`, `body`, `mono` only. `--font-display-tight`, `--font-heading`,
  layout/radius/glow tokens exist in CSS but not in the TS mirror (hand-mirrored by convention).
- Faces are loaded via Google Fonts in `layouts/Layout.astro` (Archivo, Archivo Expanded, IBM Plex
  Sans, JetBrains Mono). No `@font-face` is declared in the tokens file.
- Display headings are **uppercase** with negative tracking; the mono register is **uppercase,
  tracked** (`letter-spacing` 0.1–0.24em) for kickers, labels, nav, and telemetry.

---

## 3. Layout / spacing tokens

| Token | Value | Role |
|-------|-------|------|
| `--container-max-width` | `1200px` | Max width of the shared `.site-container` (overrides the base default) |
| `--container-padding` | `clamp(20px, 4vw, 56px)` | Fluid horizontal gutter (overrides the base `2rem`) |
| `--measure-reading` | `38rem` | Prose width for devlog long-form reading |
| `--radius` | `3px` | Corner radius — control-plane favors near-sharp corners |

`.site-container`, the type scale (`--text-*`), the radius scale (`--radius-sm/-md/-full`), and
`--measure-narrow` come from the shared base. There is no general `--space-*` scale; spacing is set
per class (mostly in `rem`).

---

## 4. Glow / texture

| Token | Value |
|-------|-------|
| `--card-glow` | `0 0 0 1px hsl(var(--border)), 0 8px 32px -8px hsl(0 0% 0% / 0.6)` |
| `--card-glow-hover` | `0 0 0 1px hsl(var(--primary) / 0.35), 0 10px 40px -8px hsl(var(--primary) / 0.18)` |

**Body texture (the control-plane signature)** lives in `layouts/Layout.astro`, not the tokens file:
a faint 48px dot/line grid + a cyan vignette glow (`radial-gradient … hsl(var(--primary) / 0.07)`)
on `body`, plus a fixed `body::after` repeating-linear-gradient **scanline** overlay (1px on / 2px
off, `opacity: 0.3`, `mix-blend-mode: multiply`). There is no separate text-glow token; the hero
accent word uses an inline `text-shadow` in cyan.

---

## 5. Code-only aesthetic motifs

Settled patterns that encode design rules beyond single tokens.

- **`.btn` / `.btn-primary` / `.btn-ghost`** (`design-tokens.css`) — mono, uppercase, tracked, 700,
  `--radius` corners. Primary is a solid cyan fill with near-black (`--background`) text + a cyan
  halo box-shadow; lifts 1px and intensifies the halo on hover. Ghost is a `--border-hover` outline
  that goes cyan on hover.
- **`.kicker`** (`design-tokens.css`) — mono uppercase eyebrow (0.24em tracking, cyan) with a
  leading 28px cyan tick via `::before`. The standard section/hero eyebrow.
- **`.rule-single`** — single hairline top border, `margin: 1.5rem 0`.
- **`.rule-accent`** — `var(--rule-medium)` (2px) cyan top border, `width: 3rem` (no glow).
- **Phase rail** — see `components/PhaseRail.astro` (§6). The signature device.
- **VFD readout (`.stage-ord`, `pages/index.astro`)** — the ordinal "tubes" in THE METHOD section: a
  filled cyan digit with a three-layer bloom, seated in a darkened glass panel (radial cyan-tint
  background, inset phosphor glow, hairline cyan bezel, multiply-blended scanlines), surging on
  hover. A cyan vacuum-fluorescent / oscilloscope-phosphor reading — never amber nixie (that breaks
  the mono-cyan rule); also a nod to vintage sampler/synth displays.
- **The Method flow (`.method-flow` / `.stage` / `.stage-arrow`)** — three numbered stages joined by
  cyan flow arrows; the assembly-line thesis made literal. Stacks vertically on mobile.
- **Telemetry ticker** — see `components/Ticker.astro` (§6).
- **Body grid + scanline** — see §4 (lives in the Layout's global style).

The `@keyframes ticker` (translateX 0 → -50%) and `.card-glow` come from the shared base.

---

## 6. Components

- **`components/Header.astro`** — sticky, blurred, hairline-bottom site header. Wordmark + mono nav
  (Method / Product / Devlog / About — same-page jump anchors plus the Devlog page) with a cyan
  underline-reveal on hover and an `active` state derived from `Astro.url.pathname`. On ≤560px the
  nav wraps to its own full-width line below the wordmark (two-line header) rather than overflowing.
- **`components/Footer.astro`** — wordmark + tagline, sibling links (audiocontrol.org,
  editorialcontrol.org), system links, mono copyline. Imports `Logo`.
- **`components/Logo.astro`** — the wordmark `stackcontrol` + cyan separating `.` + muted `org`.
  Props: `variant?: 'header' | 'footer'` (font size only).
- **`components/PhaseRail.astro`** — **the signature structural device.** Four connected nodes
  (Define → Implement → Audit → Repeat) on a hairline track with a cyan-tinted center.
  Props: `active?: number` (cyan-lit glowing node), `variant?: 'labeled' | 'divider'`,
  `phases?: Phase[]`. The `labeled` variant (ordinal over uppercase name) renders **beneath the
  lifecycle phase cards** in THE LIFECYCLE section — the loop visualized below its own cards. (The
  hero leads with the babysitter hook; THE METHOD section carries the thesis.) The `divider` variant
  is currently unused on the homepage.
- **`components/Ticker.astro`** — the telemetry status bar: a scrolling mono uppercase strip of
  system metadata with a blinking cyan "live" dot, duplicated track for a seamless loop. Rendered
  via the Layout's `banner` slot (above the sticky header). Motion respects
  `prefers-reduced-motion`.
- **`layouts/Layout.astro`** — base layout: fonts, SEO/OG/JSON-LD, global element styles, body
  texture, `banner` + default slots, Header, Footer.
- **`layouts/BlogLayout.astro`** — devlog entry layout (Telemetry register): mono kicker/meta,
  uppercase Archivo title, cyan-styled code/prose, `BlogPosting` JSON-LD.

---

## 7. Vocabulary

- **Devlog** — the blog. Entries are tagged with the **phase** they're about (SCOPE, AUDIT,
  PIPELINE, …), surfaced as a cyan-bordered chip. (`phase` is a stackcontrol-specific content field;
  see `content.config.ts`.)
- **Lifecycle / phase rail** — the four-phase **loop** (Define → Implement → Audit → Repeat) is the
  site's organizing metaphor and its signature visual device. Define happens once up front;
  Implement and Audit repeat until the diff is clean. Audit carries no command — it fires
  automatically on the implement hook; Repeat is the loop.
- **Babysitter / assembly line** — the homepage framing (supersedes the earlier "control plane"
  language). Coding agents are "insane, hyperintelligent toddlers" that need supervision;
  stack-control is the babysitter that runs every change down an **assembly line** — heavy design
  up front, hands-off parallel implementation, mechanized multi-agent audit. The differentiators
  (multi-agent audit / "stochastic correctness", scope discovery) are evidence for the thesis, not
  the headline. Full copy + rationale: `docs/1.0/001-IN-PROGRESS/stackcontrol-site/messaging-copy-deck.md`.
- **The Method** — the homepage's three-move thesis, its own section `[ 01 ]` (before THE LIFECYCLE):
  **front-load design → invest in tooling → industrialize production**, rendered as VFD-readout
  stages. Page order: METHOD `[ 01 ]` → LIFECYCLE `[ 02 ]` → WHAT/WHY/HOW `[ 03 ]` → DEVLOG `[ 04 ]`.

---

## 8. Relationship to the shared base + siblings

- **Consumes `src/shared/design-tokens-base.css`**, imported before this file in the Layout. The
  base supplies `color-scheme`, structural tokens, the `--text-*` / `--radius-*` scales,
  `.site-container`, `.rule-double`, `.card-glow`, and `@keyframes ticker`. This file layers the
  Telemetry palette, fonts, and site-specific utilities on top, overriding `--container-max-width`
  and `--container-padding`.
- **Implements the shared `Brand`** (`src/shared/brand.ts`) via `brand.ts`.
- **Differentiation (settled).** The cyan primary is deliberately neither audiocontrol's amber nor
  editorialcontrol's chartreuse; the Archivo display diverges from audiocontrol's technical sans and
  editorialcontrol's Fraunces serif. This is the load-bearing constraint from the design pass — do
  not drift the accent toward amber/green or adopt a sibling's display face without revisiting the
  ACCEPTED archive entry.

---

## 9. See also

- [`../../../DESIGN-DECISIONS-PROTOCOL.md`](../../../DESIGN-DECISIONS-PROTOCOL.md) — governs the
  per-feature `explorations/{ACCEPTED,REJECTED}/` archive and the `brief.md` contract.
- [`../../../.claude/rules/design-discipline.md`](../../../.claude/rules/design-discipline.md) — the
  read-before / update-with rule.
- `docs/1.0/001-IN-PROGRESS/stackcontrol-site/explorations/` — the design-pass archive (ACCEPTED
  Telemetry + REJECTED Blueprint/Stack) and the constraints `brief.md`.

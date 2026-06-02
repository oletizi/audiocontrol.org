# editorialcontrol.org — Design System

Status: load-bearing

Aesthetic direction: **editorial publication-dark** — ink-near-black background, signal-green
chartreuse primary, warm parchment-cream accent, Fraunces serif display.

This document describes what **exists** in `src/sites/editorialcontrol/styles/design-tokens.css`
(the authoritative token + utility source) and its TS mirror `src/sites/editorialcontrol/brand.ts`.
Every value below is quoted from source. Where the two sites duplicate or diverge, that is noted as
known drift, not as an aspiration. It invents no standards.

Companion docs: this is the per-site half of the two-doc model in
[`../../../DESIGN-DECISIONS-PROTOCOL.md`](../../../DESIGN-DECISIONS-PROTOCOL.md) (repo root) — read
this doc before any UI work on editorialcontrol; read the protocol when picking or rejecting a
direction.

---

## 1. Color roles

All colors are stored as **HSL components** (`H S% L%`) and consumed via `hsl(var(--token) / alpha)`.
`color-scheme: dark` is declared at `:root`. Values are quoted from `design-tokens.css`; the
`brand.ts` field column shows which roles the TS mirror also carries.

| CSS custom property | `brand.ts` field | HSL value | Semantic role |
|---------------------|------------------|-----------|---------------|
| `--background` | `background` | `215 22% 7%` | Page background — ink-near-black with a faint cool cast (press ink on paper) |
| `--card` | `card` | `215 18% 11%` | Raised cards / panels |
| `--card-hover` | `cardHover` | `215 18% 14%` | Card hover surface |
| `--foreground` | `foreground` | `40 20% 90%` | Primary text — warm off-white (cream on ink) |
| `--muted-foreground` | `mutedForeground` | `215 10% 55%` | Secondary / muted text |
| `--primary` | `primary` | `74 82% 58%` | Signal-green chartreuse — editorial attention / tracked-changes mark; the dominant chromatic voice |
| `--accent` | `accent` | `38 32% 82%` | Parchment cream — the "paper" accent, used for pull quotes / rules |
| `--border` | `border` | `215 14% 18%` | Hairline borders |
| `--border-hover` | `borderHover` | `215 14% 28%` | Border hover state |

No badge tokens are defined for this site. The only inline literal color in the tokens file is the
paper-grain dot, which uses `hsl(var(--foreground))` (see §6).

---

## 2. Typography

| Font role | CSS var | Stack |
|-----------|---------|-------|
| Display | `--font-display` | `"Fraunces", "Iowan Old Style", "Palatino", Georgia, serif` |
| Body | `--font-body` | `"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
| Mono | `--font-mono` | `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` |
| Heading | `--font-heading` | `var(--font-display)` (headings alias the Fraunces serif display) |

`brand.ts` mirrors `display`, `body`, and `mono` only; `--font-heading` exists in CSS but not in the
TS mirror.

**Type scale (shared).** A numeric `--text-xs … --text-3xl` scale lives in
`src/shared/design-tokens-base.css`. `.ticker-track` consumes `--text-xs` (`0.75rem`); other sizes
remain per-class literals (e.g. `.dropcap::first-letter` `3.25rem` / `line-height: 0.85` /
`font-weight: 600`). No dedicated line-height or weight tokens yet.

**No `@font-face` is declared in the tokens file.** Unlike audiocontrol (which self-hosts faces),
editorialcontrol's `design-tokens.css` declares no faces — Fraunces / Inter / JetBrains Mono are
loaded elsewhere (layout, font service, or system fallback).

---

## 3. Layout / spacing tokens

| Token | Value | Role |
|-------|-------|------|
| `--container-max-width` | `1280px` | Max width of the shared container (narrower than audiocontrol's 1400px) |
| `--container-padding` | `2rem` | Horizontal padding inside the container |
| `--measure-reading` | `34rem` | Ideal prose width for long-form reading |
| `--measure-narrow` | `28rem` | Narrow measure for standalone essays |

There is **no general spacing scale** (no `--space-*` tokens). **Radius tokens**
(`--radius-sm/-md/-full`) live in `src/shared/design-tokens-base.css` (this site has no radius
adopters yet). `--container-padding` and `--measure-narrow` now live in the shared base (identical
across both sites); `--container-max-width` (1280px) and `--measure-reading` (34rem) stay
site-specific here. `--measure-reading` is consumed by layouts/components outside the tokens file.

---

## 4. Rule weights and glow

**Rule weights** (the comment in source notes "this site leans heavily on typographic rules"):

| Token | Value |
|-------|-------|
| `--rule-hairline` | `1px` |
| `--rule-medium` | `2px` |

There is **no `--rule-heavy`** here (audiocontrol defines one; this site does not). The 3px masthead
rule is a hard-coded `height: 3px` inside `.rule-masthead` (§6), not a token.

**Glow / shadow:**

| Token | Value |
|-------|-------|
| `--card-glow` | `0 0 0 1px hsl(var(--border)), 0 8px 32px -8px hsl(0 0% 0% / 0.55)` |
| `--card-glow-hover` | `0 0 0 1px hsl(var(--primary) / 0.35), 0 10px 40px -8px hsl(var(--primary) / 0.12)` |

There is no text-glow token (audiocontrol has `--phosphor-glow`; editorialcontrol has none).

---

## 5. Code-only aesthetic motifs

These settled patterns encode design rules beyond single tokens. Each is defined in
`design-tokens.css`.

- **`.site-container`** — `box-sizing: border-box`, `width: 100%`, `max-width:
  var(--container-max-width)`, centered (`margin: 0 auto`), `padding: var(--container-padding)`.
  Shared by header, footer, and main content.
- **`.rule-single`** — single hairline top border (`var(--rule-hairline) solid hsl(var(--border))`),
  `margin: 1.5rem 0`. (audiocontrol names the same concept `.rule-hairline`; this is a divergent
  class name for the same idea.)
- **`.rule-double`** — hairline top + hairline bottom borders, `height: 5px`, `margin: 2rem 0`.
- **`.rule-accent`** — `var(--rule-medium)` (2px) chartreuse top border, `width: 3rem`, `margin:
  1.5rem 0`. **No glow** — unlike audiocontrol's `.rule-accent`, which adds a box-shadow; this one
  does not.
- **`.rule-masthead`** — signature 3px bar: `height: 3px`, `background: hsl(var(--foreground))` (a
  solid foreground bar, not a border-top), `margin: 0 0 2.5rem 0`. The thick masthead-top rule.
- **`.edit-mark`** — `display: inline-block`, `color: hsl(var(--primary))`, `font-family:
  var(--font-display)`, **`font-style: italic`**. A small typographic indicator before topic items
  and section openers — the tracked-changes / editorial-mark motif.
- **`.dropcap::first-letter`** — display font, `font-weight: 600`, `float: left`, `font-size:
  3.25rem`, `line-height: 0.85`, `padding: 0.25rem 0.5rem 0 0`, `color: hsl(var(--primary))`. The
  section-opener drop cap.
- **`.paper-grain`** — a single `::before` overlay (the element gets `position: relative`). The
  overlay is **`position: absolute`** with `inset: 0` (not fixed full-viewport like audiocontrol's
  grain), `pointer-events: none`, `opacity: 0.025`, a radial-dot grain (`background-size: 3px 3px`)
  in `hsl(var(--foreground))`, `mix-blend-mode: overlay`. Pure CSS, "to avoid an asset round-trip."
  No scanlines, no vignette (those are audiocontrol-only).
- **`.card-glow`** — applies `var(--card-glow)`, transitions `box-shadow` and `border-color` over
  `0.3s ease`; `.card-glow:hover` applies `var(--card-glow-hover)`. There is **no
  `.card-glow-hover` variant** and **no border-color change on hover** (audiocontrol's hover variant
  sets `border-color`; this one does not).
- **Ticker** — `.ticker` (top + bottom hairline borders, `padding: 0.5rem 0`, explicit `background:
  hsl(var(--background))`). `.ticker-track` uses **`var(--font-mono)`**, `font-size: 0.75rem`,
  `letter-spacing: 0.08em`, uppercase, muted color; animated by `@keyframes ticker` translating
  `translateX(0)` → `translateX(-50%)` over **60s** `linear infinite`. `.ticker-track > span` is
  right-padded `3rem`; `.ticker-track .ticker-mark` is primary-colored. A `@media
  (prefers-reduced-motion: reduce)` block disables the `.ticker-track` animation.

---

## 6. Components

Grounded in the UI-surface census (`docs/1.0/001-IN-PROGRESS/design-system-foundation/discovery/02-ui-surface-census.md`).

**User-facing chrome:**

- **`components/Header.astro`** — sticky site header; consumed by `layouts/Layout.astro`.
- **`components/Footer.astro`** — site footer; imports `Logo`; consumed by `layouts/Layout.astro`.
- **`components/Logo.astro`** — brand logo. Props: `variant?: 'masthead' | 'inline' | 'compact'`.
  Consumed by `Header`, `Footer`, and `pages/index.astro`.

editorialcontrol has **no `ProjectCard` equivalent** and no card-like component at all — the
publication uses inline markup for dispatch listings. (The only card-like primitive in the repo is
`audiocontrol/components/ProjectCard.astro`.)

**Dev-only studio surfaces** — everything under `/dev`, `/api/dev`, or PROD-guarded is dev-only,
enforced by route prefix and/or `import.meta.env.PROD` 404/redirect guards:

- **`components/studio/ProgressTape.astro`** — studio progress "reel" component. Consumed by
  `layouts/StudioLayout.astro` and the `dev/studio/proto/progress.astro` harness.
- **`components/studio/focus-client.ts`**, **`gallery-client.ts`**, **`generate-client.ts`**,
  **`templates-client.ts`** — client-side TS controllers for the Feature Image Studio tabs
  (dev-only).

These studio surfaces are tooling for the Feature Image Studio and are not part of the public
publication chrome. They are noted here so a reader knows they exist behind the dev guard, not to
imply they ship to readers.

---

## 7. Known drift (documented, not yet fixed)

**Resolved in Phase 3 (shared token base).** The previously-duplicated structural tokens and the
missing scale tokens now live in `src/shared/design-tokens-base.css`, imported by every layout
before this site's tokens:

- Shared structural tokens (identical across both sites): `color-scheme`, `--container-padding`,
  `--measure-narrow`, `--rule-hairline`, `--rule-medium`, `--font-mono`, `--font-heading`.
- Shared additive scales: `--text-xs … --text-3xl` (this site's `.ticker-track` uses `--text-xs`)
  and `--radius-sm/-md/-full` (no adopters on this site yet).
- Four byte-identical utility classes (`.site-container`, `.rule-double`, `.card-glow`/`:hover`,
  `@keyframes ticker`) live in the base. Site-specific values (colors, Fraunces/Inter fonts,
  `--container-max-width`, `--measure-reading`, glow) stay in this site's `design-tokens.css`.

**Still open (documented, not fixed):**

- **`--font-mono` has no `@font-face`.** Consumed by `.ticker-track`, but no JetBrains Mono face is
  declared, so it resolves via system fallback unless loaded elsewhere.
- **`brand.ts` is a strict subset of the CSS.** The TS mirror carries only the nine `BrandColors`
  plus the three font stacks; layout/measure/rule/glow tokens and `--font-heading` exist only in CSS
  (now plus the shared base). Hand-mirrored by convention — no generator.

---

## 8. See also

- [`../../../DESIGN-DECISIONS-PROTOCOL.md`](../../../DESIGN-DECISIONS-PROTOCOL.md) — the repo-root
  companion that governs the per-feature `explorations/{ACCEPTED,REJECTED}/` archive and the
  `brief.md` contract. This DESIGN-SYSTEM records what is *settled*; the protocol records what was
  *explored*.
- [`../../../.claude/rules/design-discipline.md`](../../../.claude/rules/design-discipline.md) — the
  read-before / update-with rule: read this doc before any UI work on editorialcontrol, and update
  it in the same commit as any global-pattern change.

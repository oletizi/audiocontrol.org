# Design Language Inventory — audiocontrol.org & editorialcontrol.org

Exhaustive, code-grounded catalogue of both sites' design tokens, typography, spacing/rule scales, and code-only aesthetic rules, plus the shared brand contract. Nothing here is invented; every entry traces to one of the five source files.

## Sources catalogued

| File | Role |
|------|------|
| `src/shared/brand.ts` | Shared TypeScript `Brand` interface (data contract only — no values) |
| `src/sites/audiocontrol/brand.ts` | audiocontrol token values in TS |
| `src/sites/audiocontrol/styles/design-tokens.css` | audiocontrol CSS custom properties + utility classes |
| `src/sites/editorialcontrol/brand.ts` | editorialcontrol token values in TS |
| `src/sites/editorialcontrol/styles/design-tokens.css` | editorialcontrol CSS custom properties + utility classes |

All color values are stored as **HSL components** (`H S% L%`), consumed via `hsl(var(--token) / alpha)`. The TS `brand.ts` and the CSS `design-tokens.css` are **hand-mirrored** by stated convention (`src/shared/brand.ts` lines 10-15) — there is no generator. This inventory flags where the two have drifted apart.

---

## 1. Shared layer — `src/shared/brand.ts`

The shared file defines **only the TypeScript contract**, no concrete values. It is a pure interface module; every site supplies its own values.

### Interfaces

**`BrandColors`** — nine required string fields (HSL components):
- `background` — page background, the deepest surface
- `card` — raised cards and panels
- `cardHover` — card hover state
- `foreground` — primary text on the background
- `mutedForeground` — secondary / muted text
- `primary` — brand-identifying accent (links, glows, highlights); documented as "the dominant chromatic voice"
- `accent` — warm counter-accent, used sparingly ("single-spot-of-warmth in an otherwise cool palette")
- `border` — 1px borders / hairlines
- `borderHover` — hover state for borders

**`BrandTypography`** — three required string fields:
- `display` — display / headline / wordmark (the typographic identity)
- `body` — body copy / long-form reading
- `mono` — code, metadata, tabular numbers

**`Brand`** — top-level: `site` (slug), `name` (display name), `tagline` (one line for header/footer/OG), `colors: BrandColors`, `typography: BrandTypography`.

### What is shared vs per-site
- **Shared:** the *shape* (field names, semantic roles, the HSL-component storage convention). The role docstrings (e.g. "primary = dominant chromatic voice", "accent = single warm spot") are the cross-site design rule.
- **Per-site:** every concrete value. No defaults, no base palette, no inherited CSS. Each site's `design-tokens.css` is standalone `:root` — there is no shared CSS token file. Sites do **not** import a common stylesheet; the only shared thing in CSS terms is the *naming convention* of the custom properties and the *names* of utility classes (`.site-container`, `.rule-double`, `.rule-accent`, `.card-glow`, `.ticker*`), which are independently redefined in each site's CSS.

Note: the `Brand` interface does **not** model layout tokens (container width, measures), rule weights, badge colors, glow/shadow tokens, or any utility class. Those live only in the per-site CSS and are therefore **not** part of the shared data contract.

---

## 2. audiocontrol.org

Stated aesthetic (from file headers): **service-manual / flight-instrumentation.** Warm-ink background, warm cream foreground, phosphor-amber primary (VFD/CRT glow), Roland-blue accent used sparingly. Display face = Departure Mono (Apollo-era pixel mono).

### 2.1 Color roles

| Token (CSS) | Brand.ts field | HSL value | Semantic role |
|-------------|----------------|-----------|---------------|
| `--background` | `background` | `30 12% 7%` | Page background — warm near-black, faint amber cast |
| `--card` | `card` | `30 14% 11%` | Raised cards / panels |
| `--card-hover` | `cardHover` | `30 14% 14%` | Card hover surface |
| `--foreground` | `foreground` | `35 18% 88%` | Primary text — warm cream off-white (phosphor-on-ink) |
| `--muted-foreground` | `mutedForeground` | `30 10% 55%` | Secondary / muted text |
| `--primary` | `primary` | `35 95% 62%` | Phosphor amber — dominant chromatic voice (VFD/flight instrument) |
| `--accent` | `accent` | `215 55% 55%` | Roland-blue — sparse secondary accent / hover |
| `--border` | `border` | `30 10% 18%` | Hairline borders |
| `--border-hover` | `borderHover` | `30 10% 28%` | Border hover state |

**Badge colors (CSS-only — not in brand.ts):**
| Token | HSL value | Role |
|-------|-----------|------|
| `--badge-available` | `152 55% 55%` | "Available" badge text (green) |
| `--badge-available-bg` | `152 40% 13%` | "Available" badge background |
| `--badge-coming` | `35 80% 55%` | "Coming soon" badge text (amber) |
| `--badge-coming-bg` | `30 14% 14%` | "Coming soon" badge background |

**Inline / literal colors used in atmosphere effects (not tokens):**
- Grain dot color: `hsl(35 30% 70%)` (warm)
- Scanline stripe: `hsl(0 0% 0% / 0.06)`
- Vignette gradient stops: `hsl(35 35% 10%)` (top), `hsl(var(--background))` (mid), `hsl(30 15% 4%)` (outer)

### 2.2 Typography

| Font role | CSS var | Stack | Notes |
|-----------|---------|-------|-------|
| Display | `--font-display` | `"Departure Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | Pixel mono; reserved for wordmark, eyebrows, panel labels, tickers |
| Body | `--font-body` | `"IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Long-form + UI |
| Mono | `--font-mono` | `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | Code + tabular meta |
| Heading | `--font-heading` | `var(--font-display)` | Headings alias to display (Departure Mono) |

**Self-hosted @font-face declarations (woff2, `font-display: swap`):**
- `Departure Mono` 400 → `/fonts/departure-mono-regular.woff2` (single weight only)
- `IBM Plex Sans` 400, 500, 600, 700 → `/fonts/ibm-plex-sans-{400,500,600,700}.woff2`
- **No self-hosted JetBrains Mono `@font-face`** in this file — `--font-mono` references "JetBrains Mono" but no face is declared here, so it resolves via system fallback unless loaded elsewhere.

**Type scale:** There is **no numeric type scale** (no `--text-sm`/`--text-lg`/etc. tokens, no line-height/weight tokens). Sizes are set ad hoc inside utility classes only:
- `.panel-label` — `0.75rem`, weight `400`, `letter-spacing: 0.14em`, `text-transform: uppercase`
- `.ticker-track` — `0.75rem`, `letter-spacing: 0.12em`, uppercase
- Departure Mono ships only weight 400, so display text has no bold variant.

### 2.3 Spacing / radii / shadows / rule weights

**Layout / spacing tokens:**
- `--container-max-width: 1400px`
- `--container-padding: 2rem`
- `--measure-reading: 36rem` (long-form prose measure)
- `--measure-narrow: 28rem` (standalone essays / pull quotes)
- No general spacing scale (no `--space-1..n`); spacing is hard-coded per class.

**Rule weights:**
- `--rule-hairline: 1px`
- `--rule-medium: 2px`
- `--rule-heavy: 3px`

**Radii:** No radius tokens. The only radius literal is `border-radius: 50%` on `.signal-led`.

**Shadows / glows:**
- `--card-glow: 0 0 0 1px hsl(var(--border)), 0 10px 36px -12px hsl(0 0% 0% / 0.65)`
- `--card-glow-hover: 0 0 0 1px hsl(var(--primary) / 0.35), 0 12px 44px -10px hsl(var(--primary) / 0.18)`
- `--phosphor-glow: 0 0 14px hsl(var(--primary) / 0.35), 0 0 2px hsl(var(--primary) / 0.55)` — amber text halo

### 2.4 Code-only aesthetic rules (utilities & effects)

These encode design rules beyond single tokens:

- **`color-scheme: dark`** set at `:root`.
- **`.site-container`** — `max-width: var(--container-max-width)`, centered, `padding: var(--container-padding)`; full-width box-sizing border-box.
- **Rule utilities (service-manual schematic vocabulary):**
  - `.rule-hairline` — single 1px top border, `1.5rem 0` margin.
  - `.rule-double` — 1px top + 1px bottom borders, `height: 5px`, `2rem 0` margin.
  - `.rule-accent` — **signature accent**: 2px amber top border, `width: 3rem` (short underscore), with `box-shadow: 0 0 8px hsl(var(--primary) / 0.4)` glow.
  - `.rule-ticked` — 1px background rule with `::before`/`::after` vertical 1px×11px tick marks at both ends (top `-5px`), evoking fiducial marks on a schematic.
- **`.panel-label`** — the "pixel-display voice": display font, `0.75rem`, weight 400, `letter-spacing: 0.14em`, uppercase, muted color. Variant `.panel-label--accent` switches to primary color + `text-shadow: var(--phosphor-glow)`.
- **`.dimension-bracket`** — section opener wrapper drawing top-left and top-right corner brackets (18×18px, 2px borders, `hsl(var(--primary) / 0.6)`) via pseudo-elements; reads as a callout on a technical drawing. Padding `1.25rem 1.5rem 0.75rem`.
- **`.signal-led`** — 8×8px amber dot, `border-radius: 50%`, phosphor-glow shadow, pulsing via `@keyframes signal-led-pulse` (2.4s, opacity 0.55↔1 with growing glow) — a "powered-on status lamp."
- **`.phosphor`** — amber text color + phosphor-glow text-shadow (the amber text-highlight treatment).
- **Card glow utilities** — `.card-glow` (applies `--card-glow`, transitions box-shadow + border-color 0.3s), `.card-glow:hover` and `.card-glow-hover:hover` (apply hover glow; the latter also sets `border-color: hsl(var(--primary) / 0.5)`).
- **Atmosphere layers (applied globally from Layout.astro via body classes; each isolated so pages can opt out):**
  - `.atmosphere-grain` — fixed full-viewport `::before`, `z-index: 9998`, `opacity: 0.035`, radial-dot grain `background-size: 3px 3px` in warm `hsl(35 30% 70%)`, `mix-blend-mode: overlay`.
  - `.atmosphere-scanlines` — fixed `::after`, `z-index: 9999`, repeating horizontal black stripes at `0.06` alpha (2px transparent / 1px dark), `mix-blend-mode: multiply` — whisper CRT/VFD refresh.
  - `.atmosphere-vignette` — body background: radial ellipse from warm `hsl(35 35% 10%)` at top → `--background` at 55% → deep `hsl(30 15% 4%)` at 120%, `background-attachment: fixed`.
- **Ticker** — `.ticker` (top+bottom hairline borders, `0.5rem 0` padding), `.ticker-track` (display font, `0.75rem`, `letter-spacing: 0.12em`, uppercase, muted; `@keyframes ticker` translateX 0→-50% over **80s** linear infinite), `> span` right-padded `3rem`, `.ticker-mark` colored primary.
- **Legacy alias:** `@keyframes pulse-glow` (opacity 0.4↔1, 2s) + `.animate-pulse-glow` — kept for existing components.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables animation on `.signal-led`, `.animate-pulse-glow`, `.ticker-track`.

### 2.5 brand.ts ↔ CSS divergences (audiocontrol)

- brand.ts carries **only** the nine `BrandColors` + three fonts. The CSS adds badge colors, rule-weight tokens, layout/measure tokens, glow tokens, and `--font-heading` — none of which exist in brand.ts. The mirror is therefore **partial**: brand.ts is a subset.

### 2.6 Unused / orphaned tokens (audiocontrol)

- `--font-mono` is defined but **no JetBrains Mono `@font-face`** is declared in this file (relies on the font being loaded elsewhere or system fallback).
- `--rule-heavy: 3px` is defined but not referenced by any utility class in this file.
- `--measure-reading` / `--measure-narrow` are defined here but not consumed by any class in this file (consumed by layouts/components outside the inventoried files).
- Badge tokens (`--badge-*`) are defined but no badge utility class exists in this file (consumed by components elsewhere).

---

## 3. editorialcontrol.org

Stated aesthetic (from file headers): **publication-dark.** Ink-near-black background (press ink on paper), signal-green chartreuse primary (editorial highlight / tracked-changes), warm parchment-cream accent (the paper side). Editorial typography via serif display (Fraunces).

### 3.1 Color roles

| Token (CSS) | Brand.ts field | HSL value | Semantic role |
|-------------|----------------|-----------|---------------|
| `--background` | `background` | `215 22% 7%` | Page background — ink-near-black, faint cool cast |
| `--card` | `card` | `215 18% 11%` | Raised cards / panels |
| `--card-hover` | `cardHover` | `215 18% 14%` | Card hover surface |
| `--foreground` | `foreground` | `40 20% 90%` | Primary text — warm off-white (cream on ink) |
| `--muted-foreground` | `mutedForeground` | `215 10% 55%` | Secondary / muted text |
| `--primary` | `primary` | `74 82% 58%` | Signal-green chartreuse — editorial attention / tracked-changes mark; dominant voice |
| `--accent` | `accent` | `38 32% 82%` | Parchment cream — the "paper" accent, for pull quotes / rules |
| `--border` | `border` | `215 14% 18%` | Hairline borders |
| `--border-hover` | `borderHover` | `215 14% 28%` | Border hover state |

No badge tokens defined for this site. Only inline literal: paper-grain dot uses `hsl(var(--foreground))`.

### 3.2 Typography

| Font role | CSS var | Stack | Notes |
|-----------|---------|-------|-------|
| Display | `--font-display` | `"Fraunces", "Iowan Old Style", "Palatino", Georgia, serif` | Serif; optical-size + italic give pull-quote / wordmark treatments |
| Body | `--font-body` | `"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Long-form reading |
| Mono | `--font-mono` | `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | Code + tabular meta |
| Heading | `--font-heading` | `var(--font-display)` | Headings alias to display (Fraunces serif) |

**@font-face:** **None declared in this file.** Unlike audiocontrol, editorialcontrol's `design-tokens.css` self-hosts no fonts here — Fraunces / Inter / JetBrains Mono must be loaded elsewhere (layout, font CDN, or system fallback).

**Type scale:** No numeric type-scale tokens. The only explicit sizes are in utility classes:
- `.dropcap::first-letter` — `font-size: 3.25rem`, `line-height: 0.85`, weight `600`
- `.ticker-track` — `0.75rem`, `letter-spacing: 0.08em`, uppercase

### 3.3 Spacing / radii / shadows / rule weights

**Layout / spacing tokens:**
- `--container-max-width: 1280px` (narrower than audiocontrol's 1400px)
- `--container-padding: 2rem`
- `--measure-reading: 34rem` (vs audiocontrol's 36rem)
- `--measure-narrow: 28rem` (same as audiocontrol)

**Rule weights:**
- `--rule-hairline: 1px`
- `--rule-medium: 2px`
- **No `--rule-heavy`** (audiocontrol has one; this site does not). Header comment: "this site leans heavily on typographic rules."

**Radii:** No radius tokens, no radius literals.

**Shadows / glows:**
- `--card-glow: 0 0 0 1px hsl(var(--border)), 0 8px 32px -8px hsl(0 0% 0% / 0.55)`
- `--card-glow-hover: 0 0 0 1px hsl(var(--primary) / 0.35), 0 10px 40px -8px hsl(var(--primary) / 0.12)`
- **No `--phosphor-glow`** (audiocontrol-only). editorialcontrol has no text-glow token.

### 3.4 Code-only aesthetic rules (utilities & effects)

- **`color-scheme: dark`** at `:root`.
- **`.site-container`** — identical structure to audiocontrol (max-width var, centered, `2rem` padding, border-box).
- **Rule utilities (hairlines as a primary editorial device):**
  - `.rule-single` — single 1px top border, `1.5rem 0` margin. (audiocontrol's equivalent is named `.rule-hairline` — **divergent class name** for the same concept.)
  - `.rule-double` — 1px top + 1px bottom, `height: 5px`, `2rem 0` margin (identical to audiocontrol).
  - `.rule-accent` — 2px chartreuse top border, `width: 3rem`, `1.5rem 0` margin. **No glow** (audiocontrol's `.rule-accent` adds a box-shadow; this one does not).
  - `.rule-masthead` — signature 3px solid `hsl(var(--foreground))` bar (not border-top), `margin: 0 0 2.5rem 0` — thicker masthead-top rule. (audiocontrol has no masthead rule.)
- **`.paper-grain`** — `::before` overlay, **`position: absolute`** (not fixed like audiocontrol's grain), no z-index, `opacity: 0.025`, radial-dot `3px 3px` grain in `hsl(var(--foreground))`, `mix-blend-mode: overlay`. Pure CSS, "to avoid an asset round-trip." No scanlines, no vignette (audiocontrol-only atmosphere).
- **`.edit-mark`** — inline, primary color, display font, **italic** — small typographic indicator before topic items / section openers (the "tracked-changes / editorial mark" motif).
- **`.dropcap::first-letter`** — display font, weight 600, `float: left`, `3.25rem`, `line-height: 0.85`, padding `0.25rem 0.5rem 0 0`, primary color — section-opener drop cap.
- **Card glow** — `.card-glow` + `.card-glow:hover` only. **No `.card-glow-hover` variant** and **no border-color change on hover** (audiocontrol's hover variant sets border-color; this one does not).
- **Ticker** — `.ticker` (top+bottom hairlines, `0.5rem 0` padding, **explicit `background: hsl(var(--background))`** which audiocontrol's ticker lacks). `.ticker-track` uses **`--font-mono`** (audiocontrol uses `--font-display`), `0.75rem`, `letter-spacing: 0.08em` (vs 0.12em), uppercase, muted; `@keyframes ticker` translateX 0→-50% over **60s** (vs audiocontrol's 80s). `> span` right-padded `3rem`; `.ticker-mark` primary-colored.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables `.ticker-track` animation only (audiocontrol also covers `.signal-led` and `.animate-pulse-glow`, which don't exist here).

### 3.5 brand.ts ↔ CSS divergences (editorialcontrol)

- As with audiocontrol, brand.ts carries only the nine colors + three fonts; CSS adds layout/measure tokens, rule weights, glow tokens, and `--font-heading`. brand.ts is a strict subset.

### 3.6 Unused / orphaned tokens (editorialcontrol)

- `--font-mono` is used by `.ticker-track` (so it is consumed), but no `@font-face` for JetBrains Mono is declared here.
- `--measure-reading` / `--measure-narrow` are defined but not consumed by any class in this file (consumed by layouts/components elsewhere).
- `--rule-medium` is consumed by `.rule-accent`; `--rule-hairline` by rule + ticker utilities.

---

## 4. Cross-site comparison (shared concept, divergent execution)

| Dimension | audiocontrol | editorialcontrol |
|-----------|--------------|------------------|
| Aesthetic | Service-manual / flight-instrumentation | Publication-dark / press-ink |
| Background hue | Warm (`30°`) near-black | Cool (`215°`) near-black |
| Primary | Phosphor amber `35 95% 62%` | Signal-green chartreuse `74 82% 58%` |
| Accent | Roland-blue `215 55% 55%` (cool) | Parchment cream `38 32% 82%` (warm) |
| Display face | Departure Mono (pixel mono) | Fraunces (serif) |
| Heading | aliases display (mono) | aliases display (serif) |
| Body | IBM Plex Sans | Inter |
| Container max | 1400px | 1280px |
| Reading measure | 36rem | 34rem |
| Rule weights | hairline/medium/heavy (3) | hairline/medium (2) |
| Self-hosted fonts | Yes (Departure Mono + 4× IBM Plex Sans) | None in tokens file |
| Text glow | `--phosphor-glow` (amber halo) | none |
| Atmosphere | grain (fixed) + scanlines + vignette | paper-grain (absolute) only |
| Ticker font / speed | display / 80s / 0.12em | mono / 60s / 0.08em |
| Single-rule class name | `.rule-hairline` | `.rule-single` |
| `.rule-accent` glow | yes (box-shadow) | no |
| Card hover border change | yes (`.card-glow-hover`) | no |
| Signature motifs | signal-LED, dimension-bracket, panel-label, ticked rule | edit-mark (italic), dropcap, masthead rule |

**Shared utility-class names that exist in both (independently defined, not imported):** `.site-container`, `.rule-double`, `.rule-accent`, `.card-glow`, `.ticker` / `.ticker-track` / `.ticker-mark`, plus the `@keyframes ticker` animation and the reduced-motion guard. These are convergent by convention only — there is no shared CSS source; each site redefines them, sometimes with different values (e.g. ticker speed, `.rule-accent` glow).

**Convention-level shared rules (the de-facto design system, not formalized in code):**
- HSL-component color storage consumed via `hsl(var(--x) / a)`.
- Identical custom-property *names* across sites for the nine color roles + container/measure/rule/glow families + `--font-{display,body,mono,heading}`.
- `--font-heading: var(--font-display)` on both (headings = display face).
- `color-scheme: dark`, `2rem` container padding, `28rem` narrow measure, 1px hairline / 2px medium rule weights — all identical across both sites.
- Same ticker mechanic (`translateX(0 → -50%)`, span right-pad `3rem`, primary-colored mark), same reduced-motion respect.

These shared conventions are **not encoded anywhere shared** — they live only as duplicated declarations in two CSS files plus the `Brand` TS interface. That duplication is the gap a design-system-foundation feature would consolidate.

# audiocontrol.org — Design System

Status: load-bearing

Aesthetic direction: **service-manual / flight-instrumentation** — warm-ink background, warm cream foreground, phosphor-amber primary (VFD / flight-instrument glow), Roland-blue accent used sparingly, Departure Mono (Apollo-era pixel mono) as the display voice.

This doc records what is **settled and exists** for the audiocontrol site. It is grounded in two authoritative sources: `styles/design-tokens.css` (the CSS custom properties, `@font-face` declarations, and utility classes) and `brand.ts` (the TypeScript mirror, which holds only a subset). Where the two disagree, `design-tokens.css` is authoritative. Read this before any UI design or implementation on this site; see [Design Discipline](#see-also).

---

## 1. Color roles

All colors are stored as **HSL components** (`H S% L%`) and consumed via `hsl(var(--token) / alpha)`. Values below are quoted verbatim from `styles/design-tokens.css`. The first nine roles are mirrored in `brand.ts`; the badge tokens are CSS-only.

| Token | HSL value | Role |
|---|---|---|
| `--background` | `30 12% 7%` | Page background — warm near-black with a faint amber cast |
| `--card` | `30 14% 11%` | Raised cards / panels |
| `--card-hover` | `30 14% 14%` | Card hover surface |
| `--foreground` | `35 18% 88%` | Primary text — warm cream off-white (phosphor-on-ink, not grey-on-slate) |
| `--muted-foreground` | `30 10% 55%` | Secondary / muted text |
| `--primary` | `35 95% 62%` | Phosphor amber — the dominant chromatic voice (VFD / flight instrument) |
| `--accent` | `215 55% 55%` | Roland-blue — used sparingly for secondary accents and hover states |
| `--border` | `30 10% 18%` | Hairline borders |
| `--border-hover` | `30 10% 28%` | Border hover state |

**Badge colors** (defined in CSS only — absent from `brand.ts`):

| Token | HSL value | Role |
|---|---|---|
| `--badge-available` | `152 55% 55%` | "Available" badge text (green) |
| `--badge-available-bg` | `152 40% 13%` | "Available" badge background |
| `--badge-coming` | `35 80% 55%` | "Coming soon" badge text (amber) |
| `--badge-coming-bg` | `30 14% 14%` | "Coming soon" badge background |

`:root` also sets `color-scheme: dark`.

---

## 2. Typography

| Role | Token | Stack |
|---|---|---|
| Display | `--font-display` | `"Departure Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` |
| Body | `--font-body` | `"IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
| Mono | `--font-mono` | `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` |
| Heading | `--font-heading` | `var(--font-display)` — headings alias the display face |

**Self-hosted faces** (`woff2`, `font-display: swap`):

- **Departure Mono** — weight **400 only** (`/fonts/departure-mono-regular.woff2`). There is no bold variant; display text cannot be made heavier.
- **IBM Plex Sans** — weights **400, 500, 600, 700** (`/fonts/ibm-plex-sans-{400,500,600,700}.woff2`).

**There is no numeric type scale.** No `--text-*`, line-height, or weight tokens exist. Font sizes are hard-coded inside individual utility classes — for example `.panel-label` is `0.75rem` / weight `400`, and `.ticker-track` is `0.75rem`. Any new sizing follows the existing per-class literal pattern; there is no token to reach for.

---

## 3. Layout / spacing tokens

| Token | Value | Role |
|---|---|---|
| `--container-max-width` | `1400px` | Maximum content width (`.site-container`) |
| `--container-padding` | `2rem` | Horizontal/vertical container padding |
| `--measure-reading` | `36rem` | Long-form prose measure |
| `--measure-narrow` | `28rem` | Standalone essays / pull quotes |

There is **no general spacing scale** (no `--space-1..n`); spacing is hard-coded per class. **There are no radius tokens** — the only border-radius in the file is a literal `50%` on `.signal-led`.

---

## 4. Rule weights + glow

| Token | Value | Role |
|---|---|---|
| `--rule-hairline` | `1px` | Hairline rules and borders |
| `--rule-medium` | `2px` | Accent rules, bracket borders |
| `--rule-heavy` | `3px` | Heaviest rule weight |
| `--card-glow` | `0 0 0 1px hsl(var(--border)), 0 10px 36px -12px hsl(0 0% 0% / 0.65)` | Resting card shadow |
| `--card-glow-hover` | `0 0 0 1px hsl(var(--primary) / 0.35), 0 12px 44px -10px hsl(var(--primary) / 0.18)` | Amber-tinted hover shadow |
| `--phosphor-glow` | `0 0 14px hsl(var(--primary) / 0.35), 0 0 2px hsl(var(--primary) / 0.55)` | Amber text halo |

---

## 5. Code-only aesthetic motifs

These utility classes **are** the design language — settled patterns to reuse by class name, not re-invent. All live in `styles/design-tokens.css`.

- **`.site-container`** — full-width, centered, `max-width: var(--container-max-width)`, `padding: var(--container-padding)`, `box-sizing: border-box`. The page-width frame.

- **Rule utilities** (service-manual schematic vocabulary):
  - **`.rule-hairline`** — single 1px top border, `1.5rem 0` margin.
  - **`.rule-double`** — 1px top + 1px bottom border, `height: 5px`, `2rem 0` margin.
  - **`.rule-accent`** — the **signature accent rule**: short 3rem-wide 2px amber top border with `box-shadow: 0 0 8px hsl(var(--primary) / 0.4)` glow.
  - **`.rule-ticked`** — 1px background rule with vertical 1px×11px tick marks at both ends (via `::before`/`::after`), evoking fiducial marks on a schematic.

- **`.panel-label`** — the pixel-display voice: `--font-display`, `0.75rem`, weight 400, `letter-spacing: 0.14em`, uppercase, `--muted-foreground`. Use for eyebrows, meta labels, panel headers. Variant **`.panel-label--accent`** switches color to `--primary` and adds `text-shadow: var(--phosphor-glow)`.

- **`.dimension-bracket`** — section opener framed by top-left and top-right corner hairlines (18×18px, 2px borders, `hsl(var(--primary) / 0.6)`, drawn by pseudo-elements). Reads as a callout on a technical drawing.

- **`.signal-led`** — 8×8px amber dot, `border-radius: 50%`, phosphor-glow shadow, pulsing via `@keyframes signal-led-pulse` (2.4s, opacity 0.55↔1 with growing glow). A powered-on status lamp.

- **`.phosphor`** — amber text color (`--primary`) + `text-shadow: var(--phosphor-glow)`. The amber text-highlight treatment.

- **`.card-glow`** — applies `--card-glow`, transitions box-shadow + border-color over 0.3s; `:hover` applies `--card-glow-hover`. The variant `.card-glow-hover:hover` additionally sets `border-color: hsl(var(--primary) / 0.5)`.

- **Atmosphere — three isolated layers** (applied globally from `Layout.astro` via body classes; each is its own utility so a page can opt out):
  - **`.atmosphere-grain`** — fixed full-viewport `::before`, `z-index: 9998`, `opacity: 0.035`, warm radial-dot grain (`hsl(35 30% 70%)`, `background-size: 3px 3px`), `mix-blend-mode: overlay`.
  - **`.atmosphere-scanlines`** — fixed `::after`, `z-index: 9999`, repeating horizontal black stripes at `0.06` alpha, `mix-blend-mode: multiply` — whisper CRT/VFD refresh.
  - **`.atmosphere-vignette`** — body background: radial ellipse from warm `hsl(35 35% 10%)` (top) → `--background` (55%) → deep `hsl(30 15% 4%)` (120%), `background-attachment: fixed`.

- **Ticker** — `.ticker` (top + bottom hairline borders, `0.5rem 0` padding) wrapping `.ticker-track` (`--font-display`, `0.75rem`, `letter-spacing: 0.12em`, uppercase, muted; scrolls via `@keyframes ticker` translateX 0→-50% over 80s linear infinite). `.ticker-track > span` is right-padded `3rem`; `.ticker-mark` is colored `--primary`.

- **Legacy alias** — `@keyframes pulse-glow` (opacity 0.4↔1, 2s) + `.animate-pulse-glow`, kept for existing components.

- **Reduced motion** — `@media (prefers-reduced-motion: reduce)` disables animation on `.signal-led`, `.animate-pulse-glow`, and `.ticker-track`.

---

## 6. Components

### `ProjectCard.astro` — the only live card primitive

The single card-like primitive in active use, imported by the homepage (`pages/index.astro`) and the editors index (`pages/editors/index.astro`).

**Props:**

```ts
interface Props {
  name: string;
  description: string;
  status: 'available' | 'coming-soon';
  href?: string;
  image?: string;
  /** Terse spec line rendered under the title. Example: "1987 · 16-VOICE · 12-BIT". */
  meta?: string;
}
```

The **`status` union has exactly two members**: `'available' | 'coming-soon'`. Every behavioral branch derives from a single boolean, `isAvailable = status === 'available'`:

| Aspect | `available` | `coming-soon` |
|---|---|---|
| Root tag | `<a>` | `<div>` |
| `href` emitted | yes | no |
| Status value text | "Available" | "Pending" |
| CTA text | "Open Editor" | "In development" |
| Dimension-bracket corners | rendered | not rendered |
| CSS class | `.is-available` | `.is-coming-soon` |
| Visual treatment | full opacity, hover lift + amber glow + border + image zoom + amber CTA | `opacity: 0.62`, `cursor: default`, muted status value |

The status panel-label always renders as `STATUS: <value>` (the `:` is appended via `.card-status-label::after`). The `image` slot renders only when `image` is truthy (`.has-image`). The card image slot is CSS-driven (`height: 11rem`, `object-fit: cover`), so any aspect ratio crops to the panel.

### Orphaned components

`DeviceCard.astro` and `SpecsTable.astro` exist in `components/` but are **orphaned** — no `.astro` or `.md` file imports them (verified by grep in the UI-surface census). They are candidates for either adoption into the design system or removal; until then, do not treat them as settled primitives. The `/hardware` index inlines its own `.hardware-card` markup rather than using `DeviceCard.astro`.

---

## 7. Known drift (documented, not yet fixed)

These are honest gaps in the current state, flagged for the Phase 3 safe-fix task — recorded here so they are not mistaken for intentional design:

- **Per-site token duplication.** audiocontrol and editorialcontrol each re-declare the same custom-property *names* (the nine color roles, the container/measure/rule/glow families, `--font-{display,body,mono,heading}`) in their own standalone `:root`. There is no shared CSS token source. A few **structural values are identical** across both sites — `--container-padding: 2rem`, `--rule-hairline: 1px`, `--rule-medium: 2px`, and `--font-mono` (JetBrains Mono) — but they are duplicated, not shared.
- **No numeric type-scale or radius token set.** Font sizes live as per-class literals; the only radius is a hard-coded `50%` on `.signal-led`. New work has no token to reach for.
- **`--font-mono` has no `@font-face` in this file.** `--font-mono` references "JetBrains Mono", but no `@font-face` for it is declared in `styles/design-tokens.css` — it resolves via system fallback unless loaded elsewhere.
- **`brand.ts` is a partial mirror.** It carries only the nine `BrandColors` + three font stacks. Badge colors, rule-weight tokens, layout/measure tokens, glow tokens, and `--font-heading` exist only in the CSS. The mirror is a subset; the CSS is authoritative.

---

## 8. See also

- **[`../../../DESIGN-DECISIONS-PROTOCOL.md`](../../../DESIGN-DECISIONS-PROTOCOL.md)** (repo root) — the per-feature ACCEPTED / REJECTED exploration archive and `brief.md` contract. This DESIGN-SYSTEM doc is its per-site companion: this doc records what is *settled*; the protocol records what was *explored*. Neither subsumes the other.
- **[Design Discipline rule](../../../.claude/rules/design-discipline.md)** — read this and the protocol before any UI work; update this doc in the same commit as any global-pattern change.

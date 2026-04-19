/**
 * Shared Brand interface for all sites in this repo.
 *
 * Every site's `src/sites/<site>/brand.ts` exports a `brand: Brand` constant.
 * Color values are stored as HSL components (e.g. "220 20% 10%") matching
 * the --name: H S% L% convention used by the CSS custom properties in each
 * site's design-tokens.css. This lets us use `hsl(var(--primary) / 0.5)`
 * at will while keeping the literal color values authoritative in TS.
 *
 * The brand is the *data* contract between a site's subtree and anyone that
 * needs to read it (tests, build scripts, future shared layouts, etc). The
 * CSS tokens file is the visual contract — it must stay in sync with
 * brand.ts by construction. A future refactor can generate one from the
 * other; for now the two are hand-mirrored.
 */

export interface BrandColors {
  /** Page background — the deepest surface. */
  background: string;
  /** Raised cards and panels. */
  card: string;
  /** Card hover state. */
  cardHover: string;
  /** Primary text on the background. */
  foreground: string;
  /** Secondary / muted text. */
  mutedForeground: string;
  /**
   * Brand-identifying accent used for links, glows, highlights, and
   * tight typographic accents. The dominant chromatic voice.
   */
  primary: string;
  /**
   * Warm counter-accent. Used sparingly for emphasis — typographic
   * pulls, callouts, and the single-spot-of-warmth in an otherwise
   * cool palette.
   */
  accent: string;
  /** 1px borders and hairlines. */
  border: string;
  /** Hover state for borders. */
  borderHover: string;
}

export interface BrandTypography {
  /**
   * Display / headline / wordmark. The publication's typographic
   * identity lives here.
   */
  display: string;
  /** Body copy — long-form reading. */
  body: string;
  /** Code, metadata, and tabular numbers. */
  mono: string;
}

export interface Brand {
  /** Site slug matching the `src/sites/<site>/` directory name. */
  site: string;
  /** Canonical display name (e.g. "audiocontrol.org"). */
  name: string;
  /** One-line tagline suitable for header, footer, OG description. */
  tagline: string;
  colors: BrandColors;
  typography: BrandTypography;
}

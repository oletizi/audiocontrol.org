/**
 * audiocontrol.org brand tokens.
 *
 * Service-manual aesthetic: warm-ink background, warm off-white foreground,
 * phosphor amber primary (VFD / flight-instrumentation glow), Roland-blue
 * accent used sparingly. Display face is Departure Mono — a pixel monospace
 * with Apollo-era terminal lineage — reserved for wordmark, panel labels,
 * tickers, and small structural moments. Body copy rides on IBM Plex Sans
 * for readable long-form and UI. JetBrains Mono continues to carry code and
 * tabular meta.
 *
 * Mirrors `src/sites/audiocontrol/styles/design-tokens.css`. Any change here
 * must be reflected there (and vice versa).
 */

import type { Brand } from '../../shared/brand.js';

export const brand: Brand = {
  site: 'audiocontrol',
  name: 'audiocontrol.org',
  tagline: 'Open source audio tools.',
  colors: {
    /* Warm near-black — faint amber cast so the primary feels emergent. */
    background: '30 12% 7%',
    card: '30 14% 11%',
    cardHover: '30 14% 14%',
    /* Warm cream off-white — reads as phosphor-on-ink, not grey-on-slate. */
    foreground: '35 18% 88%',
    mutedForeground: '30 10% 55%',
    /* Phosphor amber — VFD/CRT glow, the dominant chromatic voice. */
    primary: '35 95% 62%',
    /* Roland-blue — reserved for sparse secondary accents and hover states. */
    accent: '215 55% 55%',
    border: '30 10% 18%',
    borderHover: '30 10% 28%',
  },
  typography: {
    /* Departure Mono (SIL OFL) — pixel mono with Apollo-era lineage.
     * Reserved for wordmark, eyebrows, panel labels, and tickers via
     * --font-display. Content headings use --font-heading (IBM Plex Sans). */
    display: '"Departure Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    body: '"IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
};

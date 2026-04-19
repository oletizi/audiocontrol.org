/**
 * editorialcontrol.org brand tokens.
 *
 * Publication-dark palette: ink-near-black background, signal-green
 * chartreuse primary (editorial highlight / tracked-changes feel),
 * warm parchment cream accent (the paper side of a publication).
 * Typography leans editorial via a serif display face (Fraunces).
 * Body stays on Inter for long-form reading; JetBrains Mono remains
 * for code and tabular meta.
 *
 * Mirrors `src/sites/editorialcontrol/styles/design-tokens.css`.
 */

import type { Brand } from '../../shared/brand.js';

export const brand: Brand = {
  site: 'editorialcontrol',
  name: 'editorialcontrol.org',
  tagline: 'A publication on building with AI agents.',
  colors: {
    /* Ink-near-black with a faint cool cast — feels like press ink on paper. */
    background: '215 22% 7%',
    card: '215 18% 11%',
    cardHover: '215 18% 14%',
    /* Warm off-white foreground — cream-on-ink rather than grey-on-ink. */
    foreground: '40 20% 90%',
    mutedForeground: '215 10% 55%',
    /* Signal-green chartreuse — editorial attention, tracked-changes mark. */
    primary: '74 82% 58%',
    /* Warm parchment cream — the paper accent, used for pull quotes / rules. */
    accent: '38 32% 82%',
    border: '215 14% 18%',
    borderHover: '215 14% 28%',
  },
  typography: {
    /* Serif display — Fraunces. Optical-size + italic variants give us
     * editorial pull-quote and wordmark treatments for free. */
    display: '"Fraunces", "Iowan Old Style", "Palatino", Georgia, serif',
    body: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
};

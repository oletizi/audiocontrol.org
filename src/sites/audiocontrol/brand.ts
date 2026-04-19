/**
 * audiocontrol.org brand tokens.
 *
 * Authoritative source of truth for the site's visual identity. Mirrors
 * `src/sites/audiocontrol/styles/design-tokens.css` — any change here
 * should be reflected there and vice versa. A future build step can
 * generate one from the other.
 */

import type { Brand } from '../../shared/brand.js';

export const brand: Brand = {
  site: 'audiocontrol',
  name: 'audiocontrol.org',
  tagline: 'Open source audio tools.',
  colors: {
    background: '220 20% 10%',
    card: '220 18% 13%',
    cardHover: '220 18% 16%',
    foreground: '210 20% 82%',
    mutedForeground: '215 12% 48%',
    primary: '174 60% 46%',
    accent: '4 70% 62%',
    border: '220 15% 20%',
    borderHover: '220 15% 30%',
  },
  typography: {
    display: '"JetBrains Mono", monospace',
    body: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
};

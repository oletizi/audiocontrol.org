/**
 * stackcontrol.org brand tokens.
 *
 * Identity: "Telemetry" — an industrial control-plane / live-orchestration
 * aesthetic. Near-black surface with a faint cool-blue cast, a single electric
 * cyan accent (the dominant chromatic voice), and a sparing cool-neutral
 * counter-accent. Typography pairs Archivo (heavy industrial grotesk display;
 * Archivo Expanded for the largest headlines) with IBM Plex Sans for body and
 * JetBrains Mono for telemetry, labels, and metadata.
 *
 * Distinct from its siblings by construction: the cyan accent is neither
 * audiocontrol's amber nor editorialcontrol's chartreuse, and the Archivo
 * display diverges from audiocontrol's technical sans and editorialcontrol's
 * Fraunces serif. Chosen via the Phase 2 /frontend-design pass (direction A).
 *
 * Mirrors `src/sites/stackcontrol/styles/design-tokens.css`.
 */

import type { Brand } from '../../shared/brand.js';

export const brand: Brand = {
  site: 'stackcontrol',
  name: 'stackcontrol.org',
  tagline: 'Lifecycle tooling for agentic development.',
  colors: {
    /* Near-black with a faint cool-blue cast — control-plane surface. */
    background: '200 28% 5%',
    card: '202 24% 9%',
    cardHover: '202 22% 13%',
    /* Cool off-white foreground (AA on background). */
    foreground: '195 18% 92%',
    mutedForeground: '200 12% 62%',
    /* Electric cyan — the dominant accent: links, glows, active nodes. */
    primary: '190 92% 56%',
    /* Cool neutral counter-accent — used sparingly for mono command echoes. */
    accent: '200 14% 74%',
    border: '200 18% 18%',
    borderHover: '190 40% 34%',
  },
  typography: {
    /* Archivo Expanded for the largest headlines, falling back to Archivo. */
    display: '"Archivo Expanded", "Archivo", system-ui, sans-serif',
    body: '"IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
};

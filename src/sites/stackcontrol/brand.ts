/**
 * stackcontrol.org brand tokens — PHASE 1 STUB.
 *
 * ⚠️ PROVISIONAL. This is a deliberately neutral placeholder palette so the
 * site builds and previews during scaffold (Phase 1). The real identity is
 * chosen in the Phase 2 `/frontend-design` pass and implemented in Phase 3,
 * at which point this file + `styles/design-tokens.css` are replaced with the
 * accepted direction (accent distinct from amber/audiocontrol and
 * chartreuse/editorialcontrol per `explorations/brief.md`).
 *
 * Mirrors `src/sites/stackcontrol/styles/design-tokens.css`.
 */

import type { Brand } from '../../shared/brand.js';

export const brand: Brand = {
  site: 'stackcontrol',
  name: 'stackcontrol.org',
  tagline: 'Lifecycle tooling for agentic development — product and devlog.',
  colors: {
    /* Neutral cool slate — provisional, replaced in Phase 3. */
    background: '220 16% 8%',
    card: '220 14% 12%',
    cardHover: '220 14% 15%',
    foreground: '220 15% 90%',
    mutedForeground: '220 8% 56%',
    /* Provisional steel accent — intentionally muted; NOT the chosen identity. */
    primary: '205 60% 60%',
    accent: '220 12% 70%',
    border: '220 12% 18%',
    borderHover: '220 12% 28%',
  },
  typography: {
    /* Provisional system stacks — the chosen display face lands in Phase 3. */
    display: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
};

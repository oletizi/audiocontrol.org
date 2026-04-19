# Workplan: audiocontrol.org Redesign

**Feature slug:** `audiocontrol-redesign`
**Branch:** `feature/audiocontrol-redesign`
**Milestone:** audiocontrol.org Redesign
**GitHub Issue:** oletizi/audiocontrol.org#79

## GitHub Tracking

| Phase | Issue |
|-------|-------|
| Parent | oletizi/audiocontrol.org#79 |
| Phase 1: Design Foundation | oletizi/audiocontrol.org#80 |
| Phase 2: Header, Footer, Navigation | oletizi/audiocontrol.org#81 |
| Phase 3: Homepage Redesign | oletizi/audiocontrol.org#82 |
| Phase 4: Content Pages | oletizi/audiocontrol.org#83 |

## Files Affected

- `src/sites/audiocontrol/styles/design-tokens.css` — expanded palette, typography, utilities
- `src/sites/audiocontrol/brand.ts` — new display typeface, refined colors
- `src/sites/audiocontrol/layouts/Layout.astro` — font loading, global styles, atmosphere
- `src/sites/audiocontrol/layouts/BlogLayout.astro` — updated typography
- `src/sites/audiocontrol/layouts/DocsLayout.astro` — updated typography
- `src/sites/audiocontrol/layouts/GuideLayout.astro` — updated typography
- `src/sites/audiocontrol/components/Header.astro` — wordmark, mobile nav, scroll behavior
- `src/sites/audiocontrol/components/Footer.astro` — colophon-style redesign
- `src/sites/audiocontrol/components/Logo.astro` — coherent wordmark treatment
- `src/sites/audiocontrol/components/ProjectCard.astro` — refined card design
- `src/sites/audiocontrol/pages/index.astro` — homepage redesign
- `src/sites/audiocontrol/pages/blog/index.astro` — blog index styling

## Implementation Phases

### Phase 1: Design Foundation — Tokens, Brand, Layout

**Status:** Complete (commit `c1bc552`, issue #80)

**Deliverable:** New design tokens, brand config, and base Layout.astro with the redesigned visual foundation

- [x] Select display typeface — **Departure Mono** (SIL OFL, Apollo-era pixel mono) for wordmark + h1/h2 + panel labels; **IBM Plex Sans** for body + h3+
- [x] Update `brand.ts` with new display typeface and warm Service-Manual palette (warm ink bg, phosphor amber primary, Roland-blue accent)
- [x] Update `design-tokens.css` with new palette and full utility set (rules, panel labels, dimension bracket, signal LED, phosphor text, ticker, scanlines, grain, vignette)
- [x] Update `Layout.astro` with self-hosted font preloads, heading stack, atmosphere classes on body, z-indexed content stacking
- [x] Verify all existing pages render correctly (home, blog index, blog post, device page, docs, mobile)

**Acceptance Criteria:**
- [x] New display typeface is loaded and applied to headings
- [x] Color palette has warmth and atmosphere (not flat solid background)
- [x] Design tokens include rule utilities, section markers, and atmospheric effects
- [x] All existing pages render without breakage

### Phase 2: Header, Footer, Navigation

**Status:** Complete (issue #81)

**Deliverable:** Redesigned header with coherent wordmark and working mobile nav, informative footer

- [x] Redesign Header component with Departure Mono wordmark, amber signal-LED indicator, `SIG: LIVE` panel-label meta, underline-on-hover nav, scroll-compress
- [x] Redesign Footer as four-column colophon (Mark / Projects / Sibling / Community) with build panel-label bottom row
- [x] Rewrite Logo.astro: retires 80s-neon pixel-art alien; new `indicator` (pulsing amber LED) and `glyph` (5x5 amber "A" monogram) variants fit the instrumentation aesthetic
- [x] Mobile hamburger toggle: animated bars → X, aria-expanded, Escape/link-click close, stacks nav below header
- [x] Scroll-responsive header: padding compresses and tagline collapses above 10px scroll

**Acceptance Criteria:**
- [x] Wordmark uses the display typeface and feels coherent with the site
- [x] Mobile navigation is accessible and functional
- [x] Footer includes project links, sibling site, community channels
- [x] Header contracts on scroll with smooth transitions

### Phase 3: Homepage Redesign

**Status:** Complete (issue #82)

**Deliverable:** Homepage with narrative structure: hero, project showcase, blog highlights

- [x] Hero masthead: panel-label eyebrow with signal-LED, phosphor-amber headline, mission paragraph, primary/ghost CTA buttons, ticked rule, 4-up spec-stat row (Available / In development / Stack / Install)
- [x] ProjectCard redesign: dimension-bracket corners, panel-label `STATUS: AVAILABLE/PENDING`, spec-meta line ("1987 · 16-voice · 12-bit"), amber CTA with arrow
- [x] Two-tier projects grid: Available Now (2-col featured) + In Development (3-col small)
- [x] Latest Writing list: top-3 blog posts sourced from shared `data/blog-posts.ts`, date/title/excerpt rows with "Read article →" hover reveal
- [x] Community Channels: 3-card grid for GitHub / Discord / YouTube with panel-label eyebrows

**Acceptance Criteria:**
- [x] Homepage has clear visual hierarchy and narrative flow
- [x] Projects are presented with context (spec meta, status label), not just a flat grid
- [x] Recent blog posts surfaced on the homepage
- [x] Layout is responsive and works on mobile

### Phase 4: Content Pages — Blog, Docs, Hardware, Device Pages

**Deliverable:** All content pages updated to use the new design language

- [ ] Update BlogLayout.astro with new typography and reading experience
- [ ] Update blog index page styling
- [ ] Update DocsLayout.astro and docs pages
- [ ] Update GuideLayout.astro and device pages
- [ ] Update hardware index page
- [ ] Visual review of all pages in desktop and mobile viewports

**Acceptance Criteria:**
- Blog posts have refined reading typography (line height, measure, heading styles)
- All content pages feel cohesive with the new design
- Device pages and docs maintain their information structure with improved presentation
- No broken layouts or missing styles on any page

## Verification Checklist

- [ ] `npm run build` succeeds
- [ ] All pages render correctly in desktop viewport
- [ ] All pages render correctly in mobile viewport
- [ ] Editor proxy paths still work (`/roland/s330/editor`, etc.)
- [ ] No broken images or missing fonts
- [ ] Navigation works on mobile
- [ ] Footer is informative and well-structured
- [ ] Visual review confirms cohesive design language across all pages

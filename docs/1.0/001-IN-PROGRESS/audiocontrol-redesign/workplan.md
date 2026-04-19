# Workplan: audiocontrol.org Redesign

**Feature slug:** `audiocontrol-redesign`
**Branch:** `feature/audiocontrol-redesign`
**Milestone:** audiocontrol.org Redesign

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

**Deliverable:** New design tokens, brand config, and base Layout.astro with the redesigned visual foundation

- [ ] Use `/frontend-design` to explore and select a display typeface for the audiocontrol domain
- [ ] Update `brand.ts` with new display typeface, refined color palette
- [ ] Update `design-tokens.css` with new palette, typographic utilities (rules, measures, atmospheric effects)
- [ ] Update `Layout.astro` with new font loading, global styles, background atmosphere
- [ ] Verify all existing pages render correctly with the new foundation

**Acceptance Criteria:**
- New display typeface is loaded and applied to headings
- Color palette has warmth and atmosphere (not flat solid background)
- Design tokens include rule utilities, section markers, and atmospheric effects
- All existing pages render without breakage

### Phase 2: Header, Footer, Navigation

**Deliverable:** Redesigned header with coherent wordmark and working mobile nav, informative footer

- [ ] Use `/frontend-design` to redesign the Header component with new wordmark and mobile navigation
- [ ] Use `/frontend-design` to redesign the Footer as an informative colophon
- [ ] Update Logo.astro with a coherent wordmark treatment using the display typeface
- [ ] Ensure mobile navigation is functional (not hidden)
- [ ] Add scroll-responsive header behavior matching editorialcontrol's quality

**Acceptance Criteria:**
- Wordmark uses the display typeface and feels coherent with the site
- Mobile navigation is accessible and functional
- Footer includes project links, sibling site, community channels
- Header contracts on scroll with smooth transitions

### Phase 3: Homepage Redesign

**Deliverable:** Homepage with narrative structure: hero, project showcase, blog highlights

- [ ] Use `/frontend-design` to redesign the homepage with hero/masthead section
- [ ] Redesign project cards with richer presentation
- [ ] Add blog highlights section showing recent posts
- [ ] Add community/contribution section
- [ ] Ensure responsive layout works across viewports

**Acceptance Criteria:**
- Homepage has clear visual hierarchy and narrative flow
- Projects are presented with context, not just a flat grid
- Recent blog posts are surfaced on the homepage
- Layout is responsive and works on mobile

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

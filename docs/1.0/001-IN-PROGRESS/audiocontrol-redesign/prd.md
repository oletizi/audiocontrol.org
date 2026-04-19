# PRD: audiocontrol.org Redesign

## Problem Statement

audiocontrol.org's visual design is generic dark-mode with no typographic identity, no compositional ambition, and no atmospheric detail. The homepage is a flat card grid with no narrative. The logo (pixel-art CRT aesthetic) exists in a completely different visual universe from the rest of the site (clean-minimal dark). The sibling site editorialcontrol.org — built on the same stack — demonstrates that the architecture can support genuinely distinctive design. audiocontrol.org needs a redesign that brings it up to par: a coherent visual identity rooted in its domain (vintage audio hardware, open source tools), with the same level of typographic craft and atmospheric detail.

## Goals

- Establish a distinctive visual identity rooted in the vintage audio hardware domain
- Match editorialcontrol.org's level of typographic craft and atmospheric detail
- Create a homepage with narrative structure (not just a card grid)
- Unify the site's aesthetic (logo, typography, color, layout speaking the same language)
- Fix mobile navigation

## Acceptance Criteria

- A distinctive display typeface replaces JetBrains Mono for headings and the wordmark
- The color palette retains the dark theme but gains warmth and atmosphere (background texture, vignette, refined foreground tones)
- The homepage has narrative structure: hero/masthead, project showcase with editorial context, blog highlights, community links
- The logo/wordmark treatment is coherent with the site's design tokens (no isolated pixel-art-in-a-vacuum)
- The footer is informative: project links, sibling site, community channels, colophon
- Mobile navigation works (no `display: none` on nav)
- Design tokens include typographic utilities (rules, section markers, atmospheric effects) matching editorialcontrol's level of craft
- All existing pages (blog, docs, hardware, editors, device pages) work with the new design
- The editor proxy paths (`/roland/s330/editor`, etc.) are unaffected
- The site passes visual review in both desktop and mobile viewports

## Out of Scope

- Content changes (blog posts, docs, device page copy)
- New pages or new content types
- Changes to editorialcontrol.org
- SEO or structured data changes (unless layout changes require meta tag updates)
- Editor application code (proxied from separate apps)
- Analytics or tracking changes

## Technical Approach

### Design Audit — Current Weaknesses

| Dimension | Current State | Target |
|-----------|--------------|--------|
| Display typeface | JetBrains Mono (same as code) | Distinctive display face for the domain |
| Typographic devices | None | Rules, section markers, atmospheric effects |
| Color warmth | Cool grey foreground | Warm, atmospheric |
| Background atmosphere | Flat solid | Texture, vignette, depth |
| Homepage | "Projects" + card grid | Masthead, narrative, highlights |
| Logo coherence | Pixel art in isolated aesthetic | Wordmark in brand typeface |
| Footer | Centered text + icons | Informative colophon |
| Mobile nav | Hidden entirely | Functional |
| CSS utilities | Card glow, pulse | Full typographic utility set |

### Strategy

1. Use the `/frontend-design` plugin to generate the new design for each component/page
2. Start with design tokens and brand.ts — establish the new palette, typography, and utilities before touching components
3. Work from the inside out: Layout.astro → Header/Footer → Homepage → remaining pages
4. Preserve existing page structure and content — this is a visual redesign, not a content restructure
5. The pixel-art logo can be preserved as an icon/favicon but the wordmark should use the display typeface

### Dependencies

- `/frontend-design` plugin for design generation
- Existing site content and page structure (preserved, not changed)
- editorialcontrol.org as design quality reference (sibling, not clone — different aesthetic direction)

### Open Questions

- What display typeface fits the vintage audio hardware domain? Candidates to explore: something that evokes studio equipment, technical instrumentation, or retro-analog without being kitschy
- Should the pixel-art logo be retired entirely, or retained as a favicon/icon element alongside a typographic wordmark?
- How much of the CRT/retro aesthetic from the current logo should bleed into the site design vs. going in a different direction?

## References

- Sibling site for quality reference: editorialcontrol.org (`src/sites/editorialcontrol/`)
- Current design tokens: `src/sites/audiocontrol/styles/design-tokens.css`
- Current brand: `src/sites/audiocontrol/brand.ts`

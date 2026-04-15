# Palette Redesign - Product Requirements Document

**Created:** 2026-02-10
**Status:** Approved
**Owner:** Orion Letizi

## Problem Statement

The current audiocontrol.org site design lacks visual sophistication and doesn't effectively showcase the available audio tools. The existing design doesn't create the professional, modern aesthetic that reflects the quality of the underlying projects.

A new design prototype has been created in the `audiocontrol-org/audiocontrol-palette-design` repository using Lovable/shadcn-ui components. This design establishes a dark theme with accent colors, monospace typography, and subtle glow effects that better represent the technical nature of the project.

## User Stories

- As a visitor, I want a visually appealing landing page so that I can quickly understand what audiocontrol.org offers
- As a visitor, I want to see which projects are available vs coming soon so that I know what I can use today
- As a visitor, I want easy navigation to different sections (Blog, Hardware, Docs, Editors) so that I can find relevant information
- As a returning user, I want a consistent visual identity across the site so that I feel confident in the project's professionalism

## Success Criteria

- [ ] New dark theme applied site-wide
- [ ] Project cards display availability status (Available / Coming Soon)
- [ ] Header with logo, tagline, and navigation implemented
- [ ] Footer with branding implemented
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] JetBrains Mono font for monospace elements
- [ ] CSS custom properties match the design palette
- [ ] Glow/pulse animations on interactive elements

## Scope

### In Scope

- Migrate color palette from design prototype to Astro
- Implement Header component with logo and navigation
- Implement ProjectCard component with status badges
- Implement Footer component
- Create home page layout matching prototype
- Add responsive breakpoints
- Integrate CSS custom properties (HSL color system)
- Add glow and pulse animations

### Out of Scope

- Blog page redesign (separate feature)
- Hardware page content
- Docs page content
- Editors page content
- New project additions (use existing project list)

## Dependencies

- Source design: `audiocontrol-org/audiocontrol-palette-design` repository
- Target site: `oletizi/audiocontrol.org` (Astro-based)
- shadcn/ui conventions (CSS custom properties, HSL colors)

## Design System Reference

### Color Palette (HSL values from prototype)

| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | 220 20% 10% | Page background |
| `--foreground` | 210 20% 82% | Primary text |
| `--card` | 220 18% 13% | Card backgrounds |
| `--primary` | 4 70% 62% | Accent color (coral) |
| `--accent` | 174 60% 46% | Secondary accent (teal) |
| `--muted-foreground` | 215 12% 48% | Secondary text |
| `--border` | 220 15% 20% | Border color |

### Typography

- **Display/headings:** JetBrains Mono
- **Body text:** Inter (or system sans-serif)
- **Monospace elements:** JetBrains Mono

### Components from Prototype

1. **Header** - Logo with animated dots, site title, navigation links
2. **ProjectCard** - Title, description, status badge, hover glow effect
3. **Footer** - Simple centered branding line

## Open Questions

- [x] Should we keep shadcn/ui structure or simplify for Astro? → Simplify for Astro, keep CSS variables
- [x] Are additional pages (Blog, Hardware, etc.) in scope? → No, home page only for this feature

## Appendix

### Source Repository

- URL: https://github.com/audiocontrol-org/audiocontrol-palette-design
- Stack: Vite + React + shadcn/ui + Tailwind
- Key files:
  - `src/index.css` - CSS custom properties and theme
  - `src/pages/Index.tsx` - Home page layout
  - `src/components/Header.tsx` - Header component
  - `src/components/ProjectCard.tsx` - Project card component

### Target Repository

- URL: https://github.com/oletizi/audiocontrol.org
- Stack: Astro + Tailwind
- Current structure: `src/pages/`, `src/components/`, `src/layouts/`

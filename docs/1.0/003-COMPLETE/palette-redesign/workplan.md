# Palette Redesign - Workplan

**Feature slug:** `palette-redesign`
**Branch:** `feature/palette-redesign`
**Worktree:** `~/work/audiocontrol-work/audiocontrol.org-palette-redesign/`

---

## GitHub Tracking

**GitHub Milestone:** [Week of Feb 10-14](https://github.com/oletizi/audiocontrol.org/milestone/3)
**GitHub Issues:**

- [Parent: [site] Palette Redesign (#19)](https://github.com/oletizi/audiocontrol.org/issues/19)
- [Add CSS design tokens and font imports (#20)](https://github.com/oletizi/audiocontrol.org/issues/20)
- [Create Header component (#21)](https://github.com/oletizi/audiocontrol.org/issues/21)
- [Create ProjectCard component (#22)](https://github.com/oletizi/audiocontrol.org/issues/22)
- [Create Footer component (#23)](https://github.com/oletizi/audiocontrol.org/issues/23)
- [Integrate components into home page (#24)](https://github.com/oletizi/audiocontrol.org/issues/24)
- [Final polish and cross-browser testing (#25)](https://github.com/oletizi/audiocontrol.org/issues/25)

---

## Implementation Phases

### Phase 1: CSS Foundation

**Goal:** Establish the design system foundation

**Tasks:**

1. Create `src/styles/design-tokens.css` with CSS custom properties
   - Background, foreground, card colors
   - Primary (coral) and accent (teal) colors
   - Border, muted, and surface colors
   - Badge colors for status indicators

2. Add font imports (JetBrains Mono, Inter)

3. Create utility classes for glow effects
   - `.card-glow` - Default card shadow
   - `.card-glow-hover` - Hover state with primary glow
   - `.animate-pulse-glow` - Animated pulse for status dots

**Success criteria:**
- All CSS custom properties defined
- Fonts loading correctly
- Utility classes working in isolation

### Phase 2: Component Implementation

**Goal:** Create reusable Astro components matching the design

**Tasks:**

1. Create `src/components/Header.astro`
   - Animated dot indicators
   - Site title with styled ".org"
   - Tagline text
   - Navigation links (Blog, Hardware, Docs, Editors)
   - Responsive mobile menu (optional, can be collapsed)

2. Create `src/components/ProjectCard.astro`
   - Props: name, description, status, href
   - Status badge (Available / Coming Soon)
   - Hover glow effect for available projects
   - Link wrapper for available projects

3. Create `src/components/Footer.astro`
   - Simple centered branding line
   - Border top styling

**Success criteria:**
- Components render correctly in isolation
- Props interface matches design requirements
- Hover states working

### Phase 3: Home Page Integration

**Goal:** Assemble components into the home page

**Tasks:**

1. Update `src/layouts/Layout.astro`
   - Import design tokens CSS
   - Apply dark background to body
   - Set default font families

2. Update `src/pages/index.astro`
   - Import Header, Footer, ProjectCard
   - Create Projects section with heading
   - Render project cards in grid
   - Add responsive grid breakpoints

3. Define project data
   - Roland S-330 (available)
   - Akai S3000XL (coming soon)
   - Akai S5000 (coming soon)
   - Roland JV-1080 (coming soon)

**Success criteria:**
- Home page matches design prototype
- Responsive layout works on mobile/tablet/desktop
- Project cards link correctly for available projects

### Phase 4: Polish and Verification

**Goal:** Final refinements and cross-browser testing

**Tasks:**

1. Verify color contrast accessibility
2. Test on Chrome, Firefox, Safari
3. Test responsive breakpoints
4. Verify font loading performance
5. Check animation performance
6. Update any stale navigation links

**Success criteria:**
- All success criteria from PRD met
- No visual regressions
- Animations smooth at 60fps

---

## Task Breakdown for GitHub Issues

| Issue | Title | Phase |
|-------|-------|-------|
| Parent | [site] Palette Redesign | - |
| 1 | Add CSS design tokens and font imports | 1 |
| 2 | Create Header component | 2 |
| 3 | Create ProjectCard component | 2 |
| 4 | Create Footer component | 2 |
| 5 | Integrate components into home page | 3 |
| 6 | Final polish and cross-browser testing | 4 |

---

## Technical Notes

### CSS Custom Properties (from prototype)

```css
:root {
  --background: 220 20% 10%;
  --foreground: 210 20% 82%;
  --card: 220 18% 13%;
  --primary: 4 70% 62%;
  --accent: 174 60% 46%;
  --muted-foreground: 215 12% 48%;
  --border: 220 15% 20%;
  --badge-available: 152 60% 42%;
  --badge-coming: 220 15% 30%;
}
```

### Component Props Interfaces

```typescript
// Header - no props needed

// ProjectCard
interface ProjectCardProps {
  name: string;
  description: string;
  status: "available" | "coming-soon";
  href?: string;
}

// Footer - no props needed
```

### Project Data

```typescript
const projects = [
  {
    name: "Roland S-330",
    description: "Web-based editor for the Roland S-330 12-bit sampler",
    status: "available",
    href: "https://audiocontrol.org/roland/s330/editor",
  },
  {
    name: "Akai S3000XL",
    description: "Web-based editor for the Akai S3000XL sampler",
    status: "coming-soon",
  },
  {
    name: "Akai S5000",
    description: "Web-based editor for the Akai S5000/S6000 samplers",
    status: "coming-soon",
  },
  {
    name: "Roland JV-1080",
    description: "Web-based editor for the Roland JV-1080 synthesizer module",
    status: "coming-soon",
  },
];
```

---

## Dependencies

- Design prototype: https://github.com/audiocontrol-org/audiocontrol-palette-design
- Tailwind CSS (already in project)
- Google Fonts (JetBrains Mono, Inter)

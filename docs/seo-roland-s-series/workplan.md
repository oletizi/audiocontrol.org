# Workplan: SEO Content — Roland S-Series Samplers

**Feature slug:** `seo-roland-s-series`
**Branch:** `feature/seo-roland-s-series`
**Milestone:** SEO Roland S-Series Content

## Implementation Steps

### 1. Create GuideLayout and reusable components

- `src/layouts/GuideLayout.astro` — based on DocsLayout, uses `guide-article` class, passes `type="article"` to Layout
- `src/components/DeviceCard.astro` — card with name, path, description, optional image
- `src/components/SpecsTable.astro` — table from array of `{ label, value }` entries

### 2. Create S-330 content hub page

- `src/pages/roland/s330/index.astro`
- Sections: hero, specs table, editor CTA, accessories (MU-1 + RC-100 cards), related devices (S-550, S-770, W-30 cards), further reading
- Product JSON-LD via `<Fragment slot="head">`
- Reuses existing images: `s-330-feature.jpg`, `s330-screenshot.jpg`, `mu-1.jpg`, `rc-100.jpg`

### 3. Create S-330 accessory guides

- `src/pages/roland/s330/mu-1-mouse.md` — MU-1 mouse history, MSX protocol, compatible hardware, alternatives, web editor as modern replacement
- `src/pages/roland/s330/rc-100.md` — RC-100 design, controls, workflow comparison with mouse, availability, alternatives

### 4. Create related device overview pages

- `src/pages/roland/s550/index.md` — S-550 specs, history, comparison to S-330, RGB display advantage
- `src/pages/roland/s770/index.md` — S-770 specs, history, 16-bit vs 12-bit, relationship to earlier models
- `src/pages/roland/w30/index.md` — W-30 specs, history, workstation concept, cultural impact

### 5. Create Roland S-Series blog post

- `src/pages/blog/roland-s-series-samplers/index.md`
- Narrative covering all S-series models, the 12-bit sound, control hardware problem, web editor, and buying guide
- Cross-links to all device pages, accessory guides, and existing content

### 6. Update navigation, cross-links, and structured data

- `src/layouts/Layout.astro`:
  - Add optional `jsonLd` prop (falls back to Organization JSON-LD)
  - Add "Hardware" dropdown between Blog and Docs
  - Add new blog post to Blog dropdown
- `src/pages/blog/free-roland-s330-sampler-editor/index.md`:
  - Link S-550, W-30, MU-1, RC-100 mentions to new pages
  - Add "Related Content" section
- `src/pages/docs/roland/samplers/s-330/index.md`:
  - Add "See Also" section linking to S-330 hub and related content

## URL Structure

| URL | Source File | Type |
|-----|------------|------|
| `/roland/s330/` | `src/pages/roland/s330/index.astro` | Hub page |
| `/roland/s330/mu-1-mouse` | `src/pages/roland/s330/mu-1-mouse.md` | Guide |
| `/roland/s330/rc-100` | `src/pages/roland/s330/rc-100.md` | Guide |
| `/roland/s550/` | `src/pages/roland/s550/index.md` | Guide |
| `/roland/s770/` | `src/pages/roland/s770/index.md` | Guide |
| `/roland/w30/` | `src/pages/roland/w30/index.md` | Guide |
| `/blog/roland-s-series-samplers/` | `src/pages/blog/roland-s-series-samplers/index.md` | Blog post |

## Verification Checklist

- [ ] `npm run build` succeeds
- [ ] All new URLs load correctly
- [ ] `/roland/s330/editor` proxy still works (no conflict)
- [ ] Navigation dropdowns include new pages
- [ ] Cross-links work between new and existing content
- [ ] OG tags and JSON-LD present in page source
- [ ] Sitemap includes new pages

# UI-Surface Census — Both Sites (design-system-foundation discovery 02)

Exhaustive census of every page, component, layout, and shared module across
both sites in the monorepo, grounded in the actual files on disk. The repo hosts
two Astro sites under `src/sites/`:

- `audiocontrol/` — audiocontrol.org (hardware/editor hub)
- `editorialcontrol/` — editorialcontrol.org (publication + Feature Image Studio)

Plus one cross-site dev component (`src/components/dev/OGPreview.astro`) and
shared modules in `src/shared/`.

## Count Summary

| Site | Pages | User-facing pages | Dev-only pages | Components | Layouts |
|------|-------|-------------------|----------------|-----------|---------|
| audiocontrol | 15 | 13 | 2 | 6 | 4 |
| editorialcontrol | 21 | 5 | 16 | 4 + 4 studio clients | 3 |
| (cross-site) | — | — | — | 1 (`components/dev/OGPreview.astro`, dev-only) | — |
| shared (`src/shared/`) | — | — | — | 6 modules | — |

Notes on the counts:
- audiocontrol pages: 8 `.astro` + 7 `.md`. Dynamic route `blog/[slug].astro`
  counts as one page surface (fans out to N blog posts).
- editorialcontrol pages: 12 `.astro` + 6 API `.ts` routes + 1 `robots.txt.ts`
  + 2 dynamic. All 6 API routes and the `dev/**` tree are dev-only (guarded by
  `import.meta.env.PROD` 404/redirect or `/dev` / `/api/dev` route prefix).
- "Components" for editorialcontrol counts 4 `.astro` components (Footer, Header,
  Logo, studio/ProgressTape) plus 4 client-side TS controllers under
  `components/studio/` (focus, gallery, generate, templates clients).

Pilot-relevant finding: the only card-like primitive in active use is
**`audiocontrol/components/ProjectCard.astro`**, imported by the homepage
(`index.astro`) and the editors index. `DeviceCard.astro` and `SpecsTable.astro`
exist but are **orphaned** — no `.astro` or `.md` file references them anywhere
(verified by grep). The homepage pilot will touch ProjectCard.

---

## Site: audiocontrol (audiocontrol.org)

### Pages (15)

| Path | Route | Facing | Purpose | Component reuse |
|------|-------|--------|---------|-----------------|
| `pages/index.astro` | `/` | user | Homepage — hero + project grid for the vintage-sampler editors | `Layout`, **`ProjectCard`** |
| `pages/blog/index.astro` | `/blog/` | user | Blog index — "Notes from the workbench" post list | `Layout` |
| `pages/blog/[slug].astro` | `/blog/<slug>/` (dynamic, per published blog entry) | user | Single blog post renderer; `getStaticPaths` over `blog` collection (PROD = published only) | `BlogLayout` |
| `pages/hardware/index.astro` | `/hardware/` | user | Hardware index — "The rack units we write software for" | `Layout` (no card component; inline markup) |
| `pages/docs/index.astro` | `/docs/` | user | Docs index — "Operation guides for every editor" | `Layout` |
| `pages/docs/roland/samplers/s-330/index.md` | `/docs/roland/samplers/s-330/` | user | Roland S-330 web editor documentation/guide | `DocsLayout` (via frontmatter) |
| `pages/editors/index.astro` | `/editors/` | user | Editors index — "Web editors for the rack" | `Layout`, **`ProjectCard`** |
| `pages/roland/s330/index.md` | `/roland/s330/` | user | Roland S-330 device guide (specs, history, editor) | `GuideLayout` |
| `pages/roland/s330/mu-1-mouse.md` | `/roland/s330/mu-1-mouse/` | user | Roland MU-1 mouse accessory guide | `GuideLayout` |
| `pages/roland/s330/rc-100.md` | `/roland/s330/rc-100/` | user | Roland RC-100 remote controller guide | `GuideLayout` |
| `pages/roland/s550/index.md` | `/roland/s550/` | user | Roland S-550 device guide | `GuideLayout` |
| `pages/roland/s770/index.md` | `/roland/s770/` | user | Roland S-770 device guide | `GuideLayout` |
| `pages/roland/w30/index.md` | `/roland/w30/` | user | Roland W-30 device guide | `GuideLayout` |
| `pages/dev/index.astro` | `/dev/` | **dev-only** | Stub — "Moved." Dev surfaces relocated to editorialcontrol | `Layout` |
| `pages/og-preview.astro` | `/og-preview/` | **dev-only** | OG-image preview grid; top comment says "for development only", `<meta name="robots" content="noindex">` | none (standalone HTML) |

Ambiguity judgments (audiocontrol):
- `dev/index.astro` — under `/dev`, explicit "Moved." stub → dev-only.
- `og-preview.astro` — NOT under `/dev`, but the file's own comment declares
  "for development only" and it emits `robots: noindex` → judged dev-only on
  intent + noindex, despite the top-level route.
- All `roland/**` and `docs/**` markdown, blog, hardware, editors → user-facing
  (public content routes, no dev guards).

### Components (6)

| Path | Purpose | Used by |
|------|---------|---------|
| `components/ProjectCard.astro` | **Card-like** service-manual product callout (status panel-label, spec-meta line, dimension-bracket corners, amber CTA). Props: `name, description, status, href?, image?, meta?` | `pages/index.astro`, `pages/editors/index.astro` — **pilot target** |
| `components/DeviceCard.astro` | Card-like device link (Props: `name, path, …`) | **ORPHANED** — no importers found |
| `components/SpecsTable.astro` | Spec key/value table (Props: `label, value` rows) | **ORPHANED** — no importers found |
| `components/Header.astro` | Sticky site header (imports `Logo`) | `layouts/Layout.astro` |
| `components/Footer.astro` | Site footer (imports `Logo`) | `layouts/Layout.astro` |
| `components/Logo.astro` | Brand logo; Props: `variant?: 'indicator' \| 'glyph'`, `size?` | `Header`, `Footer` |

### Layouts (4)

| Path | Purpose | Composition |
|------|---------|-------------|
| `layouts/Layout.astro` | Base shell — head/meta + `Header` + `Footer` | imports `Header`, `Footer` |
| `layouts/BlogLayout.astro` | Blog-post chrome (hero image via `astro:assets`, headings); wires `initLightbox` from `shared/lightbox.ts` | wraps `Layout` |
| `layouts/DocsLayout.astro` | Docs-page chrome | wraps `Layout` |
| `layouts/GuideLayout.astro` | Device-guide chrome (used by all `roland/**` md) | wraps `Layout` |

---

## Site: editorialcontrol (editorialcontrol.org)

### Pages (21)

User-facing content pages (5):

| Path | Route | Facing | Purpose | Component reuse |
|------|-------|--------|---------|-----------------|
| `pages/index.astro` | `/` | user | Homepage — masthead for the AI-agents publication | `Layout`, `Logo` |
| `pages/about.astro` | `/about/` | user | About / essay page | `Layout` |
| `pages/contact.astro` | `/contact/` | user | Contact page | `Layout` |
| `pages/blog/index.astro` | `/blog/` | user | "The desk" — dispatch (post) index | `Layout` |
| `pages/blog/[slug].astro` | `/blog/<slug>/` (dynamic, per published entry) | user | Single dispatch renderer; `getStaticPaths` over `blog` collection (PROD = published only) | `BlogLayout` |

Dev-only pages (16) — all under `/dev`, `/api/dev`, or PROD-guarded:

| Path | Route | Facing | Purpose | Component reuse |
|------|-------|--------|---------|-----------------|
| `pages/dev/index.astro` | `/dev/` | dev-only | Index of local development surfaces | `Layout` |
| `pages/dev/og-preview.astro` | `/dev/og-preview/` | dev-only | Social-share composite preview | `Layout` |
| `pages/dev/feature-image-bake.astro` | `/dev/feature-image-bake/` | dev-only | Headless bake target rendering `OGPreview` from query params | `OGPreview` (cross-site dev comp) |
| `pages/dev/feature-image-preview.astro` | `/dev/feature-image-preview/` | dev-only | Redirect stub → `/dev/studio` (PROD 404) | none |
| `pages/dev/studio/index.astro` | `/dev/studio/` | dev-only | Feature Image Studio — Gallery / History tab | `StudioLayout` |
| `pages/dev/studio/generate.astro` | `/dev/studio/generate/` | dev-only | Studio — Generate tab | `StudioLayout` |
| `pages/dev/studio/help.astro` | `/dev/studio/help/` | dev-only | Studio — Help / manual tab | `StudioLayout` |
| `pages/dev/studio/templates.astro` | `/dev/studio/templates/` | dev-only | Studio — prompt Templates tab | `StudioLayout` |
| `pages/dev/studio/proto/progress.astro` | `/dev/studio/proto/progress/` | dev-only | ProgressTape reel-harness prototype | `StudioLayout` (+ `ProgressTape`) |
| `pages/dev/studio/focus/[id].astro` | `/dev/studio/focus/<id>/` (dynamic) | dev-only | Studio focus canvas — OGPreview hero + DIP-switch params + thread composer (PROD-guarded, `prerender=false`) | `StudioLayout`, `OGPreview` |
| `pages/dev/studio/focus/index.astro` | `/dev/studio/focus/` | dev-only | Bare focus URL → redirect to gallery (PROD 404) | none |
| `pages/api/dev/feature-image/generate.ts` | `/api/dev/feature-image/generate` | dev-only | API: generate a feature image (POST) | n/a |
| `pages/api/dev/feature-image/log.ts` | `/api/dev/feature-image/log` | dev-only | API: read/update generation log (GET/PATCH) | n/a |
| `pages/api/dev/feature-image/recomposite.ts` | `/api/dev/feature-image/recomposite` | dev-only | API: re-bake variants from existing raw | n/a |
| `pages/api/dev/feature-image/templates.ts` | `/api/dev/feature-image/templates` | dev-only | API: prompt-template CRUD/fork | n/a |
| `pages/api/dev/feature-image/threads.ts` | `/api/dev/feature-image/threads` | dev-only | API: read/append iteration thread messages | n/a |
| `pages/api/dev/feature-image/workflow.ts` | `/api/dev/feature-image/workflow` | dev-only | API: read/create/update workflow context | n/a |

Build/config route (not a UI surface, listed for completeness):

| Path | Route | Facing | Purpose |
|------|-------|--------|---------|
| `pages/robots.txt.ts` | `/robots.txt` | infra | Generates robots.txt (`GET` returns text) |

Ambiguity judgments (editorialcontrol):
- Everything under `pages/dev/**` and `pages/api/dev/**` → dev-only by route
  prefix; `focus/[id]`, `focus/index`, `feature-image-preview` additionally
  enforce it with `import.meta.env.PROD` 404/redirect guards.
- `robots.txt.ts` is an infra/generated endpoint, not a user-navigated UI
  surface; excluded from the user-facing/dev-only page tally.
- `index`, `about`, `contact`, `blog/*` → user-facing public content.

### Components (4 .astro + 4 studio TS clients)

| Path | Purpose | Used by |
|------|---------|---------|
| `components/Header.astro` | Sticky site header | `layouts/Layout.astro` |
| `components/Footer.astro` | Site footer (imports `Logo`) | `layouts/Layout.astro` |
| `components/Logo.astro` | Brand logo; Props: `variant?: 'masthead' \| 'inline' \| 'compact'` | `Header`, `Footer`, `pages/index.astro` |
| `components/studio/ProgressTape.astro` | Studio progress "reel" component (Props include `label, estimateMs?, key, operation`) | `StudioLayout`, `dev/studio/proto/progress.astro` |
| `components/studio/focus-client.ts` | Client controller for the focus canvas (dev-only) | focus page |
| `components/studio/gallery-client.ts` | Client controller for the gallery/history (dev-only) | studio index |
| `components/studio/generate-client.ts` | Client controller for the generate tab (dev-only) | generate page |
| `components/studio/templates-client.ts` | Client controller for the templates tab (dev-only) | templates page |

No card-like component exists on editorialcontrol; the publication uses inline
markup for dispatch listings.

### Layouts (3)

| Path | Purpose | Composition |
|------|---------|-------------|
| `layouts/Layout.astro` | Base shell — head/meta + `Header` + `Footer`; imports `brand` | imports `Header`, `Footer`, `brand` |
| `layouts/BlogLayout.astro` | Dispatch chrome (hero via `astro:assets`); wires `initLightbox` from `shared/lightbox.ts` | wraps `Layout` |
| `layouts/StudioLayout.astro` | Feature Image Studio chrome (tabbed nav via `activeTab`); embeds `ProgressTape` | imports `ProgressTape`; dev-only shell |

---

## Cross-site dev component

| Path | Purpose | Facing | Used by |
|------|---------|--------|---------|
| `src/components/dev/OGPreview.astro` | OG/feature-image composite preview with CRT/phosphor/vignette/scanline/grain grading knobs; brand-aware (`audiocontrol` / `editorialcontrol`) | dev-only | `editorialcontrol/pages/dev/feature-image-bake.astro`, `editorialcontrol/pages/dev/studio/focus/[id].astro` |

This is the one component living outside `src/sites/`; it is dev-only tooling
shared by the Feature Image Studio surfaces.

---

## Shared modules (`src/shared/`, 6)

| Path | Type | Purpose |
|------|------|---------|
| `shared/brand.ts` | TS | Shared `Brand` interface; each site's `brand.ts` exports a `brand: Brand`. Colors stored as HSL components matching the `--name: H S% L%` design-token convention. **Design-system relevant.** |
| `shared/lightbox.ts` | TS | `initLightbox()` — click-to-view image viewer for `figure.blog-figure img`; called from both sites' `BlogLayout`. |
| `shared/outline-split.ts` | TS | Utility to separate the `## Outline` section from the rest of a dispatch markdown document. |
| `shared/scrapbook-client.ts` | TS | Scrapbook viewer client (expand/collapse, lazy render, inline edit, drag-drop upload, index-rail, localStorage). |
| `shared/blog-figure.css` | CSS | Styling for blog/dispatch figures (shared across both BlogLayouts). |
| `shared/scrapbook.css` | CSS | Styling for the scrapbook viewer. |

Per-site token/style files (not in `src/shared/`, noted for the design-system pilot):
- `audiocontrol/styles/design-tokens.css`, `audiocontrol/styles/prose.css`
- `editorialcontrol/styles/design-tokens.css`, `studio-tokens.css`, `og-preview.css`
- Each site also has its own `brand.ts` implementing the shared `Brand` interface.

---

## Key findings for the homepage pilot

1. **ProjectCard is the single card-like primitive in use**, on
   `audiocontrol/pages/index.astro` (homepage) and `editors/index.astro`.
   Service-manual styling already lives in its scoped `<style>`.
2. **`DeviceCard.astro` and `SpecsTable.astro` are orphaned** — present but
   imported by nothing. Candidates for either adoption into the design system or
   removal.
3. **Design tokens are duplicated per-site** as `styles/design-tokens.css`, with
   color values authored in `brand.ts` against a shared `Brand` interface
   (`src/shared/brand.ts`). That interface is the existing seam a shared design
   system would build on.
4. **editorialcontrol has no card component**; any shared card primitive would
   be a net-new adoption there.

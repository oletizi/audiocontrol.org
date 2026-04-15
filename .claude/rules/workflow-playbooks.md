---
name: workflow-playbooks
description: "Step-by-step playbooks for common audiocontrol.org workflows"
---

# Workflow Playbooks

## Add a New Page

1. Create `.astro` or `.md` file in `src/pages/`
2. Set frontmatter: title, description, layout
3. Use semantic HTML with proper heading hierarchy
4. Add to sitemap in `astro.config.mjs` if needed
5. Verify with `npm run build` and `npm run dev`
6. Check OG image generation if the page needs one

## Add a New Editor Proxy

1. Add proxy redirect rules in `netlify.toml`:
   - Bare path: `/manufacturer/device/editor`
   - Trailing slash: `/manufacturer/device/editor/`
   - Splat: `/manufacturer/device/editor/*`
   - All with `status = 200` and `force = true`
2. Update sitemap in `astro.config.mjs` (customPages array)
3. Add project entry in `src/pages/index.astro` (projects array)
4. Exclude editor path from sitemap if needed
5. Create blog post or docs page about the editor
6. Test proxy locally: `npm run dev` and verify redirects

## Add a Blog Post

1. Create directory: `src/pages/blog/<slug>/`
2. Create `index.md` with frontmatter:
   ```yaml
   layout: ../../../layouts/BlogLayout.astro
   title: "Post Title"
   description: "Brief description for SEO"
   date: "Month Year"
   datePublished: "YYYY-MM-DD"
   dateModified: "YYYY-MM-DD"
   author: "Author Name"
   ```
3. Add entry to blog index in `src/pages/blog/index.astro`
4. Add feature image if applicable (in `public/images/blog/`)
5. Verify OG image path exists or will be generated
6. Build and preview: `npm run build && npm run preview`
7. Check heading hierarchy, links, and SEO metadata

// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';

import sitemap from '@astrojs/sitemap';

import remarkStripOutline from './scripts/lib/editorial/remark-strip-outline.mjs';
import remarkImageFigure from './scripts/lib/editorial/remark-image-figure.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://editorialcontrol.org',
  srcDir: 'src/sites/editorialcontrol',
  publicDir: 'src/sites/editorialcontrol/public',
  outDir: 'dist/editorialcontrol',
  output: 'static',
  adapter: netlify(),
  integrations: [sitemap()],
  // Strip the operator-facing `## Outline` section from the public
  // render. The editorial-review surface has its own unified pipeline
  // and stays unaffected; the outline stays visible where it's used
  // for annotate-and-iterate work, and disappears from /blog/<slug>/.
  markdown: {
    remarkPlugins: [remarkStripOutline, remarkImageFigure],
  },
  vite: {
    server: {
      allowedHosts: ['orion-m4'],
    },
  },
});

// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

import remarkStripOutline from './scripts/lib/editorial/remark-strip-outline.mjs';
import remarkStripFirstH1 from './scripts/lib/editorial/remark-strip-first-h1.mjs';
import remarkImageFigure from './scripts/lib/editorial/remark-image-figure.mjs';

// Adapter is required at build time to package on-demand routes (the
// dev-only API endpoints under /dev/*). Skipped in dev so the dev server
// doesn't bootstrap Netlify Blobs sessions or other adapter machinery.
const isDev = process.argv.includes('dev');

// Last modified dates for sitemap
const lastModified = {
  '/': '2026-02-09',
  '/blog/free-roland-s330-sampler-editor/': '2025-01-15',
  '/blog/roland-s-series-samplers/': '2025-01-15',
  '/blog/roland-s330-sampler-editor-feb-2026-update/': '2026-02-09',
  '/docs/roland/samplers/s-330/': '2025-01-15',
  '/roland/s330/': '2025-01-15',
  '/roland/s330/editor': '2026-02-09',
  '/roland/s330/mu-1-mouse/': '2025-01-15',
  '/roland/s330/rc-100/': '2025-01-15',
  '/roland/s550/': '2025-01-15',
  '/roland/s550/editor': '2026-03-27',
  '/roland/s770/': '2025-01-15',
  '/roland/w30/': '2025-01-15',
};

// https://astro.build/config
export default defineConfig({
  site: 'https://audiocontrol.org',
  srcDir: 'src/sites/audiocontrol',
  publicDir: 'src/sites/audiocontrol/public',
  outDir: 'dist/audiocontrol',
  output: 'static',
  ...(isDev ? {} : { adapter: netlify() }),
  integrations: [
    sitemap({
      customPages: [
        'https://audiocontrol.org/roland/s330/editor',
        'https://audiocontrol.org/roland/s550/editor',
      ],
      filter: (page) => !page.includes('/og-preview'),
      serialize(item) {
        const path = new URL(item.url).pathname;
        const lastmod = lastModified[path];
        if (lastmod) {
          item.lastmod = lastmod;
        }
        return item;
      },
    }),
  ],
  // Strip the operator-facing `## Outline` section from the public
  // render. The editorial-review surface has its own unified pipeline
  // and stays unaffected; the outline stays visible where it's used
  // for annotate-and-iterate work, and disappears from /blog/<slug>/.
  markdown: {
    remarkPlugins: [remarkStripOutline, remarkStripFirstH1, remarkImageFigure],
  },
  vite: {
    server: {
      allowedHosts: ['orion-m4'],
    },
  },
});

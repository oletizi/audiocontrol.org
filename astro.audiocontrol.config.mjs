// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';

import sitemap from '@astrojs/sitemap';

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
  adapter: netlify(),
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
  vite: {
    server: {
      allowedHosts: ['orion-m4'],
    },
  },
});

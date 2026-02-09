// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
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
  '/roland/s770/': '2025-01-15',
  '/roland/w30/': '2025-01-15',
};

export default defineConfig({
  site: 'https://audiocontrol.org',
  output: 'static',
  adapter: netlify(),
  integrations: [
    sitemap({
      customPages: ['https://audiocontrol.org/roland/s330/editor'],
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
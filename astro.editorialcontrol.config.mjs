// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://editorialcontrol.org',
  srcDir: 'src/sites/editorialcontrol',
  outDir: 'dist/editorialcontrol',
  output: 'static',
  adapter: netlify(),
  integrations: [sitemap()],
  vite: {
    server: {
      allowedHosts: ['orion-m4'],
    },
  },
});

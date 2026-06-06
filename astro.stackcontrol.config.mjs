// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

// Adapter is required at build time to package any on-demand routes. Skipped
// in dev so the dev server doesn't bootstrap Netlify adapter machinery.
// Mirrors astro.editorialcontrol.config.mjs.
const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  site: 'https://stackcontrol.org',
  srcDir: 'src/sites/stackcontrol',
  publicDir: 'src/sites/stackcontrol/public',
  outDir: 'dist/stackcontrol',
  output: 'static',
  // Dev only: allow Tailscale magic-DNS hosts (*.ts.net) past Vite's host
  // check so the dev server is viewable across the tailnet. Never applied to
  // the production build.
  ...(isDev
    ? { vite: { server: { allowedHosts: ['.ts.net'] } } }
    : { adapter: netlify() }),
  integrations: [sitemap()],
});

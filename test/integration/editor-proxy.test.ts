/**
 * Integration tests for editor proxy configuration.
 *
 * Verifies that audiocontrol.org correctly proxies to the editor Netlify apps
 * and that the editors are functional.
 *
 * Run with: npm run test:integration
 */

import { describe, it, expect } from 'vitest';

const PRODUCTION_BASE = 'https://audiocontrol.org';
const EDITOR_NETLIFY_APP = 'https://roland-sxx0-editor.netlify.app';

interface EditorEndpoint {
  path: string;
  description: string;
}

const EDITOR_ENDPOINTS: EditorEndpoint[] = [
  { path: '/roland/s330/editor', description: 'S-330 editor root' },
  { path: '/roland/s330/editor/', description: 'S-330 editor root with trailing slash' },
  { path: '/roland/s550/editor', description: 'S-550 editor root' },
  { path: '/roland/s550/editor/', description: 'S-550 editor root with trailing slash' },
];

describe('Editor Proxy Integration', () => {
  describe('Netlify app is accessible directly', () => {
    it('should return 200 from roland-sxx0-editor.netlify.app', async () => {
      const response = await fetch(EDITOR_NETLIFY_APP);
      expect(response.status).toBe(200);
    });

    it('should return valid HTML with React root', async () => {
      const response = await fetch(EDITOR_NETLIFY_APP);
      const html = await response.text();

      expect(html).toContain('<!doctype html>');
      expect(html).toContain('<div id="root">');
      expect(html).toContain('Roland Sampler Editor');
    });

    it('should serve static assets', async () => {
      const response = await fetch(EDITOR_NETLIFY_APP);
      const html = await response.text();

      // Extract CSS asset path from HTML
      const cssMatch = html.match(/href="(\/assets\/index-[^"]+\.css)"/);
      expect(cssMatch).not.toBeNull();

      if (cssMatch) {
        const cssResponse = await fetch(`${EDITOR_NETLIFY_APP}${cssMatch[1]}`);
        expect(cssResponse.status).toBe(200);
        expect(cssResponse.headers.get('content-type')).toContain('text/css');
      }
    });
  });

  describe('audiocontrol.org proxies to editor', () => {
    for (const endpoint of EDITOR_ENDPOINTS) {
      it(`should proxy ${endpoint.description}`, async () => {
        const url = `${PRODUCTION_BASE}${endpoint.path}`;
        const response = await fetch(url);

        expect(response.status).toBe(200);

        const html = await response.text();
        expect(html).toContain('<div id="root">');
        expect(html).toContain('Roland Sampler Editor');
      });
    }

    it('should proxy editor sub-routes (SPA routing)', async () => {
      // The editor uses client-side routing, so all paths should return the index.html
      const response = await fetch(`${PRODUCTION_BASE}/roland/s330/editor/patches`);

      expect(response.status).toBe(200);

      const html = await response.text();
      expect(html).toContain('<div id="root">');
    });

    it('should proxy static assets through audiocontrol.org', async () => {
      // First get the index to find the asset paths
      const indexResponse = await fetch(`${PRODUCTION_BASE}/roland/s330/editor/`);
      const html = await indexResponse.text();

      // Extract JS asset path
      const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
      expect(jsMatch).not.toBeNull();

      if (jsMatch) {
        const assetResponse = await fetch(
          `${PRODUCTION_BASE}/roland/s330/editor${jsMatch[1]}`
        );
        expect(assetResponse.status).toBe(200);
        expect(assetResponse.headers.get('content-type')).toContain('javascript');
      }
    });
  });

  describe('Editor responds with correct headers', () => {
    it('should include security headers', async () => {
      const response = await fetch(EDITOR_NETLIFY_APP);

      // These headers are set in netlify/_headers
      expect(response.headers.get('x-frame-options')).toBe('DENY');
      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    });
  });
});

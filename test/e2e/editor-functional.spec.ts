/**
 * E2E tests that verify the editors actually render and function.
 *
 * These tests use a real browser to verify JavaScript executes correctly
 * and the React app mounts and renders UI elements.
 *
 * Run with: npm run test:e2e
 */

import { test, expect } from '@playwright/test';

// Only test via proxy - direct Netlify access uses different base path
const EDITOR_URLS = [
  { url: 'https://audiocontrol.org/roland/s330/editor/', name: 'S-330 via proxy' },
  { url: 'https://audiocontrol.org/roland/s550/editor/', name: 'S-550 via proxy' },
];

for (const { url, name } of EDITOR_URLS) {
  test.describe(`${name}`, () => {
    test('React app mounts and renders UI', async ({ page }) => {
      await page.goto(url);

      // Wait for React to mount - the root div should have children
      const root = page.locator('#root');
      await expect(root).not.toBeEmpty({ timeout: 10000 });

      // The app should render the Connect page heading
      await expect(page.getByRole('heading', { name: /Connect to S-/ })).toBeVisible({
        timeout: 10000,
      });
    });

    test('page has no console errors on load', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(url);
      // Wait for app to fully load
      await page.waitForLoadState('networkidle');

      // Filter out known acceptable errors (like missing favicon)
      const criticalErrors = errors.filter(
        (e) => !e.includes('favicon') && !e.includes('404')
      );

      expect(criticalErrors).toEqual([]);
    });

    test('navigation links are present', async ({ page }) => {
      await page.goto(url);

      // Wait for React to render
      await page.waitForSelector('#root:not(:empty)');

      // Check for expected navigation elements
      // The editor should have links to Tones, Patches, etc.
      const hasNavigation = await page
        .locator('nav, [role="navigation"], a[href*="tones"], a[href*="patches"]')
        .count();

      expect(hasNavigation).toBeGreaterThan(0);
    });

    test('static assets load successfully', async ({ page }) => {
      const failedRequests: string[] = [];

      page.on('requestfailed', (request) => {
        failedRequests.push(`${request.url()}: ${request.failure()?.errorText}`);
      });

      await page.goto(url);
      await page.waitForLoadState('networkidle');

      expect(failedRequests).toEqual([]);
    });
  });
}

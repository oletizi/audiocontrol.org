import { chromium, type Browser } from 'playwright';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export type OverlayPosition =
  | 'bottom'
  | 'middle'
  | 'top'
  | 'left'
  | 'right'
  | 'left-one-third'
  | 'left-two-thirds'
  | 'right-one-third'
  | 'right-two-thirds'
  | 'full';

export interface BakeVariant {
  format: 'og' | 'youtube' | 'instagram';
  width: number;
  height: number;
  overlay: boolean;
  outputPath: string;
}

export interface BakeParams {
  baseUrl: string;
  entryId?: string;
  rawPath?: string;
  title?: string;
  subtitle?: string;
  preset?: string;
  filters?: Record<string, string>;
  /** Site whose brand tokens drive the overlay. */
  site?: string;
  /** Where the text panel sits. Defaults to 'bottom' on the bake page. */
  overlayPosition?: OverlayPosition;
  variants: BakeVariant[];
}

const FORMAT_DIMS: Record<string, { width: number; height: number }> = {
  og: { width: 1200, height: 630 },
  youtube: { width: 1280, height: 720 },
  instagram: { width: 1080, height: 1080 },
};

export function formatDims(format: 'og' | 'youtube' | 'instagram'): { width: number; height: number } {
  const dims = FORMAT_DIMS[format];
  if (!dims) throw new Error(`Unknown format: ${format}`);
  return dims;
}

function buildBakeUrl(baseUrl: string, variant: BakeVariant, params: BakeParams): string {
  const url = new URL('/dev/feature-image-bake', baseUrl);
  if (params.entryId) url.searchParams.set('entry', params.entryId);
  if (params.rawPath) url.searchParams.set('raw', params.rawPath);
  url.searchParams.set('format', variant.format);
  if (params.title) url.searchParams.set('title', params.title);
  if (params.subtitle) url.searchParams.set('subtitle', params.subtitle);
  if (params.preset) url.searchParams.set('preset', params.preset);
  if (params.site) url.searchParams.set('site', params.site);
  url.searchParams.set('overlay', variant.overlay ? 'on' : 'off');
  if (params.overlayPosition) url.searchParams.set('overlayPosition', params.overlayPosition);
  for (const [k, v] of Object.entries(params.filters ?? {})) {
    if (v) url.searchParams.set(k, v);
  }
  return url.toString();
}

export async function bakeVariants(params: BakeParams): Promise<BakeVariant[]> {
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({ headless: true });
    for (const variant of params.variants) {
      await mkdir(join(variant.outputPath, '..'), { recursive: true });
      const context = await browser.newContext({
        viewport: { width: variant.width, height: variant.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const url = buildBakeUrl(params.baseUrl, variant, params);
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      if (!response || !response.ok()) {
        await context.close();
        throw new Error(`Bake page returned ${response?.status()}: ${url}`);
      }
      // Wait for any background images (bg PNG, fonts, SVG grain) to settle.
      await page.evaluate(() => document.fonts.ready);
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: variant.outputPath,
        omitBackground: false,
        clip: { x: 0, y: 0, width: variant.width, height: variant.height },
      });
      await context.close();
    }
    return params.variants;
  } finally {
    if (browser) await browser.close();
  }
}

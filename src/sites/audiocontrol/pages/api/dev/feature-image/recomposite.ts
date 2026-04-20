import type { APIRoute } from 'astro';
import { randomUUID } from 'crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { appendLog, readLog, type LogEntry } from '../../../../../../../scripts/feature-image/log.js';
import { bakeVariants, formatDims, type BakeVariant, type OverlayPosition, type OverlayAlign } from '../../../../../../../scripts/feature-image/bake-dom.js';
import {
  type Site,
  resolveSite,
  getGalleryPublicDir,
} from '../../../../../../../scripts/feature-image/sites.js';

export const prerender = false;

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..', '..', '..', '..', '..', '..');

// Scratch output always lands in the gallery's host site publicDir so the
// dev server can serve what it just wrote. See sites.ts GALLERY_HOST_SITE.
const GALLERY_PUBLIC_DIR = getGalleryPublicDir(rootDir);
const DEFAULT_OUTPUT = join(GALLERY_PUBLIC_DIR, 'images', 'generated');

type Format = 'og' | 'youtube' | 'instagram';

interface RecompositeBody {
  sourceEntryId: string;
  title?: string;
  subtitle?: string;
  preset?: string;
  filters?: Record<string, string>;
  overlay?: boolean;
  overlayPosition?: OverlayPosition;
  overlayAlign?: OverlayAlign;
  formats?: Format[];
  includeFilteredVariant?: boolean;
  baseName?: string;
  /** Override the inherited site for exploratory cross-site recomposition. */
  site?: string;
}

function toPublicPath(absolutePath: string): string {
  const publicDirPrefix = GALLERY_PUBLIC_DIR + '/';
  if (absolutePath.startsWith(publicDirPrefix)) {
    return '/' + absolutePath.slice(publicDirPrefix.length);
  }
  return absolutePath;
}

export const POST: APIRoute = async ({ request, url }) => {
  if (import.meta.env.PROD) {
    return new Response('Not Found', { status: 404 });
  }

  let body: RecompositeBody;
  try {
    body = (await request.json()) as RecompositeBody;
  } catch {
    return new Response(
      JSON.stringify({ error: 'invalid JSON body' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  if (!body.sourceEntryId) {
    return new Response(
      JSON.stringify({ error: '`sourceEntryId` is required' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  const source = (await readLog()).find(e => e.id === body.sourceEntryId);
  if (!source) {
    return new Response(
      JSON.stringify({ error: `sourceEntryId ${body.sourceEntryId} not found in log` }),
      { status: 404, headers: { 'content-type': 'application/json' } },
    );
  }

  const rawPath = source.outputs?.raw?.[0];
  if (!rawPath) {
    return new Response(
      JSON.stringify({ error: `source entry has no raw output` }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  // Site resolves from: explicit override in body > source entry's site > default.
  const site: Site = resolveSite(body.site, resolveSite(source.site));

  const id = randomUUID();
  const baseName = body.baseName ?? id.slice(0, 8);
  const formats: Format[] = body.formats ?? ['og'];
  const overlay = body.overlay !== false;
  const includeFiltered = body.includeFilteredVariant !== false;

  const variants: BakeVariant[] = [];
  for (const format of formats) {
    const dims = formatDims(format);
    variants.push({
      format,
      width: dims.width,
      height: dims.height,
      overlay,
      outputPath: join(DEFAULT_OUTPUT, `${baseName}-${format}.png`),
    });
  }
  if (includeFiltered) {
    const dims = formatDims('og');
    variants.push({
      format: 'og',
      width: dims.width,
      height: dims.height,
      overlay: false,
      outputPath: join(DEFAULT_OUTPUT, `${baseName}-filtered.png`),
    });
  }

  const startedAt = new Date().toISOString();
  // Playwright runs on the same host as the dev server — use 127.0.0.1 to avoid
  // hostname resolution flakiness when the user is browsing via Tailscale / mDNS.
  const port = url.port || (url.protocol === 'https:' ? '443' : '80');
  const origin = `http://127.0.0.1:${port}`;

  try {
    await bakeVariants({
      baseUrl: origin,
      rawPath,
      title: body.title,
      subtitle: body.subtitle,
      preset: body.preset,
      filters: body.filters,
      site,
      overlayPosition: body.overlayPosition,
      overlayAlign: body.overlayAlign,
      variants,
    });

    const composited = variants
      .filter(v => v.overlay)
      .map(v => ({ provider: 'dom', format: v.format, path: toPublicPath(v.outputPath) }));
    const filtered = variants
      .filter(v => !v.overlay)
      .map(v => toPublicPath(v.outputPath));

    const entry: LogEntry = {
      id,
      timestamp: startedAt,
      prompt: source.prompt,
      provider: 'dom-bake',
      preset: body.preset,
      filters: body.filters ? JSON.stringify(body.filters) : undefined,
      title: body.title,
      subtitle: body.subtitle,
      formats: formats.join(','),
      outputDir: DEFAULT_OUTPUT,
      outputs: {
        raw: [rawPath],
        filtered,
        composited,
      },
      durationMs: Date.now() - new Date(startedAt).getTime(),
      status: 'generated',
      templateSlug: source.templateSlug,
      notes: `rebaked from ${source.id.slice(0, 8)} via DOM`,
      parentEntryId: source.id,
      site,
      overlayPosition: body.overlayPosition,
      overlayAlign: body.overlayAlign,
    };
    appendLog(entry);

    return new Response(JSON.stringify({ entry }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message, sourceEntryId: body.sourceEntryId }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
};

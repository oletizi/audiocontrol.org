import type { APIRoute } from 'astro';
import { randomUUID } from 'crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  generateFeatureImage,
  loadApiKeysFromConfig,
  type ProviderSelection,
} from '../../../../../../../scripts/feature-image/pipeline.js';
import { appendLog, type LogEntry } from '../../../../../../../scripts/feature-image/log.js';
import {
  type Site,
  DEFAULT_SITE,
  resolveSite,
  getGalleryPublicDir,
} from '../../../../../../../scripts/feature-image/sites.js';
import type { OverlayPosition, OverlayAlign } from '../../../../../../../scripts/feature-image/bake-dom.js';

export const prerender = false;

const __dirname = dirname(fileURLToPath(import.meta.url));
// src/sites/audiocontrol/pages/api/dev/feature-image → repo root is 7 levels up
const rootDir = join(__dirname, '..', '..', '..', '..', '..', '..', '..');

// Scratch generation output always lands in the gallery's host site
// publicDir so the dev server can actually serve the files it just wrote.
// The `site` dimension on LogEntry captures target-brand intent;
// /feature-image-apply routes COPIES into the correct per-site tree when
// the user approves.
const GALLERY_PUBLIC_DIR = getGalleryPublicDir(rootDir);
const DEFAULT_OUTPUT = join(GALLERY_PUBLIC_DIR, 'images', 'generated');

function toPublicPath(absolutePath: string): string {
  const publicDirPrefix = GALLERY_PUBLIC_DIR + '/';
  if (absolutePath.startsWith(publicDirPrefix)) {
    return '/' + absolutePath.slice(publicDirPrefix.length);
  }
  return absolutePath;
}

function toPublicPaths(paths: string[]): string[] {
  return paths.map(toPublicPath);
}

interface GenerateBody {
  prompt?: string;
  backgroundPath?: string;
  templateSlug?: string;
  provider?: ProviderSelection;
  preset?: string;
  filters?: string;
  title?: string;
  subtitle?: string;
  formats?: string;
  width?: number;
  height?: number;
  baseName?: string;
  outputDir?: string;
  parentEntryId?: string;
  site?: string;
  /**
   * Where the text panel sits. Captured on the log entry so a subsequent
   * DOM rebake (via recomposite or the approve flow) can re-apply the
   * position without losing it. The satori composite path in pipeline.ts
   * still renders a bottom-anchored panel; the authoritative output is
   * the DOM bake.
   */
  overlayPosition?: OverlayPosition;
  /** Vertical anchor inside the panel. 'auto' follows the position default. */
  overlayAlign?: OverlayAlign;
}

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return new Response('Not Found', { status: 404 });
  }

  loadApiKeysFromConfig();

  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return new Response(
      JSON.stringify({ error: 'invalid JSON body' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  if (!body.prompt && !body.backgroundPath) {
    return new Response(
      JSON.stringify({ error: 'either `prompt` or `backgroundPath` is required' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  const site: Site = resolveSite(body.site);
  const id = randomUUID();
  const baseName = body.baseName ?? id.slice(0, 8);
  const outputDir = body.outputDir ?? DEFAULT_OUTPUT;

  const startedAt = new Date().toISOString();
  try {
    const result = await generateFeatureImage({
      prompt: body.prompt,
      backgroundPath: body.backgroundPath,
      provider: body.provider,
      preset: body.preset,
      filters: body.filters,
      title: body.title,
      subtitle: body.subtitle,
      formats: body.formats,
      width: body.width,
      height: body.height,
      outputDir,
      baseName,
      site,
    });

    const entry: LogEntry = {
      id,
      timestamp: startedAt,
      prompt: body.prompt,
      backgroundPath: body.backgroundPath,
      provider: body.provider,
      preset: body.preset,
      filters: body.filters,
      title: body.title,
      subtitle: body.subtitle,
      formats: body.formats,
      outputDir,
      outputs: {
        raw: toPublicPaths(result.raw),
        filtered: toPublicPaths(result.filtered),
        composited: result.composited.map(c => ({
          provider: c.provider,
          format: c.format,
          path: toPublicPath(c.path),
        })),
      },
      durationMs: result.durationMs,
      status: 'generated',
      templateSlug: body.templateSlug,
      parentEntryId: body.parentEntryId,
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
    const entry: LogEntry = {
      id,
      timestamp: startedAt,
      prompt: body.prompt,
      backgroundPath: body.backgroundPath,
      provider: body.provider,
      preset: body.preset,
      filters: body.filters,
      title: body.title,
      subtitle: body.subtitle,
      formats: body.formats,
      outputDir,
      outputs: { raw: [], filtered: [], composited: [] },
      durationMs: 0,
      status: 'rejected',
      error: message,
      templateSlug: body.templateSlug,
      site,
    };
    appendLog(entry);

    return new Response(JSON.stringify({ entry, error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};


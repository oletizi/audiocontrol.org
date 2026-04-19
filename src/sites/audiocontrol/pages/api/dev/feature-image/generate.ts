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

export const prerender = false;

const __dirname = dirname(fileURLToPath(import.meta.url));
// src/sites/audiocontrol/pages/api/dev/feature-image → repo root is 7 levels up
const rootDir = join(__dirname, '..', '..', '..', '..', '..', '..', '..');
const DEFAULT_OUTPUT = join(rootDir, 'public', 'images', 'generated');

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
    };
    appendLog(entry);

    return new Response(JSON.stringify({ entry, error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

/**
 * Convert an absolute filesystem path inside `public/` to a URL-style path.
 * e.g. /Users/.../public/images/generated/foo.png → /images/generated/foo.png
 */
function toPublicPath(absolutePath: string): string {
  const publicDir = join(rootDir, 'public') + '/';
  if (absolutePath.startsWith(publicDir)) {
    return '/' + absolutePath.slice(publicDir.length);
  }
  return absolutePath;
}

function toPublicPaths(paths: string[]): string[] {
  return paths.map(toPublicPath);
}

import type { APIRoute } from 'astro';
import {
  isValidSite,
  readScrapbookFile,
} from '../../../../../../../scripts/lib/editorial/scrapbook.js';

export const prerender = false;

/**
 * GET /api/dev/scrapbook/read?site=<site>&slug=<slug>&file=<filename>
 *
 * Returns file content. For binary files (images), returns the raw
 * bytes with a type hint; for text files, returns JSON with a
 * `content` string. Clients check `kind` in the listing to decide.
 */
export const GET: APIRoute = async ({ url }) => {
  if (import.meta.env.PROD) return new Response('Not Found', { status: 404 });

  const site = url.searchParams.get('site');
  const slug = url.searchParams.get('slug');
  const file = url.searchParams.get('file');
  if (!isValidSite(site)) return json({ error: 'invalid site' }, 400);
  if (!slug || !file) return json({ error: 'missing slug or file' }, 400);

  try {
    const entry = readScrapbookFile(process.cwd(), site, slug, file);
    if (entry.kind === 'img') {
      // Return raw bytes so the browser can render the image directly.
      const mime = guessImageMime(entry.name);
      return new Response(entry.content as unknown as BodyInit, {
        status: 200,
        headers: { 'content-type': mime, 'content-length': String(entry.size) },
      });
    }
    // Text-y files — return as JSON with decoded content.
    return json(
      {
        name: entry.name,
        kind: entry.kind,
        size: entry.size,
        mtime: entry.mtime,
        content: entry.content.toString('utf-8'),
      },
      200,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.startsWith('not found:') ? 404 : 400;
    return json({ error: msg }, status);
  }
};

function guessImageMime(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  if (n.endsWith('.gif')) return 'image/gif';
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

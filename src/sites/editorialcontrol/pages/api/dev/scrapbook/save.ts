import type { APIRoute } from 'astro';
import {
  isValidSite,
  saveScrapbookFile,
} from '../../../../../../../scripts/lib/editorial/scrapbook.js';

export const prerender = false;

interface Body {
  site?: string;
  slug?: string;
  filename?: string;
  body?: string;
}

/**
 * POST /api/dev/scrapbook/save
 * Body: { site, slug, filename, body }
 *
 * Overwrite an existing file's contents. Refuses if the file
 * doesn't exist — use /create for new files.
 */
export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) return new Response('Not Found', { status: 404 });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }
  const { site, slug, filename, body: content } = body;
  if (!isValidSite(site)) return json({ error: 'invalid site' }, 400);
  if (!slug || !filename) return json({ error: 'missing slug or filename' }, 400);
  if (typeof content !== 'string') return json({ error: 'missing body string' }, 400);

  try {
    const item = saveScrapbookFile(process.cwd(), site, slug, filename, content);
    return json({ item }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.startsWith('file not found') ? 404 : 400;
    return json({ error: msg }, status);
  }
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

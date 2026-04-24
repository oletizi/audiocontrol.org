import type { APIRoute } from 'astro';
import {
  isValidSite,
  renameScrapbookFile,
} from '../../../../../../../scripts/lib/editorial/scrapbook.js';

export const prerender = false;

interface Body {
  site?: string;
  slug?: string;
  oldName?: string;
  newName?: string;
}

/**
 * POST /api/dev/scrapbook/rename
 * Body: { site, slug, oldName, newName }
 */
export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) return new Response('Not Found', { status: 404 });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ error: 'invalid JSON' }, 400);
  }
  const { site, slug, oldName, newName } = body;
  if (!isValidSite(site)) return json({ error: 'invalid site' }, 400);
  if (!slug || !oldName || !newName)
    return json({ error: 'missing slug / oldName / newName' }, 400);

  try {
    const item = renameScrapbookFile(process.cwd(), site, slug, oldName, newName);
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

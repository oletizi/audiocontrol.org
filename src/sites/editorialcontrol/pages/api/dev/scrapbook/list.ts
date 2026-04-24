import type { APIRoute } from 'astro';
import {
  isValidSite,
  listScrapbook,
} from '../../../../../../../scripts/lib/editorial/scrapbook.js';

export const prerender = false;

/**
 * GET /api/dev/scrapbook/list?site=<site>&slug=<slug>
 *
 * Returns the scrapbook directory listing for the article.
 * 404 in production per /dev/* convention.
 */
export const GET: APIRoute = async ({ url }) => {
  if (import.meta.env.PROD) return new Response('Not Found', { status: 404 });

  const site = url.searchParams.get('site');
  const slug = url.searchParams.get('slug');
  if (!isValidSite(site)) return json({ error: 'invalid site' }, 400);
  if (!slug) return json({ error: 'missing slug' }, 400);

  try {
    const summary = listScrapbook(process.cwd(), site, slug);
    return json(summary, 200);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 400);
  }
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

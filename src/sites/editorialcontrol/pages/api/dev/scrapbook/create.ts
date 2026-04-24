import type { APIRoute } from 'astro';
import {
  createScrapbookMarkdown,
  isValidSite,
} from '../../../../../../../scripts/lib/editorial/scrapbook.js';

export const prerender = false;

interface Body {
  site?: string;
  slug?: string;
  filename?: string;
  body?: string;
}

/**
 * POST /api/dev/scrapbook/create
 * Body: { site, slug, filename (.md), body }
 *
 * Creates a new markdown note. Refuses if the file already exists
 * (the client should choose a fresh name).
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

  try {
    const item = createScrapbookMarkdown(
      process.cwd(),
      site,
      slug,
      filename,
      content ?? '',
    );
    return json({ item }, 200);
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

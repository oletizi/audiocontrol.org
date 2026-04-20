import type { APIRoute } from 'astro';
import { handlePublish } from '../../../../../../../scripts/lib/editorial-calendar-actions/index.js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) return new Response('Not Found', { status: 404 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid JSON body' }, 400);
  }
  const result = handlePublish(process.cwd(), body);
  return json(result.body, result.status);
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

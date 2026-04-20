import type { APIRoute } from 'astro';
import { handleAnnotate } from '../../../../../../../scripts/lib/editorial-review/index.js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) return new Response('Not Found', { status: 404 });
  const body = await readJson(request);
  if (body === BAD_JSON) return json({ error: 'invalid JSON body' }, 400);
  const result = handleAnnotate(process.cwd(), body);
  return json(result.body, result.status);
};

const BAD_JSON = Symbol('bad-json');

async function readJson(req: Request): Promise<unknown | typeof BAD_JSON> {
  try {
    return await req.json();
  } catch {
    return BAD_JSON;
  }
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

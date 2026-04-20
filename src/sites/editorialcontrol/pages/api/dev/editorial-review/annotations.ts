import type { APIRoute } from 'astro';
import { handleListAnnotations } from '../../../../../../../scripts/lib/editorial-review/index.js';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  if (import.meta.env.PROD) return new Response('Not Found', { status: 404 });
  const result = handleListAnnotations(process.cwd(), {
    workflowId: url.searchParams.get('workflowId'),
    version: url.searchParams.get('version'),
  });
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'content-type': 'application/json' },
  });
};

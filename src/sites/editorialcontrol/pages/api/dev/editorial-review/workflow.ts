import type { APIRoute } from 'astro';
import { handleGetWorkflow } from '../../../../../../../scripts/lib/editorial-review/index.js';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  if (import.meta.env.PROD) return new Response('Not Found', { status: 404 });
  const result = handleGetWorkflow(process.cwd(), {
    id: url.searchParams.get('id'),
    site: url.searchParams.get('site'),
    slug: url.searchParams.get('slug'),
    contentKind: url.searchParams.get('contentKind'),
    platform: url.searchParams.get('platform'),
    channel: url.searchParams.get('channel'),
  });
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'content-type': 'application/json' },
  });
};

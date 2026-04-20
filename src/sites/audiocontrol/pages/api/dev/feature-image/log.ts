import type { APIRoute } from 'astro';
import { readLog, updateLog, type LogStatus } from '../../../../../../../scripts/feature-image/log.js';

export const prerender = false;

export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) {
    return new Response('Not Found', { status: 404 });
  }
  const entries = readLog();
  // Most recent first
  entries.reverse();
  return new Response(JSON.stringify({ entries }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

interface UpdateBody {
  id: string;
  status?: LogStatus;
  notes?: string;
  rating?: number;
  templateSlug?: string;
  appliedTo?: string;
  archived?: boolean;
}

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return new Response('Not Found', { status: 404 });
  }

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return new Response(
      JSON.stringify({ error: 'invalid JSON body' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  if (!body.id) {
    return new Response(
      JSON.stringify({ error: '`id` is required' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  // Build a patch containing ONLY the fields the client explicitly sent.
  // Passing `undefined` through the spread in updateLog would overwrite
  // existing values — e.g. a rate-only POST would wipe status + appliedTo.
  const patch: Parameters<typeof updateLog>[1] = {};
  if (body.status !== undefined) patch.status = body.status;
  if (body.notes !== undefined) patch.notes = body.notes;
  if (body.rating !== undefined) patch.rating = body.rating;
  if (body.templateSlug !== undefined) patch.templateSlug = body.templateSlug;
  if (body.appliedTo !== undefined) patch.appliedTo = body.appliedTo;
  if (body.archived !== undefined) patch.archived = body.archived;
  const updated = updateLog(body.id, patch);
  if (!updated) {
    return new Response(
      JSON.stringify({ error: `no log entry with id ${body.id}` }),
      { status: 404, headers: { 'content-type': 'application/json' } },
    );
  }

  return new Response(JSON.stringify({ entry: updated }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

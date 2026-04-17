import type { APIRoute } from 'astro';
import {
  readWorkflow,
  createWorkflow,
  updateWorkflow,
  type WorkflowContext,
  type WorkflowState,
  type WorkflowType,
} from '../../../../../scripts/feature-image/workflow.js';

export const prerender = false;

type Action = 'create' | 'decide' | 'cancel' | 'apply-result';

interface PostBody {
  action: Action;
  // create
  type?: WorkflowType;
  context?: WorkflowContext;
  createdBy?: 'agent' | 'user';
  // decide | cancel | apply-result
  id?: string;
  // decide
  logEntryId?: string;
  userNotes?: string;
  // apply-result
  changedFiles?: string[];
  error?: string;
}

export const GET: APIRoute = async ({ url }) => {
  if (import.meta.env.PROD) {
    return new Response('Not Found', { status: 404 });
  }

  const stateFilter = url.searchParams.get('state') as WorkflowState | null;
  const items = readWorkflow();
  const filtered = stateFilter ? items.filter(i => i.state === stateFilter) : items;
  filtered.reverse(); // most recent first

  return new Response(JSON.stringify({ items: filtered }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return new Response('Not Found', { status: 404 });
  }

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return json({ error: 'invalid JSON body' }, 400);
  }

  switch (body.action) {
    case 'create': {
      if (!body.type || !body.context) return json({ error: 'type and context are required' }, 400);
      const item = createWorkflow({
        type: body.type,
        createdBy: body.createdBy,
        context: body.context,
      });
      return json({ item }, 200);
    }

    case 'decide': {
      if (!body.id || !body.logEntryId) return json({ error: 'id and logEntryId are required' }, 400);
      const updated = updateWorkflow(body.id, {
        state: 'decided',
        decision: {
          decidedAt: new Date().toISOString(),
          logEntryId: body.logEntryId,
          userNotes: body.userNotes,
        },
      });
      if (!updated) return json({ error: `no workflow item with id ${body.id}` }, 404);
      return json({ item: updated }, 200);
    }

    case 'cancel': {
      if (!body.id) return json({ error: 'id is required' }, 400);
      const updated = updateWorkflow(body.id, { state: 'cancelled' });
      if (!updated) return json({ error: `no workflow item with id ${body.id}` }, 404);
      return json({ item: updated }, 200);
    }

    case 'apply-result': {
      if (!body.id) return json({ error: 'id is required' }, 400);
      const updated = updateWorkflow(body.id, {
        state: body.error ? 'decided' : 'applied',
        application: {
          appliedAt: new Date().toISOString(),
          changedFiles: body.changedFiles ?? [],
          error: body.error,
        },
      });
      if (!updated) return json({ error: `no workflow item with id ${body.id}` }, 404);
      return json({ item: updated }, 200);
    }

    default:
      return json({ error: `unknown action "${body.action}"` }, 400);
  }
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

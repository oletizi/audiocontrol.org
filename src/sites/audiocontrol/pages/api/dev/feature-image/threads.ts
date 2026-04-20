import type { APIRoute } from 'astro';
import {
  readThread,
  appendMessage,
  resolveRootEntryId,
  type ThreadMessage,
  type ThreadSnapshot,
} from '../../../../../../../scripts/feature-image/threads.js';
import { createWorkflow } from '../../../../../../../scripts/feature-image/workflow.js';

export const prerender = false;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ url }) => {
  if (import.meta.env.PROD) return new Response('Not Found', { status: 404 });

  const entryId = url.searchParams.get('entryId');
  if (!entryId) return json({ error: 'entryId is required' }, 400);

  const threadId = resolveRootEntryId(entryId);
  const messages = readThread(threadId);
  return json({ threadId, messages }, 200);
};

interface AppendUserBody {
  action: 'append-message';
  entryId: string;
  text: string;
  snapshot?: ThreadSnapshot;
}

interface AppendAssistantBody {
  action: 'append-assistant';
  threadId: string;
  text: string;
  logEntryId?: string;
}

type PostBody = AppendUserBody | AppendAssistantBody;

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) return new Response('Not Found', { status: 404 });

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return json({ error: 'invalid JSON body' }, 400);
  }

  if (body.action === 'append-message') {
    if (!body.entryId || !body.text || !body.text.trim()) {
      return json({ error: 'entryId and non-empty text are required' }, 400);
    }
    const threadId = resolveRootEntryId(body.entryId);
    const message: ThreadMessage = {
      threadId,
      timestamp: new Date().toISOString(),
      role: 'user',
      text: body.text.trim(),
      snapshot: body.snapshot,
    };
    appendMessage(message);
    const workflowItem = createWorkflow({
      type: 'feature-image-iterate',
      createdBy: 'user',
      context: {
        threadId,
        sourceEntryId: body.entryId,
        userFeedback: body.text.trim(),
        snapshot: body.snapshot,
      },
    });
    return json({ threadId, message, workflowId: workflowItem.id }, 200);
  }

  if (body.action === 'append-assistant') {
    if (!body.threadId || !body.text || !body.text.trim()) {
      return json({ error: 'threadId and non-empty text are required' }, 400);
    }
    const message: ThreadMessage = {
      threadId: body.threadId,
      timestamp: new Date().toISOString(),
      role: 'assistant',
      text: body.text.trim(),
      logEntryId: body.logEntryId,
    };
    appendMessage(message);
    return json({ message }, 200);
  }

  return json({ error: `unknown action` }, 400);
};

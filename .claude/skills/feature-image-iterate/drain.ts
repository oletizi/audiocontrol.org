#!/usr/bin/env tsx
/*
 * drain.ts — list all pending feature-image-iterate workflow items with enough
 * context for Claude to pick a response strategy. Invoked by the
 * /feature-image-iterate skill (and by humans who want to see what's pending).
 *
 * Usage: tsx .claude/skills/feature-image-iterate/drain.ts [--base=<url>]
 *
 * Default base URL is http://localhost:4322. Override if the dev server is
 * running on a different port.
 */

interface WorkflowItem {
  id: string;
  type: string;
  createdAt: string;
  state: string;
  context: {
    threadId?: string;
    sourceEntryId?: string;
    userFeedback?: string;
    snapshot?: Record<string, unknown>;
  };
}

interface ThreadMessage {
  threadId: string;
  timestamp: string;
  role: 'user' | 'assistant';
  text: string;
  logEntryId?: string;
}

interface LogEntry {
  id: string;
  prompt?: string;
  preset?: string;
  provider?: string;
  title?: string;
  subtitle?: string;
  rating?: number;
  status?: string;
  templateSlug?: string;
  parentEntryId?: string;
  outputs?: {
    raw?: string[];
    filtered?: string[];
    composited?: Array<{ format: string; path: string }>;
  };
}

function parseBase(argv: string[]): string {
  const arg = argv.find(a => a.startsWith('--base='));
  return arg ? arg.slice('--base='.length) : 'http://localhost:4322';
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} at ${url}`);
  return (await res.json()) as T;
}

async function main() {
  const base = parseBase(process.argv.slice(2));

  const wf = await getJson<{ items: WorkflowItem[] }>(`${base}/api/dev/feature-image/workflow?state=open`);
  const iterate = wf.items.filter(i => i.type === 'feature-image-iterate');
  if (iterate.length === 0) {
    console.log(JSON.stringify({ pendingCount: 0, items: [] }, null, 2));
    return;
  }

  const log = await getJson<{ entries: LogEntry[] }>(`${base}/api/dev/feature-image/log`);
  const byId = new Map(log.entries.map(e => [e.id, e]));

  const output = {
    pendingCount: iterate.length,
    items: await Promise.all(iterate.map(async item => {
      const { sourceEntryId, threadId, userFeedback, snapshot } = item.context;
      const source = sourceEntryId ? byId.get(sourceEntryId) : undefined;
      let thread: ThreadMessage[] = [];
      if (sourceEntryId) {
        try {
          const t = await getJson<{ threadId: string; messages: ThreadMessage[] }>(
            `${base}/api/dev/feature-image/threads?entryId=${encodeURIComponent(sourceEntryId)}`,
          );
          thread = t.messages;
        } catch {
          // thread may not exist yet — proceed with empty
        }
      }
      return {
        workflowId: item.id,
        createdAt: item.createdAt,
        threadId,
        sourceEntryId,
        userFeedback,
        snapshot,
        source: source
          ? {
              id: source.id,
              prompt: source.prompt,
              preset: source.preset,
              provider: source.provider,
              title: source.title,
              subtitle: source.subtitle,
              rating: source.rating,
              status: source.status,
              templateSlug: source.templateSlug,
              parentEntryId: source.parentEntryId,
              rawPath: source.outputs?.raw?.[0],
            }
          : null,
        thread: thread.map(m => ({
          role: m.role,
          at: m.timestamp,
          text: m.text,
          logEntryId: m.logEntryId,
        })),
      };
    })),
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch(err => {
  console.error(`drain failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

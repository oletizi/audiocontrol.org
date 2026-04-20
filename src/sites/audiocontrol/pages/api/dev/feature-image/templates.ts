import type { APIRoute } from 'astro';
import {
  readTemplates,
  createTemplate,
  updateTemplate,
  forkTemplate,
  archiveTemplate,
  rankTemplates,
  filterByTags,
  type PromptTemplate,
} from '../../../../../../../scripts/feature-image/templates.js';
import { readLog } from '../../../../../../../scripts/feature-image/log.js';

export const prerender = false;

type Action = 'create' | 'update' | 'fork' | 'archive';

interface PostBody {
  action: Action;
  // create
  template?: PromptTemplate;
  // update / archive
  slug?: string;
  patch?: Partial<PromptTemplate>;
  archived?: boolean;
  // fork
  sourceSlug?: string;
  newSlug?: string;
  overrides?: Partial<Pick<PromptTemplate, 'name' | 'description' | 'tags' | 'prompt' | 'preset' | 'provider'>>;
}

export const GET: APIRoute = async ({ url }) => {
  if (import.meta.env.PROD) {
    return new Response('Not Found', { status: 404 });
  }

  const tagFilter = url.searchParams.get('tag');
  const includeArchived = url.searchParams.get('includeArchived') === 'true';

  const all = readTemplates();
  const history = readLog();
  let working = includeArchived ? all : all.filter(t => !t.archived);
  if (tagFilter) {
    working = filterByTags(working, [tagFilter]);
  }

  const ranked = rankTemplates(working, history);
  return json({ templates: ranked }, 200);
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
      if (!body.template) return json({ error: 'template is required' }, 400);
      try {
        const created = createTemplate(body.template);
        return json({ template: created }, 200);
      } catch (e) {
        return json({ error: (e as Error).message }, 400);
      }
    }

    case 'update': {
      if (!body.slug || !body.patch) return json({ error: 'slug and patch are required' }, 400);
      const updated = updateTemplate(body.slug, body.patch);
      if (!updated) return json({ error: `no template "${body.slug}"` }, 404);
      return json({ template: updated }, 200);
    }

    case 'fork': {
      if (!body.sourceSlug || !body.newSlug) {
        return json({ error: 'sourceSlug and newSlug are required' }, 400);
      }
      try {
        const forked = forkTemplate(body.sourceSlug, body.newSlug, body.overrides ?? {});
        return json({ template: forked }, 200);
      } catch (e) {
        return json({ error: (e as Error).message }, 400);
      }
    }

    case 'archive': {
      if (!body.slug) return json({ error: 'slug is required' }, 400);
      const archived = archiveTemplate(body.slug, body.archived ?? true);
      if (!archived) return json({ error: `no template "${body.slug}"` }, 404);
      return json({ template: archived }, 200);
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

import type { APIRoute } from 'astro';
import {
  classify,
  isValidSite,
  writeScrapbookUpload,
} from '../../../../../../../scripts/lib/editorial/scrapbook.js';

export const prerender = false;

// Allowed upload kinds — matches the design brief's §4 table.
// Rejects dotfiles, scripts (can't upload code via the browser), and
// anything not classified into a known image/json/txt bucket.
const ALLOWED_KINDS = new Set(['img', 'json', 'txt', 'md', 'other']);

// Hard ceiling on upload size — keeps a browser mis-click from
// dropping a gig into the scrapbook.
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * POST /api/dev/scrapbook/upload
 * Multipart body: { site, slug, file }
 *
 * Writes the uploaded file into the scrapbook dir under its own
 * filename. Refuses overwrites (caller renames first).
 */
export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) return new Response('Not Found', { status: 404 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'expected multipart/form-data' }, 400);
  }

  const site = form.get('site');
  const slug = form.get('slug');
  const file = form.get('file');

  if (typeof site !== 'string' || !isValidSite(site))
    return json({ error: 'invalid site' }, 400);
  if (typeof slug !== 'string' || !slug)
    return json({ error: 'missing slug' }, 400);
  if (!(file instanceof File))
    return json({ error: 'missing file' }, 400);
  if (file.size > MAX_BYTES)
    return json({ error: `file too large (> ${MAX_BYTES} bytes)` }, 400);

  const filename = file.name;
  const kind = classify(filename);
  if (!ALLOWED_KINDS.has(kind))
    return json({ error: `file type not allowed: "${filename}"` }, 400);

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const item = writeScrapbookUpload(process.cwd(), site, slug, filename, bytes);
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

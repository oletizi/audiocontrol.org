import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SITES } from '../../../../../../../scripts/lib/editorial/types.js';

export const prerender = false;

/**
 * Dev-only: return a short signature of every input the editorial
 * studio renders from. The client polls this and reloads only when
 * the signature changes — replacing the blunt "reload every 10s"
 * loop that was causing a visible flicker even when nothing had
 * moved on the backend.
 *
 * Signature inputs:
 *   - mtime of each site's calendar markdown
 *   - count + mtime-max of the workflow pipeline directory
 *   - count + mtime-max of the workflow history directory
 *   - count + mtime-max of each site's content/blog/ directory
 *
 * That covers calendar edits, workflow state transitions, version
 * appends, new annotations, address/resolve events, and any file
 * scaffolded/edited on disk. It deliberately skips the node_modules
 * and git-metadata noise that would force spurious reloads.
 *
 * The hash is deterministic and cheap — dozens of stat calls at
 * worst. No directory walks beyond one level.
 */
export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) return new Response('Not Found', { status: 404 });
  try {
    const root = process.cwd();
    const parts: string[] = [];

    for (const site of SITES) {
      const cal = join(root, 'docs', `editorial-calendar-${site}.md`);
      parts.push(`cal:${site}:${safeMtime(cal)}`);
      parts.push(`content:${site}:${dirSignature(join(root, 'src', 'sites', site, 'content', 'blog'))}`);
    }
    parts.push(`pipeline:${dirSignature(join(root, 'journal', 'editorial', 'pipeline'))}`);
    parts.push(`history:${dirSignature(join(root, 'journal', 'editorial', 'history'))}`);

    const digest = createHash('sha256').update(parts.join('\n')).digest('hex').slice(0, 16);
    return new Response(JSON.stringify({ signature: digest }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        // Short no-cache so the client always hits fresh state.
        'cache-control': 'no-store',
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

function safeMtime(path: string): number {
  try {
    return existsSync(path) ? statSync(path).mtimeMs : 0;
  } catch {
    return 0;
  }
}

/**
 * Summarize a directory as count + latest mtime across its direct
 * entries. Catches appends (count goes up) and in-place edits (mtime
 * advances). Missing directories return `0:0` — a stable signature
 * so their absence doesn't look like a change every poll.
 */
function dirSignature(path: string): string {
  try {
    if (!existsSync(path)) return '0:0';
    const entries = readdirSync(path);
    let latest = 0;
    for (const name of entries) {
      try {
        const m = statSync(join(path, name)).mtimeMs;
        if (m > latest) latest = m;
      } catch {
        /* skip unreadable entries */
      }
    }
    return `${entries.length}:${latest}`;
  } catch {
    return '0:0';
  }
}

import type { APIRoute } from 'astro';

/**
 * Per-site robots.txt for editorialcontrol.org.
 *
 * Overrides the shared `public/robots.txt` (which is authored for
 * audiocontrol.org) so crawlers discover editorialcontrol's own sitemap
 * instead of audiocontrol's. Astro resolves a route-file at this path
 * ahead of a same-named asset in `public/`.
 */
export const GET: APIRoute = ({ site }) => {
  const origin = site ? site.origin : 'https://editorialcontrol.org';
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${origin}/sitemap-index.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};

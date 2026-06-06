import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Devlog entries live as directories at `content/blog/<slug>/index.md` so
 * per-post assets can sit next to the markdown (mirrors the sibling sites).
 * `generateId` strips the trailing `/index` so `entry.id` equals the slug,
 * matching the route param in `pages/blog/[slug].astro`.
 *
 * `phase` is a stackcontrol-specific field: the lifecycle phase a devlog
 * entry is about (SCOPE / AUDIT / PIPELINE / …), surfaced as a tag chip in
 * the telemetry-styled listing.
 */
const blog = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/sites/stackcontrol/content/blog',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.string(), // human display, e.g. "May 2026"
      datePublished: z.string(), // ISO YYYY-MM-DD
      dateModified: z.string().optional(),
      author: z.string().optional(),
      phase: z.string().optional(),
      image: image().optional(),
      socialImage: image().optional(),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().default(false),
      // deskwork binds each calendar entry to its markdown via a UUID under
      // the `deskwork:` namespace; permit it so graduated entries validate.
      deskwork: z.object({ id: z.string().uuid() }).passthrough().optional(),
    }),
});

export const collections = { blog };

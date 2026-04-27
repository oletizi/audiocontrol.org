import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog entries live as directories at `content/blog/<slug>/index.md` so
 * per-post assets (feature-*.png, body figures) can sit next to the
 * markdown. Relative paths in the body (`./figure.png`) and in the
 * `image` / `socialImage` frontmatter fields are resolved by Astro's
 * image pipeline at build time — a slug rename is then a single
 * directory rename with no path rewriting.
 *
 * `generateId` strips the trailing `/index` so `entry.id` equals the
 * slug, matching the route param in `pages/blog/[slug].astro`.
 */
const blog = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/sites/editorialcontrol/content/blog',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.string(),
      datePublished: z.string(),
      dateModified: z.string().optional(),
      author: z.string().optional(),
      image: image().optional(),
      socialImage: image().optional(),
      tags: z.array(z.string()).optional(),
      state: z.enum(['draft', 'published']).default('draft'),
    }),
});

export const collections = { blog };

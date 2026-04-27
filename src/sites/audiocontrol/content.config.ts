import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog entries live as directories at `content/blog/<slug>/index.md`
 * so per-post assets (feature-*.png, body figures) sit next to the
 * markdown. Relative paths (`./feature-og.png`) are resolved by
 * Astro's image pipeline at build time; a slug rename becomes a
 * single directory rename with no path rewriting.
 *
 * `image` / `socialImage` are resolved relative to the post's
 * `index.md` via Astro's `image()` schema — shared assets that some
 * older posts referenced from `/public/images/...` have been copied
 * into each post's directory so every reference is co-located.
 *
 * `generateId` strips the trailing `/index` so `entry.id` equals the
 * slug, matching the route param in `pages/blog/[slug].astro`.
 */
const blog = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/sites/audiocontrol/content/blog',
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
      // deskwork binds each calendar entry to its markdown via a stable
      // UUID written into frontmatter. Optional so legacy posts that
      // haven't been ingested yet still validate.
      id: z.string().uuid().optional(),
    }),
});

export const collections = { blog };

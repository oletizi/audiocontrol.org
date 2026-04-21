import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/sites/editorialcontrol/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    datePublished: z.string(),
    dateModified: z.string().optional(),
    author: z.string().optional(),
    image: z.string().optional(),
    socialImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    state: z.enum(['draft', 'published']).default('draft'),
  }),
});

export const collections = { blog };

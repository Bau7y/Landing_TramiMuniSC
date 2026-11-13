import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * One .md file per service and language: src/content/services/{es,en}/<key>.md
 * <key> (the Spanish file name) pairs both translations and identifies the
 * service in the contact form. `url_slug` is the URL segment for that language
 * (`slug` is reserved: the glob loader would use it as the entry id).
 */
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    order: z.number().int(),
    url_slug: z.string().regex(/^[a-z0-9-]+$/),
    group: z.enum(['inmuebles', 'agro', 'permisos', 'orientacion']),
    law: z.string().optional(),
    form: z.enum(['exoneracion', 'declaracion']).optional(),
    nav_label: z.string(),
    title: z.string(),
    /** <title> for search results; falls back to nav_label. Include the place. */
    seo_title: z.string().optional(),
    subtitle: z.string(),
    meta_description: z.string(),
    card: z.object({
      title: z.string(),
      summary: z.string(),
    }),
    intro_title: z.string(),
    list: z.object({
      title: z.string(),
      items: z.array(z.string()).min(1),
    }),
    steps: z.object({
      title: z.string(),
      items: z.array(z.object({ title: z.string(), text: z.string() })).min(1),
    }),
    aside: z.object({
      title: z.string(),
      text: z.string(),
      button: z.string(),
      note: z.string(),
    }),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    cta: z.object({
      title: z.string(),
      text: z.string(),
      button: z.string(),
    }),
  }),
});

export const collections = { services };

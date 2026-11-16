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
    meta_description: z.string().max(160),
    /** Last content review; shown on the page and used as sitemap lastmod. */
    updated: z.coerce.date(),
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

/**
 * Practical guides: src/content/guides/{es,en}/<key>.md. They answer one
 * question in depth and link to the service that solves it (`service` key).
 */
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    order: z.number().int(),
    url_slug: z.string().regex(/^[a-z0-9-]+$/),
    service: z.string(),
    law: z.string().optional(),
    title: z.string(),
    seo_title: z.string(),
    meta_description: z.string().max(160),
    /** Direct answer shown first on the page and reused by llms.txt. */
    summary: z.string(),
    updated: z.coerce.date(),
  }),
});

/** Privacy policy and legal notice: src/content/legal/{es,en}/<key>.md. */
const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    order: z.number().int(),
    url_slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string(),
    meta_description: z.string().max(160),
    updated: z.coerce.date(),
  }),
});

export const collections = { services, guides, legal };

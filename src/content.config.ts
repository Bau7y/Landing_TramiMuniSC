import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      order: z.number().int(),
      nav_label: z.string(),
      title: z.string(),
      subtitle: z.string(),
      meta_description: z.string(),
      card: z.object({
        title: z.string(),
        summary: z.string(),
        image: image(),
        alt: z.string(),
      }),
      intro_title: z.string(),
      list: z.object({
        title: z.string(),
        items: z.array(z.string()).min(1),
      }),
      steps: z.object({
        title: z.string(),
        items: z
          .array(z.object({ title: z.string(), text: z.string() }))
          .min(1),
      }),
      aside: z.object({
        title: z.string(),
        text: z.string(),
        button: z.string(),
        note: z.string(),
      }),
      cta: z.object({
        title: z.string(),
        text: z.string(),
        button: z.string(),
      }),
    }),
});

export const collections = { services };

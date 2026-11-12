import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const servicios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/servicios' }),
  schema: ({ image }) =>
    z.object({
      orden: z.number().int(),
      nav: z.string(),
      titulo: z.string(),
      subtitulo: z.string(),
      meta_descripcion: z.string(),
      tarjeta: z.object({
        titulo: z.string(),
        resumen: z.string(),
        imagen: image(),
        alt: z.string(),
      }),
      intro_titulo: z.string(),
      lista: z.object({
        titulo: z.string(),
        items: z.array(z.string()).min(1),
      }),
      pasos: z.object({
        titulo: z.string(),
        items: z
          .array(z.object({ titulo: z.string(), texto: z.string() }))
          .min(1),
      }),
      aside: z.object({
        titulo: z.string(),
        texto: z.string(),
        boton: z.string(),
        nota: z.string(),
      }),
      cta: z.object({
        titulo: z.string(),
        texto: z.string(),
        boton: z.string(),
      }),
    }),
});

export const collections = { servicios };

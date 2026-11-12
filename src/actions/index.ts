import { defineAction, ActionError } from 'astro:actions';
import { getEntry } from 'astro:content';
import { z } from 'astro/zod';
import { Resend } from 'resend';
import { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } from 'astro:env/server';
import { canReceiveEmail } from '../lib/email';

/** Minimum time (ms) between form load and submit. Filters out bots. */
const MIN_SUBMIT_TIME_MS = 3000;

const contactSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(120, 'Máximo 120 caracteres'),
  email: z
    .string()
    .trim()
    .min(1, 'El correo es requerido')
    .pipe(z.email('Ingrese un correo válido'))
    .refine(canReceiveEmail, 'Este correo no parece existir. Revise que esté bien escrito.'),
  subject: z.string().trim().min(1, 'El asunto es requerido').max(150, 'Máximo 150 caracteres'),
  service: z.string().trim().max(60).nullish().transform((v) => v ?? ''),
  message: z
    .string()
    .trim()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(5000, 'Máximo 5000 caracteres'),
  // Anti-spam: honeypot field (must be empty) and form load timestamp.
  // Astro parses empty FormData fields as null.
  website: z.string().nullish().transform((v) => v ?? ''),
  loaded_at: z.coerce.number().nullish().transform((v) => v ?? 0),
});

let client: Resend | null = null;
const getClient = () => (client ??= new Resend(RESEND_API_KEY));

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const server = {
  sendContact: defineAction({
    accept: 'form',
    input: contactSchema,
    handler: async (input) => {
      const isBot =
        input.website !== '' ||
        (input.loaded_at > 0 && Date.now() - input.loaded_at < MIN_SUBMIT_TIME_MS);

      // Reply "ok" to bots so they get no signal; nothing is sent.
      if (isBot) return { sent: true };

      const service = input.service ? await getEntry('services', input.service) : undefined;
      const serviceLabel = service?.data.nav_label ?? 'No especificado';

      const rows: [string, string][] = [
        ['Nombre', input.name],
        ['Correo', input.email],
        ['Trámite', serviceLabel],
        ['Asunto', input.subject],
      ];

      const text = [...rows.map(([key, value]) => `${key}: ${value}`), '', input.message].join('\n');

      const html = `
        <table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
          ${rows
            .map(
              ([key, value]) =>
                `<tr><td style="padding:4px 12px 4px 0;color:#5b665d"><strong>${key}</strong></td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
            )
            .join('')}
        </table>
        <p style="font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${escapeHtml(input.message)}</p>
      `;

      const { error } = await getClient().emails.send({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        replyTo: input.email,
        subject: `TramiMuniSC · ${input.subject}`,
        text,
        html,
      });

      if (error) {
        console.error('[sendContact] Resend:', error);
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se pudo enviar el mensaje. Intente de nuevo en unos minutos.',
        });
      }

      return { sent: true };
    },
  }),
};

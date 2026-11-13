import { defineAction, ActionError } from 'astro:actions';
import { getEntry } from 'astro:content';
import { z } from 'astro/zod';
import { Resend } from 'resend';
import {
  RESEND_API_KEY,
  CONTACT_TO,
  CONTACT_FROM,
  TURNSTILE_SECRET_KEY,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
} from 'astro:env/server';
import { canReceiveEmail } from '../lib/email';
import { MAX_ATTACHMENT_BYTES, ATTACHMENT_TYPES } from '../lib/attachment';
import { analyzeMessage, isRateLimited, verifyTurnstile } from '../lib/spam';

/** Minimum time (ms) between form load and submit. Filters out bots. */
const MIN_SUBMIT_TIME_MS = 3000;

/** Accepted messages per IP and hour. */
const RATE_LIMIT = { limit: 5, windowSeconds: 3600 };
const redis =
  UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN
    ? { url: UPSTASH_REDIS_REST_URL, token: UPSTASH_REDIS_REST_TOKEN }
    : undefined;

/*
 * Error messages are codes (see `error.*` in src/i18n/ui.ts); the client
 * shows them in the visitor's language.
 */
const contactSchema = z.object({
  lang: z.enum(['es', 'en']).nullish().transform((v) => v ?? 'es'),
  name: z.string().trim().min(1, 'name_required').max(120, 'name_max'),
  email: z
    .string()
    .trim()
    .min(1, 'email_required')
    .pipe(z.email('email_invalid'))
    .refine(canReceiveEmail, 'email_unreachable'),
  subject: z.string().trim().min(1, 'subject_required').max(150, 'subject_max'),
  service: z.string().trim().max(60).nullish().transform((v) => v ?? ''),
  message: z.string().trim().min(10, 'message_min').max(5000, 'message_max'),
  // An empty file input arrives as a File of size 0.
  attachment: z
    .instanceof(File)
    .nullish()
    .transform((file) => (file && file.size > 0 ? file : null))
    .refine((file) => !file || (ATTACHMENT_TYPES as readonly string[]).includes(file.type), 'attachment_type')
    .refine((file) => !file || file.size <= MAX_ATTACHMENT_BYTES, 'attachment_size'),
  // Anti-spam: honeypot field (must be empty) and form load timestamp.
  // Astro parses empty FormData fields as null.
  website: z.string().nullish().transform((v) => v ?? ''),
  loaded_at: z.coerce.number().nullish().transform((v) => v ?? 0),
  'cf-turnstile-response': z.string().nullish().transform((v) => v ?? ''),
});

let client: Resend | null = null;
const getClient = () => (client ??= new Resend(RESEND_API_KEY));

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Keeps the original name readable but safe for an email attachment. */
const safeFilename = (name: string) => name.replace(/[^\w.\- áéíóúñÁÉÍÓÚÑ]/g, '_').slice(0, 120) || 'adjunto';

export const server = {
  sendContact: defineAction({
    accept: 'form',
    input: contactSchema,
    handler: async (input, context) => {
      const isBot =
        input.website !== '' ||
        (input.loaded_at > 0 && Date.now() - input.loaded_at < MIN_SUBMIT_TIME_MS);

      // Reply "ok" to bots so they get no signal; nothing is sent.
      if (isBot) return { sent: true };

      const ip = context.clientAddress;

      if (await isRateLimited(ip, { ...RATE_LIMIT, redis })) {
        throw new ActionError({ code: 'TOO_MANY_REQUESTS', message: 'contact.rate_limited' });
      }

      if (TURNSTILE_SECRET_KEY && !(await verifyTurnstile(input['cf-turnstile-response'], TURNSTILE_SECRET_KEY, ip))) {
        throw new ActionError({ code: 'FORBIDDEN', message: 'contact.captcha_failed' });
      }

      const analysis = analyzeMessage({
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
        hasService: input.service !== '',
      });

      if (analysis.verdict === 'offensive') {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'contact.offensive' });
      }

      if (analysis.verdict === 'spam') {
        // Logged so the lists can be tuned; the sender sees a normal "sent".
        console.warn('[sendContact] spam descartado:', analysis.reasons.join(', '));
        return { sent: true };
      }

      const needsReview = analysis.verdict === 'review';

      // The email to the office is always in Spanish.
      const service = input.service ? await getEntry('services', `es/${input.service}`) : undefined;
      const serviceLabel = service?.data.nav_label ?? 'No especificado';

      const rows: [string, string][] = [
        ['Nombre', input.name],
        ['Correo', input.email],
        ['Trámite', serviceLabel],
        ['Asunto', input.subject],
        ['Idioma', input.lang === 'en' ? 'Inglés' : 'Español'],
        ['Adjunto', input.attachment ? input.attachment.name : 'Ninguno'],
      ];
      if (needsReview) rows.push(['Revisar', analysis.reasons.join(', ')]);

      const text = [...rows.map(([key, value]) => `${key}: ${value}`), '', input.message].join('\n');

      const html = `
        <table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
          ${rows
            .map(
              ([key, value]) =>
                `<tr><td style="padding:4px 12px 4px 0;color:#56625a"><strong>${key}</strong></td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
            )
            .join('')}
        </table>
        <p style="font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${escapeHtml(input.message)}</p>
      `;

      const attachments = input.attachment
        ? [
            {
              filename: safeFilename(input.attachment.name),
              content: Buffer.from(await input.attachment.arrayBuffer()),
            },
          ]
        : undefined;

      const { error } = await getClient().emails.send({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        replyTo: input.email,
        // [Revisar] lets a Gmail filter route doubtful messages to their own label
        subject: `${needsReview ? '[Revisar] ' : ''}TramiMuniSC · ${input.subject}`,
        text,
        html,
        attachments,
      });

      if (error) {
        console.error('[sendContact] Resend:', error);
        throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'contact.error' });
      }

      return { sent: true };
    },
  }),
};

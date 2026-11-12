import { defineAction, ActionError } from 'astro:actions';
import { getEntry } from 'astro:content';
import { z } from 'astro/zod';
import { Resend } from 'resend';
import { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } from 'astro:env/server';

/** Tiempo mínimo (ms) entre la carga del formulario y el envío. Filtra bots. */
const TIEMPO_MINIMO_MS = 3000;

const esquema_contacto = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(120, 'Máximo 120 caracteres'),
  correo: z.string().trim().min(1, 'El correo es requerido').pipe(z.email('Ingrese un correo válido')),
  asunto: z.string().trim().min(1, 'El asunto es requerido').max(150, 'Máximo 150 caracteres'),
  tramite: z.string().trim().max(60).nullish().transform((v) => v ?? ''),
  mensaje: z
    .string()
    .trim()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(5000, 'Máximo 5000 caracteres'),
  // Anti-spam: campo trampa (debe venir vacío) y marca de tiempo de carga.
  // Astro entrega los campos vacíos de un FormData como null.
  sitio_web: z.string().nullish().transform((v) => v ?? ''),
  cargado_en: z.coerce.number().nullish().transform((v) => v ?? 0),
});

let cliente: Resend | null = null;
const obtenerCliente = () => (cliente ??= new Resend(RESEND_API_KEY));

const escaparHtml = (texto: string) =>
  texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const server = {
  enviarContacto: defineAction({
    accept: 'form',
    input: esquema_contacto,
    handler: async (datos) => {
      const es_bot =
        datos.sitio_web !== '' ||
        (datos.cargado_en > 0 && Date.now() - datos.cargado_en < TIEMPO_MINIMO_MS);

      // Al bot se le responde "ok" para no darle señal; no se envía nada.
      if (es_bot) return { enviado: true };

      const servicio = datos.tramite ? await getEntry('servicios', datos.tramite) : undefined;
      const tramite = servicio?.data.nav ?? 'No especificado';

      const filas: [string, string][] = [
        ['Nombre', datos.nombre],
        ['Correo', datos.correo],
        ['Trámite', tramite],
        ['Asunto', datos.asunto],
      ];

      const texto = [...filas.map(([k, v]) => `${k}: ${v}`), '', datos.mensaje].join('\n');

      const html = `
        <table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
          ${filas
            .map(
              ([k, v]) =>
                `<tr><td style="padding:4px 12px 4px 0;color:#5b665d"><strong>${k}</strong></td><td style="padding:4px 0">${escaparHtml(v)}</td></tr>`,
            )
            .join('')}
        </table>
        <p style="font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap;margin-top:16px">${escaparHtml(datos.mensaje)}</p>
      `;

      const { error } = await obtenerCliente().emails.send({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        replyTo: datos.correo,
        subject: `[Contacto web] ${datos.asunto}`,
        text: texto,
        html,
      });

      if (error) {
        console.error('[enviarContacto] Resend:', error);
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se pudo enviar el mensaje. Intente de nuevo en unos minutos.',
        });
      }

      return { enviado: true };
    },
  }),
};

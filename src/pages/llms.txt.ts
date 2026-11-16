import type { APIRoute } from 'astro';
import { getPages, type PageEntry } from '../data/pages';
import { getGuides } from '../data/guides';
import { homeFaq } from '../data/home_faq';
import { site } from '../data/site';
import { useTranslations } from '../i18n/ui';

/**
 * Summary of the site for AI assistants (llmstxt.org): what the service is,
 * its pages and the short legal answers, so they can cite the right page.
 */
export const GET: APIRoute = async ({ site: base }) => {
  const t = useTranslations('es');
  const pages = await getPages();
  const guides = await getGuides('es');
  const abs = (path: string) => new URL(path, base).toString();
  const list = (filter: (p: PageEntry) => boolean) =>
    pages.filter(filter).map((p) => `- [${p.title}](${abs(p.path)}): ${p.description}`);

  const body = [
    `# ${site.name}`,
    '',
    `> ${t('meta.home_description')}`,
    '',
    t('footer.disclaimer'),
    `Atiende en ${site.location}. Contacto: ${site.email}. Horario: ${t('site.hours')}`,
    '',
    '## Servicios',
    ...list((p) => p.lang === 'es' && p.section === 'service'),
    '',
    '## Guías',
    ...guides.map((g) => `- [${g.data.title}](${abs(g.href)}): ${g.data.summary}`),
    '',
    '## Preguntas frecuentes',
    ...homeFaq.es.map(({ q, a }) => `- ${q} ${a}`),
    '',
    '## Contacto y legal',
    ...list((p) => p.lang === 'es' && (p.section === 'contact' || p.section === 'legal')),
    '',
    '## English',
    ...list((p) => p.lang === 'en' && p.section !== 'legal'),
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

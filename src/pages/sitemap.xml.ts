import type { APIRoute } from 'astro';
import { getPages } from '../data/pages';

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const day = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Every page of the registry with its language alternates (hreflang) and,
 * when the content records it, the date of its last review.
 */
export const GET: APIRoute = async ({ site }) => {
  const abs = (path: string) => xml(new URL(path, site).toString());
  const urls = (await getPages()).map((page) => {
    const links = Object.entries(page.alternates).map(
      ([lang, path]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${abs(path)}"/>`,
    );
    links.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${abs(page.alternates.es)}"/>`);
    const lastmod = page.updated ? `<lastmod>${day(page.updated)}</lastmod>` : '';
    return `<url><loc>${abs(page.path)}</loc>${lastmod}${links.join('')}</url>`;
  });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};

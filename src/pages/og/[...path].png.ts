import type { APIRoute, GetStaticPaths } from 'astro';
import { getPages, ogImagePath, type PageEntry } from '../../data/pages';
import { renderOgImage } from '../../lib/og_image';
import { site } from '../../data/site';
import { useTranslations } from '../../i18n/ui';

/** One Open Graph image per page in the registry: /og/<page path>.png */
export const getStaticPaths = (async () =>
  (await getPages()).map((page) => ({
    params: { path: ogImagePath(page.path).slice('/og/'.length, -'.png'.length) },
    props: { page },
  }))) satisfies GetStaticPaths;

const eyebrowOf = ({ section, lang }: PageEntry) => {
  const t = useTranslations(lang);
  if (section === 'guide' || section === 'guides') return t('guides.nav');
  if (section === 'service') return t('footer.services');
  if (section === 'legal') return t('footer.legal');
  return site.name;
};

export const GET: APIRoute<{ page: PageEntry }> = async ({ props: { page } }) => {
  const png = await renderOgImage({
    title: page.title,
    description: page.description,
    eyebrow: eyebrowOf(page),
    footer: `tramimunisc.com · ${site.location}`,
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};

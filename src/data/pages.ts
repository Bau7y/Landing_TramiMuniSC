/**
 * Registry of every indexable page in both languages. The sitemap, the
 * Open Graph images and llms.txt are built from this list, so a new page
 * only needs to be added here once.
 */
import { getServices } from './services';
import { getGuides } from './guides';
import { getLegalPages } from './legal';
import { languages, routes, useTranslations, type Lang } from '../i18n/ui';

export type PageSection = 'home' | 'service' | 'guides' | 'guide' | 'contact' | 'legal';

export interface PageEntry {
  path: string;
  lang: Lang;
  section: PageSection;
  /** Visible heading, used on the Open Graph image. */
  title: string;
  description: string;
  /** Same page in each language (hreflang). */
  alternates: Record<Lang, string>;
  updated?: Date;
}

const LANGS = Object.keys(languages) as Lang[];

/** Pairs entries of a localized collection by key: { key: { es: href, en: href } }. */
function pairHrefs(lists: Record<Lang, { key: string; href: string }[]>) {
  const pairs = new Map<string, Record<Lang, string>>();
  for (const lang of LANGS) {
    for (const { key, href } of lists[lang]) {
      pairs.set(key, { ...(pairs.get(key) ?? ({} as Record<Lang, string>)), [lang]: href });
    }
  }
  return (key: string, lang: Lang) => {
    const pair = pairs.get(key) ?? ({} as Partial<Record<Lang, string>>);
    return Object.fromEntries(LANGS.map((l) => [l, pair[l] ?? pair[lang]])) as Record<Lang, string>;
  };
}

export async function getPages(): Promise<PageEntry[]> {
  const services = { es: await getServices('es'), en: await getServices('en') };
  const guides = { es: await getGuides('es'), en: await getGuides('en') };
  const legal = { es: await getLegalPages('es'), en: await getLegalPages('en') };
  const serviceAlt = pairHrefs(services);
  const guideAlt = pairHrefs(guides);
  const legalAlt = pairHrefs(legal);

  return LANGS.flatMap((lang) => {
    const t = useTranslations(lang);
    const fixed = (section: PageSection, route: Record<Lang, string>, title: string, description: string): PageEntry => ({
      path: route[lang],
      lang,
      section,
      title,
      description,
      alternates: route,
    });

    return [
      fixed('home', routes.home, t('home.title'), t('meta.home_description')),
      ...services[lang].map((s) => ({
        path: s.href,
        lang,
        section: 'service' as const,
        title: s.data.title,
        description: s.data.meta_description,
        alternates: serviceAlt(s.key, lang),
        updated: s.data.updated,
      })),
      fixed('guides', routes.guides, t('guides.title'), t('guides.meta')),
      ...guides[lang].map((g) => ({
        path: g.href,
        lang,
        section: 'guide' as const,
        title: g.data.title,
        description: g.data.meta_description,
        alternates: guideAlt(g.key, lang),
        updated: g.data.updated,
      })),
      fixed('contact', routes.contact, t('contact.title'), t('contact.meta')),
      ...legal[lang].map((p) => ({
        path: p.href,
        lang,
        section: 'legal' as const,
        title: p.data.title,
        description: p.data.meta_description,
        alternates: legalAlt(p.key, lang),
        updated: p.data.updated,
      })),
    ];
  });
}

/** Open Graph image size (the generic public/og.jpg uses it too). */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/** Path of a page's Open Graph image: /og/<page path>.png ("/" becomes /og/index.png). */
export const ogImagePath = (path: string) => `/og${path === '/' ? '/index' : path}.png`;

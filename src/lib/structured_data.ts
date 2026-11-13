/**
 * schema.org JSON-LD builders. Pure functions: they receive data and return
 * plain objects, so pages decide what to publish and components stay unaware.
 */
import { site } from '../data/site';
import type { Lang } from '../i18n/ui';

type Json = Record<string, unknown>;

export interface FaqItem {
  q: string;
  a: string;
}

const absolute = (path: string, base: URL) => new URL(path, base).toString();

/** The business itself, published on the home page. */
export function businessSchema(base: URL, lang: Lang, description: string, homePath: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': absolute('/#business', base),
    name: site.name,
    description,
    url: absolute(homePath, base),
    email: site.email,
    image: absolute('/og.jpg', base),
    logo: absolute('/favicon.svg', base),
    inLanguage: lang,
    areaServed: { '@type': 'AdministrativeArea', name: 'San Carlos, Alajuela, Costa Rica' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Carlos',
      addressRegion: 'Alajuela',
      addressCountry: 'CR',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '22:00',
    },
  };
}

export function serviceSchema(base: URL, lang: Lang, name: string, description: string, path: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: absolute(path, base),
    inLanguage: lang,
    provider: { '@id': absolute('/#business', base) },
    areaServed: { '@type': 'AdministrativeArea', name: 'San Carlos, Alajuela, Costa Rica' },
  };
}

export function breadcrumbSchema(base: URL, items: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absolute(item.path, base),
    })),
  };
}

/** FAQ markup no longer produces a Google rich result, but still describes the page. */
export function faqSchema(items: FaqItem[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

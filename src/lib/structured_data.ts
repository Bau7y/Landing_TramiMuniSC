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

const AREA = { '@type': 'AdministrativeArea', name: 'San Carlos, Alajuela, Costa Rica' };
const LANGUAGES = ['es', 'en'];

/** "Ley 7509" → schema.org Legislation; other labels (e.g. "Plan Regulador") are skipped. */
export function legislation(label?: string): Json | undefined {
  const number = label?.match(/^Ley (\d+)$/)?.[1];
  if (!number) return undefined;
  return {
    '@type': 'Legislation',
    name: label,
    legislationIdentifier: `Ley N.° ${number}`,
    legislationJurisdiction: 'CR',
  };
}

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
    knowsLanguage: LANGUAGES,
    ...(site.phone ? { telephone: site.phone } : {}),
    ...(site.profiles.length > 0 ? { sameAs: site.profiles } : {}),
    areaServed: AREA,
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

export interface ServiceInfo {
  name: string;
  /** Generic kind of service, e.g. the menu label ("Exoneraciones"). */
  type: string;
  description: string;
  path: string;
  law?: string;
}

export function serviceSchema(base: URL, lang: Lang, info: ServiceInfo): Json {
  const law = legislation(info.law);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: info.name,
    serviceType: info.type,
    description: info.description,
    url: absolute(info.path, base),
    inLanguage: lang,
    availableLanguage: LANGUAGES,
    provider: { '@id': absolute('/#business', base) },
    areaServed: AREA,
    audience: { '@type': 'Audience', audienceType: lang === 'es' ? 'Propietarios y contribuyentes de San Carlos' : 'Property owners and taxpayers in San Carlos' },
    ...(law ? { subjectOf: law } : {}),
  };
}

export interface ArticleInfo {
  title: string;
  description: string;
  path: string;
  image: string;
  updated: Date;
  law?: string;
}

/** A guide: an Article published by the business. */
export function articleSchema(base: URL, lang: Lang, info: ArticleInfo): Json {
  const law = legislation(info.law);
  const business = { '@id': absolute('/#business', base) };
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: info.title,
    description: info.description,
    url: absolute(info.path, base),
    mainEntityOfPage: absolute(info.path, base),
    image: absolute(info.image, base),
    inLanguage: lang,
    dateModified: info.updated.toISOString().slice(0, 10),
    author: business,
    publisher: business,
    ...(law ? { about: law } : {}),
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

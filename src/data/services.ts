import { getCollection, type CollectionEntry } from 'astro:content';
import { routes, type Lang } from '../i18n/ui';

export type Service = CollectionEntry<'services'> & { key: string; lang: Lang; href: string };

const keyOf = (id: string) => id.split('/')[1];
const langOf = (id: string) => id.split('/')[0] as Lang;

/** All services of a language, sorted by `order`, with key and localized href. */
export async function getServices(lang: Lang): Promise<Service[]> {
  const entries = await getCollection('services', ({ id }) => langOf(id) === lang);
  return entries
    .map((entry) => ({
      ...entry,
      key: keyOf(entry.id),
      lang,
      href: `${routes.servicesBase[lang]}/${entry.data.url_slug}`,
    }))
    .sort((a, b) => a.data.order - b.data.order);
}

/** URL of the same service in another language. */
export async function getServiceHref(key: string, lang: Lang): Promise<string | undefined> {
  return (await getServices(lang)).find((s) => s.key === key)?.href;
}

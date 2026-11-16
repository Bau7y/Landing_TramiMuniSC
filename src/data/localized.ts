import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import type { Lang } from '../i18n/ui';

/**
 * Collections stored as src/content/<collection>/<lang>/<key>.md.
 * <key> (the Spanish file name) pairs the translations of one entry.
 */
export type Localized<C extends CollectionKey> = CollectionEntry<C> & { key: string; lang: Lang; href: string };

type WithSlug = 'services' | 'guides' | 'legal';

const keyOf = (id: string) => id.split('/')[1];
const langOf = (id: string) => id.split('/')[0] as Lang;

/** Entries of one language, sorted by `order`, with key and localized href (`<base>/<url_slug>`). */
export async function getLocalized<C extends WithSlug>(collection: C, lang: Lang, base: string): Promise<Localized<C>[]> {
  const entries = (await getCollection(collection, ({ id }) => langOf(id) === lang)) as CollectionEntry<C>[];
  return entries
    .map((entry) => ({ ...entry, key: keyOf(entry.id), lang, href: `${base}/${entry.data.url_slug}` }))
    .sort((a, b) => a.data.order - b.data.order);
}

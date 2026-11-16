import { getLocalized, type Localized } from './localized';
import { routes, type Lang } from '../i18n/ui';

export type LegalPage = Localized<'legal'>;

/** Privacy policy and legal notice; Spanish at the root, English under /en. */
export const getLegalPages = (lang: Lang) => getLocalized('legal', lang, routes.legalBase[lang]);

export async function getLegalHref(key: string, lang: Lang): Promise<string | undefined> {
  return (await getLegalPages(lang)).find((p) => p.key === key)?.href;
}

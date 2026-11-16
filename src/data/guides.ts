import { getLocalized, type Localized } from './localized';
import { routes, type Lang } from '../i18n/ui';

export type Guide = Localized<'guides'>;

export const getGuides = (lang: Lang) => getLocalized('guides', lang, routes.guides[lang]);

export async function getGuideHref(key: string, lang: Lang): Promise<string | undefined> {
  return (await getGuides(lang)).find((g) => g.key === key)?.href;
}

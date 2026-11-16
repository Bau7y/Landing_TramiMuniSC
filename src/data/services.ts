import { getLocalized, type Localized } from './localized';
import { routes, type Lang } from '../i18n/ui';

export type Service = Localized<'services'>;

/** All services of a language, sorted by `order`, with key and localized href. */
export const getServices = (lang: Lang) => getLocalized('services', lang, routes.servicesBase[lang]);

/** URL of the same service in another language. */
export async function getServiceHref(key: string, lang: Lang): Promise<string | undefined> {
  return (await getServices(lang)).find((s) => s.key === key)?.href;
}

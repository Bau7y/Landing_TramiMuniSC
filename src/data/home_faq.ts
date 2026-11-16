/**
 * General legal questions about the property tax, shown on the home page.
 * Service-specific questions live in each service's frontmatter (`faq`).
 * Sources: Ley 7509 (arts. 4 e, 16, 17, 22, 23; checked against the law text)
 * and the municipality's form F-SBI-002-2024.
 */
import type { FaqItem } from '../lib/structured_data';
import type { Lang } from '../i18n/ui';

export const homeFaq: Record<Lang, FaqItem[]> = {
  es: [
    {
      q: '¿Cada cuánto tengo que declarar mi propiedad?',
      a: 'Al menos cada cinco años, ante la municipalidad donde está la propiedad (Ley 7509, art. 16).',
    },
    {
      q: '¿Qué pasa si no declaro a tiempo?',
      a: 'La municipalidad puede valorar la propiedad de oficio, sin su declaración (Ley 7509, art. 17).',
    },
    {
      q: '¿Cuándo conviene solicitar la exoneración por bien único?',
      a: 'En enero. El impuesto es anual (enero a diciembre) y la exoneración se renueva cada año: pedirla al inicio cubre el periodo completo.',
    },
    {
      q: '¿Quién tiene derecho a solicitar la exoneración del impuesto de bienes inmuebles?',
      a: 'Las personas que poseen un solo bien inmueble a nivel nacional. El derecho es de la persona, no de la propiedad, y cubre hasta 45 salarios base del valor (Ley 7509, art. 4 e).',
    },
    {
      q: '¿Cuánto es el impuesto sobre bienes inmuebles?',
      a: 'El 0,25 % anual sobre el valor registrado: terreno más construcciones fijas y permanentes.',
    },
  ],
  en: [
    {
      q: 'How often do I have to declare my property?',
      a: 'At least every five years, to the municipality where the property is located (Ley 7509, art. 16).',
    },
    {
      q: 'What happens if I don’t declare on time?',
      a: 'The municipality may value the property on its own, without your declaration (Ley 7509, art. 17).',
    },
    {
      q: 'When is the best time to request the single-property exemption?',
      a: 'In January. The tax is annual (January to December) and the exemption is renewed every year: requesting it early covers the whole period.',
    },
    {
      q: 'Who is entitled to request the property tax exemption?',
      a: 'People who own only one property nationwide. The right belongs to the person, not to the property, and covers up to 45 base salaries of its value (Ley 7509, art. 4 e).',
    },
    {
      q: 'How much is the property tax?',
      a: '0.25% per year of the registered value: land plus fixed, permanent buildings.',
    },
  ],
};

/**
 * General legal questions about the property tax, shown on the home page.
 * Service-specific questions live in each service's frontmatter (`faq`).
 * Sources: Ley 7509 (arts. 4 e, 16, 17, 22, 23), Ley 4755 (arts. 18 y 18 bis)
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
      a: 'La municipalidad puede cobrar una multa igual al impuesto dejado de pagar y valorar la propiedad de oficio (Ley 7509, art. 17).',
    },
    {
      q: '¿Cuándo conviene solicitar la exoneración por bien único?',
      a: 'En enero. El impuesto es anual (enero a diciembre) y la exoneración se renueva cada año: pedirla al inicio cubre el periodo completo.',
    },
    {
      q: '¿Qué propiedades pueden exonerarse por bien único?',
      a: 'La única propiedad de una persona física en todo el país. Cubre hasta 45 salarios base; sobre el exceso se paga impuesto (Ley 7509, art. 4 e).',
    },
    {
      q: '¿Puedo pedir la exoneración si tengo tributos pendientes?',
      a: 'No. Estar al día con los tributos municipales es requisito indispensable (Ley 4755, arts. 18 y 18 bis).',
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
      a: 'The municipality may charge a fine equal to the unpaid tax and value the property on its own (Ley 7509, art. 17).',
    },
    {
      q: 'When is the best time to request the single-property exemption?',
      a: 'In January. The tax is annual (January to December) and the exemption is renewed every year: requesting it early covers the whole period.',
    },
    {
      q: 'Which properties qualify for the single-property exemption?',
      a: 'An individual’s only property nationwide. It covers up to 45 base salaries; tax is paid on the excess (Ley 7509, art. 4 e).',
    },
    {
      q: 'Can I request the exemption if I owe municipal taxes?',
      a: 'No. Being up to date with municipal taxes is mandatory (Ley 4755, arts. 18 and 18 bis).',
    },
    {
      q: 'How much is the property tax?',
      a: '0.25% per year of the registered value: land plus fixed, permanent buildings.',
    },
  ],
};

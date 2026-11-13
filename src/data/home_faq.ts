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
      a: 'Al menos cada cinco años. El artículo 16 de la Ley N.° 7509 obliga a toda persona propietaria a declarar el valor de sus bienes inmuebles ante la municipalidad donde se ubican.',
    },
    {
      q: '¿Qué pasa si no declaro a tiempo?',
      a: 'Según el artículo 17 de la Ley N.° 7509, la municipalidad puede imponer una multa igual a la diferencia de impuesto dejada de pagar y valorar la propiedad de oficio.',
    },
    {
      q: '¿Cuándo conviene solicitar la exoneración por bien único?',
      a: 'Al inicio del año. El impuesto es anual, del 1 de enero al 31 de diciembre, y la exoneración debe renovarse cada año; solicitarla en enero permite que cubra el periodo completo desde el primer pago.',
    },
    {
      q: '¿Qué propiedades pueden exonerarse por bien único?',
      a: 'La de una persona física que posea un único bien inmueble a nivel nacional, inscrito o no en el Registro. El beneficio cubre hasta 45 salarios base; si la propiedad vale más, se paga el impuesto sobre el exceso (artículo 4, inciso e, de la Ley N.° 7509).',
    },
    {
      q: '¿Puedo pedir la exoneración si tengo tributos pendientes?',
      a: 'No. Estar al día con los tributos municipales es un requisito indispensable, según los artículos 18 y 18 bis del Código de Normas y Procedimientos Tributarios (Ley N.° 4755).',
    },
    {
      q: '¿Cuánto es el impuesto sobre bienes inmuebles?',
      a: 'El 0,25 % anual sobre el valor registrado de la propiedad: terreno más construcciones e instalaciones fijas y permanentes.',
    },
  ],
  en: [
    {
      q: 'How often do I have to declare my property?',
      a: 'At least every five years. Article 16 of Ley N.° 7509 requires every owner to declare the value of their property to the municipality where it is located.',
    },
    {
      q: 'What happens if I don’t declare on time?',
      a: 'Under article 17 of Ley N.° 7509, the municipality may impose a fine equal to the unpaid tax difference and value the property on its own.',
    },
    {
      q: 'When is the best time to request the single-property exemption?',
      a: 'At the start of the year. The tax is annual, from January 1 to December 31, and the exemption must be renewed every year; requesting it in January lets it cover the whole period from the first payment.',
    },
    {
      q: 'Which properties qualify for the single-property exemption?',
      a: 'One owned by an individual who has only one property nationwide, registered or not. The benefit covers up to 45 base salaries; if the property is worth more, tax is paid on the excess (article 4, subsection e, of Ley N.° 7509).',
    },
    {
      q: 'Can I request the exemption if I owe municipal taxes?',
      a: 'No. Being up to date with municipal taxes is a mandatory requirement under articles 18 and 18 bis of the Tax Code (Ley N.° 4755).',
    },
    {
      q: 'How much is the property tax?',
      a: '0.25% per year of the property’s registered value: land plus fixed, permanent buildings and installations.',
    },
  ],
};

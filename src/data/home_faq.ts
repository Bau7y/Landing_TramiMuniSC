/**
 * General questions about the service, shown on the home page.
 * Service-specific questions live in each service's frontmatter (`faq`).
 * Pending legal/business review before publishing.
 */
import type { FaqItem } from '../lib/structured_data';
import type { Lang } from '../i18n/ui';

export const homeFaq: Record<Lang, FaqItem[]> = {
  es: [
    {
      q: '¿TramiMuni es parte de la Municipalidad de San Carlos?',
      a: 'No. Somos un servicio privado e independiente de acompañamiento. Presentamos los trámites ante la municipalidad en nombre de cada cliente, pero las resoluciones las emite la municipalidad.',
    },
    {
      q: '¿Cuánto cuesta el servicio?',
      a: 'La primera consulta es gratuita. El costo de la gestión depende del trámite y se lo indicamos antes de empezar. Los montos que cobre la municipalidad, si los hay, se pagan aparte.',
    },
    {
      q: '¿Tengo que ir a las oficinas de la municipalidad?',
      a: 'En la mayoría de los trámites, no: nos envía los documentos y nosotros los presentamos. Si un trámite exige la presencia o la firma original del propietario, se lo indicamos desde el inicio.',
    },
    {
      q: '¿Cuánto tarda un trámite?',
      a: 'Depende del tipo de trámite y de los plazos de la municipalidad. Al revisar su caso le damos un estimado y le avisamos de cada avance.',
    },
    {
      q: '¿Qué hacen con mis datos?',
      a: 'Los usamos solo para responderle y gestionar su trámite. Únicamente se comparten con la municipalidad cuando el trámite lo requiere.',
    },
  ],
  en: [
    {
      q: 'Is TramiMuni part of the Municipality of San Carlos?',
      a: 'No. We are a private, independent support service. We file procedures with the municipality on behalf of each client, but resolutions are issued by the municipality.',
    },
    {
      q: 'How much does the service cost?',
      a: 'The first consultation is free. The fee depends on the procedure and we tell you before starting. Any amounts charged by the municipality are paid separately.',
    },
    {
      q: 'Do I have to go to the municipal offices?',
      a: 'For most procedures, no: you send us the documents and we file them. If a procedure requires the owner to be present or sign in person, we tell you from the start.',
    },
    {
      q: 'How long does a procedure take?',
      a: 'It depends on the procedure and the municipality’s deadlines. When we review your case we give you an estimate and keep you updated.',
    },
    {
      q: 'What do you do with my data?',
      a: 'We only use it to reply and handle your procedure. It is shared with the municipality only when the procedure requires it.',
    },
  ],
};

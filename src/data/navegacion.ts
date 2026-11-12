import { getCollection } from 'astro:content';

export interface EnlaceNav {
  href: string;
  etiqueta: string;
}

/**
 * Enlaces de navegación. Los servicios se generan desde la colección
 * `servicios`: agregar un .md en src/content/servicios lo publica en
 * navbar, menú móvil, footer y tarjetas del inicio.
 */
export async function obtenerNavegacion() {
  const servicios = (await getCollection('servicios')).sort(
    (a, b) => a.data.orden - b.data.orden,
  );

  const enlaces_servicios: EnlaceNav[] = servicios.map((s) => ({
    href: `/servicios/${s.id}`,
    etiqueta: s.data.nav,
  }));

  const principal: EnlaceNav[] = [{ href: '/', etiqueta: 'Inicio' }, ...enlaces_servicios];
  const contacto: EnlaceNav = { href: '/contacto', etiqueta: 'Contáctenos' };

  return { principal, servicios: enlaces_servicios, contacto };
}

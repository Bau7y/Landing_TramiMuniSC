import { getCollection } from 'astro:content';

export interface NavLink {
  href: string;
  label: string;
}

/**
 * Navigation links. Service links are built from the `services` collection:
 * adding a .md file to src/content/services publishes it in the navbar,
 * mobile menu, footer and home page cards.
 */
export async function getNavigation() {
  const services = (await getCollection('services')).sort(
    (a, b) => a.data.order - b.data.order,
  );

  const serviceLinks: NavLink[] = services.map((service) => ({
    href: `/servicios/${service.id}`,
    label: service.data.nav_label,
  }));

  const main: NavLink[] = [{ href: '/', label: 'Inicio' }, ...serviceLinks];
  const contact: NavLink = { href: '/contacto', label: 'Contáctenos' };

  return { main, services: serviceLinks, contact };
}

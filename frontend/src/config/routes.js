/** Single source of truth for URLs, used by the router, the nav and links. */
export const ROUTES = {
  home: '/',
  projects: '/projects',
  projectDetail: '/projects/:slug',
  drawings: '/drawings',
  photography: '/photography',
  interiors: '/interiors',
  competitions: '/competitions',
  contact: '/contact',
};

export const projectPath = (slug) => `${ROUTES.projects}/${encodeURIComponent(slug)}`;

export const NAV_ITEMS = [
  { to: ROUTES.projects, label: 'Projects' },
  { to: ROUTES.drawings, label: 'Drawings' },
  { to: ROUTES.photography, label: 'Photography' },
  { to: ROUTES.interiors, label: 'Interiors' },
  { to: ROUTES.competitions, label: 'Competitions' },
  { to: ROUTES.contact, label: 'Contact' },
];

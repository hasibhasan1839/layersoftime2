import { ApiError } from './ApiError.js';
import { createListResource } from './createListResource.js';

const projectsBase = createListResource('projects');

export const projectsApi = {
  ...projectsBase,

  /** The site URL uses the slug, but the API detail route uses the numeric id, so filter by slug. */
  async getBySlug(slug, { signal } = {}) {
    const matches = await projectsBase.list({ params: { slug }, signal });
    const project = matches.find((item) => item.slug === slug);
    if (!project) throw new ApiError('Project not found.', { status: 404 });
    return project;
  },
};

export const drawingsApi = createListResource('drawings');
export const photographyApi = createListResource('photography');
export const interiorDesignsApi = createListResource('interior-designs');
export const competitionsApi = createListResource('competitions');

const contactsBase = createListResource('contacts');

export const contactApi = {
  /** The studio has one contact record; returns it, or null if none is published. */
  async get({ signal } = {}) {
    const [contact = null] = await contactsBase.list({ signal });
    return contact;
  },
};

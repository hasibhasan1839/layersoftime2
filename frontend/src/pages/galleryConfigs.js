import { drawingsApi, interiorDesignsApi, photographyApi } from '../api';
import { ROUTES } from '../config/routes.js';

/**
 * One entry per category-filtered gallery page. GalleryPage renders them all, so a
 * new gallery is a new entry here rather than a new page component.
 * `getCategory` and `toGalleryItem` map API fields onto the shapes the UI expects.
 */
export const GALLERY_CONFIGS = [
  {
    key: 'drawings',
    path: ROUTES.drawings,
    title: 'Drawings',
    intro: 'Watercolours, ink washes and pen studies of buildings and places.',
    filterLabel: 'Filter drawings by technique',
    emptyMessage: 'No drawings have been added yet.',
    resource: drawingsApi,
    getCategory: (drawing) => ({ value: drawing.drawing_type, label: drawing.drawing_type_display }),
    toGalleryItem: (drawing) => ({ id: drawing.id, src: drawing.image, title: drawing.name }),
  },
  {
    key: 'photography',
    path: ROUTES.photography,
    title: 'Photography',
    intro: 'Street, structure and light, in colour and monochrome.',
    filterLabel: 'Filter photographs by style',
    emptyMessage: 'No photographs have been added yet.',
    resource: photographyApi,
    getCategory: (photo) => ({ value: photo.photography_type, label: photo.photography_type_display }),
    toGalleryItem: (photo) => ({ id: photo.id, src: photo.image, title: photo.name }),
  },
  {
    key: 'interiors',
    path: ROUTES.interiors,
    title: 'Interiors',
    intro: 'Rooms designed around material, light and the way people use them.',
    filterLabel: 'Filter interiors by type',
    emptyMessage: 'No interior designs have been added yet.',
    resource: interiorDesignsApi,
    getCategory: (design) => ({ value: String(design.design_type), label: design.design_type_name }),
    toGalleryItem: (design) => ({ id: design.id, src: design.image, title: design.name, description: design.description }),
  },
];

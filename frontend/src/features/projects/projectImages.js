/**
 * A project has one cover (`image`) plus optional gallery rows (`images`).
 * The detail page shows them as a single sequence, cover first.
 */
export function getProjectGalleryItems(project) {
  const cover = project.image ? [{ id: `cover-${project.id}`, src: project.image }] : [];
  const extras = project.images.map((extra) => ({ id: `image-${extra.id}`, src: extra.image, caption: extra.caption }));
  return [...cover, ...extras].map(({ id, src, caption }, index) => ({
    id,
    src,
    title: caption || `${project.name}, view ${index + 1}`,
  }));
}

export const getProjectStatus = (project) => ({ value: project.status, label: project.status_display });

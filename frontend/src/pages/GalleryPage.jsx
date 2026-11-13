import { AsyncBoundary } from '../components/AsyncBoundary.jsx';
import { CategoryBrowser } from '../components/CategoryBrowser.jsx';
import { Gallery } from '../components/Gallery.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useQuery } from '../hooks/useQuery.js';

/** Drawings, photography and interiors: fetch a collection, filter by category, show a gallery. */
export default function GalleryPage({ config }) {
  const { key, title, intro, filterLabel, emptyMessage, resource, getCategory, toGalleryItem } = config;
  usePageTitle(title);
  const query = useQuery([key], ({ signal }) => resource.list({ signal }));

  return (
    <>
      <PageHeader title={title} intro={intro} />
      <AsyncBoundary query={query} emptyMessage={emptyMessage}>
        {(items) => (
          <CategoryBrowser items={items} getCategory={getCategory} filterLabel={filterLabel}>
            {(visible) => <Gallery items={visible.map(toGalleryItem)} />}
          </CategoryBrowser>
        )}
      </AsyncBoundary>
    </>
  );
}

import { useCategoryFilter } from '../hooks/useCategoryFilter.js';
import { FilterTabs } from './FilterTabs.jsx';

/**
 * Filter tabs derived from `items`, plus the filtered list handed to `children`.
 * Tabs are hidden when there is only one category, because they would filter nothing.
 */
export function CategoryBrowser({ items, getCategory, filterLabel, children }) {
  const { options, active, setActive, filtered } = useCategoryFilter(items, getCategory);
  return (
    <>
      {options.length > 2 && (
        <FilterTabs label={filterLabel} options={options} value={active} onChange={setActive} />
      )}
      {children(filtered)}
    </>
  );
}

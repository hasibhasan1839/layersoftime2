import { useMemo, useState } from 'react';
import { ALL_CATEGORIES, buildCategoryOptions, filterByCategory } from '../lib/categories.js';

/** `getCategory` must be a stable reference (define it at module level). */
export function useCategoryFilter(items, getCategory) {
  const [selected, setSelected] = useState(ALL_CATEGORIES);
  const options = useMemo(() => buildCategoryOptions(items, getCategory), [items, getCategory]);
  // If the selected category vanished after a reload, fall back to "All".
  const active = options.some((option) => option.value === selected) ? selected : ALL_CATEGORIES;
  const filtered = useMemo(() => filterByCategory(items, getCategory, active), [items, getCategory, active]);
  return { options, active, setActive: setSelected, filtered };
}

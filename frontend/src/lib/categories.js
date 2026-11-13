export const ALL_CATEGORIES = 'all';

/**
 * Builds filter-tab options from the data itself, so tabs always match what the
 * API returned and nothing is hard-coded twice.
 * `getCategory(item)` returns { value, label }.
 */
export function buildCategoryOptions(items, getCategory) {
  const byValue = new Map();
  items.forEach((item) => {
    const { value, label } = getCategory(item);
    const entry = byValue.get(value) ?? { value, label, count: 0 };
    entry.count += 1;
    byValue.set(value, entry);
  });
  return [{ value: ALL_CATEGORIES, label: 'All', count: items.length }, ...byValue.values()];
}

export function filterByCategory(items, getCategory, value) {
  return value === ALL_CATEGORIES ? items : items.filter((item) => getCategory(item).value === value);
}

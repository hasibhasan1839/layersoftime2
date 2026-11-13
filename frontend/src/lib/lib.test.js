import { describe, expect, it } from 'vitest';
import { ALL_CATEGORIES, buildCategoryOptions, filterByCategory } from './categories.js';
import { splitParagraphs, toTelHref } from './format.js';
import { resolveMediaUrl } from './media.js';

describe('categories', () => {
  const items = [{ t: 'a' }, { t: 'b' }, { t: 'a' }];
  const getCategory = (item) => ({ value: item.t, label: item.t.toUpperCase() });

  it('builds options with counts, led by "All"', () => {
    expect(buildCategoryOptions(items, getCategory)).toEqual([
      { value: ALL_CATEGORIES, label: 'All', count: 3 },
      { value: 'a', label: 'A', count: 2 },
      { value: 'b', label: 'B', count: 1 },
    ]);
  });

  it('filters by category and passes everything through for "All"', () => {
    expect(filterByCategory(items, getCategory, 'a')).toHaveLength(2);
    expect(filterByCategory(items, getCategory, ALL_CATEGORIES)).toBe(items);
  });
});

describe('format', () => {
  it('splits paragraphs on blank lines and drops empties', () => {
    expect(splitParagraphs('One.\n\nTwo.\n\n\n')).toEqual(['One.', 'Two.']);
    expect(splitParagraphs(undefined)).toEqual([]);
  });

  it('builds a dialable tel: link', () => {
    expect(toTelHref('+880 1688 483030')).toBe('tel:+8801688483030');
  });
});

describe('resolveMediaUrl', () => {
  it('keeps absolute URLs, resolves relative ones against the API origin, and handles empty', () => {
    expect(resolveMediaUrl('http://localhost:8000/media/a.jpg')).toBe('http://localhost:8000/media/a.jpg');
    expect(resolveMediaUrl('/media/a.jpg')).toBe('http://localhost:8000/media/a.jpg');
    expect(resolveMediaUrl(null)).toBeNull();
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeList } from './createListResource.js';
import { contactApi, projectsApi } from './resources.js';

const stubList = (payload) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
    new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json' } }),
  ));

afterEach(() => vi.unstubAllGlobals());

describe('normalizeList', () => {
  it('accepts a bare array and a DRF paginated envelope', () => {
    expect(normalizeList([1, 2])).toEqual([1, 2]);
    expect(normalizeList({ count: 1, results: [1] })).toEqual([1]);
    expect(normalizeList(null)).toEqual([]);
  });
});

describe('projectsApi.getBySlug', () => {
  it('filters by slug and returns the exact match', async () => {
    stubList([{ id: 2, slug: 'oculus-house' }]);
    await expect(projectsApi.getBySlug('oculus-house')).resolves.toMatchObject({ id: 2 });
    expect(fetch.mock.calls[0][0].toString()).toContain('/projects/?slug=oculus-house');
  });

  it('throws a 404 ApiError when nothing matches', async () => {
    stubList([]);
    await expect(projectsApi.getBySlug('nope')).rejects.toMatchObject({ status: 404, isNotFound: true });
  });
});

describe('contactApi.get', () => {
  it('returns the first contact record, or null when there is none', async () => {
    stubList([{ id: 1, email: 'a@b.c' }, { id: 2 }]);
    await expect(contactApi.get()).resolves.toMatchObject({ id: 1 });
    stubList([]);
    await expect(contactApi.get()).resolves.toBeNull();
  });
});

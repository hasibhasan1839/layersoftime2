import { get } from './httpClient.js';

/**
 * DRF returns a bare array today. If pagination is enabled later it returns
 * { results: [...] } instead; accepting both keeps the UI working.
 */
export function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

/** Builds the read-only client for one collection endpoint, e.g. createListResource('drawings'). */
export function createListResource(name) {
  return {
    async list({ params, signal } = {}) {
      return normalizeList(await get(`${name}/`, { params, signal }));
    },
  };
}

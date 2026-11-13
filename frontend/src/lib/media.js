import { API_ORIGIN } from '../config/env.js';

/** DRF normally returns absolute image URLs; this also handles relative "/media/..." paths. */
export function resolveMediaUrl(path) {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return new URL(path, API_ORIGIN).href;
}

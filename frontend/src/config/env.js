const DEFAULT_API_URL = 'http://localhost:8000/api';

/** Base URL of the Django API, without a trailing slash. */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL).replace(/\/+$/, '');

/** Scheme + host of the API. Relative media paths (e.g. "/media/x.jpg") resolve against this. */
export const API_ORIGIN = new URL(API_BASE_URL).origin;

export const REQUEST_TIMEOUT_MS = 15_000;

import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './ApiError.js';
import { get } from './httpClient.js';

const jsonResponse = (body, init = {}) =>
  new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' }, ...init });

afterEach(() => vi.unstubAllGlobals());

describe('httpClient.get', () => {
  it('requests the API base URL with a trailing-slash path and query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    await get('projects/', { params: { slug: 'oculus-house', status: undefined, empty: '' } });

    const [url] = fetchMock.mock.calls[0];
    expect(url.toString()).toBe('http://localhost:8000/api/projects/?slug=oculus-house');
  });

  it('returns parsed JSON on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([{ id: 1 }])));
    await expect(get('drawings/')).resolves.toEqual([{ id: 1 }]);
  });

  it('turns an error response into an ApiError with the server message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ detail: 'Not found.' }, { status: 404 })));
    await expect(get('projects/9/')).rejects.toMatchObject({ name: 'ApiError', status: 404, message: 'Not found.', isNotFound: true });
  });

  it('turns a network failure into an ApiError with status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const error = await get('projects/').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/Cannot reach the API/);
  });

  it('rejects with AbortError (not ApiError) when the caller cancels', async () => {
    vi.stubGlobal('fetch', vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    const controller = new AbortController();
    const pending = get('projects/', { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('reports a timeout as an ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    await expect(get('projects/', { timeoutMs: 5 })).rejects.toMatchObject({ name: 'ApiError', message: /too long/ });
  });
});

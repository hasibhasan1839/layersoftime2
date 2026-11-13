import { useCallback, useEffect, useRef, useState } from 'react';
import { isAbortError } from '../api/ApiError.js';

export const QueryStatus = { LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' };

/**
 * Runs `queryFn({ signal })` and tracks loading / success / error.
 *
 * `queryKey` (any JSON-serialisable value) identifies the request: when it changes
 * the previous request is aborted and a new one starts. The in-flight request is
 * also aborted on unmount, so a slow response can never update a dead component.
 */
export function useQuery(queryKey, queryFn) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const requestKey = `${JSON.stringify(queryKey)}#${attempt}`;

  const queryFnRef = useRef(queryFn);
  useEffect(() => {
    queryFnRef.current = queryFn;
  });

  useEffect(() => {
    const controller = new AbortController();
    queryFnRef.current({ signal: controller.signal }).then(
      (data) => setResult({ requestKey, data, error: null }),
      (error) => {
        if (!isAbortError(error)) setResult({ requestKey, data: null, error });
      },
    );
    return () => controller.abort();
  }, [requestKey]);

  const reload = useCallback(() => setAttempt((count) => count + 1), []);

  // A result only counts if it belongs to the current request; otherwise we are loading.
  const settled = result?.requestKey === requestKey ? result : null;
  const status = !settled ? QueryStatus.LOADING : settled.error ? QueryStatus.ERROR : QueryStatus.SUCCESS;
  return { status, data: settled?.data ?? null, error: settled?.error ?? null, reload };
}

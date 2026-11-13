import { QueryStatus } from '../hooks/useQuery.js';
import styles from './AsyncBoundary.module.css';

const isEmptyData = (data) => data == null || (Array.isArray(data) && data.length === 0);

/**
 * Renders the right UI for a useQuery() result: loading, error (with retry),
 * empty, or `children(data)` once data has arrived.
 */
export function AsyncBoundary({ query, emptyMessage = 'Nothing to show yet.', children }) {
  if (query.status === QueryStatus.LOADING) {
    return (
      <div className={styles.loading} role="status">
        <span className="sr-only">Loading</span>
        <div className={styles.bar} />
        <div className={styles.bar} />
        <div className={styles.bar} />
      </div>
    );
  }

  if (query.status === QueryStatus.ERROR) {
    return (
      <div className={styles.message} role="alert">
        <p>{query.error.message}</p>
        {!query.error.isNotFound && (
          <button type="button" className={styles.retry} onClick={query.reload}>
            Try again
          </button>
        )}
      </div>
    );
  }

  if (isEmptyData(query.data)) return <p className={styles.message}>{emptyMessage}</p>;
  return children(query.data);
}

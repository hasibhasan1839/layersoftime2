import { useState } from 'react';
import { cx } from '../lib/format.js';
import { resolveMediaUrl } from '../lib/media.js';
import styles from './SafeImage.module.css';

/** An <img> that shows a neutral placeholder when the image is missing or fails to load. */
export function SafeImage({ src, alt, className, ...imgProps }) {
  const resolved = resolveMediaUrl(src);
  const [failedSrc, setFailedSrc] = useState(null);

  if (!resolved || failedSrc === resolved) {
    return <div className={cx(styles.placeholder, className)} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} />;
  }
  return (
    <img
      className={className}
      src={resolved}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(resolved)}
      {...imgProps}
    />
  );
}

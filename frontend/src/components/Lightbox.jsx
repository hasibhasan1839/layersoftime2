import { useCallback, useEffect, useRef } from 'react';
import { SafeImage } from './SafeImage.jsx';
import styles from './Lightbox.module.css';

/** Full-screen viewer built on the native <dialog>: focus trap and Esc come for free. */
export function Lightbox({ items, index, onIndexChange }) {
  const dialogRef = useRef(null);
  const isOpen = index !== null;
  const item = isOpen ? items[index] : null;
  const canNavigate = items.length > 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const step = useCallback(
    (delta) => onIndexChange((index + delta + items.length) % items.length),
    [index, items.length, onIndexChange],
  );

  const handleKeyDown = (event) => {
    if (!canNavigate) return;
    if (event.key === 'ArrowRight') step(1);
    if (event.key === 'ArrowLeft') step(-1);
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Image viewer"
      onClose={() => onIndexChange(null)}
      onKeyDown={handleKeyDown}
      onClick={(event) => event.target === dialogRef.current && onIndexChange(null)}
    >
      {item && (
        <figure className={styles.figure}>
          <SafeImage className={styles.image} src={item.src} alt={item.title} loading="eager" />
          <figcaption className={styles.caption}>
            <strong>{item.title}</strong>
            {item.description && <span>{item.description}</span>}
          </figcaption>
        </figure>
      )}
      <div className={styles.controls}>
        {canNavigate && <button type="button" onClick={() => step(-1)}>Previous</button>}
        {canNavigate && <button type="button" onClick={() => step(1)}>Next</button>}
        <button type="button" onClick={() => onIndexChange(null)}>Close</button>
      </div>
    </dialog>
  );
}

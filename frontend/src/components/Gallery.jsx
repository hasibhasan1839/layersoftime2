import { useState } from 'react';
import { SafeImage } from './SafeImage.jsx';
import { Lightbox } from './Lightbox.jsx';
import styles from './Gallery.module.css';

/**
 * Masonry grid that opens a lightbox on click.
 * items: [{ id, src, title, description? }]
 * With `showCaptions` off, `title` is used as the image's alt text instead.
 */
export function Gallery({ items, showCaptions = true }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <>
      <ul className={styles.grid}>
        {items.map((item, index) => (
          <li key={item.id} className={styles.item}>
            <button type="button" className={styles.tile} onClick={() => setOpenIndex(index)}>
              <SafeImage src={item.src} alt={showCaptions ? '' : item.title} />
              {showCaptions && <span className={styles.caption}>{item.title}</span>}
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={items} index={openIndex} onIndexChange={setOpenIndex} />
    </>
  );
}

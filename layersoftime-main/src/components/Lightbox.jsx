import { useEffect, useRef } from 'react'

// Full-screen image viewer. `items` are { src, title, meta }; `index` is the open item or null.
export default function Lightbox({ items, index, onClose, onChange }) {
  const touchX = useRef(null)
  const closeRef = useRef(null)
  const open = index !== null && index !== undefined
  const count = items.length

  // Lock scroll and move focus in while open; hand focus back on close.
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      prev?.focus?.({ preventScroll: true })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChange((index + 1) % count)
      if (e.key === 'ArrowLeft') onChange((index - 1 + count) % count)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, count, onClose, onChange])

  if (!open) return null
  const item = items[index]

  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 50) onChange((index + (dx < 0 ? 1 : -1) + count) % count)
    touchX.current = null
  }

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
    >
      <div className="lightbox__top" onClick={(e) => e.stopPropagation()}>
        <span className="mono">
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
        <button ref={closeRef} className="lightbox__close" onClick={onClose}>
          Close ✕
        </button>
      </div>

      <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
        <img key={item.src} src={item.src} alt={item.title} />
        <figcaption>
          <span>{item.title}</span>
          {item.meta && <span className="mono">{item.meta}</span>}
        </figcaption>
      </figure>

      {count > 1 && (
        <>
          <button
            className="lightbox__nav lightbox__nav--prev"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation()
              onChange((index - 1 + count) % count)
            }}
          >
            ←
          </button>
          <button
            className="lightbox__nav lightbox__nav--next"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation()
              onChange((index + 1) % count)
            }}
          >
            →
          </button>
        </>
      )}
    </div>
  )
}

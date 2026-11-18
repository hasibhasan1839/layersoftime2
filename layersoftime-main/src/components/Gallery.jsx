import { useCallback, useMemo, useState } from 'react'
import Lightbox from './Lightbox.jsx'
import Reveal from './Reveal.jsx'

// Filterable masonry grid. `filterKey` is the item field the chips filter on.
export default function Gallery({ items, filters, filterKey, variant = '' }) {
  const [filter, setFilter] = useState('All')
  const [open, setOpen] = useState(null)

  const shown = useMemo(
    () => (filter === 'All' ? items : items.filter((it) => it[filterKey] === filter)),
    [items, filter, filterKey],
  )
  const lightboxItems = useMemo(
    () => shown.map((it) => ({ src: it.src, title: it.title, meta: it[filterKey] })),
    [shown, filterKey],
  )

  const close = useCallback(() => setOpen(null), [])

  return (
    <section className="container gallery-wrap">
      <div className="filters" role="group" aria-label="Filter">
        {['All', ...filters].map((f) => {
          const n = f === 'All' ? items.length : items.filter((it) => it[filterKey] === f).length
          return (
            <button
              key={f}
              className={`chip ${filter === f ? 'is-active' : ''}`}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f} <sup>{n}</sup>
            </button>
          )
        })}
      </div>

      <div className={`masonry ${variant}`} key={filter}>
        {shown.map((it, i) => (
          <Reveal key={it.src} className="masonry__item" delay={(i % 3) * 90}>
            <button className="tile" onClick={() => setOpen(i)} aria-label={`Open ${it.title}`}>
              <img src={it.src} alt={it.title} loading="lazy" />
              <span className="tile__cap">
                <span>{it.title}</span>
                <span className="mono">{it[filterKey]}</span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      <Lightbox items={lightboxItems} index={open} onClose={close} onChange={setOpen} />
    </section>
  )
}

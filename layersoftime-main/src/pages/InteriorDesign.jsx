import { useEffect, useMemo, useState } from 'react'
import Lightbox from '../components/Lightbox.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import { useInteriorDesigns, useInteriorDesignTypes } from '../hooks/useContent.js'

export default function InteriorDesign() {
  const { interiorDesigns, loading } = useInteriorDesigns()
  const { types } = useInteriorDesignTypes()
  const [filter, setFilter] = useState('All')
  const [open, setOpen] = useState(null)

  useEffect(() => {
    document.title = 'Interior Design — Layers of Time'
  }, [])

  const typeNames = useMemo(
    () => types.filter((t) => t.status).map((t) => t.name),
    [types],
  )

  const shown = useMemo(
    () => filter === 'All' ? interiorDesigns : interiorDesigns.filter((d) => d.designTypeName === filter),
    [interiorDesigns, filter],
  )

  const lightboxItems = useMemo(
    () => shown.map((d) => ({ src: d.src, title: d.title, meta: d.designTypeName })),
    [shown],
  )

  return (
    <>
      <PageHeader
        index="04"
        eyebrow="Interiors"
        title={
          <>
            Interior Design<em>.</em>
          </>
        }
        aside={
          <>
            <span className="mono">Categories</span>
            <span>{typeNames.join(' · ') || 'All types'}</span>
          </>
        }
      >
        Spaces shaped from the inside out — where material, light and proportion come together to make
        a room feel exactly right.
      </PageHeader>

      {loading ? (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>Loading…</div>
      ) : (
        <section className="container gallery-wrap">
          {typeNames.length > 0 && (
            <div className="filters" role="group" aria-label="Filter">
              {['All', ...typeNames].map((f) => {
                const n = f === 'All'
                  ? interiorDesigns.length
                  : interiorDesigns.filter((d) => d.designTypeName === f).length
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
          )}

          <div className="masonry" key={filter}>
            {shown.map((d, i) => (
              <Reveal key={d.id} className="masonry__item" delay={(i % 3) * 90}>
                <button className="tile" onClick={() => setOpen(i)} aria-label={`Open ${d.title}`}>
                  {d.src ? (
                    <img src={d.src} alt={d.title} loading="lazy" />
                  ) : (
                    <div style={{ aspectRatio: '4/3', background: 'var(--paper-2, #eee)' }} />
                  )}
                  <span className="tile__cap">
                    <span>{d.title}</span>
                    <span className="mono">{d.designTypeName}</span>
                  </span>
                </button>
              </Reveal>
            ))}
          </div>

          <Lightbox items={lightboxItems} index={open} onClose={() => setOpen(null)} onChange={setOpen} />
        </section>
      )}
    </>
  )
}

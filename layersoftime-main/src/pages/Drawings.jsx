import { useEffect } from 'react'
import Gallery from '../components/Gallery.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { useDrawings } from '../hooks/useContent.js'
import { drawingMediums } from '../data.js'

export default function Drawings() {
  const { drawings, loading } = useDrawings()

  useEffect(() => {
    document.title = 'Drawings — Layers of Time'
  }, [])

  return (
    <>
      <PageHeader
        index="02"
        eyebrow="Sketchbook"
        title={
          <>
            Drawings<em>.</em>
          </>
        }
        aside={
          <>
            <span className="mono">Mediums</span>
            <span>Pen · Ink · Watercolour · Marker</span>
          </>
        }
      >
        Pages from the sketchbook — heritage façades in watercolour, ink-wash studies of light and
        shadow, and pen explorations of form. This is where every project is tested before it becomes a
        building.
      </PageHeader>

      {loading ? (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>Loading…</div>
      ) : (
        <Gallery items={drawings} filters={drawingMediums} filterKey="medium" variant="masonry--paper" />
      )}
    </>
  )
}

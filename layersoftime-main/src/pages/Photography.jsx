import { useEffect } from 'react'
import Gallery from '../components/Gallery.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { usePhotographs } from '../hooks/useContent.js'

export default function Photography() {
  const { photographs, loading } = usePhotographs()

  useEffect(() => {
    document.title = 'Photography — Layers of Time'
  }, [])

  return (
    <>
      <PageHeader
        index="03"
        eyebrow="Street & structure"
        title={
          <>
            Photo<em>graphy.</em>
          </>
        }
        aside={
          <>
            <span className="mono">Series</span>
            <span>Street · Structure · Everyday life</span>
          </>
        }
      >
        Rickshaws at rest, monsoon roads, towers seen from below and people at the edges of the day.
        Photographing the city is how we learn what architecture is actually for.
      </PageHeader>

      {loading ? (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>Loading…</div>
      ) : (
        <Gallery items={photographs} filters={['Colour', 'Monochrome']} filterKey="tone" />
      )}
    </>
  )
}

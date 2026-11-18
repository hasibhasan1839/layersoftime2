import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import { useProjects } from '../hooks/useContent.js'

export default function Projects() {
  const { projects, loading } = useProjects()

  useEffect(() => {
    document.title = 'Projects — Layers of Time'
  }, [])

  return (
    <>
      <PageHeader
        index="01"
        eyebrow="Portfolio"
        title={
          <>
            Projects<em>.</em>
          </>
        }
        aside={
          <>
            <span className="mono">Index</span>
            <span>{String(projects.length).padStart(2, '0')} projects · Residential & cultural</span>
          </>
        }
      >
        Homes, apartment buildings and pavilions. Each one starts with brick, light and planting — and
        with the question of how it will look after years of being lived in.
      </PageHeader>

      {loading ? (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>Loading…</div>
      ) : (
        <section className="container project-list">
          {projects.map((p, i) => (
            <Reveal key={p.slug} className={`project-row ${i % 2 ? 'project-row--flip' : ''}`}>
              <Link to={`/projects/${p.slug}`} className="project-row__link">
                <div className="project-row__img">
                  <img src={p.images[0]} alt={`${p.title} — exterior view`} loading={i < 2 ? 'eager' : 'lazy'} />
                  {p.images[1] && <img className="project-row__alt" src={p.images[1]} alt="" loading="lazy" />}
                </div>
                <div className="project-row__info">
                  <span className="project-row__num">{String(i + 1).padStart(2, '0')}</span>
                  <h2>{p.title}</h2>
                  <p>{p.summary}</p>
                  <dl className="meta-list">
                    <div>
                      <dt>Type</dt>
                      <dd>{p.typology}</dd>
                    </div>
                    <div>
                      <dt>Storeys</dt>
                      <dd>{p.storeys}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{p.status}</dd>
                    </div>
                  </dl>
                  <span className="link-arrow">
                    View project <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </section>
      )}
    </>
  )
}

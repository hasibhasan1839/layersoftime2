import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import { useCompetitions } from '../hooks/useContent.js'

export default function Competitions() {
  const { competitions, loading } = useCompetitions()

  useEffect(() => {
    document.title = 'Competitions — Layers of Time'
  }, [])

  return (
    <>
      <PageHeader
        index="05"
        eyebrow="Accolades"
        title={
          <>
            Competi<em>tions.</em>
          </>
        }
        aside={
          <>
            <span className="mono">Index</span>
            <span>{String(competitions.length).padStart(2, '0')} entries</span>
          </>
        }
      >
        Projects recognised in national and international design competitions — where ideas are tested
        against the best in the field.
      </PageHeader>

      {loading ? (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>Loading…</div>
      ) : !competitions.length ? (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted)' }}>
          No competition entries yet.
        </div>
      ) : (
        <section className="container project-list">
          {competitions.map((c, i) => {
            const image = c.src || c.projectImage
            const projectSlug = c.projectDetail?.slug
            return (
              <Reveal key={c.id} className={`project-row ${i % 2 ? 'project-row--flip' : ''}`}>
                <div className="project-row__link" style={{ cursor: projectSlug ? 'pointer' : 'default' }}>
                  <div className="project-row__img">
                    {image ? (
                      <img src={image} alt={`${c.title}`} loading={i < 2 ? 'eager' : 'lazy'} />
                    ) : (
                      <div style={{ aspectRatio: '16/10', background: 'var(--paper-2, #eee)' }} />
                    )}
                  </div>
                  <div className="project-row__info">
                    <span className="project-row__num">{String(i + 1).padStart(2, '0')}</span>
                    <h2>{c.title}</h2>
                    {c.description && <p>{c.description}</p>}
                    {c.awards.length > 0 && (
                      <dl className="meta-list">
                        {c.awards.map((a) => (
                          <div key={a.id}>
                            <dt>Award</dt>
                            <dd>{a.prize}{a.project ? ` — ${a.project.name}` : ''}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {projectSlug && (
                      <Link to={`/projects/${projectSlug}`} className="link-arrow">
                        View project <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </section>
      )}
    </>
  )
}

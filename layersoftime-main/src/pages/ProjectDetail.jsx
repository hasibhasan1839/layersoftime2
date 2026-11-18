import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Lightbox from '../components/Lightbox.jsx'
import Reveal from '../components/Reveal.jsx'
import { useProject } from '../hooks/useContent.js'
import NotFound from './NotFound.jsx'

export default function ProjectDetail() {
  const { slug } = useParams()
  const { project, projects, loading } = useProject(slug)
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])

  useEffect(() => {
    if (project) document.title = `${project.title} — Layers of Time`
  }, [project])

  if (loading) return <div style={{ textAlign: 'center', padding: '8rem 0' }}>Loading…</div>
  if (!project) return <NotFound />

  const index = projects.findIndex((p) => p.slug === slug)
  const next = projects[(index + 1) % projects.length]
  const prev = projects[(index - 1 + projects.length) % projects.length]
  const [cover, ...rest] = project.images
  const lightboxItems = project.images.map((src, i) => ({
    src,
    title: project.title,
    meta: `View ${i + 1}`,
  }))

  return (
    <>
      <section className="project-hero">
        <img src={cover} alt={`${project.title} — main view`} />
        <div className="project-hero__shade" />
        <div className="project-hero__content container">
          <Link to="/projects" className="mono back-link">
            ← All projects
          </Link>
          <h1 className="display">{project.title}</h1>
          <p className="mono">
            {String(index + 1).padStart(2, '0')} — {project.typology}
          </p>
        </div>
      </section>

      <section className="section container project-body">
        <Reveal className="project-meta">
          <dl className="meta-list meta-list--stack">
            <div>
              <dt>Typology</dt>
              <dd>{project.typology}</dd>
            </div>
            <div>
              <dt>Storeys</dt>
              <dd>{project.storeys}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{project.status}</dd>
            </div>
            <div>
              <dt>Views</dt>
              <dd>{String(project.images.length).padStart(2, '0')}</dd>
            </div>
          </dl>
        </Reveal>
        <div className="project-text">
          <Reveal as="p" className="statement statement--sm" delay={60}>
            {project.summary}
          </Reveal>
          {project.description.map((para, i) => (
            <Reveal as="p" key={i} delay={120 + i * 60}>
              {para}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container project-gallery">
        <Reveal className="project-gallery__item project-gallery__item--wide">
          <button className="tile" onClick={() => setOpen(0)} aria-label="Open main view">
            <img src={cover} alt={`${project.title} — view 1`} loading="lazy" />
          </button>
        </Reveal>
        {rest.map((src, i) => (
          <Reveal
            key={src}
            className={`project-gallery__item ${rest.length % 2 === 1 && i === rest.length - 1 ? 'project-gallery__item--wide' : ''}`}
            delay={(i % 2) * 100}
          >
            <button className="tile" onClick={() => setOpen(i + 1)} aria-label={`Open view ${i + 2}`}>
              <img src={src} alt={`${project.title} — view ${i + 2}`} loading="lazy" />
            </button>
          </Reveal>
        ))}
      </section>

      <nav className="container pager" aria-label="More projects">
        <Link to={`/projects/${prev.slug}`} className="pager__link">
          <span className="mono">← Previous</span>
          <span className="pager__title">{prev.title}</span>
        </Link>
        <Link to={`/projects/${next.slug}`} className="pager__link pager__link--next">
          <span className="mono">Next →</span>
          <span className="pager__title">{next.title}</span>
          <img src={next.images[0]} alt="" loading="lazy" />
        </Link>
      </nav>

      <Lightbox items={lightboxItems} index={open} onClose={close} onChange={setOpen} />
    </>
  )
}

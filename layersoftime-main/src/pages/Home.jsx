import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import { useProjects, useDrawings, usePhotographs } from '../hooks/useContent.js'

const SLIDE_MS = 6500

function Hero({ projects }) {
  const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]))
  const heroSlides = [
    { project: bySlug['brick-fin-pavilion'], image: '/images/projects/brick-fin-3.jpg' },
    { project: bySlug['lakeside-retreat'], image: '/images/projects/lakeside-1.jpg' },
    { project: bySlug['oculus-house'], image: '/images/projects/oculus-2.jpg' },
    { project: bySlug['white-courtyard-villa'], image: '/images/projects/courtyard-2.jpg' },
  ].filter((s) => s.project)

  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || !heroSlides.length) return
    const t = setTimeout(() => setActive((a) => (a + 1) % heroSlides.length), SLIDE_MS)
    return () => clearTimeout(t)
  }, [active, paused, heroSlides.length])

  if (!heroSlides.length) return null

  const go = (dir) => setActive((a) => (a + dir + heroSlides.length) % heroSlides.length)
  const slide = heroSlides[active]

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {heroSlides.map((s, i) => (
        <div key={s.image} className={`hero__slide ${i === active ? 'is-active' : ''}`} aria-hidden={i !== active}>
          <img src={s.image} alt="" />
        </div>
      ))}
      <div className="hero__shade" />

      <div className="hero__content container">
        <p className="hero__eyebrow">
          <span className="dot" /> Architecture · Drawing · Photography
        </p>
        <h1 className="hero__title display">
          Architecture,
          <br />
          drawn in <em>layers</em>
          <br />
          of time.
        </h1>
      </div>

      <div className="hero__bar container">
        <Link to={`/projects/${slide.project.slug}`} className="hero__caption" key={active}>
          <span className="mono">Featured — {slide.project.typology}</span>
          <span className="hero__caption-title">{slide.project.title} ↗</span>
        </Link>

        <div className="hero__controls">
          <span className="mono">
            {String(active + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
          </span>
          <div className="hero__progress">
            {heroSlides.map((s, i) => (
              <button
                key={s.image}
                className={`hero__tick ${i === active ? 'is-active' : ''} ${paused ? 'is-paused' : ''}`}
                style={{ '--dur': `${SLIDE_MS}ms` }}
                onClick={() => setActive(i)}
                aria-label={`Show ${s.project.title}`}
              >
                <i />
              </button>
            ))}
          </div>
          <button className="round-btn" onClick={() => go(-1)} aria-label="Previous slide">
            ←
          </button>
          <button className="round-btn" onClick={() => go(1)} aria-label="Next slide">
            →
          </button>
        </div>
      </div>
    </section>
  )
}

function Intro({ projects, drawings, photographs }) {
  return (
    <section className="section intro container">
      <Reveal className="section-label">
        <span className="mono">(01)</span>
        <span className="label">The studio</span>
      </Reveal>

      <Reveal as="p" className="statement" delay={80}>
        Every building begins as a line on paper and ends as a place people live in. We work across
        that whole distance —{' '}
        <span className="muted">
          sketching by hand, designing in three dimensions, and photographing the city to understand how
          it is really used.
        </span>
      </Reveal>

      <div className="intro__grid">
        <Reveal className="intro__image" delay={100}>
          <img src="/images/drawings/d06.jpg" alt="Perspective sketch on a desk next to three fineliner pens" loading="lazy" />
        </Reveal>
        <div className="intro__text">
          <Reveal as="p" delay={160}>
            The work is about patience. A façade is studied in pen before it is ever modelled; a street
            is photographed at different hours before a single wall is placed on it. Brick, light,
            shade and greenery come back again and again — materials that age well and get better with
            every layer of time.
          </Reveal>
          <Reveal className="stats" delay={220}>
            <div>
              <span className="stats__num">{String(projects.length).padStart(2, '0')}</span>
              <span className="label">Projects</span>
            </div>
            <div>
              <span className="stats__num">{drawings.length}</span>
              <span className="label">Drawings</span>
            </div>
            <div>
              <span className="stats__num">{photographs.length}</span>
              <span className="label">Photographs</span>
            </div>
          </Reveal>
          <Reveal delay={260}>
            <Link to="/contact" className="link-arrow">
              Work with us <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

const disciplines = [
  {
    to: '/projects',
    title: 'Projects',
    text: 'Homes, apartments and pavilions — designed and visualised from first sketch to final render.',
    image: '/images/projects/oculus-1.jpg',
  },
  {
    to: '/drawings',
    title: 'Drawings',
    text: 'Sketchbook pages in pen, ink and watercolour. Where every idea is tested first.',
    image: '/images/drawings/d02.jpg',
  },
  {
    to: '/photography',
    title: 'Photography',
    text: 'Street, structure and everyday life — observing how the city is actually lived in.',
    image: '/images/photography/p04.jpg',
  },
]

function Disciplines() {
  return (
    <section className="section section--tint">
      <div className="container">
        <div className="section-head">
          <Reveal className="section-label">
            <span className="mono">(02)</span>
            <span className="label">Practice</span>
          </Reveal>
          <Reveal as="h2" className="h2" delay={60}>
            Design, draw, observe — <em>three ways of looking</em> at the same city.
          </Reveal>
        </div>

        <div className="disciplines">
          {disciplines.map((d, i) => (
            <Reveal key={d.to} delay={i * 110}>
              <Link to={d.to} className="discipline">
                <div className="discipline__img">
                  <img src={d.image} alt="" loading="lazy" />
                </div>
                <div className="discipline__body">
                  <span className="mono">0{i + 1}</span>
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                  <span className="link-arrow">
                    Explore <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function SelectedProjects({ projects }) {
  const featured = projects.slice(0, 4)
  const [active, setActive] = useState(0)
  const p = featured[active]

  if (!featured.length) return null

  return (
    <section className="section section--dark selected">
      <div className="container">
        <div className="section-head section-head--center">
          <Reveal className="section-label">
            <span className="mono">(03)</span>
            <span className="label">Selected work</span>
          </Reveal>
          <Reveal as="h2" className="h2" delay={60}>
            Projects shaped by brick, light <em>and the space between.</em>
          </Reveal>
        </div>

        <Reveal className="tabs" role="tablist" delay={100}>
          {featured.map((f, i) => (
            <button
              key={f.slug}
              role="tab"
              aria-selected={i === active}
              className={`tabs__tab ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              {f.title}
            </button>
          ))}
        </Reveal>

        <Reveal className="selected__panel" delay={140}>
          <div className="selected__image" key={p.slug}>
            <img src={p.images[0]} alt={`${p.title} — exterior view`} loading="lazy" />
          </div>
          <div className="selected__card" key={`${p.slug}-card`}>
            <span className="mono">{p.typology}</span>
            <h3>{p.title}</h3>
            <p>{p.summary}</p>
            <dl className="meta-list">
              <div>
                <dt>Storeys</dt>
                <dd>{p.storeys}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{p.status}</dd>
              </div>
            </dl>
            <Link to={`/projects/${p.slug}`} className="btn btn--accent">
              View project <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function FeatureBand({ projects }) {
  const p = projects.find((pr) => pr.slug === 'brick-fin-pavilion')
  if (!p) return null
  return (
    <Link to={`/projects/${p.slug}`} className="band" aria-label={`View ${p.title}`}>
      <div className="band__bg" style={{ backgroundImage: 'url(/images/projects/brick-fin-1.jpg)' }} />
      <div className="band__content container">
        <span className="mono">In focus</span>
        <h2 className="display">{p.title}</h2>
        <p>{p.summary}</p>
      </div>
    </Link>
  )
}

function Sketchbook({ drawings }) {
  const items = drawings.slice(0, 8)
  return (
    <section className="section sketchbook">
      <div className="container section-head section-head--split">
        <div>
          <Reveal className="section-label">
            <span className="mono">(04)</span>
            <span className="label">From the sketchbook</span>
          </Reveal>
          <Reveal as="h2" className="h2" delay={60}>
            Ideas are tested <em>by hand</em> first.
          </Reveal>
        </div>
        <Reveal delay={120}>
          <Link to="/drawings" className="link-arrow">
            All drawings <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>

      <div className="strip" tabIndex={0} aria-label="Drawings, scroll horizontally">
        {items.map((d, i) => (
          <Link to="/drawings" className="strip__item" key={d.src}>
            <div className="strip__img">
              <img src={d.src} alt={d.title} loading="lazy" />
            </div>
            <span className="mono">{String(i + 1).padStart(2, '0')}</span>
            <span className="strip__title">{d.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function Marquee() {
  const words = ['Architecture', 'Drawing', 'Photography', 'Visualisation']
  const row = (
    <span className="marquee__row">
      {words.map((w) => (
        <span key={w}>
          {w} <i>✦</i>
        </span>
      ))}
    </span>
  )
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {row}
        {row}
      </div>
    </div>
  )
}

function Street({ photographs }) {
  const picks = [photographs[0], photographs[1], photographs[2], photographs[4]].filter(Boolean)
  return (
    <section className="section street">
      <div className="container">
        <div className="section-head section-head--split">
          <div>
            <Reveal className="section-label">
              <span className="mono">(05)</span>
              <span className="label">Photography</span>
            </Reveal>
            <Reveal as="h2" className="h2" delay={60}>
              Notes from the street — <em>how the city is really lived in.</em>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <Link to="/photography" className="link-arrow">
              All photographs <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>

        <div className="street__grid">
          {picks.map((p, i) => (
            <Reveal key={p.src} className={`street__item street__item--${i + 1}`} delay={i * 80}>
              <Link to="/photography">
                <img src={p.src} alt={p.title} loading="lazy" />
                <span className="street__cap">{p.title}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Cta() {
  return (
    <section className="cta">
      <div className="cta__bg" style={{ backgroundImage: 'url(/images/projects/lakeside-1.jpg)' }} />
      <div className="container">
        <Reveal className="cta__card">
          <span className="mono">(06) Contact</span>
          <h2 className="h2">Would you like to discuss a project?</h2>
          <p>
            A new home, an apartment building, or a set of drawings for an idea you have been carrying
            around — tell us about it.
          </p>
          <Link to="/contact" className="btn btn--light">
            Get in touch <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

export default function Home() {
  const { projects, loading: pLoading } = useProjects()
  const { drawings, loading: dLoading } = useDrawings()
  const { photographs, loading: phLoading } = usePhotographs()

  useEffect(() => {
    document.title = 'Layers of Time — Architecture, drawing & photography'
  }, [])

  const loading = pLoading || dLoading || phLoading

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '8rem 0' }}>Loading…</div>
  }

  return (
    <>
      <Hero projects={projects} />
      <Intro projects={projects} drawings={drawings} photographs={photographs} />
      <Disciplines />
      <SelectedProjects projects={projects} />
      <FeatureBand projects={projects} />
      <Sketchbook drawings={drawings} />
      <Marquee />
      <Street photographs={photographs} />
      <Cta />
    </>
  )
}

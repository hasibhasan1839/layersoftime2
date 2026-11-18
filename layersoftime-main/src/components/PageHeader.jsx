import Reveal from './Reveal.jsx'

export default function PageHeader({ index, eyebrow, title, children, aside }) {
  return (
    <section className="page-header container">
      <Reveal className="page-header__top">
        <span className="mono">({index})</span>
        <span className="label">{eyebrow}</span>
      </Reveal>
      <Reveal as="h1" className="page-header__title display" delay={80}>
        {title}
      </Reveal>
      <div className="page-header__bottom">
        <Reveal as="p" className="lead" delay={160}>
          {children}
        </Reveal>
        {aside && (
          <Reveal className="page-header__aside" delay={220}>
            {aside}
          </Reveal>
        )}
      </div>
    </section>
  )
}

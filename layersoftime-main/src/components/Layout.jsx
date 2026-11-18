import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { site } from '../data.js'
import { useContact } from '../hooks/useContent.js'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/drawings', label: 'Drawings' },
  { to: '/photography', label: 'Photography' },
  { to: '/interior-design', label: 'Interior Design' },
  { to: '/competitions', label: 'Competitions' },
  { to: '/team', label: 'Our Professionals' },
  { to: '/contact', label: 'Contact' },
]

function useSiteInfo() {
  const { contact } = useContact()
  if (!contact) return site
  return {
    ...site,
    email: contact.email || site.email,
    phone: contact.phone || site.phone,
    location: contact.location || site.location,
    social: contact.linkedin
      ? [{ label: 'LinkedIn', href: contact.linkedin }]
      : site.social,
  }
}

function Header() {
  const info = useSiteInfo()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  // Pages that start with a full-bleed dark image get a light header until scrolled.
  const overImage = (pathname === '/' || pathname.startsWith('/projects/')) && !scrolled && !open

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''} ${overImage ? 'is-over-image' : ''} ${open ? 'is-open' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="logo" aria-label={`${info.name} — home`}>
          <span className="logo__mark" aria-hidden="true">
            <i /><i /><i />
          </span>
          <span className="logo__text">Layers of Time</span>
        </Link>

        <nav className="nav" aria-label="Main">
          {nav.slice(1).map((item) => (
            <NavLink key={item.to} to={item.to} className="nav__link">
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <i /><i />
        </button>
      </div>

      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile">
          {nav.map((item, i) => (
            <NavLink key={item.to} to={item.to} end className="mobile-menu__link" style={{ '--i': i }}>
              <span className="mono">0{i + 1}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mobile-menu__foot">
          <a href={`mailto:${info.email}`}>{info.email}</a>
          <a href={`tel:${info.phone.replace(/\s/g, '')}`}>{info.phone}</a>
          <span>{info.location}</span>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  const info = useSiteInfo()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__cta">
          <h2 className="display">
            Have something in mind?
            <br />
            <em>Let’s talk.</em>
          </h2>
          <Link to="/contact" className="btn btn--light">
            Start a conversation <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="footer__cols">
          <div>
            <p className="label">Pages</p>
            <ul>
              {nav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label">Studio</p>
            <ul>
              <li>
                <a href={`mailto:${info.email}`}>{info.email}</a>
              </li>
              <li>
                <a href={`tel:${info.phone.replace(/\s/g, '')}`}>{info.phone}</a>
              </li>
              <li>{info.location}</li>
            </ul>
          </div>
          <div>
            <p className="label">Follow</p>
            <ul>
              {info.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer__note">
            <p className="label">Philosophy</p>
            <p>
              Buildings, sketches and streets are read the same way here — slowly, one layer at a time.
            </p>
          </div>
        </div>
      </div>

      <div className="footer__wordmark" aria-hidden="true">
        Layers <em>of</em> Time
      </div>

      <div className="container footer__base">
        <span>© {new Date().getFullYear()} {info.name}</span>
        <span>{info.tagline}</span>
        <button className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Back to top ↑
        </button>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main" key={pathname} className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

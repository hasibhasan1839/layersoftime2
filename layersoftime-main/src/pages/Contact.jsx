import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import { useContact, sendContactMessage } from '../hooks/useContent.js'
import { site } from '../data.js'

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' }

// `pin` is what the map points at (coordinates or a place query); `address` is the text shown
// to the reader. They are separate so a precise pin never forces an unreadable address on the page.
function StudioMap({ address, pin }) {
  const query = encodeURIComponent(pin || address)
  return (
    <div className="map">
      <iframe
        className="map__frame"
        title={`Map showing ${address}`}
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="map__bar">
        <div>
          <span className="label">Studio</span>
          <address>{address}</address>
        </div>
        <a
          className="link-arrow"
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          target="_blank"
          rel="noreferrer"
        >
          Directions <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  )
}

function MessageForm() {
  const [v, setV] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [formError, setFormError] = useState('')

  const set = (k) => (e) => {
    setV((s) => ({ ...s, [k]: e.target.value }))
    setErrors((s) => ({ ...s, [k]: '' }))
  }

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!v.name.trim()) errs.name = 'Please tell us your name'
    if (!v.email.trim()) errs.email = 'We need an email to reply to'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) errs.email = 'That email does not look right'
    if (!v.message.trim()) errs.message = 'Please write a short message'

    setErrors(errs)
    setFormError('')
    if (Object.keys(errs).length) return

    setStatus('sending')
    try {
      await sendContactMessage(v)
      setV(EMPTY)
      setStatus('sent')
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(err.message)
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="form-done">
        <span className="mono">Message sent</span>
        <h3>Thank you — we have your note.</h3>
        <p>
          We read everything that comes in and usually reply within two working days. If it is
          urgent, a phone call is always faster.
        </p>
        <button type="button" className="btn btn--accent" onClick={() => setStatus('idle')}>
          Send another <span aria-hidden="true">→</span>
        </button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      {formError && <p className="form__alert" role="alert">{formError}</p>}

      <div className="form__row">
        <label className={`field ${errors.name ? 'has-error' : ''}`}>
          <span className="label">Your name *</span>
          <input value={v.name} onChange={set('name')} autoComplete="name" />
          {errors.name && <small>{errors.name}</small>}
        </label>
        <label className={`field ${errors.email ? 'has-error' : ''}`}>
          <span className="label">Email *</span>
          <input type="email" value={v.email} onChange={set('email')} autoComplete="email" />
          {errors.email && <small>{errors.email}</small>}
        </label>
      </div>

      <div className="form__row">
        <label className={`field ${errors.phone ? 'has-error' : ''}`}>
          <span className="label">Phone</span>
          <input value={v.phone} onChange={set('phone')} autoComplete="tel" />
          {errors.phone && <small>{errors.phone}</small>}
        </label>
        <label className={`field ${errors.subject ? 'has-error' : ''}`}>
          <span className="label">Subject</span>
          <input value={v.subject} onChange={set('subject')} placeholder="e.g. New residential project" />
          {errors.subject && <small>{errors.subject}</small>}
        </label>
      </div>

      <label className={`field ${errors.message ? 'has-error' : ''}`}>
        <span className="label">Message *</span>
        <textarea
          rows={6}
          value={v.message}
          onChange={set('message')}
          placeholder="Tell us about the site, who will use it, and what you imagine."
        />
        {errors.message && <small>{errors.message}</small>}
      </label>

      <div className="form__foot">
        <p className="form__note">* Required. We never share your details.</p>
        <button className="btn btn--accent" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'} <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  )
}

export default function Contact() {
  const { contact, loading } = useContact()
  const info = {
    email: contact?.email || site.email,
    phone: contact?.phone || site.phone,
    location: contact?.location || site.location,
    mapLocation: contact?.mapLocation || '',
    linkedin: contact?.linkedin || '',
    intro: contact?.intro || '',
  }

  useEffect(() => {
    document.title = 'Contact — Layers of Time'
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '8rem 0' }}>Loading…</div>

  return (
    <>
      <PageHeader
        index="07"
        eyebrow="Contact"
        title={
          <>
            Let's <em>talk.</em>
          </>
        }
      >
        {info.intro ||
          'Tell us about the site, the people who will use it, and what you imagine. We usually reply within two working days.'}
      </PageHeader>

      <section className="container contact">
        <Reveal className="contact__info">
          <a href={`mailto:${info.email}`} className="contact__lead">
            {info.email} <span aria-hidden="true">↗</span>
          </a>
          <dl className="contact__list">
            <div>
              <dt className="label">Phone</dt>
              <dd>
                <a href={`tel:${info.phone.replace(/\s/g, '')}`}>{info.phone}</a>
              </dd>
            </div>
            <div>
              <dt className="label">Studio</dt>
              <dd>{info.location}</dd>
            </div>
            {info.linkedin && (
              <div>
                <dt className="label">Follow</dt>
                <dd className="contact__social">
                  <a href={info.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </Reveal>

        <Reveal className="contact__map" delay={100}>
          <StudioMap address={info.location} pin={info.mapLocation} />
        </Reveal>
      </section>

      <section className="section section--tint">
        <div className="container contact-form">
          <div className="contact-form__intro">
            <Reveal className="section-label">
              <span className="mono">(01)</span>
              <span className="label">Send us a message</span>
            </Reveal>
            <Reveal as="h2" className="h2" delay={60}>
              Have something <em>in mind?</em>
            </Reveal>
            <Reveal as="p" className="lead" delay={120}>
              Fill in the form and it lands straight in the studio inbox. A short description of the
              site and what you need is enough to start.
            </Reveal>
          </div>
          <Reveal className="contact-form__body" delay={160}>
            <MessageForm />
          </Reveal>
        </div>
      </section>
    </>
  )
}

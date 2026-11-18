import { useEffect, useState } from 'react'
import { Field } from './Login.jsx'
import { useNoIndex } from './AdminLayout.jsx'
import { api } from './api.js'

export default function ContactSettings() {
  useNoIndex('Contact')
  const [v, setV] = useState({ email: '', phone: '', location: '', mapLocation: '', linkedin: '', intro: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => {
    setMsg({ type: '', text: '' })
    setV((s) => ({ ...s, [k]: e.target.value }))
  }

  useEffect(() => {
    api
      .getContact()
      .then((r) => setV(r.contact))
      .catch((e) => setMsg({ type: 'err', text: e.message }))
      .finally(() => setLoading(false))
  }, [])

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) errs.email = 'Enter a valid email address'
    if (!/^\+?[0-9\s-]{7,20}$/.test(v.phone.trim())) errs.phone = 'Enter a valid phone number'
    if (!v.location.trim()) errs.location = 'Location is required'
    if (v.linkedin && !/^https?:\/\//.test(v.linkedin)) errs.linkedin = 'Link must start with http:// or https://'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    setMsg({ type: '', text: '' })
    try {
      await api.updateContact(v)
      setMsg({ type: 'ok', text: 'Contact details saved.' })
    } catch (err) {
      setErrors(err.fields || {})
      setMsg({ type: 'err', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="adm-center">Loading…</div>

  return (
    <>
      <header className="adm-head">
        <div>
          <p className="adm-eyebrow">Manage</p>
          <h1 className="adm-title">Contact</h1>
        </div>
      </header>
      <form className="adm-card" style={{ maxWidth: 720 }} onSubmit={submit} noValidate>
        {msg.text && <div className={msg.type === 'ok' ? 'adm-ok' : 'adm-alert'}>{msg.text}</div>}
        <div className="adm-grid">
          <Field label="Email" error={errors.email}><input type="email" value={v.email} onChange={set('email')} /></Field>
          <Field label="Phone" error={errors.phone}><input value={v.phone} onChange={set('phone')} /></Field>
          <Field label="Studio location" error={errors.location}><input value={v.location} onChange={set('location')} /></Field>
          <Field label="LinkedIn link" error={errors.linkedin}><input value={v.linkedin} onChange={set('linkedin')} /></Field>
          <div className="adm-span">
            <Field label="Map pin" error={errors.mapLocation}>
              <input value={v.mapLocation} onChange={set('mapLocation')} placeholder="e.g. 23.2370703,91.1233779" />
            </Field>
            <p className="adm-hint">
              Where the map pin sits, if that is not the studio location above. Paste
              "latitude,longitude" or any place name. Leave empty to pin the studio location itself.
            </p>
          </div>
          <div className="adm-span">
            <Field label="Intro text"><textarea rows={4} value={v.intro} onChange={set('intro')} /></Field>
          </div>
        </div>
        <div className="adm-actions">
          <button className="adm-btn adm-btn--primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save contact details'}
          </button>
        </div>
      </form>
    </>
  )
}

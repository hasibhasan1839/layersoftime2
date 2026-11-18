import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api, USE_MOCK } from './api.js'
import { useAuth } from './AuthContext.jsx'
import { useNoIndex } from './AdminLayout.jsx'
import { validateUser } from './validate.js'

export default function Login() {
  useNoIndex('Login')
  const { user, setUser, loading } = useAuth()
  const navigate = useNavigate()
  const [needsSetup, setNeedsSetup] = useState(false)
  const [form, setForm] = useState({ login: '', username: '', email: '', name: '', phoneNo: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.status().then((r) => setNeedsSetup(r.needsSetup)).catch(() => {})
  }, [])

  if (!loading && user) return <Navigate to="/admin" replace />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setFormError('')
    let errs = {}
    if (needsSetup) errs = validateUser(form, { passwordRequired: true })
    else {
      if (!form.login.trim()) errs.login = 'Enter your username or email'
      if (!form.password) errs.password = 'Enter your password'
    }
    setErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    try {
      const r = needsSetup
        ? await api.setup({ ...form })
        : await api.login({ login: form.login, password: form.password })
      setUser(r.user)
      navigate('/admin', { replace: true })
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm-center">
      <form className="adm-card adm-card--narrow" onSubmit={submit} noValidate>
        <p className="adm-eyebrow">Layers of Time</p>
        <h1 className="adm-title">{needsSetup ? 'Create the first admin' : 'Admin login'}</h1>
        {needsSetup && <p className="adm-muted">No users exist yet. This account becomes the admin.</p>}
        {USE_MOCK && (
          <div className="adm-demo">
            Demo mode (no database yet). Login: <strong>admin</strong> / <strong>admin123</strong>
          </div>
        )}
        {formError && <div className="adm-alert">{formError}</div>}

        {needsSetup ? (
          <>
            <Field label="Full name" error={errors.name}>
              <input value={form.name} onChange={set('name')} autoComplete="name" />
            </Field>
            <Field label="Username" error={errors.username}>
              <input value={form.username} onChange={set('username')} autoComplete="username" />
            </Field>
            <Field label="Email" error={errors.email}>
              <input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
            </Field>
            <Field label="Phone (optional)" error={errors.phoneNo}>
              <input value={form.phoneNo} onChange={set('phoneNo')} autoComplete="tel" />
            </Field>
          </>
        ) : (
          <Field label="Username or email" error={errors.login}>
            <input value={form.login} onChange={set('login')} autoComplete="username" autoFocus />
          </Field>
        )}
        <Field label="Password" error={errors.password}>
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            autoComplete={needsSetup ? 'new-password' : 'current-password'}
          />
        </Field>

        <button className="adm-btn adm-btn--primary" disabled={busy}>
          {busy ? 'Please wait…' : needsSetup ? 'Create admin' : 'Log in'}
        </button>
      </form>
    </div>
  )
}

export function Field({ label, error, children }) {
  return (
    <label className={`adm-field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  )
}

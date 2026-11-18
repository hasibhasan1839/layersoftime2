import { useState } from 'react'
import { api } from './api.js'
import { Field } from './Login.jsx'
import { useNoIndex } from './AdminLayout.jsx'
import { passwordError } from './validate.js'

export default function ChangePassword() {
  useNoIndex('Change password')
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    const errs = {}
    if (!form.currentPassword) errs.currentPassword = 'Enter your current password'
    const pe = passwordError(form.newPassword)
    if (pe) errs.newPassword = pe
    if (form.confirm !== form.newPassword) errs.confirm = 'Passwords do not match'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    try {
      await api.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
      setMsg({ type: 'ok', text: 'Password updated. Other devices have been signed out.' })
    } catch (err) {
      setErrors(err.fields || {})
      setMsg({ type: 'err', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <header className="adm-head">
        <h1 className="adm-title">Change password</h1>
      </header>
      <form className="adm-card adm-card--narrow" onSubmit={submit} noValidate>
        {msg.text && <div className={msg.type === 'ok' ? 'adm-ok' : 'adm-alert'}>{msg.text}</div>}
        <Field label="Current password" error={errors.currentPassword}>
          <input type="password" value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />
        </Field>
        <Field label="New password" error={errors.newPassword}>
          <input type="password" value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" />
        </Field>
        <Field label="Confirm new password" error={errors.confirm}>
          <input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
        </Field>
        <button className="adm-btn adm-btn--primary" disabled={busy}>
          {busy ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </>
  )
}

import { useState } from 'react'
import { api } from './api.js'
import { Field } from './Login.jsx'
import { validateUser } from './validate.js'

// Modal used for both "Add user" and "Edit user".
export default function UserForm({ user, onClose, onSaved }) {
  const editing = Boolean(user)
  const [form, setForm] = useState({
    username: user?.username ?? '',
    email: user?.email ?? '',
    name: user?.name ?? '',
    phoneNo: user?.phoneNo ?? '',
    userType: user?.userType ?? 'user',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setFormError('')
    const errs = validateUser(form, { passwordRequired: !editing })
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      const r = editing ? await api.updateUser(user.id, form) : await api.createUser(form)
      onSaved(r.user, editing)
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="adm-card adm-modal__box" onSubmit={submit} noValidate>
        <h2 className="adm-title adm-title--sm">{editing ? `Edit ${user.username}` : 'Add user'}</h2>
        {formError && <div className="adm-alert">{formError}</div>}
        <div className="adm-grid">
          <Field label="Full name" error={errors.name}>
            <input value={form.name} onChange={set('name')} autoFocus />
          </Field>
          <Field label="Username" error={errors.username}>
            <input value={form.username} onChange={set('username')} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Phone no" error={errors.phoneNo}>
            <input value={form.phoneNo} onChange={set('phoneNo')} />
          </Field>
          <Field label="User type" error={errors.userType}>
            <select value={form.userType} onChange={set('userType')}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label={editing ? 'New password (leave blank to keep)' : 'Password'} error={errors.password}>
            <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
          </Field>
        </div>
        <div className="adm-actions">
          <button type="button" className="adm-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="adm-btn adm-btn--primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </form>
    </div>
  )
}

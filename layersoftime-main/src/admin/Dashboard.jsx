import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import { useAuth } from './AuthContext.jsx'
import { useNoIndex } from './AdminLayout.jsx'
import UserForm from './UserForm.jsx'

const fmt = (s) =>
  new Date(s.replace(' ', 'T') + 'Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export default function Dashboard() {
  useNoIndex('Dashboard')
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [form, setForm] = useState(null) // null | 'new' | user
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api
      .listUsers()
      .then((r) => setUsers(r.users))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return users.filter(
      (u) =>
        (type === 'all' || u.userType === type) &&
        (!s || [u.name, u.username, u.email, u.phoneNo].some((v) => v.toLowerCase().includes(s))),
    )
  }, [users, q, type])

  const flash = (t) => {
    setNotice(t)
    setTimeout(() => setNotice(''), 3000)
  }

  const onSaved = (saved, wasEdit) => {
    setUsers((list) => (wasEdit ? list.map((u) => (u.id === saved.id ? saved : u)) : [saved, ...list]))
    setForm(null)
    flash(wasEdit ? 'User updated' : 'User created')
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await api.deleteUser(toDelete.id)
      setUsers((list) => list.filter((u) => u.id !== toDelete.id))
      setToDelete(null)
      flash('User deleted')
    } catch (e) {
      setError(e.message)
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const admins = users.filter((u) => u.userType === 'admin').length

  return (
    <>
      <header className="adm-head">
        <div>
          <p className="adm-eyebrow">Dashboard</p>
          <h1 className="adm-title">Users</h1>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setForm('new')}>
          + Add user
        </button>
      </header>

      <div className="adm-stats">
        <div className="adm-stat"><span>Total users</span><strong>{users.length}</strong></div>
        <div className="adm-stat"><span>Admins</span><strong>{admins}</strong></div>
        <div className="adm-stat"><span>Regular users</span><strong>{users.length - admins}</strong></div>
      </div>

      {notice && <div className="adm-ok">{notice}</div>}
      {error && <div className="adm-alert">{error}</div>}

      <div className="adm-toolbar">
        <input placeholder="Search name, username, email, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All types</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Created</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="8" className="adm-empty">Loading…</td></tr>
            )}
            {!loading && !filtered.length && (
              <tr><td colSpan="8" className="adm-empty">No users found</td></tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="adm-mono">{u.id}</td>
                <td>
                  <strong>{u.name}</strong>
                  <br />
                  <span className="adm-muted">@{u.username}</span>
                </td>
                <td>{u.email}</td>
                <td>{u.phoneNo || '—'}</td>
                <td><span className={`adm-badge adm-badge--${u.userType}`}>{u.userType}</span></td>
                <td>{fmt(u.createdAt)}</td>
                <td>{fmt(u.updatedAt)}</td>
                <td className="adm-row-actions">
                  <button className="adm-link" onClick={() => setForm(u)}>Edit</button>
                  <button className="adm-link adm-link--danger" disabled={u.id === me.id} onClick={() => setToDelete(u)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && <UserForm user={form === 'new' ? null : form} onClose={() => setForm(null)} onSaved={onSaved} />}

      {toDelete && (
        <div className="adm-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && setToDelete(null)}>
          <div className="adm-card adm-card--narrow">
            <h2 className="adm-title adm-title--sm">Delete user?</h2>
            <p className="adm-muted">
              <strong>{toDelete.name}</strong> (@{toDelete.username}) will be permanently removed. This cannot be undone.
            </p>
            <div className="adm-actions">
              <button className="adm-btn" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="adm-btn adm-btn--danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

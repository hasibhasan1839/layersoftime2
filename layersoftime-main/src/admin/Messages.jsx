import { useEffect, useState } from 'react'
import { useNoIndex } from './AdminLayout.jsx'
import { api } from './api.js'

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export default function Messages() {
  useNoIndex('Messages')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all | unread
  const [open, setOpen] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setLoading(true)
    api
      .listContactMessages()
      .then((r) => setMessages(r.messages))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const unread = messages.filter((m) => !m.isRead).length
  const shown = filter === 'unread' ? messages.filter((m) => !m.isRead) : messages

  async function openMessage(m) {
    setOpen(m)
    if (!m.isRead) {
      try {
        await api.markContactMessageRead(m.id, true)
        setMessages((l) => l.map((x) => (x.id === m.id ? { ...x, isRead: true } : x)))
      } catch { /* leaving it unread is harmless */ }
    }
  }

  async function toggleRead(m) {
    const next = !m.isRead
    try {
      await api.markContactMessageRead(m.id, next)
      setMessages((l) => l.map((x) => (x.id === m.id ? { ...x, isRead: next } : x)))
      setOpen((o) => (o && o.id === m.id ? { ...o, isRead: next } : o))
    } catch (e) {
      setError(e.message)
    }
  }

  async function confirmDelete() {
    setBusy(true)
    try {
      await api.deleteContactMessage(toDelete.id)
      setMessages((l) => l.filter((x) => x.id !== toDelete.id))
      setToDelete(null)
      setOpen(null)
    } catch (e) {
      setError(e.message)
      setToDelete(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <header className="adm-head">
        <div>
          <p className="adm-eyebrow">Inbox</p>
          <h1 className="adm-title">Messages</h1>
        </div>
        <div className="adm-seg" role="group" aria-label="Filter messages">
          <button
            className={`adm-seg__btn ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All <span>{messages.length}</span>
          </button>
          <button
            className={`adm-seg__btn ${filter === 'unread' ? 'is-active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread <span>{unread}</span>
          </button>
        </div>
      </header>

      {error && <div className="adm-alert">{error}</div>}

      <div className="adm-table-wrap">
        <table className="adm-table" style={{ minWidth: 640 }}>
          <thead>
            <tr>
              <th style={{ width: 28 }} />
              <th>From</th>
              <th>Subject</th>
              <th>Received</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="adm-empty">Loading…</td></tr>}
            {!loading && !shown.length && (
              <tr>
                <td colSpan={5} className="adm-empty">
                  {filter === 'unread' ? 'No unread messages' : 'No messages yet'}
                </td>
              </tr>
            )}
            {shown.map((m) => (
              <tr key={m.id} className={m.isRead ? '' : 'adm-row--unread'}>
                <td>{!m.isRead && <span className="adm-dot" aria-label="Unread" />}</td>
                <td>
                  <button className="adm-linkrow" onClick={() => openMessage(m)}>
                    <strong>{m.name}</strong>
                    <span className="adm-muted">{m.email}</span>
                  </button>
                </td>
                <td>{m.subject || <span className="adm-muted">— no subject —</span>}</td>
                <td className="adm-mono" style={{ whiteSpace: 'nowrap' }}>{formatDate(m.createdAt)}</td>
                <td className="adm-row-actions">
                  <button className="adm-link" onClick={() => openMessage(m)}>Read</button>
                  <button className="adm-link adm-link--danger" onClick={() => setToDelete(m)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div
          className="adm-modal"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(null)}
        >
          <div className="adm-card adm-modal__box">
            <h2 className="adm-title adm-title--sm">{open.subject || 'No subject'}</h2>

            <dl className="adm-meta">
              <div><dt>Name</dt><dd>{open.name}</dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${open.email}`}>{open.email}</a></dd></div>
              {open.phone && (
                <div><dt>Phone</dt><dd><a href={`tel:${open.phone.replace(/\s/g, '')}`}>{open.phone}</a></dd></div>
              )}
              <div><dt>Received</dt><dd>{formatDate(open.createdAt)}</dd></div>
            </dl>

            <div className="adm-message">{open.message}</div>

            <div className="adm-actions">
              <button className="adm-btn adm-btn--danger" onClick={() => setToDelete(open)}>Delete</button>
              <span style={{ flex: 1 }} />
              <button className="adm-btn" onClick={() => toggleRead(open)}>
                Mark {open.isRead ? 'unread' : 'read'}
              </button>
              <button className="adm-btn" onClick={() => setOpen(null)}>Close</button>
              <a
                className="adm-btn adm-btn--primary"
                href={`mailto:${open.email}?subject=${encodeURIComponent('Re: ' + (open.subject || 'Your message to Layers of Time'))}`}
              >
                Reply by email
              </a>
            </div>
          </div>
        </div>
      )}

      {toDelete && (
        <div
          className="adm-modal"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => e.target === e.currentTarget && setToDelete(null)}
        >
          <div className="adm-card adm-card--narrow">
            <h2 className="adm-title adm-title--sm">Delete message?</h2>
            <p className="adm-muted">
              The message from <strong>{toDelete.name}</strong> will be permanently removed.
            </p>
            <div className="adm-actions">
              <button className="adm-btn" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="adm-btn adm-btn--danger" onClick={confirmDelete} disabled={busy}>
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

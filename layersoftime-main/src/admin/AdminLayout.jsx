import { useEffect } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

export function useNoIndex(title) {
  useEffect(() => {
    document.title = `${title} — Admin · Layers of Time`
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [title])
}

// Protected shell: must be logged in AND be an admin.
export default function AdminLayout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  if (loading) return <div className="adm-center">Loading…</div>
  if (!user) return <Navigate to="/admin/login" replace />

  const onLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  if (user.userType !== 'admin') {
    return (
      <div className="adm-center">
        <div className="adm-card adm-card--narrow">
          <h1 className="adm-title">Access denied</h1>
          <p className="adm-muted">Your account ({user.username}) does not have admin access.</p>
          <button className="adm-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="adm">
      <aside className="adm-side">
        <Link to="/admin" className="adm-brand">
          Layers <em>of</em> Time
          <span>Admin</span>
        </Link>
        <nav className="adm-nav">
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/projects">Projects</NavLink>
          <NavLink to="/admin/drawings">Drawings</NavLink>
          <NavLink to="/admin/photography">Photography</NavLink>
          <NavLink to="/admin/interior-designs">Interior Designs</NavLink>
          <NavLink to="/admin/competitions">Competitions</NavLink>
          <NavLink to="/admin/team">Our Professionals</NavLink>
          <NavLink to="/admin/messages">Messages</NavLink>
          <NavLink to="/admin/contact">Contact</NavLink>
          <NavLink to="/admin/password">Change password</NavLink>
          <Link to="/" target="_blank">
            View site ↗
          </Link>
        </nav>
        <div className="adm-me">
          <strong>{user.name}</strong>
          <span>@{user.username}</span>
          <button className="adm-btn adm-btn--ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="adm-main">
        <Outlet />
      </main>
    </div>
  )
}

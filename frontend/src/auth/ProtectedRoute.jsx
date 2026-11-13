import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from './AuthContext'

export default function ProtectedRoute({ requireAdmin = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }
  if (requireAdmin && user.user_type !== 'admin') {
    return (
      <Box sx={{ p: 4 }}>
        <h2>Access denied</h2>
        <p>Your account ({user.username}) does not have admin access.</p>
      </Box>
    )
  }
  return <Outlet />
}
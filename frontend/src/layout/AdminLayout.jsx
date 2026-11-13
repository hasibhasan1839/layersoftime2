import { Link as RouterLink, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  Stack,
  Typography,
} from '@mui/material'
import { tokens } from '../theme'
import { useAuth } from '../auth/AuthContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/project-images', label: 'Project images' },
  { to: '/admin/drawings', label: 'Drawings' },
  { to: '/admin/photography', label: 'Photography' },
  { to: '/admin/interior-designs', label: 'Interior designs' },
  { to: '/admin/interior-design-types', label: 'Interior design types' },
  { to: '/admin/competitions', label: 'Competitions' },
  { to: '/admin/contact', label: 'Contact' },
  { to: '/admin/password', label: 'Change password' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '250px 1fr' }, minHeight: '100vh', bgcolor: tokens.paper }}>
      <Box
        sx={{
          bgcolor: tokens.night,
          color: tokens.paper,
          p: 3,
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          alignItems: { xs: 'center', md: 'stretch' },
          gap: 3,
          position: { md: 'sticky' },
          top: 0,
          height: { md: '100vh' },
        }}
      >
        <Box>
          <Typography sx={{ fontFamily: tokens.serif, fontSize: 26, lineHeight: 1.1 }}>
            Layers <Box component="em" sx={{ color: tokens.brick2 }}>of</Box> Time
          </Typography>
          <Typography variant="mono" sx={{ color: 'rgba(244,241,236,0.5)', mt: 0.75 }}>
            Admin
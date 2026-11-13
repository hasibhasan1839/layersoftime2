import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { tokens } from '../../theme'
import { useAuth } from '../../auth/AuthContext'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Admin login — Layers of Time'
  }, [])

  useEffect(() => {
    if (user) navigate(location.state?.from || '/admin', { replace: true })
  }, [user, navigate, location.state])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(username.trim(), password)
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: tokens.paper, p: 3 }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 420, p: 4, border: `1px solid ${tokens.line}` }}>
        <Typography variant="mono" sx={{ color: 'primary.main', mb: 1 }}>
          Layers of Time
        </Typography>
        <Typography variant="h3" sx={{ mb: 3, fontSize: 34 }}>
          Admin login
        </Typography>

        <Stack spacing={2} component="form" onSubmit={submit} noValidate>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Username or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button type="submit" variant="contained" disabled={busy} size="large">
            {busy ? 'Signing in…' : 'Log in'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
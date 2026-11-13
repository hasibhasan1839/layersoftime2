import { Link as RouterLink, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AppBar, Box, Container, Link, Stack, Toolbar, Typography } from '@mui/material'
import { tokens } from '../theme'

const NAV = [
  { to: '/projects', label: 'Projects' },
  { to: '/drawings', label: 'Drawings' },
  { to: '/photography', label: 'Photography' },
  { to: '/contact', label: 'Contact' },
]

export default function PublicLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: isHome ? 'transparent' : 'rgba(244,241,236,0.9)',
          color: isHome ? tokens.paper : tokens.ink,
          backdropFilter: isHome ? 'none' : 'blur(14px)',
          borderBottom: isHome ? 'none' : `1px solid ${tokens.line}`,
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: tokens.max, px: { xs: 2, md: 5 } }}>
          <Toolbar disableGutters sx={{ height: tokens.headerH, gap: 4 }}>
            <Link
              component={RouterLink}
              to="/"
              underline="none"
              sx={{ fontFamily: tokens.sans, fontWeight: 500, fontSize: 17, display: 'flex', alignItems: 'center', gap: 1.5 }}
            >
              <Box component="span" sx={{ display: 'grid', gap: '3px', width: 22 }}>
                <Box sx={{ height: 2, bgcolor: 'currentColor', width: '45%' }} />
                <Box sx={{ height: 2, bgcolor: 'currentColor', width: '72%' }} />
                <Box sx={{ height: 2, bgcolor: 'currentColor', width: '100%' }} />
              </Box>
              Layers of Time
            </Link>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={{ xs: 2, md: 4 }} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  component={NavLink}
                  to={n.to}
                  underline="none"
                  sx={{
                    fontSize: 15,
                    position: 'relative',
                    py: 0.5,
                    '&.active::after': { transform: 'scaleX(1)' },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 1,
                      bgcolor: 'currentColor',
                      transform: 'scaleX(0)',
                      transformOrigin: 'right',
                      transition: `transform 0.4s ${tokens.ease}`,
                    },
                    '&:hover::after': { transform: 'scaleX(1)', transformOrigin: 'left' },
                  }}
                >
                  {n.label}
                </Link>
              ))}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flex: 1, pt: isHome ? 0 : `${tokens.headerH}px` }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ bgcolor: tokens.night, color: tokens.paper, py: 6, mt: 8 }}>
        <Container maxWidth={false} sx={{ maxWidth: tokens.max, px: { xs: 2, md: 5 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
            <Typography variant="mono" sx={{ color: 'rgba(244,241,236,0.5)' }}>
              Layers of Time
            </Typography>
            <Typography variant="mono" sx={{ color: 'rgba(244,241,236,0.5)' }}>
              Architecture, drawing & photography
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
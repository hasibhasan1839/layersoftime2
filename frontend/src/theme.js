import { createTheme } from '@mui/material/styles'

// Design tokens — mirrors the original styles.css palette exactly.
export const tokens = {
  paper: '#f4f1ec',
  paper2: '#ebe6de',
  ink: '#161513',
  ink2: '#45423d',
  muted: '#8a857c',
  line: 'rgba(22, 21, 19, 0.14)',
  brick: '#a9532f',
  brick2: '#c46a43',
  night: '#121517',
  night2: '#1c2024',
  lineDark: 'rgba(244, 241, 236, 0.16)',
  serif: "'Instrument Serif', 'Times New Roman', serif",
  sans: "'Inter Tight', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
  max: 1440,
  headerH: 76,
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.brick, contrastText: tokens.paper },
    secondary: { main: tokens.ink },
    background: { default: tokens.paper, paper: '#ffffff' },
    text: { primary: tokens.ink, secondary: tokens.ink2 },
    divider: tokens.line,
  },
  typography: {
    fontFamily: tokens.sans,
    body1: { fontSize: 16, lineHeight: 1.6 },
    body2: { fontSize: 15, lineHeight: 1.55 },
    h1: { fontFamily: tokens.serif, fontWeight: 400, lineHeight: 0.92, letterSpacing: '-0.02em' },
    h2: { fontFamily: tokens.serif, fontWeight: 400, lineHeight: 1.02, letterSpacing: '-0.015em' },
    h3: { fontFamily: tokens.serif, fontWeight: 400, lineHeight: 1.1 },
    button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: tokens.paper, color: tokens.ink },
        '::selection': { backgroundColor: tokens.brick, color: tokens.paper },
        a: { color: 'inherit', textDecoration: 'none' },
        img: { display: 'block', maxWidth: '100%' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 22, paddingBlock: 10 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: '#fff' },
        input: { padding: '12px 14px' },
      },
    },
    MuiTextField: { defaultProps: { fullWidth: true, size: 'small' } },
  },
})

// Custom typography variants used across the app: .mono, .label, .display
theme.typography.mono = {
  fontFamily: tokens.mono,
  fontSize: 11.5,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  lineHeight: 1.4,
}
theme.typography.label = {
  fontSize: 11.5,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  fontWeight: 500,
  color: tokens.muted,
}
theme.typography.display = {
  fontFamily: tokens.serif,
  fontWeight: 400,
  lineHeight: 0.92,
  letterSpacing: '-0.02em',
}

export default theme
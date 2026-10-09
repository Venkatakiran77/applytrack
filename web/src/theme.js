import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c6cf0', light: '#a99dff', contrastText: '#ffffff' },
    success: { main: '#34d399' },
    warning: { main: '#fbbf24' },
    error: { main: '#f87171' },
    info: { main: '#60a5fa' },
    background: { default: '#08080f', paper: '#0f0f1a' },
    text: { primary: '#f1f1f7', secondary: '#9a9ab0' },
    divider: 'rgba(255,255,255,0.08)',
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(1100px 480px at 50% -8%, rgba(88, 76, 214, 0.20), transparent 62%)',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(8,8,15,0.8)',
          backdropFilter: 'blur(12px)',
          border: 'none',
          borderRadius: 0,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 22 },
        containedPrimary: { boxShadow: '0 8px 24px rgba(124,108,240,0.35)' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)' } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: 'rgba(255,255,255,0.06)' },
        head: {
          color: '#9a9ab0',
          fontWeight: 600,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        },
      },
    },
  },
});

export default theme;
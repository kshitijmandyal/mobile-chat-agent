import { createTheme } from '@mui/material/styles';

/**
 * Colours MUI's own components need. They mirror styles/abstracts/_variables.scss;
 * SCSS can't be read from TypeScript, so the two are kept in step by hand.
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5d7a5d' },
    error: { main: '#b3261e' },
    text: { primary: '#1a1a1a', secondary: 'rgba(0, 0, 0, 0.6)' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
    button: { textTransform: 'none', fontWeight: 600 },
  },
});

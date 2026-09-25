'use client';

import { ThemeProvider } from '@mui/material/styles';
import { useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';

import { makeStore } from './store/store';
import { theme } from './theme';

export function Providers({ children }: { children: ReactNode }) {
  // One store per browser session, created once and kept across re-renders.
  const [store] = useState(makeStore);
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </Provider>
  );
}

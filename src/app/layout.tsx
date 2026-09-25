import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { Providers } from '@/client/Providers';
import '@/client/styles/main.scss';

export const metadata: Metadata = {
  title: 'Mobile Chat Assistant',
  description: 'Describe the phone you want and get options from a catalog of 670 models, explained by Claude.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#abbaab',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* MUI's styles go in a CSS layer so the SCSS modules, being unlayered, always win. */}
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

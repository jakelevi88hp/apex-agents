import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TRPCProvider } from '../lib/trpc/client';
import { ErrorBoundary } from '../components/ui/error-boundary';
import Script from 'next/script';
import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = 'https://apex-ai-agent.com';
const GOOGLE_ADS_ID = 'AW-18241966954';
const GA4_ID = 'G-PBZH6YQFBT';

// metadataBase only — no default title, description, canonical, or robots.
// Those leak onto /login, 404s, and every other route if set here.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
            gtag('config', '${GA4_ID}');
          `}
        </Script>
        <ErrorBoundary>
          <TRPCProvider>
            <ThemeProvider>
              <div className="app-layout">
                {children}
              </div>
            </ThemeProvider>
          </TRPCProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
};

export default AppLayout;

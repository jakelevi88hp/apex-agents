import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TRPCProvider } from '../lib/trpc/client';
import { ErrorBoundary } from '../components/ui/error-boundary';
import Script from 'next/script';
import './globals.css';

const SITE_URL = 'https://apex-ai-agent.com';
const GOOGLE_ADS_ID = 'AW-18241966954';
const GA4_ID = 'G-PBZH6YQFBT';

export const metadata = {
  title: {
    default: 'AI Revenue Engine for Local Businesses | Apex Agents',
    template: '%s | Apex Agents',
  },
  description:
    'Scout leads, score prospects on 9 signals, and send personalized outreach for local businesses. Indianapolis-built AI revenue engine.',
  keywords: 'AI revenue engine, local business lead generation, 9-signal lead scoring, autonomous outreach, Indianapolis',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'AI Revenue Engine for Local Businesses | Apex Agents',
    description:
      'Scout leads, 9-signal scoring, and personalized outreach for local businesses. Indianapolis-built.',
    siteName: 'Apex Agents',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Revenue Engine for Local Businesses | Apex Agents',
    description:
      'Scout leads, 9-signal scoring, and personalized outreach for local businesses. Indianapolis-built.',
  },
  robots: { index: true, follow: true },
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Apex Agents',
  applicationCategory: 'BusinessApplication',
  description:
    'AI revenue engine for local businesses. Scout leads, score prospects across 9 signals, write outreach, and track results.',
  url: SITE_URL,
  offers: {
    '@type': 'Offer',
    url: `${SITE_URL}/pricing`,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Apex Advantage',
    url: SITE_URL,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Indianapolis',
      addressRegion: 'IN',
      addressCountry: 'US',
    },
  },
  areaServed: {
    '@type': 'City',
    name: 'Indianapolis',
  },
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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

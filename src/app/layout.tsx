import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TRPCProvider } from '../lib/trpc/client';
import { ErrorBoundary } from '../components/ui/error-boundary';
import Script from 'next/script';
import './globals.css';

const SITE_URL = 'https://apex-agents.vercel.app';

export const metadata = {
  title: 'Apex Agents — Autonomous AI Platform for Local Businesses',
  description:
    'Deploy intelligent AI agents that scout leads, score prospects, write personalized outreach, and track revenue — on autopilot. Built for local businesses.',
  keywords: 'AI agents, local business automation, lead generation, Google reviews, local SEO, autonomous agents',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Apex Agents — Autonomous AI Platform for Local Businesses',
    description:
      'AI-powered revenue system for local businesses. Scout leads, score prospects, send outreach — automatically.',
    url: SITE_URL,
    siteName: 'Apex Agents',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apex Agents — Autonomous AI Platform for Local Businesses',
    description:
      'AI-powered revenue system for local businesses. Scout leads, score prospects, send outreach — automatically.',
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
    'Autonomous AI platform for local businesses. Deploy agents that scout leads, score prospects, write outreach, and track revenue — on autopilot.',
  url: SITE_URL,
  offers: {
    '@type': 'Offer',
    url: `${SITE_URL}/pricing`,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Apex Advantage',
    url: SITE_URL,
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

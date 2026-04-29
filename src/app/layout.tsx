import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TRPCProvider } from '../lib/trpc/client';
import { ErrorBoundary } from '../components/ui/error-boundary';
import './globals.css';

export const metadata = {
  title: 'Apex Agents — Autonomous AI Platform for Local Businesses',
  description:
    'Deploy intelligent AI agents that scout leads, score prospects, write personalized outreach, and track revenue — on autopilot. Built for local businesses.',
  keywords: 'AI agents, local business automation, lead generation, Google reviews, local SEO, autonomous agents',
  metadataBase: new URL('https://apex-agents.vercel.app'),
  openGraph: {
    title: 'Apex Agents — Your Business on Autopilot',
    description:
      'AI-powered revenue system for local businesses. Scout leads, score prospects, send outreach — automatically.',
    url: 'https://apex-agents.vercel.app',
    siteName: 'Apex Agents',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apex Agents — Your Business on Autopilot',
    description:
      'AI-powered revenue system for local businesses. Scout leads, score prospects, send outreach — automatically.',
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
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

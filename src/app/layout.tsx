import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/providers';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Apex Agents - Autonomous AI Platform',
  description: 'Build intelligent agents that think, learn, and execute autonomously',
  manifest: '/manifest.json',
  themeColor: '#8b5cf6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Apex Agents',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Apex Agents',
    title: 'Apex Agents - Autonomous AI Platform',
    description: 'Build intelligent agents that think, learn, and execute autonomously',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apex Agents - Autonomous AI Platform',
    description: 'Build intelligent agents that think, learn, and execute autonomously',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8b5cf6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/favicon-32x32.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon-16x16.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Apex Agents" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <PWAInstallPrompt />
      </body>
    </html>
  );
}

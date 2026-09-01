import type { ReactNode } from 'react';

export const metadata = {
  title: 'Start free',
  description: 'Start a 3-day trial of Apex Agents. Scout leads, 9-signal scoring, and outreach for local businesses.',
  alternates: { canonical: '/signup' },
  openGraph: {
    title: 'Start free | Apex Agents',
    url: 'https://apex-ai-agent.com/signup',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

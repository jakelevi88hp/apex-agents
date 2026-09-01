import type { ReactNode } from 'react';

export const metadata = {
  title: 'Pricing',
  description: '3-day trial, then Premium $29 or Pro $99. AI revenue engine for local businesses.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Apex Agents',
    url: 'https://apex-ai-agent.com/pricing',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

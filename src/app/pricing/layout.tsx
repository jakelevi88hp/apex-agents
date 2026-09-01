import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Local Business AI Agent Pricing | Apex Agents',
  description:
    'Plans for the Apex Agents AI revenue engine: scout leads, 9-signal scoring, and personalized outreach for local businesses.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Local Business AI Agent Pricing | Apex Agents',
    description:
      'Plans for the Apex Agents AI revenue engine: scout leads, 9-signal scoring, and personalized outreach for local businesses.',
    url: '/pricing',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

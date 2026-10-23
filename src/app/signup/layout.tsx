import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start Your Free 3-Day Trial | Apex Agents',
  description:
    'Create your Apex Agents account. 3-day free trial, no credit card required. Scout commercial leads, score them on 9 signals, and send outreach you approve.',
  alternates: { canonical: '/signup' },
  openGraph: {
    title: 'Start Your Free 3-Day Trial | Apex Agents',
    description:
      'Create your Apex Agents account. 3-day free trial, no credit card required. Scout commercial leads, score them on 9 signals, and send outreach you approve.',
    url: '/signup',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

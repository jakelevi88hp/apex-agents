import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start Your AI Revenue Engine | Apex Agents',
  description:
    'Create an Apex Agents account to scout leads, score prospects, and send personalized outreach for your local business.',
  alternates: { canonical: '/signup' },
  openGraph: {
    title: 'Start Your AI Revenue Engine | Apex Agents',
    description:
      'Create an Apex Agents account to scout leads, score prospects, and send personalized outreach for your local business.',
    url: '/signup',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

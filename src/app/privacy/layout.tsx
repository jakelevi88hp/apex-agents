import type { ReactNode } from 'react';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Apex Agents collects, uses, and protects your information.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy | Apex Agents',
    url: 'https://apex-ai-agent.com/privacy',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

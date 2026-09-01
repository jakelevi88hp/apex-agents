import type { ReactNode } from 'react';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using the Apex Agents platform.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms of Service | Apex Agents',
    url: 'https://apex-ai-agent.com/terms',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

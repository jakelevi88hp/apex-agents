import type { ReactNode } from 'react';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to Apex Agents.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

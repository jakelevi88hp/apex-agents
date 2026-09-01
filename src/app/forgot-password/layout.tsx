import type { ReactNode } from 'react';

export const metadata = {
  title: 'Reset password',
  description: 'Reset your Apex Agents password.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

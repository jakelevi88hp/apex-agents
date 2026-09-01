import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Apex Agents',
  description: 'Sign in to your Apex Agents account.',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

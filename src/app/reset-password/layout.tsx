import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Set a new password | Apex Agents',
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}

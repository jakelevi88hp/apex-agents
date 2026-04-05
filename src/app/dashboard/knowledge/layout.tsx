import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Knowledge Base | Apex Agents',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

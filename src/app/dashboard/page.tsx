import type { Metadata } from 'next';
import DashboardHome from './DashboardHome';

// The dashboard layout is a client component, so the title is set here on a
// server page that renders the (client) dashboard home.
export const metadata: Metadata = {
  title: 'Dashboard | Apex Agents',
};

export default function DashboardPage() {
  return <DashboardHome />;
}

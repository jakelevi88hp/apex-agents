import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold">Apex Agents</Link>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-purple-600">Dashboard</Link>
            <Link href="/dashboard/agents" className="hover:text-purple-600">Agents</Link>
            <Link href="/dashboard/workflows" className="hover:text-purple-600">Workflows</Link>
            <Link href="/dashboard/knowledge" className="hover:text-purple-600">Knowledge</Link>
            <Link href="/dashboard/analytics" className="hover:text-purple-600">Analytics</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}


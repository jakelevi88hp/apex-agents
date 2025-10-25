import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-white">Apex Agents</Link>
          <div className="flex gap-6">
            <Link href="/dashboard" className="text-gray-300 hover:text-purple-400">Dashboard</Link>
            <Link href="/dashboard/agents" className="text-gray-300 hover:text-purple-400">Agents</Link>
            <Link href="/dashboard/workflows" className="text-gray-300 hover:text-purple-400">Workflows</Link>
            <Link href="/dashboard/knowledge" className="text-gray-300 hover:text-purple-400">Knowledge</Link>
            <Link href="/dashboard/analytics" className="text-gray-300 hover:text-purple-400">Analytics</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}


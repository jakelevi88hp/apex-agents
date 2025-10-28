'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationCenter from '@/components/NotificationCenter';
import { LogOut, Settings, User, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.role === 'admin' || payload.role === 'owner');
      } catch (e) {
        setIsAdmin(false);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    // Redirect to login
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-white">Apex Agents</Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-300 hover:text-purple-400 transition-colors">Dashboard</Link>
            <Link href="/dashboard/agents" className="text-gray-300 hover:text-purple-400 transition-colors">Agents</Link>
            <Link href="/dashboard/workflows" className="text-gray-300 hover:text-purple-400 transition-colors">Workflows</Link>
            <Link href="/dashboard/knowledge" className="text-gray-300 hover:text-purple-400 transition-colors">Knowledge</Link>
            <Link href="/dashboard/analytics" className="text-gray-300 hover:text-purple-400 transition-colors">Analytics</Link>
            <Link href="/dashboard/settings" className="text-gray-300 hover:text-purple-400 transition-colors">Settings</Link>
            {isAdmin && (
              <Link href="/admin/ai" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
                <Bot className="w-4 h-4" />
                AI Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-red-400 transition-colors font-medium"
            >
              Logout
            </button>
            <NotificationCenter />
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-purple-400 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-red-400 transition-colors border-t border-gray-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}


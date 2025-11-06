'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationCenter from '@/components/NotificationCenter';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { LogOut, Settings, User, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { isDarkMode } = useTheme();

  // Check if user is admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT Payload:', payload);
        console.log('User role:', payload.role);
        const adminStatus = payload.role === 'admin' || payload.role === 'owner';
        console.log('Is admin:', adminStatus);
        setIsAdmin(adminStatus);
      } catch (e) {
        console.error('Error parsing JWT:', e);
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Apex Agents
          </Link>
          <div className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className={`${isDarkMode ? 'text-gray-300 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors`}
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/agents" 
              className={`${isDarkMode ? 'text-gray-300 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors`}
            >
              Agents
            </Link>
            <Link 
              href="/dashboard/workflows" 
              className={`${isDarkMode ? 'text-gray-300 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors`}
            >
              Workflows
            </Link>
            <Link 
              href="/dashboard/knowledge" 
              className={`${isDarkMode ? 'text-gray-300 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors`}
            >
              Knowledge
            </Link>
            <Link 
              href="/dashboard/analytics" 
              className={`${isDarkMode ? 'text-gray-300 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors`}
            >
              Analytics
            </Link>
            <Link 
              href="/dashboard/settings" 
              className={`${isDarkMode ? 'text-gray-300 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors`}
            >
              Settings
            </Link>
            <Link 
              href="/dashboard/agi" 
              className={`${isDarkMode ? 'text-gray-300 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors flex items-center gap-2`}
            >
              <Bot className="w-4 h-4" />
              AGI
            </Link>
            {isAdmin && (
              <Link 
                href="/admin/ai" 
                className={`${isDarkMode ? 'text-gray-300 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors flex items-center gap-2`}
              >
                <Bot className="w-4 h-4" />
                AI Admin
              </Link>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            <button
              onClick={handleLogout}
              className={`${isDarkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-600 hover:text-red-600'} transition-colors font-medium`}
            >
              Logout
            </button>
            <NotificationCenter />
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors`}
              >
                <User className="w-5 h-5" />
              </button>
              
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-48 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-xl z-50`}>
                  <Link
                    href="/dashboard/settings"
                    className={`flex items-center gap-2 px-4 py-3 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-purple-400' : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'} transition-colors`}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-2 w-full px-4 py-3 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-red-400 border-gray-700' : 'text-gray-600 hover:bg-gray-50 hover:text-red-600 border-gray-200'} transition-colors border-t`}
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

'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import NotificationCenter from '@/components/NotificationCenter';
import ThemeToggle from '@/components/ui/ThemeToggle';
import {
  Bot,
  Workflow,
  BookOpen,
  BarChart3,
  Settings,
  Brain,
  Wrench,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const adminStatus = payload.role === 'admin' || payload.role === 'owner';
        setIsAdmin(adminStatus);
      } catch (e) {
        console.error('Error parsing JWT:', e);
        setIsAdmin(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard/agents', icon: Bot, label: 'Agents' },
    { href: '/dashboard/workflows', icon: Workflow, label: 'Workflows' },
    { href: '/dashboard/knowledge', icon: BookOpen, label: 'Knowledge' },
  ];

  const secondaryItems = [
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const settingsItems = [
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const specializedItems = [
    { href: '/dashboard/agi', icon: Brain, label: 'AGI' },
    ...(isAdmin ? [{ href: '/admin/ai', icon: Wrench, label: 'AI Admin' }] : []),
  ];

  const isActive = (href: string) => pathname === href;

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg transition-all
          ${active 
            ? isDarkMode 
              ? 'bg-purple-600 text-white font-semibold' 
              : 'bg-purple-100 text-purple-900 font-semibold'
            : isDarkMode
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
          ${active && 'border-l-4 border-purple-500'}
        `}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <div
      className={`
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border-r h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50
      `}
    >
      {/* Logo & Collapse Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <Link
          href="/dashboard/agents"
          className={`flex items-center gap-2 ${isCollapsed ? 'justify-center w-full' : ''}`}
        >
          <Bot className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          {!isCollapsed && (
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Apex Agents
            </span>
          )}
        </Link>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Collapsed state expand button */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className={`mx-auto mt-2 p-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Quick Action Button */}
      <div className="p-4">
        <Link
          href="/dashboard/agents?action=new"
          className={`
            flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all
            ${isDarkMode
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
            }
          `}
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span>New Agent</span>}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {/* Primary Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {/* Divider */}
        <div className={`my-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

        {/* Secondary Navigation */}
        <div className="space-y-1">
          {secondaryItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {/* Divider */}
        <div className={`my-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

        {/* Settings */}
        <div className="space-y-1">
          {settingsItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {/* Divider */}
        {specializedItems.length > 0 && (
          <div className={`my-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
        )}

        {/* Specialized Tools */}
        {specializedItems.length > 0 && (
          <div className="space-y-1">
            {!isCollapsed && (
              <div className={`px-4 py-2 text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Specialized
              </div>
            )}
            {specializedItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-3 space-y-2`}>
        {/* Theme Toggle */}
        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-center">
          <NotificationCenter />
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}
            `}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Account</span>}
          </button>

          {showUserMenu && (
            <div
              className={`
                absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-xl
                ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}
                border
              `}
            >
              <Link
                href="/dashboard/settings"
                className={`
                  flex items-center gap-2 px-4 py-3 transition-colors
                  ${isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-50 text-gray-600'}
                `}
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="w-4 h-4" />
                {!isCollapsed && <span>Settings</span>}
              </Link>
              <button
                onClick={handleLogout}
                className={`
                  flex items-center gap-2 w-full px-4 py-3 transition-colors border-t
                  ${isDarkMode 
                    ? 'hover:bg-gray-600 text-red-400 border-gray-600' 
                    : 'hover:bg-gray-50 text-red-600 border-gray-200'
                  }
                `}
              >
                <LogOut className="w-4 h-4" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

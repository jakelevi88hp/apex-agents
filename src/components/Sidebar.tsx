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
  Lightbulb,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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

    const specializedItems = [
      { href: '/dashboard/ideas', icon: Lightbulb, label: 'Ideas' },
      { href: '/dashboard/agi', icon: Brain, label: 'AGI' },
      ...(isAdmin ? [{ href: '/dashboard/ai-admin', icon: Wrench, label: 'AI Admin' }] : []),
    ];

  const isActive = (href: string) => pathname === href;

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`
          flex items-center gap-3 px-4 py-4 md:py-3 rounded-lg transition-all
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
        <Icon className="w-6 h-6 md:w-5 md:h-5 flex-shrink-0" />
        {!isCollapsed && <span className="text-base md:text-sm">{label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={`
          md:hidden fixed top-4 left-4 z-50 p-3 rounded-lg shadow-lg transition-all
          ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}
          text-white
        `}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          border-r h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Logo & Close/Collapse Toggle */}
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
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className={`md:hidden p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Desktop Collapse Button */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className={`hidden md:block p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Collapsed state expand button (desktop only) */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className={`hidden md:block mx-auto mt-2 p-2 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* User Menu - Moved to top */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`
                w-full flex items-center gap-3 px-4 py-4 md:py-3 rounded-lg transition-all
                ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}
              `}
            >
              <User className="w-6 h-6 md:w-5 md:h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-base md:text-sm">Account</span>}
            </button>

            {showUserMenu && (
              <div
                className={`
                  absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl z-50
                  ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}
                  border
                `}
              >
                <Link
                  href="/dashboard/settings"
                  className={`
                    flex items-center gap-2 px-4 py-4 md:py-3 transition-colors
                    ${isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-50 text-gray-600'}
                  `}
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-5 h-5 md:w-4 md:h-4" />
                  {!isCollapsed && <span className="text-base md:text-sm">Settings</span>}
                </Link>
                <button
                  onClick={handleLogout}
                  className={`
                    flex items-center gap-2 w-full px-4 py-4 md:py-3 transition-colors border-t
                    ${isDarkMode 
                      ? 'hover:bg-gray-600 text-red-400 border-gray-600' 
                      : 'hover:bg-gray-50 text-red-600 border-gray-200'
                    }
                  `}
                >
                  <LogOut className="w-5 h-5 md:w-4 md:h-4" />
                  {!isCollapsed && <span className="text-base md:text-sm">Logout</span>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="p-4">
          <Link
            href="/dashboard/agents?action=new"
            className={`
              flex items-center justify-center gap-2 px-4 py-4 md:py-3 rounded-lg font-semibold transition-all
              ${isDarkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
              }
            `}
          >
            <Plus className="w-6 h-6 md:w-5 md:h-5" />
            {!isCollapsed && <span className="text-base md:text-sm">New Agent</span>}
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
        </div>
      </div>
    </>
  );
}

'use client';

import Link from 'next/link';
import { BookOpen, Compass, FileText, LifeBuoy } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Dashboard docs page with quick links and getting started guides.
 * @returns The docs page content for the dashboard area.
 */
export default function DocsPage() {
  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Docs
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Guides, references, and best practices for building with Apex Agents.
          </p>
        </div>
        <Link
          href="/dashboard/agents?action=new"
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
            isDarkMode
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          <FileText className="h-4 w-4" />
          Create your first agent
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div
          className={`rounded-xl border p-6 shadow-lg ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-purple-500/20 p-3">
              <Compass className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Getting Started
              </h2>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Learn the basics of creating agents, running workflows, and organizing knowledge sources.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/dashboard/agents"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Agents guide
                </Link>
                <Link
                  href="/dashboard/workflows"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Workflow basics
                </Link>
                <Link
                  href="/dashboard/knowledge"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Knowledge hub
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl border p-6 shadow-lg ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-blue-500/20 p-3">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Core Concepts
              </h2>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Dive into execution runs, tool integrations, and performance tracking.
              </p>
              <div className="mt-4 grid gap-3 text-sm">
                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                  Understand agent lifecycle and state management.
                </div>
                <div className={`rounded-lg p-3 ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                  Learn how workflows orchestrate multi-step tasks.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div
          className={`rounded-xl border p-6 shadow-lg ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Links</h3>
          <div className="mt-4 space-y-3 text-sm">
            <Link
              href="/dashboard/analytics"
              className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
                isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Analytics overview
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
                isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Account settings
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/dashboard/pieces/workstream"
              className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
                isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Workstream automation
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div
          className={`rounded-xl border p-6 shadow-lg lg:col-span-2 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-emerald-500/20 p-3">
              <LifeBuoy className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Need more help?
              </h3>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Review troubleshooting tips, explore system status, and contact support if you get stuck.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                  Check integrations and API limits in settings.
                </div>
                <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                  Keep an eye on notifications for system updates.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

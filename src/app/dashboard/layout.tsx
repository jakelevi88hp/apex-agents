'use client';

import Sidebar from '@/components/Sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import OnboardingWizard from '@/components/OnboardingWizard';
import CommandPalette from '@/components/CommandPalette';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';
import ProductTour from '@/components/ProductTour';
import LiveChatWidget from '@/components/LiveChatWidget';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
        {children}
      </main>

      {/* Onboarding wizard — only shows once for new users */}
      <OnboardingWizard />

      {/* Global command palette — ⌘K / Ctrl+K */}
      <CommandPalette />

      {/* Keyboard shortcuts help — press ? */}
      <KeyboardShortcutsHelp />

      {/* Product tour — shows once after onboarding wizard */}
      <ProductTour />

      {/* Live chat / support widget — fixed bottom-right */}
      <LiveChatWidget />
    </div>
  );
}

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { DarkModeToggle } from '../components/DarkModeToggle';

const RootLayout: React.FC = ({ children }) => {
  return (
    <ThemeProvider attribute="class">
      <div className="min-h-screen bg-background text-text">
        <header className="p-4">
          <DarkModeToggle />
        </header>
        <main>{children}</main>
      </div>
    </ThemeProvider>
  );
};

export default RootLayout;

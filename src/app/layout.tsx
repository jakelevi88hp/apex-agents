import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TRPCProvider } from '../lib/trpc/client';
import { ErrorBoundary } from '../components/ui/error-boundary';
import './globals.css';

export const metadata = {
  title: 'Apex Agents - Autonomous AI Platform',
  description: 'Build intelligent agents that think, learn, and execute complex workflows autonomously.',
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <TRPCProvider>
            <ThemeProvider>
              <div className="app-layout">
                {children}
              </div>
            </ThemeProvider>
          </TRPCProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
};

export default AppLayout;

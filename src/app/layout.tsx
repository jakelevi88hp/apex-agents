import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TRPCProvider } from '../lib/trpc/client';
import './globals.css';

export const metadata = {
  title: 'Apex Agents - Autonomous AI Platform',
  description: 'Build intelligent agents that think, learn, and execute complex workflows autonomously.',
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>
          <ThemeProvider>
            <div className="app-layout">
              {children}
            </div>
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
};

export default AppLayout;

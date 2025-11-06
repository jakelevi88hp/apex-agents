import React from 'react';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <div className="app-layout">
        {children}
      </div>
    </ThemeProvider>
  );
};

export default AppLayout;
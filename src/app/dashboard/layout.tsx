import React from 'react';
import ThemeToggle from '../../components/ui/ThemeToggle';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <header>
        <ThemeToggle />
      </header>
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;
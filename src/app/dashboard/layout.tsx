import React from 'react';
import { Sidebar } from '../../components/ui/Sidebar';

/**
 * Dashboard Layout Component
 * 
 * This component is responsible for rendering the layout of the dashboard.
 * It includes a sidebar for navigation and a main content area where different
 * dashboard pages are displayed.
 */
const DashboardLayout: React.FC = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

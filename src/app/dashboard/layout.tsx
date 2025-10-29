import { DarkModeToggle } from '../../components/ui/DarkModeToggle';

export default function DashboardLayout({ children }) {
  // Existing code...
  return (
    <div className='dashboard-layout'>
      <nav>
        // Existing navigation elements...
        <DarkModeToggle />
      </nav>
      <main>{children}</main>
    </div>
  );
}

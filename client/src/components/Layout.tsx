import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background-dark text-white overflow-x-hidden">
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pt-16 sm:p-6 sm:pt-6 lg:p-12">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

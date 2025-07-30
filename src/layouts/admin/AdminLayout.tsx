import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get page title from current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/content')) return 'Content Management';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/reports')) return 'Reports';
    return 'Admin Panel';
  };

  return (
    <div className="flex h-screen bg-secondary-100">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader 
          title={getPageTitle()} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-secondary-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 
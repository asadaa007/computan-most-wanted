import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

interface NavItem {
  name: string;
  path: string;
  icon: string;
  badge?: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/comp-admin/dashboard', icon: 'fas fa-chart-line' },
  { name: 'Manage Employees', path: '/comp-admin/employees', icon: 'fas fa-users' },
  { name: 'Form Submissions', path: '/comp-admin/submissions', icon: 'fas fa-envelope' },
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };



  return (
    <div className={`bg-white border-r border-secondary-300 transition-all duration-300 flex flex-col h-full ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-secondary-300">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-secondary-800">Computan Admin</h1>
                <p className="text-xs text-secondary-600">Talent Management</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            <span className="text-secondary-600">
              {isCollapsed ? <i className="fas fa-chevron-right"></i> : <i className="fas fa-chevron-left"></i>}
            </span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-secondary-800 text-white shadow-lg'
                  : 'text-secondary-700 hover:bg-secondary-100'
              }`}
            >
              <i className={`${item.icon} text-xl`}></i>
              {!isCollapsed && (
                <>
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-secondary-200 text-secondary-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info and Logout */}
      <div className="mt-auto p-4 border-t border-secondary-300">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-secondary-800 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-800 truncate">
                {auth.currentUser?.email || 'Admin User'}
              </p>
              <p className="text-xs text-secondary-600 truncate">
                Administrator
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-secondary-800 hover:bg-secondary-500 text-white transition-colors duration-200 ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
          title="Sign Out"
        >
          <i className="fas fa-sign-out-alt text-sm"></i>
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>

    </div>
  );
} 
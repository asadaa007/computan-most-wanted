import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface NavItem {
  name: string;
  path: string;
  icon: string;
  badge?: string;
}

interface AdminUser {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  role: 'master' | 'manager' | 'team_lead';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  department?: string;
  phone?: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/comp-admin/dashboard', icon: 'fas fa-chart-line' },
  { name: 'Team', path: '/comp-admin/employees', icon: 'fas fa-users' },
  { name: 'Departments', path: '/comp-admin/departments', icon: 'fas fa-building' },
  { name: 'Attendance', path: '/comp-admin/attendance', icon: 'fas fa-clock' },
  { name: 'Form Submissions', path: '/comp-admin/submissions', icon: 'fas fa-envelope' },
  { name: 'Settings', path: '/comp-admin/settings', icon: 'fas fa-cog' },
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const location = useLocation();

  const loadCurrentUser = async (user: User | null) => {
    try {
      if (user) {
        const userDoc = await getDoc(doc(db, 'adminUsers', user.uid));
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as AdminUser;
          setCurrentUser(userData);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      loadCurrentUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

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
      <div className="p-3 border-b border-secondary-300">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img 
                src="/computan-icon.webp" 
                alt="Computan" 
                className="w-8 h-8 "
              />
              <div>
                <h1 className="text-lg font-bold text-secondary-800">Admin Panel</h1>
                <p className="text-xs text-secondary-600">Employee Management</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2  hover:bg-secondary-100 transition-colors duration-200"
          >
            <span className="text-secondary-600">
              {isCollapsed ? <i className="fas fa-chevron-right"></i> : <i className="fas fa-chevron-left"></i>}
            </span>
          </button>
        </div>
      </div>

      {/* Visit Site Button */}
      <div className="p-3 border-b border-secondary-300">
        <button
          onClick={() => window.open('/', '_blank')}
          className={`w-full flex items-center justify-center space-x-2 p-2 text-black transition-colors duration-200 ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
          title="Visit Site"
        >
          <i className="fas fa-external-link-alt text-sm"></i>
          {!isCollapsed && <span className="text-sm font-medium">Visit Site</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-3  transition-all duration-200 group ${
                isActive
                  ? 'bg-secondary-800 text-white shadow-lg'
                  : 'text-secondary-700 hover:bg-secondary-100'
              } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
            >
              <i className={`${item.icon} text-xl`}></i>
              {!isCollapsed && (
                <>
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className={`ml-auto px-2 py-1 text-xs  ${
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
          <div className="w-8 h-8 bg-secondary-800  flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'A'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-800 truncate">
                {currentUser?.displayName || 'Admin User'}
              </p>
              <p className="text-xs text-secondary-600 truncate">
                {currentUser?.email || 'admin@example.com'}
              </p>
              {currentUser && (
                <p className="text-xs text-secondary-500 truncate">
                  Role: {currentUser.role}
                </p>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center justify-center space-x-2 p-2  bg-secondary-800 hover:bg-secondary-500 text-white transition-colors duration-200 ${
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
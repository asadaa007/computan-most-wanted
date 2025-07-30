import { useState } from 'react';

interface AdminHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function AdminHeader({ title, onMenuClick }: AdminHeaderProps) {
  const [notifications] = useState([
    { id: 1, message: 'New user registration', time: '2 min ago', unread: true },
    { id: 2, message: 'System backup completed', time: '1 hour ago', unread: true },
    { id: 3, message: 'Payment processed', time: '3 hours ago', unread: false },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-secondary-300 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-secondary-100 transition-colors duration-200 lg:hidden"
          >
            <i className="fas fa-bars text-xl text-secondary-600"></i>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-secondary-800">{title}</h1>
            <p className="text-sm text-secondary-600">Manage your tech talent pool</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 px-4 py-2 pl-10 bg-secondary-100 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-secondary-800 placeholder-secondary-500"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500"></i>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
            >
              <i className="fas fa-bell text-xl"></i>
              {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary-800 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-secondary-300 z-50">
                <div className="p-4 border-b border-secondary-300">
                  <h3 className="text-lg font-semibold text-secondary-800">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-secondary-200 hover:bg-secondary-50 transition-colors duration-200 ${
                        notification.unread ? 'bg-secondary-100' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.unread ? 'bg-secondary-800' : 'bg-secondary-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-secondary-800">
                            {notification.message}
                          </p>
                          <p className="text-xs text-secondary-600 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-secondary-300">
                  <button className="w-full text-center text-sm text-secondary-700 hover:text-secondary-800 font-medium">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>


        </div>
      </div>
    </header>
  );
} 
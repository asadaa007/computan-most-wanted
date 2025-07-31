import { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface Employee {
  id?: string;
  name: string;
  position: string;
  department: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  bio: string;
  image: string;
  linkedin: string;
  github: string;
  portfolio: string;
  isActive: boolean;
  joinDate: string;
  lastModified: string;
}

interface AdminHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function AdminHeader({ title, onMenuClick }: AdminHeaderProps) {
  const [notifications] = useState([
    { id: 1, message: 'New employee added', time: '2 min ago', unread: true },
    { id: 2, message: 'System backup completed', time: '1 hour ago', unread: true },
    { id: 3, message: 'Form submission received', time: '3 hours ago', unread: false },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Load employees for search
  useEffect(() => {
    loadEmployees();
  }, []);

  // Handle search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, allEmployees]);

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadEmployees = async () => {
    try {
      const employeesSnapshot = await getDocs(collection(db, 'employees'));
      const employeesData: Employee[] = [];
      employeesSnapshot.forEach((doc) => {
        employeesData.push({ id: doc.id, ...doc.data() } as Employee);
      });
      setAllEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees for header search:', error);
    }
  };

  const performSearch = () => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query || allEmployees.length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const results = allEmployees.filter(employee =>
        employee.name.toLowerCase().includes(query) ||
        employee.position.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.skills?.some(skill => skill.toLowerCase().includes(query))
      ).slice(0, 6); // Limit to 6 results for dropdown
      
      setSearchResults(results);
      setShowSearchResults(true);
      setSearchLoading(false);
    }, 300);
  };

  const handleView = (employee: Employee) => {
    window.location.href = `/person/${employee.id}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white border-b border-secondary-300 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2  hover:bg-secondary-100 transition-colors duration-200 lg:hidden"
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
          <div className="relative hidden md:block" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onFocus={() => {
                if (searchQuery.trim() && searchResults.length > 0) {
                  setShowSearchResults(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  handleView(searchResults[0]);
                }
              }}
              placeholder="Search..."
              className="w-64 px-4 py-2 pl-10 bg-secondary-100 border border-secondary-300  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-secondary-800 placeholder-secondary-500"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500"></i>

            {/* Search Results Dropdown */}
            {showSearchResults && searchLoading && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200  shadow-lg z-50 p-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin  h-4 w-4 border-b-2 border-secondary-600 mr-2"></div>
                  <p className="text-secondary-600 text-sm">Searching...</p>
                </div>
              </div>
            )}

            {showSearchResults && !searchLoading && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200  shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleView(result)}
                    className="flex items-center p-3 hover:bg-secondary-50 cursor-pointer border-b border-secondary-100 last:border-b-0"
                  >
                    {result.image ? (
                      <img 
                        src={result.image} 
                        alt={result.name}
                        className="w-8 h-8  object-cover mr-3 border border-secondary-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-8 h-8 bg-secondary-200  flex items-center justify-center mr-3 ${result.image ? 'hidden' : ''}`}>
                      <span className="text-secondary-700 font-bold text-sm">{result.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-800">{result.name}</p>
                      <p className="text-sm text-secondary-600">{result.position}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-secondary-500">{formatDate(result.lastModified)}</p>
                      {result.isActive && (
                        <span className="inline-block mt-1 px-2 py-1 bg-success-100 text-success-800 text-xs ">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div className="p-3 border-t border-secondary-200 bg-secondary-50">
                  <p className="text-xs text-secondary-600">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}

            {/* No Results */}
            {showSearchResults && !searchLoading && searchQuery.trim() && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200  shadow-lg z-50 p-4">
                <p className="text-secondary-600 text-center">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2  hover:bg-secondary-100 transition-colors duration-200"
            >
              <i className="fas fa-bell text-xl"></i>
              {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary-800 text-white text-xs  flex items-center justify-center">
              {unreadCount}
            </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white -xl shadow-lg border border-secondary-300 z-50">
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
                        <div className={`w-2 h-2  mt-2 ${
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
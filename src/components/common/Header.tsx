import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPersonSlug } from '../../utils/slugify';

interface EmployeeCard {
  id: string;
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
  flag: string;
}

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: EmployeeCard[];
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
}

export default function Header({ 
  searchTerm, 
  setSearchTerm, 
  searchResults, 
  showSearchResults, 
  setShowSearchResults 
}: HeaderProps) {
  const searchRef = useRef<HTMLDivElement>(null);

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
  }, [setShowSearchResults]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-secondary-800 p-4 sm:p-8">
      <div className="max-w-[1440px] mx-auto">
        {/* First Row - Title and Logo */}
        <div className="flex justify-between items-start mb-4 lg:mb-6">
          {/* Left side - Title */}
          <div className="flex-1">
            <Link to="/" className="block">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-primary-400 hover:text-white transition-colors cursor-pointer">
                COMPUTAN'S MOST WANTED
              </h1>
            </Link>
          </div>

          {/* Right side - Tech and Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-white px-3 py-2 text-secondary-800 text-sm font-semibold">
              MARKETERS
            </div>
            <img
              src="/computan-icon.webp"
              alt="Computan Logo"
              className="w-16 h-16 lg:w-24 lg:h-24 object-contain"
            />
          </div>
        </div>

        {/* Second Row - Search and Buttons */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          {/* Left side - Search */}
          <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-sm" ref={searchRef}>
            <input
              type="text"
              placeholder="Search by name, position, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm.trim() && searchResults.length > 0) {
                  setShowSearchResults(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  window.location.href = `/person/${createPersonSlug(searchResults[0].name)}`;
                }
              }}
              className="w-full px-4 py-4 bg-secondary-700 text-white placeholder-gray-400 border border-secondary-600 focus:outline-none focus:border-primary-400"
            />
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200 shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    to={`/person/${createPersonSlug(result.name)}`}
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchTerm('');
                    }}
                    className="flex items-center p-3 hover:bg-secondary-50 cursor-pointer border-b border-secondary-100 last:border-b-0"
                  >
                    {result.image ? (
                      <img 
                        src={result.image} 
                        alt={result.name}
                        className="w-8 h-8 object-cover mr-3 border border-secondary-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-8 h-8 bg-secondary-200 flex items-center justify-center mr-3 ${result.image ? 'hidden' : ''}`}>
                      <span className="text-secondary-700 font-bold text-sm">{result.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-800">{result.name}</p>
                      <p className="text-sm text-secondary-600">{result.position}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-secondary-500">{formatDate(result.lastModified)}</p>
                    </div>
                  </Link>
                ))}
                <div className="p-3 border-t border-secondary-200 bg-secondary-50">
                  <p className="text-xs text-secondary-600">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} • Press Enter for first result
                  </p>
                </div>
              </div>
            )}

            {/* No Results */}
            {showSearchResults && searchTerm.trim() && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200 shadow-lg z-50 p-4">
                <p className="text-secondary-600 text-center">No results found for "{searchTerm}"</p>
              </div>
            )}
          </div>

          {/* Right side - Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button className="bg-primary-400 text-black px-4 py-4 text-sm font-semibold hover:bg-primary-300 transition-colors">
              RECEIVE EMAIL ALERTS
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 
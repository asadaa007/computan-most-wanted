import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem('cookieConsent');
    if (!hasConsent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              We use cookies
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              This website uses cookies to enhance your browsing experience and provide personalized content.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={acceptCookies}
                className="bg-primary-400 text-black px-3 py-1.5 text-xs font-medium hover:bg-primary-300 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={declineCookies}
                className="bg-gray-200 text-gray-700 px-3 py-1.5 text-xs font-medium hover:bg-gray-300 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
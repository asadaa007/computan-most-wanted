import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(auth.currentUser);



  // Listen for auth state changes - use useEffect to prevent infinite re-renders
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Cleanup function to remove the listener
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs only once

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/comp-admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-secondary-800 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-secondary-800 mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <div className="bg-danger-100 border border-danger-400 text-danger-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-400 text-white font-bold py-2 px-4 rounded hover:bg-primary-500 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
} 
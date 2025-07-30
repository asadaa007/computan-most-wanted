import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export default function AuthExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Listen for auth state changes
  auth.onAuthStateChanged((user) => {
    setUser(user);
  });

  const handleSignIn = async (e: React.FormEvent) => {
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Firebase Auth Demo</h2>
      
      {user ? (
        <div className="text-center">
          <p className="text-green-400 mb-4">Welcome, {user.email}!</p>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <form className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          
          <div className="flex space-x-2">
            <button
              type="submit"
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
            <button
              type="submit"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 
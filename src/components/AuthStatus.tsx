/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Auth error:", error);
      // We'll use console error instead of alert for now
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) return null;

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full border border-green-100">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-green-800 uppercase tracking-tighter">Contributor</p>
            <p className="text-sm text-green-900 font-medium">{user.displayName || 'Logged In'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-2 p-2 hover:bg-green-100 rounded-full text-green-700 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          disabled={authLoading}
          className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all font-medium shadow-lg shadow-gray-200 disabled:opacity-50"
        >
          <LogIn className="w-4 h-4" />
          {authLoading ? 'Connecting...' : 'Login to Contribute'}
        </button>
      )}
    </div>
  );
}

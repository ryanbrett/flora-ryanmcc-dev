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
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Add custom parameters to force account selection if needed
      provider.setCustomParameters({ prompt: 'select_account' });
      
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Auth error:", error);
      let message = "Login failed. Please try again.";
      
      if (error.code === 'auth/popup-closed-by-user') {
        message = "The login popup was closed before completion.";
      } else if (error.code === 'auth/unauthorized-domain') {
        message = "This domain is not authorized for login. Please add it in Firebase Console.";
      } else if (error.code === 'auth/popup-blocked') {
        message = "The login popup was blocked by your browser.";
      } else if (error.message) {
        message = `Error: ${error.code || error.message}`;
      }
      
      setAuthError(message);
      // Auto-clear error after 10 seconds
      setTimeout(() => setAuthError(null), 10000);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) return null;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 bg-green-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border border-green-100">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold text-green-800 uppercase tracking-tighter leading-none">Contributor</p>
              <p className="text-xs text-green-900 font-medium leading-none mt-0.5">{user.displayName || 'Logged In'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 hover:bg-green-100 rounded-full text-green-700 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            disabled={authLoading}
            className="flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all text-sm sm:text-base font-medium shadow-lg shadow-gray-200 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">{authLoading ? 'Connecting...' : 'Login to Contribute'}</span>
            <span className="sm:hidden">{authLoading ? '...' : 'Login'}</span>
          </button>
        )}
      </div>
      {authError && (
        <div className="text-[10px] font-black uppercase tracking-widest text-error bg-error/10 px-3 py-1 border border-error animate-in fade-in slide-in-from-top-1">
          {authError}
        </div>
      )}
    </div>
  );
}

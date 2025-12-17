import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { TodoList } from './components/TodoList';
import { AuthState, User } from './types';

// TODO: REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID
const GOOGLE_CLIENT_ID = '90359093418-n2t1ucbr7dv1pfqms01r2mrbk3du71mp.apps.googleusercontent.com';

// Utility to parse JWT from Google
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT', e);
    return null;
  }
};

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('smartdo_user');
    if (storedUser) {
      setAuth({
        isAuthenticated: true,
        user: JSON.parse(storedUser),
        isLoading: false
      });
    } else {
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const handleGoogleSuccess = (response: any) => {
    // Decode the ID token to get user info
    const payload = parseJwt(response.credential);
    
    if (payload) {
      const newUser: User = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        photoUrl: payload.picture
      };

      localStorage.setItem('smartdo_user', JSON.stringify(newUser));
      
      setAuth({
        isAuthenticated: true,
        user: newUser,
        isLoading: false
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smartdo_user');
    // Also disable auto-select for next time
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    setAuth({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {!auth.isAuthenticated ? (
        <Login onSuccess={handleGoogleSuccess} clientId={GOOGLE_CLIENT_ID} />
      ) : (
        <TodoList user={auth.user!} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
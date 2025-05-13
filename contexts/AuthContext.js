// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

// Create the auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const hasFetchedSession = useRef(false);
  const router = useRouter();

  // Check if user is authenticated on page load
  useEffect(() => {
    if (hasFetchedSession.current) return;
    hasFetchedSession.current = true;

    async function loadUserFromSession() {
      try {
        // Try to get the session token from cookies
        const sessionToken = Cookies.get('session_token');
        
        if (!sessionToken) {
          setLoading(false);
          setInitialized(true);
          return;
        }
        
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Failed to load user session', err);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    }

    loadUserFromSession();
  }, []); // Only run once on mount

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return { success: false, error: data.error || 'Login failed' };
      }

      // Set user data
      setUser(data.user);
      
      // Store session token in a cookie (HttpOnly cookie should be set by the server)
      // This is just a backup in case the server didn't set it properly
      if (data.sessionToken) {
        Cookies.set('session_token', data.sessionToken, { 
          expires: 7, // 7 days
          path: '/',
          sameSite: 'strict'
        });
      }

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);

    try {
      // Call the logout API endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Clear user data and session token cookie
      setUser(null);
      Cookies.remove('session_token');
      
      // Redirect to login page
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Register function (unchanged)
  const register = async (accountData, userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: accountData.accountName,
          accountDomain: accountData.accountDomain,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return { success: false, error: data.error || 'Registration failed' };
      }

      return { success: true, accountId: data.accountId };
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Handle user permissions (unchanged)
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    
    // Check if user has admin access
    if (user.permissions.all === true || user.isAdmin) {
      return true;
    }
    
    // Check for specific permission
    return user.permissions[permission] === true;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        error,
        initialized,
        login,
        logout,
        register,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
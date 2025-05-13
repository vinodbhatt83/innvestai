// components/AuthGuard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

// Pages that don't require authentication
const publicPages = ['/login', '/register', '/forgot-password', '/reset-password', '/registration-success'];

// Dashboard is at the root path
const dashboardPath = '/';

const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if the route is public
    const isPublicPage = publicPages.includes(router.pathname);
    const isDashboard = router.pathname === dashboardPath;
    
    // Authentication check function
    const authCheck = () => {
      if (!isAuthenticated && !loading && !isPublicPage) {
        // If not authenticated and not on a public page, redirect to login
        setAuthorized(false);
        router.push({
          pathname: '/login',
          query: { returnUrl: router.asPath }
        });
      } else if (isAuthenticated && isPublicPage) {
        // If authenticated and on a public page, redirect to dashboard (home page)
        setAuthorized(false);
        router.push(dashboardPath);
      } else if (!isAuthenticated && isDashboard) {
        // If not authenticated and on the dashboard (home page), redirect to login
        setAuthorized(false);
        router.push('/login');
      } else {
        // Otherwise, they're authorized to view the current page
        setAuthorized(true);
      }
    };

    // Run auth check
    authCheck();

    // Listen for route changes
    const handleRouteChange = () => {
      authCheck();
    };

    // Subscribe to router changes
    router.events.on('routeChangeComplete', handleRouteChange);

    // Unsubscribe on cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [isAuthenticated, loading, router]);

  // While checking authentication status, show a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <div className="flex justify-center">
            <svg className="animate-spin h-10 w-10 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  return authorized && children;
};

export default AuthGuard;
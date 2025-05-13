// utils/withAuthProtection.js
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Dashboard is at the root path
const dashboardPath = '/';

/**
 * Higher-order component for route protection
 * @param {React.ComponentType} Component - Component to protect
 * @param {Object} options - Options for protection
 * @param {boolean} options.adminOnly - Whether the route is admin-only
 */
const withAuthProtection = (Component, options = { adminOnly: false }) => {
  const ProtectedRoute = (props) => {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Wait until authentication state is determined
      if (!loading) {
        // If not authenticated, redirect to login
        if (!isAuthenticated) {
          router.push({
            pathname: '/login',
            query: { returnUrl: router.asPath }
          });
        } 
        // If admin-only route and user is not admin, redirect to home
        else if (options.adminOnly && !user?.isAdmin) {
          router.push(dashboardPath);
        }
      }
    }, [isAuthenticated, loading, router, user]);

    // Show loading state or render component
    if (loading || !isAuthenticated || (options.adminOnly && !user?.isAdmin)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="w-full max-w-md p-8 space-y-8 text-center">
            <div className="mx-auto">
              <svg className="animate-spin h-10 w-10 text-secondary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  // Copy getInitialProps for SSR support
  if (Component.getInitialProps) {
    ProtectedRoute.getInitialProps = Component.getInitialProps;
  }

  return ProtectedRoute;
};

export default withAuthProtection;
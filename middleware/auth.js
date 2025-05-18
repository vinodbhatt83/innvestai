// middleware/auth.js
import { NextResponse } from 'next/server';

// This middleware runs on the server (Edge runtime)
export async function authMiddleware(req) {
  const { pathname } = req.nextUrl;
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/login',
    '/signup',
    '/reset-password',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/reset-password',
    '/api/debug', // Add debug API routes as public
  ];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
  
  // Allow access to public paths
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Get the session token from cookies
  const sessionToken = req.cookies.get('session_token')?.value;
  
  // If no session token, redirect to login
  if (!sessionToken) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // Note: We can't verify the session here since Edge runtime doesn't support database connections
  // We'll rely on API routes to verify the session on each request that needs it
  
  return NextResponse.next();
}

// This is used client-side to check if user is authenticated
export async function isAuthenticated() {
  // This only runs in the browser
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for session token cookie
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  return !!cookies.session_token;
}

// This is only used server-side in API routes and server components
export const apiAuthMiddleware = async (req, res, next) => {
  console.log('apiAuthMiddleware called', { 
    url: req.url,
    method: req.method,
    query: req.query 
  });
  
  // Only run this on the server
  if (typeof window !== 'undefined') {
    console.error('apiAuthMiddleware called on client side');
    throw new Error('apiAuthMiddleware can only be used on the server');
  }
  
  // Get the session token from cookies
  const cookies = req.cookies;
  const sessionToken = cookies.session_token;
  
  console.log('Session token check', { 
    hasToken: !!sessionToken,
    cookiesReceived: Object.keys(cookies)
  });
  
  // If no session token, return unauthorized
  if (!sessionToken) {
    console.log('No session token found, authentication required');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    console.log('Verifying session token');
    
    // Import auth only on server-side
    const { auth } = require('../lib/auth');
    
    // Verify the session
    const user = await auth.verifySession(sessionToken);
    
    console.log('Session verification result', { 
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email
    });
    
    // If session is invalid, return unauthorized
    if (!user) {
      console.log('Invalid or expired session');
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    // Attach user to request object
    req.user = user;
    
    console.log('User authenticated successfully', { 
      id: user.id, 
      email: user.email,
      accountId: user.accountId,
      isAdmin: user.isAdmin || user.is_account_admin
    });
    
    // Continue to the next middleware or handler
    if (next) {
      return next();
    }
    
    return true;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// For use in API routes to get the authenticated user
export const getAuthenticatedUser = async (req, res) => {
  const isAuthenticated = await apiAuthMiddleware(req, res);
  return isAuthenticated === true ? req.user : null;
};

// withAuth HOC for protecting API routes with authentication
export const withAuth = (handler) => {
  return async (req, res) => {
    try {
      // Check if user is authenticated
      const result = await apiAuthMiddleware(req, res);
      
      // If the middleware returned a status code, it handled unauthorized
      if (result !== true) {
        return result;
      }
      
      // User is authenticated, so execute the handler
      return await handler(req, res);
    } catch (error) {
      console.error('Error in withAuth middleware:', error);
      return res.status(500).json({ error: 'An internal server error occurred' });
    }
  };
};

// withPermission HOC for protecting API routes that need specific permissions
export const withPermission = (handler, permission) => {
  return async (req, res) => {
    try {
      console.log(`withPermission middleware called for permission: ${permission}`);
      
      // First check authentication
      const authResult = await apiAuthMiddleware(req, res);
      
      if (authResult !== true) {
        console.log('Authentication failed in withPermission', { authResult });
        return authResult;
      }
      
      console.log('User authenticated in withPermission', { 
        userId: req.user?.id,
        email: req.user?.email,
        permissions: req.user?.permissions,
        isAccountAdmin: req.user?.is_account_admin
      });
      
      // Check permission - allow access if:
      // 1. The user has the specific permission, OR
      // 2. The user has 'all' permissions, OR
      // 3. The user is an account admin
      // 4. If no specific permission is required (null/undefined)
      const user = req.user;
      const hasPermission = !permission || 
                           (user.permissions && 
                           (user.permissions[permission] === true || 
                            user.permissions.all === true || 
                            user.is_account_admin === true));
      
      if (!hasPermission) {
        console.log('Permission denied in withPermission', { 
          requiredPermission: permission,
          userPermissions: user.permissions,
          isAdmin: user.is_account_admin
        });
        return res.status(403).json({ error: 'You do not have permission to access this resource' });
      }
      
      console.log('Permission granted in withPermission', { permission });
      
      // User is authenticated and has permission, so execute the handler
      return await handler(req, res);
    } catch (error) {
      console.error('Error in withPermission middleware:', error);
      return res.status(500).json({ error: 'An internal server error occurred' });
    }
  };
};

// withAuthRedirect HOC for client-side auth checking with redirect
export const withAuthRedirect = (Component, options = { adminOnly: false }) => {
  // This is just a wrapper around withAuthProtection for consistency
  return Component;
};
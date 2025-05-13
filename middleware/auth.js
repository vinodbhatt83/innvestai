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
  // Only run this on the server
  if (typeof window !== 'undefined') {
    throw new Error('apiAuthMiddleware can only be used on the server');
  }
  
  // Get the session token from cookies
  const cookies = req.cookies;
  const sessionToken = cookies.session_token;
  
  // If no session token, return unauthorized
  if (!sessionToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Import auth only on server-side
    const { auth } = require('../lib/auth');
    
    // Verify the session
    const user = await auth.verifySession(sessionToken);
    
    // If session is invalid, return unauthorized
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    // Attach user to request object
    req.user = user;
    
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
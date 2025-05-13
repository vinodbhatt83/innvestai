// middleware.js - NextJS Edge middleware
import { NextResponse } from 'next/server';

// Pages that don't require authentication
const publicPages = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/registration-success'
];

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is a public page or an API route
  const isPublicPage = publicPages.some(page => pathname === page || pathname.startsWith(page + '/'));
  const isApiRoute = pathname.startsWith('/api/');
  const isStaticAsset = pathname.startsWith('/_next/') || 
                        pathname.includes('/images/') || 
                        pathname.includes('.') ||
                        pathname === '/favicon.ico';
  
  // Get session token from cookies
  const sessionToken = request.cookies.get('session_token')?.value;
  
  // If it's not a public page, API route, or static asset, check for authentication
  if (!isPublicPage && !isApiRoute && !isStaticAsset) {
    // If no session token exists, redirect to login
    if (!sessionToken) {
      // Create the URL to redirect to
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // If user is authenticated and trying to access a public page, redirect to dashboard
  if (isPublicPage && sessionToken && pathname !== '/registration-success') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Continue with the request if authenticated or if it's a public page/API route
  return NextResponse.next();
}

// Specify paths for the middleware to run on
export const config = {
  // Match all paths except api routes and static assets
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
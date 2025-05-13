// middleware.js
import { NextResponse } from 'next/server';

// Store for deduplicating requests 
const processedRequests = new Set();

// Middleware function
export function middleware(request) {
  // Get the pathname
  const url = request.nextUrl.pathname;
  
  // Only deduplicate specific data fetches
  if (url.includes('/_next/data/') && url.includes('/index.json')) {
    // Create a unique key for this request
    const uniqueKey = `${url}-${Date.now()}`;
    
    // Check if we've seen this URL path very recently (within 500ms)
    const recentRequests = Array.from(processedRequests).filter(key => 
      key.startsWith(url) && 
      parseInt(key.split('-')[1]) > Date.now() - 500
    );
    
    // If we have a recent request for this URL, block the duplicate
    if (recentRequests.length > 0) {
      console.log('Blocking duplicate request to:', url);
      return NextResponse.json({ pageProps: {} });
    }
    
    // Add this request to our processed set
    processedRequests.add(uniqueKey);
    
    // Clean up old entries to prevent memory leaks
    setTimeout(() => {
      processedRequests.delete(uniqueKey);
    }, 1000);
  }
  
  return NextResponse.next();
}

// Configure middleware to run for all routes
export const config = {
  matcher: ['/:path*'],
};
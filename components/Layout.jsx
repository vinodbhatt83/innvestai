// components/Layout.jsx
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import AccountMenu from './AccountMenu';

const Layout = ({ children, title = 'InnVestAI' }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Check if a navigation item is active
  const isActive = (href) => {
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };
  return (
    <div className="min-h-screen bg-neutral-50">      <Head>
        <title>{title} | Hotel Investment Analytics</title>
        <meta name="description" content="AI-powered hotel investment analytics" />
        <link rel="icon" href="/theme-favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </Head>      {/* Navigation */}      <nav className="bg-white shadow-sm">
        <div className="max-w-full mx-auto px-1 sm:px-2 lg:px-3">
          <div className="flex justify-between h-20">
            <div className="flex items-center">              <Link href="/">
                <span className="flex-shrink-0 flex items-center cursor-pointer py-2">
                  <img src="/logo.svg" alt="InnVestAI Logo" className="h-14 w-auto" />
                </span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/deals">
                  <span className={`${isActive('/deals') ? 'border-secondary text-neutral-900' : 'border-transparent text-neutral-500 hover:border-secondary hover:text-neutral-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer`}>
                    Deals
                  </span>
                </Link>
                <Link href="/analytics/market-trends">
                  <span className={`${isActive('/analytics/market-trends') ? 'border-secondary text-neutral-900' : 'border-transparent text-neutral-500 hover:border-secondary hover:text-neutral-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer`}>
                    Market Trends
                  </span>
                </Link>
                <Link href="/analytics/performance">
                  <span className={`${isActive('/analytics/performance') ? 'border-secondary text-neutral-900' : 'border-transparent text-neutral-500 hover:border-secondary hover:text-neutral-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer`}>
                    Performance Analysis
                  </span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              {isAuthenticated && (
                <Link href="/deals/create">
                  <button
                    type="button"
                    className="sm:mr-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                  >
                    Create Deal
                  </button>
                </Link>
              )}
              
              {/* Account Menu Component */}
              <AccountMenu />
              
              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden ml-4">
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
                <Link href="/deals">
                  <span className={`${isActive('/deals') ? 'bg-secondary-light border-secondary text-neutral-900' : 'border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer`}>
                    Deals
                  </span>
                </Link>
                <Link href="/analytics/market-trends">
                  <span className={`${isActive('/analytics/market-trends') ? 'bg-secondary-light border-secondary text-neutral-900' : 'border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer`}>
                    Market Trends
                  </span>
                </Link>
                <Link href="/analytics/performance">
                  <span className={`${isActive('/analytics/performance') ? 'bg-secondary-light border-secondary text-neutral-900' : 'border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer`}>
                    Performance Analysis
                  </span>
                </Link>
                
                {isAuthenticated && (
                  <Link href="/admin/accounts">
                    <span className={`${isActive('/admin/accounts') ? 'bg-secondary-light border-secondary text-neutral-900' : 'border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer`}>
                      Account Management
                    </span>
                  </Link>
                )}

                {isAuthenticated && (
                  <Link href="/deals/create">
                    <span className="mt-3 block pl-3 pr-4 py-2 bg-secondary text-white rounded-md text-base font-medium cursor-pointer">
                      Create Deal
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>      {/* Main content */}
      <main className="max-w-full mx-auto px-1 py-4">
        {children}
      </main>      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-full mx-auto px-1 py-3">
          <div className="border-t border-neutral-200 pt-4">
            <p className="text-center text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} InnVestAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
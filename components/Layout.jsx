// components/Layout.jsx
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const Layout = ({ children, title = 'InnVestAI' }) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Head>
        <title>{title} | Hotel Investment Analytics</title>
        <meta name="description" content="AI-powered hotel investment analytics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <span className="flex-shrink-0 flex items-center cursor-pointer">
                  <div className="text-primary text-3xl font-bold">InnVest<span className="text-secondary">AI</span></div>
                </span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/deals">
                  <span className="border-transparent text-neutral-500 hover:border-secondary hover:text-neutral-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer">
                    Deals
                  </span>
                </Link>
                <Link href="/analytics/market-trends">
                  <span className="border-transparent text-neutral-500 hover:border-secondary hover:text-neutral-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer">
                    Market Trends
                  </span>
                </Link>
                <Link href="/analytics/performance">
                  <span className="border-transparent text-neutral-500 hover:border-secondary hover:text-neutral-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer">
                    Performance Analysis
                  </span>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              >
                Create Deal
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="border-t border-neutral-200 pt-6">
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
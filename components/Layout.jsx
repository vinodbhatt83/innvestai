// components/NewLayout.jsx
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router'; // Added for the Create Deal button
import { useAuth } from '../contexts/AuthContext'; // Keep useAuth for AccountMenu
import AccountMenu from './AccountMenu';
import LeftSidebar from './LeftSidebar';

const NewLayout = ({ children, title = 'InnVestAI' }) => {
  const router = useRouter(); // Initialize router
  const { isAuthenticated } // useAuth might be used by AccountMenu or children
    = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100"> {/* Main background for the content area */}
      <Head>
        <title>{title} | InnVestAI</title> {/* Simplified title */}
        <meta name="description" content="AI-powered investment analytics" />
        {/* Assuming theme-favicon.svg will be updated or is generic enough.
            If logo was #1CB4A9 (tealish) and is now #6B46C1 (purple), favicon might need update. */}
        <link rel="icon" href="/theme-favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </Head>

      <LeftSidebar />

      <div className="flex-1 flex flex-col">
        {/* Optional: Top bar for AccountMenu and perhaps page title or breadcrumbs */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div>
            {/* Placeholder for page titles or breadcrumbs if needed in the future */}
            {/* <h1 className="text-xl font-semibold text-gray-700">{title}</h1> */}
          </div>
          <div className="flex items-center">
            {isAuthenticated && (
                <button
                    onClick={() => router.push('/deals/create')} // Assuming router is available or passed if Create Deal button is here
                    type="button"
                    className="mr-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#6B46C1] hover:bg-[#55389E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B46C1]" // Using new Accent Purple
                >
                    Create Deal
                </button>
            )}
            <AccountMenu />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto"> {/* Ensure content scrolls if it overflows */}
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-full mx-auto">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} InnVestAI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NewLayout;

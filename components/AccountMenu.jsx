// components/AccountMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react'; // Added ChevronDown icon
import { useAuth } from '../contexts/AuthContext';

const AccountMenu = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/login">
          <span className="text-sm font-medium text-gray-700 hover:text-secondary cursor-pointer">Sign in</span>
        </Link>
        <Link href="/register">
          <span className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary cursor-pointer">
            Sign up
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center">
        {/* Account Management Link */}
        <Link href="/admin/accounts">
          <span className="hidden md:inline-block mr-6 text-sm font-medium text-secondary hover:text-secondary-light cursor-pointer">
            Account Management
          </span>
        </Link>

        {/* User Avatar Button */}
        <button
          className="flex items-center focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white">
            {user.firstName?.charAt(0) || ''}
            {user.lastName?.charAt(0) || ''}
          </div>
          <ChevronDown 
            className={`ml-1 h-5 w-5 text-gray-400 hover:text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="px-4 py-2 border-b border-neutral-200">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
          </div>
          <Link href="/profile">
            <span className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer">
              Your Profile
            </span>
          </Link>
          <Link href="/admin/accounts">
            <span className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer">
              Account Management
            </span>
          </Link>
          <button
            onClick={logout}
            className="w-full text-left block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
// components/UserMenu.js
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function UserMenu() {
    const { user, logout } = useAuth();

    if (!user) return null;

    const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

    return (
        <Menu as="div" className="ml-3 relative">
            <div>
                <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-white">
                        {userInitials}
                    </div>
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-neutral-900 truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    </div>

                    <Menu.Item>
                        {({ active }) => (
                            <Link href="/profile">
                                <a
                                    className={classNames(
                                        active ? 'bg-neutral-100' : '',
                                        'block px-4 py-2 text-sm text-neutral-700'
                                    )}
                                >
                                    Your Profile
                                </a>
                            </Link>
                        )}
                    </Menu.Item>

                    {user.isAdmin && (
                        <Menu.Item>
                            {({ active }) => (
                                <Link href="/admin/accounts">
                                    <a
                                        className={classNames(
                                            active ? 'bg-neutral-100' : '',
                                            'block px-4 py-2 text-sm text-neutral-700'
                                        )}
                                    >
                                        User Management
                                    </a>
                                </Link>
                            )}
                        </Menu.Item>
                    )}

                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={logout}
                                className={classNames(
                                    active ? 'bg-neutral-100' : '',
                                    'block w-full text-left px-4 py-2 text-sm text-neutral-700'
                                )}
                            >
                                Sign out
                            </button>
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
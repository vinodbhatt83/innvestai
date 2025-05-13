// pages/admin/accounts.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import { withAuthRedirect } from '../../middleware/auth';
import withAuthProtection from '../../utils/withAuthProtection';

const ManageAccounts = () => {
    const { user, hasPermission } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [roles, setRoles] = useState([]);
    const router = useRouter();

    // Check if user is admin
    useEffect(() => {
        if (user && !user.isAdmin) {
            router.push('/dashboard');
        }
    }, [user, router]);

    // Fetch users for the account
    useEffect(() => {
        if (user) {
            fetchUsers();
            fetchRoles();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/accounts/${user.accountId}/users`);

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles');

            if (!response.ok) {
                throw new Error('Failed to fetch roles');
            }

            const data = await response.json();
            setRoles(data.roles);
        } catch (err) {
            console.error('Error fetching roles:', err);
        }
    };

    // New user form state
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roleId: '',
        isAccountAdmin: false
    });

    // Form validation errors
    const [formErrors, setFormErrors] = useState({});

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewUser({
            ...newUser,
            [name]: type === 'checkbox' ? checked : value
        });

        // Clear validation error for this field
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null
            });
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!newUser.firstName.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!newUser.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }

        if (!newUser.email.trim()) {
            errors.email = 'Email is required';
        } else {
            // Simple email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newUser.email)) {
                errors.email = 'Invalid email format';
            }
        }

        if (!newUser.password) {
            errors.password = 'Password is required';
        } else if (newUser.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }

        if (!newUser.roleId) {
            errors.roleId = 'Role is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle user creation
    const handleCreateUser = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/accounts/${user.accountId}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user');
            }

            // Reset form and refresh user list
            setNewUser({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                roleId: '',
                isAccountAdmin: false
            });

            setShowAddUserForm(false);
            fetchUsers();
        } catch (err) {
            console.error('Error creating user:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Toggle user active status
    const toggleUserStatus = async (userId, isCurrentlyActive) => {
        try {
            const response = await fetch(`/api/accounts/${user.accountId}/users?userId=${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isActive: !isCurrentlyActive
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            // Refresh user list
            fetchUsers();
        } catch (err) {
            console.error('Error updating user:', err);
            setError(err.message);
        }
    };

    if (!user || !user.isAdmin) {
        return null; // Hide content from non-admins
    }

    return (
        <>
            <Head>
                <title>Manage Users | InnVestAI</title>
            </Head>

            <div className="min-h-screen bg-neutral-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="md:flex md:items-center md:justify-between mb-6">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
                                User Management
                            </h2>
                            <p className="mt-1 text-sm text-neutral-600">
                                Manage users for {user.accountName}
                            </p>
                        </div>
                        <div className="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
                            <button
                                type="button"
                                onClick={() => setShowAddUserForm(!showAddUserForm)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                            >
                                {showAddUserForm ? 'Cancel' : 'Add User'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add User Form */}
                    {showAddUserForm && (
                        <div className="bg-white shadow rounded-lg mb-6">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-neutral-900">
                                    Add New User
                                </h3>
                                <div className="mt-4">
                                    <form onSubmit={handleCreateUser}>
                                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                            <div className="sm:col-span-3">
                                                <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700">
                                                    First Name
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        id="firstName"
                                                        value={newUser.firstName}
                                                        onChange={handleInputChange}
                                                        className={`shadow-sm focus:ring-secondary focus:border-secondary block w-full sm:text-sm border-neutral-300 rounded-md ${formErrors.firstName ? 'border-red-300' : ''}`}
                                                    />
                                                    {formErrors.firstName && (
                                                        <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700">
                                                    Last Name
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        id="lastName"
                                                        value={newUser.lastName}
                                                        onChange={handleInputChange}
                                                        className={`shadow-sm focus:ring-secondary focus:border-secondary block w-full sm:text-sm border-neutral-300 rounded-md ${formErrors.lastName ? 'border-red-300' : ''}`}
                                                    />
                                                    {formErrors.lastName && (
                                                        <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="sm:col-span-4">
                                                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                                                    Email
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        id="email"
                                                        value={newUser.email}
                                                        onChange={handleInputChange}
                                                        className={`shadow-sm focus:ring-secondary focus:border-secondary block w-full sm:text-sm border-neutral-300 rounded-md ${formErrors.email ? 'border-red-300' : ''}`}
                                                    />
                                                    {formErrors.email && (
                                                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="sm:col-span-4">
                                                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                                                    Password
                                                </label>
                                                <div className="mt-1">
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        id="password"
                                                        value={newUser.password}
                                                        onChange={handleInputChange}
                                                        className={`shadow-sm focus:ring-secondary focus:border-secondary block w-full sm:text-sm border-neutral-300 rounded-md ${formErrors.password ? 'border-red-300' : ''}`}
                                                    />
                                                    {formErrors.password && (
                                                        <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-neutral-500">
                                                    Must be at least 8 characters
                                                </p>
                                            </div>

                                            <div className="sm:col-span-3">
                                                <label htmlFor="roleId" className="block text-sm font-medium text-neutral-700">
                                                    Role
                                                </label>
                                                <div className="mt-1">
                                                    <select
                                                        id="roleId"
                                                        name="roleId"
                                                        value={newUser.roleId}
                                                        onChange={handleInputChange}
                                                        className={`shadow-sm focus:ring-secondary focus:border-secondary block w-full sm:text-sm border-neutral-300 rounded-md ${formErrors.roleId ? 'border-red-300' : ''}`}
                                                    >
                                                        <option value="">Select a role</option>
                                                        {roles.map((role) => (
                                                            <option key={role.role_id} value={role.role_id}>
                                                                {role.role_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {formErrors.roleId && (
                                                        <p className="mt-1 text-sm text-red-600">{formErrors.roleId}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="sm:col-span-6">
                                                <div className="flex items-start">
                                                    <div className="flex items-center h-5">
                                                        <input
                                                            id="isAccountAdmin"
                                                            name="isAccountAdmin"
                                                            type="checkbox"
                                                            checked={newUser.isAccountAdmin}
                                                            onChange={handleInputChange}
                                                            className="focus:ring-secondary h-4 w-4 text-secondary border-neutral-300 rounded"
                                                        />
                                                    </div>
                                                    <div className="ml-3 text-sm">
                                                        <label htmlFor="isAccountAdmin" className="font-medium text-neutral-700">
                                                            Account Administrator
                                                        </label>
                                                        <p className="text-neutral-500">
                                                            Account administrators can manage users and account settings
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-secondary text-base font-medium text-white hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary sm:ml-3 sm:w-auto sm:text-sm"
                                            >
                                                {loading ? 'Processing...' : 'Add User'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddUserForm(false)}
                                                className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary sm:mt-0 sm:w-auto sm:text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users List */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-neutral-200">
                            {loading && users.length === 0 ? (
                                <li className="px-6 py-4 text-center text-sm text-neutral-500">
                                    Loading users...
                                </li>
                            ) : users.length === 0 ? (
                                <li className="px-6 py-4 text-center text-sm text-neutral-500">
                                    No users found
                                </li>
                            ) : (
                                users.map((user) => (
                                    <li key={user.user_id}>
                                        <div className="px-4 py-4 flex items-center sm:px-6">
                                            <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                                <div>
                                                    <div className="flex text-sm">
                                                        <p className="font-medium text-secondary truncate">
                                                            {user.first_name} {user.last_name}
                                                        </p>
                                                        {user.is_account_admin && (
                                                            <p className="ml-1 flex-shrink-0 font-normal text-neutral-500">
                                                                (Admin)
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 flex">
                                                        <div className="flex items-center text-sm text-neutral-500">
                                                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                            </svg>
                                                            <span className="truncate">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                                                    <div className="flex space-x-3">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {user.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {user.role_name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-5 flex-shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                                                    className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${user.is_active
                                                            ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                                            : 'text-green-700 bg-green-100 hover:bg-green-200'
                                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary`}
                                                    disabled={loading || user.user_id === user.id} // Prevent deactivating yourself
                                                >
                                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default withAuthProtection(ManageAccounts, { adminOnly: true });
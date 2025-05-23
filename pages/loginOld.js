// pages/login.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [formError, setFormError] = useState('');

    const { login, isAuthenticated, loading, error } = useAuth();
    const router = useRouter();
    const { returnUrl } = router.query;

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push(returnUrl || '/'); // Redirect to root instead of /dashboard
        }
    }, [isAuthenticated, router, returnUrl]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setFormError('Email and password are required');
            return;
        }

        // Clear previous errors
        setFormError('');

        const result = await login(email, password);

        if (result.success) {
            router.push(returnUrl || '/'); // Redirect to root instead of /dashboard
        } else {
            setFormError(result.error || 'Login failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
                    <div className="flex justify-center">
                        <svg className="animate-spin h-10 w-10 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Login | InnVestAI</title>
            </Head>

            <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">                    {/* Logo and Heading */}
                    <div>
                        <div className="flex justify-center">
                            <img src="/logo.svg" alt="InnVestAI Logo" className="h-16" />
                        </div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-center text-sm text-neutral-600">
                            Or{' '}
                            <Link href="/register">
                                <span className="font-medium text-secondary hover:text-secondary-light cursor-pointer">
                                    create a new account
                                </span>
                            </Link>
                        </p>
                    </div>

                    {/* Form */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {/* Error Messages */}
                        {(formError || error) && (
                            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium">{formError || error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-t-md focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-b-md focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-secondary focus:ring-secondary border-neutral-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/forgot-password">
                                    <span className="font-medium text-secondary hover:text-secondary-light cursor-pointer">
                                        Forgot your password?
                                    </span>
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;
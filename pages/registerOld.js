// pages/register.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    // Account information
    const [accountName, setAccountName] = useState('');
    const [accountDomain, setAccountDomain] = useState('');

    // User information
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Form state
    const [step, setStep] = useState(1);
    const [formError, setFormError] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const { register, isAuthenticated, loading, error } = useAuth();
    const router = useRouter();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    // Handle next step
    const handleNextStep = (e) => {
        e.preventDefault();

        if (!accountName) {
            setFormError('Company name is required');
            return;
        }

        setFormError('');
        setStep(2);
    };

    // Handle previous step
    const handlePrevStep = () => {
        setStep(1);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            setFormError('All fields are required');
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }

        // Validate password strength (at least 8 characters)
        if (password.length < 8) {
            setFormError('Password must be at least 8 characters long');
            return;
        }

        // Validate terms agreement
        if (!agreedToTerms) {
            setFormError('You must agree to the terms and conditions');
            return;
        }

        // Clear previous errors
        setFormError('');

        // Prepare data
        const accountData = {
            accountName,
            accountDomain
        };

        const userData = {
            firstName,
            lastName,
            email,
            password
        };

        // Register account and admin user
        const result = await register(accountData, userData);

        if (result.success) {
            // Redirect to success page
            router.push('/registration-success');
        } else {
            setFormError(result.error || 'Registration failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
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
                <title>Create Account | InnVestAI</title>
            </Head>

            <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">                    {/* Logo and Heading */}
                    <div>
                        <div className="flex justify-center">
                            <img src="/logo.svg" alt="InnVestAI Logo" className="h-16" />
                        </div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
                            Create your account
                        </h2>
                        <p className="mt-2 text-center text-sm text-neutral-600">
                            Or{' '}
                            <Link href="/login">
                                <span className="font-medium text-secondary hover:text-secondary-light cursor-pointer">
                                    sign in to your existing account
                                </span>
                            </Link>
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-secondary text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                                1
                            </div>
                            <span className="ml-2 text-sm font-medium text-neutral-900">Organization</span>
                        </div>
                        <div className="w-16 h-1 bg-neutral-200">
                            <div className={`h-full ${step >= 2 ? 'bg-secondary' : 'bg-neutral-200'}`}></div>
                        </div>
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-secondary text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                                2
                            </div>
                            <span className="ml-2 text-sm font-medium text-neutral-900">Admin User</span>
                        </div>
                    </div>

                    {/* Form */}
                    {step === 1 ? (
                        <form className="mt-8 space-y-6" onSubmit={handleNextStep}>
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

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="account-name" className="block text-sm font-medium text-neutral-700">
                                        Company/Organization Name *
                                    </label>
                                    <input
                                        id="account-name"
                                        name="accountName"
                                        type="text"
                                        required
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        className="mt-1 appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                                        placeholder="Your organization name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="account-domain" className="block text-sm font-medium text-neutral-700">
                                        Company Domain (Optional)
                                    </label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-500 sm:text-sm">
                                            https://
                                        </span>
                                        <input
                                            type="text"
                                            name="accountDomain"
                                            id="account-domain"
                                            value={accountDomain}
                                            onChange={(e) => setAccountDomain(e.target.value)}
                                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-secondary focus:border-secondary sm:text-sm border-neutral-300"
                                            placeholder="yourcompany.com"
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-neutral-500">
                                        This is used to identify your organization and for email verification.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                                >
                                    Continue
                                </button>
                            </div>
                        </form>
                    ) : (
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

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="first-name" className="block text-sm font-medium text-neutral-700">
                                            First Name *
                                        </label>
                                        <input
                                            id="first-name"
                                            name="firstName"
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="mt-1 appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="last-name" className="block text-sm font-medium text-neutral-700">
                                            Last Name *
                                        </label>
                                        <input
                                            id="last-name"
                                            name="lastName"
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="mt-1 appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                                        Email Address *
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                                        Password *
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                                    />
                                    <p className="mt-1 text-sm text-neutral-500">
                                        Must be at least 8 characters long
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700">
                                        Confirm Password *
                                    </label>
                                    <input
                                        id="confirm-password"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-1 appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm"
                                    />
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            checked={agreedToTerms}
                                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            className="h-4 w-4 text-secondary focus:ring-secondary border-neutral-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="terms" className="font-medium text-neutral-700">
                                            I agree to the{' '}
                                            <Link href="/terms">
                                                <span className="text-secondary hover:text-secondary-light cursor-pointer">
                                                    Terms and Conditions
                                                </span>
                                            </Link>
                                            {' '}and{' '}
                                            <Link href="/privacy">
                                                <span className="text-secondary hover:text-secondary-light cursor-pointer">
                                                    Privacy Policy
                                                </span>
                                            </Link>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="group relative w-1/2 flex justify-center py-2 px-4 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="group relative w-1/2 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                                >
                                    Create Account
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default Register;
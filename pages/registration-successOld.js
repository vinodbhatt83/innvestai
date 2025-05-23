// pages/registration-success.js
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const RegistrationSuccess = () => {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    return (
        <>
            <Head>
                <title>Registration Successful | InnVestAI</title>
            </Head>

            <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
                    <div>
                        <div className="flex justify-center">
                            <svg className="h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Registration Successful!
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Your account has been created successfully.
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="mt-4 text-gray-600">
                            You can now sign in to access your account.
                        </p>
                        <div className="mt-8">
                            <Link href="/login">
                                <button className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                                    Sign In
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegistrationSuccess;
// src/app/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';

const LoginPage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const signupSuccess = searchParams.get('signup_success');

    useEffect(() => {
        // Check if the user is already logged in
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (token) {
            // If token exists, redirect to the questionnaire or dashboard
            router.push('/questionnaire'); // Or '/'
        }
    }, [router]); // Depend on router
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (typeof window !== 'undefined' && data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                if (data.user?.name) {
                    localStorage.setItem('userName', data.user.name);
                }
                router.push('/questionnaire'); // Update this redirect later
            } else {
                setError(data.error || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            {/* Wrapper to provide background and centering for the card */}
            <div className="min-h-[calc(100vh-4rem-88px)] w-full bg-gray-50 flex items-center justify-center p-4 sm:p-6"> {/* Adjust h-screen calc if needed */}
                {/* The actual card */}
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md"> {/* Card styles remain the same */}
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                    {signupSuccess === 'true' && (
                        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md text-sm text-center">
                            Account created successfully! You can now log in.
                        </div>
                    )}
                    {error && <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <InputField
                            label="Email address"
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Password"
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <Button type="submit" isLoading={isLoading}>
                            Sign In
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-medium text-teal-600 hover:text-teal-500">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default LoginPage;
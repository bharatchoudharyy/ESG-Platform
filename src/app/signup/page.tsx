// src/app/signup/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';

const SignupPage: React.FC = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return; // Stop submission
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ // --- 4. Send only necessary data (exclude confirmPassword) ---
                    name: formData.name,
                    email: formData.email,
                    password: formData.password, // Send the password
                    // confirmPassword is NOT sent to the API
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account created successfully! You can now log in.');
                router.push('/login');
            } else {
                setError(data.error || 'Signup failed. Please try again.');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('An unexpected error occurred. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            {/* Wrapper to provide background and centering for the card */}
            <div className="min-h-[calc(100vh-4rem-88px)] w-full bg-gray-50 flex items-center justify-center p-4 sm:p-6"> {/* Adjust h-screen calc if needed based on exact header/footer height */}
                {/* The actual card */}
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md"> {/* Card styles remain the same */}
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
                    {error && <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <InputField
                            label="Full Name"
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
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
                        <InputField
                            label="Confirm Password"
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <Button type="submit" isLoading={isLoading}>
                            Sign Up
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-teal-600 hover:text-teal-500">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SignupPage;
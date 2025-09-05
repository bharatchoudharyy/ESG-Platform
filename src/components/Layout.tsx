// src/components/Layout.tsx
'use client';
import React, { ReactNode, useState, useEffect, } from 'react'; // Add useState, useEffect
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Function to check login status
    const checkLoginStatus = () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            setIsLoggedIn(!!token);
        }
    };

    // Check login status on mount
    useEffect(() => {
        checkLoginStatus();

        // Optional: Add an event listener to listen for storage changes
        // This helps if the token is updated in another tab/window
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'authToken') {
                checkLoginStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
        }
        setIsLoggedIn(false);
        // Redirect to the login page or homepage
        router.push('/login'); // Or router.push('/') if you want to go to the homepage
        // Calling checkLoginStatus() here might also help ensure state is consistent,
        // although the redirect often triggers a full page load/re-render.
        // checkLoginStatus();
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm z-10 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Link href="/" className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-teal-600">Oren ESG</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isLoggedIn ? (
                                <>
                                    <Link href="/questionnaire" className="text-gray-700 hover:text-teal-600 text-sm font-medium">
                                        Questionnaire
                                    </Link>
                                    <Link href="/summary" className="text-gray-700 hover:text-teal-600 text-sm font-medium">
                                        Summary
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-700 hover:text-teal-600 text-sm font-medium"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-gray-700 hover:text-teal-600 text-sm font-medium">
                                        Login
                                    </Link>
                                    <Link href="/signup" className="text-gray-700 hover:text-teal-600 text-sm font-medium">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-grow w-full bg-gray-50">
                {children}
            </main>
            <footer className="bg-gray-800 text-white w-full">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} Oren ESG Tracker. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
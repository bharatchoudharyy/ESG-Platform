// src/components/Layout.tsx
'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);

    const checkLoginStatus = () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            const name = localStorage.getItem('userName');
            setIsLoggedIn(!!token);
            setUserName(name);
        }
    };

    useEffect(() => {
        checkLoginStatus();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'authToken' || e.key === 'userName') {
                checkLoginStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userName');
        }
        setIsLoggedIn(false);
        setUserName(null);
        if (pathname == '/') {
            window.location.href = '/';
        } else {
            router.push('/');
        }
    };

    const userFirstName = userName ? userName.split(' ')[0] : '';

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="bg-white shadow-sm z-50 w-full sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left: Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center">
                                <span className="text-xl font-bold text-teal-700 tracking-tight">Oren ESG Platform</span>
                            </Link>
                        </div>

                        {/* Center: Nav links */}
                        {isLoggedIn && (
                            <div className="flex-1 flex justify-center space-x-6">
                                <Link
                                    href="/questionnaire"
                                    className={`text-base font-medium text-gray-700 hover:text-teal-700 transition-colors duration-200 ${pathname === '/questionnaire'
                                        ? 'relative after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-teal-500'
                                        : ''
                                        }`}
                                >
                                    Questionnaire
                                </Link>
                                <Link
                                    href="/summary"
                                    className={`text-base font-medium text-gray-700 hover:text-teal-700 transition-colors duration-200 ${pathname === '/summary'
                                        ? 'relative after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-teal-500'
                                        : ''
                                        }`}
                                >
                                    Summary
                                </Link>
                            </div>
                        )}

                        {/* Right: User / Auth */}
                        <div className="flex items-center space-x-3">
                            {isLoggedIn ? (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-base font-medium text-gray-700">{userFirstName}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-base font-medium text-gray-800 hover:text-red-500 transition-colors duration-200 cursor-pointer border border-gray-300 hover:border-red-500 px-3 py-1.5 rounded-md"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-3 py-1.5 text-base font-medium text-gray-700 hover:text-teal-700 transition-colors duration-200"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-3 py-1.5 text-base font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors duration-200"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow w-full">{children}</main>

            <footer className="bg-gray-800 text-white w-full mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} Oren ESG Platform. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;

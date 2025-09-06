// src/app/questionnaire/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ESGForm from '@/components/esg/ESGForm';
import { ESGFormData } from '@/types/esg';

const QuestionnairePage: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [initialFetchedData, setInitialFetchedData] = useState<ESGFormData | null>(null);

    // --- 1. State for managing years and active year ---
    const [years, setYears] = useState<number[]>([]);
    const [activeYear, setActiveYear] = useState<number | null>(null);
    const [isAddingYear, setIsAddingYear] = useState(false); // State for modal
    const [newYearInput, setNewYearInput] = useState<string>(''); // State for year input
    const [newYearError, setNewYearError] = useState<string | null>(null); // State for year input error

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const response = await fetch('/api/responses', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setInitialFetchedData(data.responses || {});
                    // --- 2. Initialize years and active year from fetched data ---
                    const fetchedYears = Object.keys(data.responses || {})
                        .map(Number)
                        .filter(y => !isNaN(y))
                        .sort((a, b) => b - a); // Sort descending
                    setYears(fetchedYears);
                    if (fetchedYears.length > 0) {
                        setActiveYear(fetchedYears[0]); // Set first (newest) as active
                    }
                } else {
                    console.error('Failed to fetch initial ', response.status);
                    setInitialFetchedData({});
                }
            } catch (err) {
                console.error('Network error fetching initial ', err);
                setInitialFetchedData({});
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthAndFetchData();
    }, [router]);

    // --- 3. Handlers for year management ---
    const handleStartAddYear = () => {
        setIsAddingYear(true);
        setNewYearInput('');
        setNewYearError(null);
    };

    const handleConfirmAddYear = () => {
        const year = parseInt(newYearInput, 10);
        if (isNaN(year) || year < 1900 || year > 2024) {
            setNewYearError('Please enter a year between 1900 - 2024.');
            return;
        }
        if (years.includes(year)) {
            setNewYearError(`Financial Year ${year} is already added.`);
            return;
        }
        const newYears = [...years, year].sort((a, b) => b - a);
        setYears(newYears);
        setActiveYear(year); // Set the newly added year as active
        setIsAddingYear(false);
        setNewYearInput('');
        setNewYearError(null);
        // Initialize data for the new year in the form data
        setInitialFetchedData(prev => ({ ...prev, [year]: {} }));
    };

    const handleCancelAddYear = () => {
        setIsAddingYear(false);
        setNewYearInput('');
        setNewYearError(null);
    };

    const handleYearTabClick = (year: number) => {
        setActiveYear(year);
    };

    const handleRemoveYear = async (yearToRemove: number) => {
        if (years.length <= 1) {
            alert("You must have at least one financial year.");
            return;
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!token) {
            setSubmitError('Authentication required to remove data.');
            return;
        }

        try {
            const response = await fetch(`/api/responses/${yearToRemove}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Failed to delete year ${yearToRemove}:`, errorData.error);
                // Optionally alert user
            }
        } catch (err: any) {
            console.error(`Network error deleting year ${yearToRemove}:`, err);
            // Optionally alert user
        }

        // Update UI state
        const newYears = years.filter(y => y !== yearToRemove);
        setYears(newYears);

        // Update active year if the removed year was active
        if (activeYear === yearToRemove) {
            setActiveYear(newYears.length > 0 ? newYears[0] : null);
        }

        // Remove data from local state
        setInitialFetchedData(prev => {
            if (!prev) return prev;
            const newData = { ...prev };
            delete newData[yearToRemove];
            return newData;
        });
    };

    const handleSubmit = async (data: ESGFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found. Please log in again.');
            }

            // Prepare data for the active year only
            const activeYearData = activeYear !== null ? { [activeYear]: data[activeYear] } : {};

            const response = await fetch('/api/responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ responses: activeYearData }),
            });

            if (response.ok) {
                setSubmitSuccess(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                try {
                    const refreshResponse = await fetch('/api/responses', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (refreshResponse.ok) {
                        const refreshedData = await refreshResponse.json();
                        setInitialFetchedData(refreshedData.responses || {});
                    }
                } catch (refreshErr) {
                    console.error('Error refreshing data after save:', refreshErr);
                }
                setTimeout(() => setSubmitSuccess(false), 3000);
            } else {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                setSubmitError(errorData.error || 'Failed to save responses. Please try again.');
            }
        } catch (err: any) {
            console.error('Submission error:', err);
            setSubmitError('An unexpected error occurred. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center h-[50vh]">
                    <p className="text-lg text-gray-600">Loading...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow rounded-lg p-6">
                    {/* --- 4. Header Section with Title, Add Button, and Tabs --- */}
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-2xl font-bold text-gray-900">ESG Questionnaire</h1>
                            <button
                                type="button"
                                onClick={handleStartAddYear}
                                className="px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm cursor-pointer"
                            >
                                Add Financial Year
                            </button>
                        </div>

                        {/* --- 5. Year Tabs --- */}
                        {years.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
                                {years.map((year) => (
                                    <button
                                        key={year}
                                        type="button"
                                        onClick={() => handleYearTabClick(year)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none ${activeYear === year
                                            ? 'bg-teal-100 text-gray-700 border border-gray-300 -mb-px z-10 relative'
                                            : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                                            }`}
                                    >
                                        FY {year}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {submitSuccess && (
                        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md text-sm flex flex-col sm:flex-row sm:items-center justify-between items-start">
                            <span className="font-medium">Responses saved successfully!</span>
                            <button
                                onClick={() => router.push('/summary')}
                                className="mt-3 sm:mt-0 px-4 py-2 bg-white text-teal-600 text-sm font-semibold rounded-md hover:bg-gray-100 focus:outline-none border border-black/50 shadow-sm whitespace-nowrap"
                            >
                                View Summary
                            </button>
                        </div>
                    )}
                    {submitError && (
                        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-sm whitespace-pre-line">
                            Error: {submitError}
                        </div>
                    )}

                    {/* --- 6. Render ESGForm for the active year --- */}
                    {activeYear !== null ? (
                        <ESGForm
                            key={activeYear} // Ensure form re-renders when year changes
                            initialData={{ [activeYear]: initialFetchedData?.[activeYear] || {} }}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            setSubmitError={setSubmitError}
                            activeYear={activeYear} // Pass active year
                            onRemoveYear={handleRemoveYear} // Pass remove handler
                        />
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-600 mb-6">No financial years added yet.</p>
                            <button
                                type="button"
                                onClick={handleStartAddYear}
                                className="px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm"
                            >
                                Add Financial Year's ESG Data
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- 7. Modal for Adding New Year --- */}
            {isAddingYear && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
                    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm" onClick={handleCancelAddYear} aria-hidden="true"></div>
                    <div
                        className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-10 border border-black/30"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Financial Year</h3>
                        <div className="mb-4">
                            <label htmlFor="newYearInput" className="block text-sm font-medium text-gray-700 mb-1">
                                Enter Financial Year (e.g., 2023)
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                id="newYearInput"
                                value={newYearInput}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setNewYearInput(value);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleConfirmAddYear();
                                    }
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                                placeholder="YYYY"
                                aria-describedby="year-error"
                            />
                            {newYearError && (
                                <p id="year-error" className="mt-1 text-sm text-red-600">
                                    {newYearError}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCancelAddYear}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAddYear}
                                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                                Add Year
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default QuestionnairePage;
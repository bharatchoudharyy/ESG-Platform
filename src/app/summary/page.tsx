// src/app/summary/page.tsx
'use client'; // Essential for client-side interactivity

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ESGFormData } from '@/types/esg';
import CarbonIntensityChart from '@/components/charts/CarbonIntensityChart'; // Example chart component

const SummaryPage: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true); // State for initial data loading
    const [esgData, setEsgData] = useState<ESGFormData | null>(null); // State to store fetched ESG data
    const [error, setError] = useState<string | null>(null); // State for fetching errors

    // Check authentication and fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            // 1. Check for authentication token
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // 2. Fetch data from the backend API endpoint
                const response = await fetch('/api/responses', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    // Assuming the API returns { responses: ESGFormData }
                    setEsgData(data.responses || {});
                } else {
                    // Handle API errors (e.g., 401, 500)
                    console.error('Failed to fetch summary data:', response.status);
                    setError('Failed to load ESG data. Please try again later.');
                    // Optionally, redirect on 401
                    if (response.status === 401) {
                        router.push('/login');
                    }
                }
            } catch (err) {
                // Handle network errors
                console.error('Network error fetching summary data:', err);
                setError('An unexpected error occurred. Please check your connection.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [router]); // Re-run if router changes (unlikely)

    // Show a simple loading state while checking auth and fetching data
    if (isLoading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center h-[50vh]">
                    <p className="text-lg text-gray-600">Loading summary data...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">ESG Summary Dashboard</h1>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-sm">
                            Error: {error}
                        </div>
                    )}

                    {/* Conditional rendering based on whether data was fetched */}
                    {esgData && Object.keys(esgData).length > 0 ? (
                        <div>
                            <p className="text-gray-600 mb-4">Overview of your ESG performance across financial years.</p>
                            {/* Placeholder for charts and data display */}
                            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                                <CarbonIntensityChart data={esgData} />
                            </div>
                            {/* Placeholder for other charts or data tables */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 mb-8">
                                Additional charts (Diversity Ratio, Renewable Ratio, etc.) and data tables will be displayed here.
                            </div>
                            {/* Placeholder for download button */}
                            <div className="mt-8 flex justify-center">
                                <button className="px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm">
                                    Download Summary (PDF)
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-600 mb-4">No ESG data found.</p>
                            <p className="text-gray-500 text-sm">Please fill out the ESG questionnaire to see your summary.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => router.push('/questionnaire')}
                                    className="px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm"
                                >
                                    Go to Questionnaire
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default SummaryPage;
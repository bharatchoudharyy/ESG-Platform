// src/app/questionnaire/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ESGForm from '@/components/esg/ESGForm';
import { ESGFormData } from '@/types/esg';
import { calculateESGMetrics } from '@/utils/esgCalculations';

const QuestionnairePage: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true); // For initial auth/data load
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [initialFetchedData, setInitialFetchedData] = useState<ESGFormData | null>(null); // State for fetched data

    // Check authentication and fetch initial data
    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            if (!token) {
                router.push('/login');
                return;
            }

            // If authenticated, fetch existing data
            try {
                const response = await fetch('/api/responses', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    // Assuming the API returns { responses: ESGFormData }
                    setInitialFetchedData(data.responses || {});
                } else {
                    // Handle fetch errors (e.g., 401, 500)
                    console.error('Failed to fetch initial data:', response.status);
                    // Optionally, you might still want to show the form, just without pre-filled data
                    // Or show an error state. For now, we'll proceed with an empty form.
                    setInitialFetchedData({}); // Initialize with empty data on fetch error
                }
            } catch (err) {
                console.error('Network error fetching initial data:', err);
                setInitialFetchedData({}); // Initialize with empty data on network error
            } finally {
                setIsLoading(false); // Stop initial loading state
            }
        };

        checkAuthAndFetchData();
    }, [router]); // Depend on router

    const handleSubmit = async (data: ESGFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Authentication token not found. Please log in again.');
            }

            const response = await fetch('/api/responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ responses: data }),
            });

            if (response.ok) {
                setSubmitSuccess(true);
                // Important: After saving, re-fetch the data to update the initial state
                // This ensures if the user refreshes, they see the latest saved data
                // Fetch logic is similar to the one in the useEffect above
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
                    // The save was successful, but refreshing failed. User can manually refresh.
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
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">ESG Questionnaire</h1>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Please fill in the Environmental, Social, and Governance metrics for your company for the selected financial year(s).
                    </p>
                    {submitSuccess && (
                        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md text-sm">
                            Responses saved successfully!
                        </div>
                    )}
                    {submitError && (
                        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-sm whitespace-pre-line"> {/* Added whitespace-pre-line for error formatting */}
                            Error: {submitError}
                        </div>
                    )}
                    {/* Pass the fetched initial data to the ESGForm */}
                    <ESGForm
                        initialData={initialFetchedData || {}} // Pass fetched data or empty object
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        setSubmitError={setSubmitError}
                    // Pass setSubmitError if ESGForm needs to set it directly
                    // setSubmitError={setSubmitError} // Uncomment if needed inside ESGForm
                    />
                </div>
            </div>
        </Layout>
    );
};

export default QuestionnairePage;
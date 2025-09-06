// src/app/summary/page.tsx
'use client'; // Essential for client-side interactivity

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ESGFormData, ESGData } from '@/types/esg';
import CarbonIntensityChart from '@/components/charts/CarbonIntensityChart'; // Example chart component
import DiversityRatioChart from '@/components/charts/DiversityRatioChart';
import RenewableElectricityRatioChart from '@/components/charts/RenewableElectricityRatioChart';
import CommunitySpendRatioChart from '@/components/charts/CommunitySpendRatioChart';

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

    const formatYesNo = (value: boolean | null | undefined): string => {
        if (value === true) return 'Yes';
        if (value === false) return 'No';
        return '-';
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow rounded-lg p-6">
                    {/* Header Section with Title and Download Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">ESG Summary Dashboard</h1>
                        {/* Download Button - Positioned Top Right */}
                        <button
                            className="mt-2 sm:mt-0 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm"
                        // onClick handler will be added later for PDF download
                        >
                            Download Summary (PDF)
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-sm">
                            Error: {error}
                        </div>
                    )}

                    {esgData && Object.keys(esgData).length > 0 ? (
                        <div>
                            <p className="text-gray-600 mb-6">Overview of your ESG performance across financial years.</p>

                            {/* --- Charts Section --- */}
                            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Calculated Metrics Trends</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <CarbonIntensityChart data={esgData} />
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <DiversityRatioChart data={esgData} />
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <RenewableElectricityRatioChart data={esgData} />
                                </div>
                                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <CommunitySpendRatioChart data={esgData} />
                                </div>
                            </div>
                            {/* --- End Charts Section --- */}

                            {/* --- Raw Data Section --- */}
                            <h2 className="text-xl font-semibold text-gray-800 mt-10 mb-4">Questionnaire Data</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Year</th>
                                            {/* Environmental */}
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Electricity (kWh)</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Renewable Electricity (kWh)</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Fuel (liters)</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Carbon Emissions (T CO2e)</th>
                                            {/* Social */}
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Employees</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Female Employees</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Avg. Training Hours</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Community Investment (INR)</th>
                                            {/* Governance */}
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">% Independent Board Members</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Data Privacy Policy</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Revenue (INR)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.keys(esgData)
                                            .map(Number)
                                            .sort((a, b) => b - a) // Sort years descending
                                            .map((year) => {
                                                const data: ESGData = esgData[year] || {};
                                                return (
                                                    <tr key={year}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{year}</td>
                                                        {/* Environmental */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{data.renewableElectricityConsumption?.toString() ?? '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{data.totalFuelConsumption?.toString() ?? '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{data.totalElectricityConsumption?.toString() ?? '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{data.carbonEmissions?.toString() ?? '-'}</td>
                                                        {/* Social */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{data.totalEmployees?.toString() ?? '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{data.femaleEmployees?.toString() ?? '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{data.averageTrainingHours?.toString() ?? '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{data.communityInvestment?.toString() ?? '-'}</td>
                                                        {/* Governance */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{data.independentBoardMembers?.toString() ?? '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatYesNo(data.hasDataPrivacyPolicy)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{data.totalRevenue?.toString() ?? '-'}</td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                            {/* --- End Raw Data Section --- */}

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
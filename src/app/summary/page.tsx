// src/app/summary/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ESGFormData } from '@/types/esg';
import CarbonIntensityChart from '@/components/charts/CarbonIntensityChart';
import DiversityRatioChart from '@/components/charts/DiversityRatioChart';
import RenewableElectricityRatioChart from '@/components/charts/RenewableElectricityRatioChart';
import CommunitySpendRatioChart from '@/components/charts/CommunitySpendRatioChart';
import DataCard from '@/components/ui/DataCard';
import { generatePDF } from '@/utils/pdfGenerator'; // Import the new function

const SummaryPage: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [esgData, setEsgData] = useState<ESGFormData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeYearTab, setActiveYearTab] = useState<number | null>(null);

    const getSortedYears = useCallback(() => {
        if (!esgData) return [];
        return Object.keys(esgData)
            .map(Number)
            .filter(year => !isNaN(year))
            .sort((a, b) => b - a);
    }, [esgData]);

    useEffect(() => {
        const fetchData = async () => {
            // ... (rest of the fetchData function remains the same)
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
                    setEsgData(data.responses || {});
                } else {
                    console.error('Failed to fetch summary data:', response.status);
                    setError('Failed to load ESG data. Please try again later.');
                    if (response.status === 401) {
                        router.push('/login');
                    }
                }
            } catch (err) {
                console.error('Network error fetching summary ', err);
                setError('An unexpected error occurred. Please check your connection.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [router]);

    useEffect(() => {
        if (esgData && Object.keys(esgData).length > 0 && activeYearTab === null) {
            const sortedYears = getSortedYears();
            if (sortedYears.length > 0) {
                setActiveYearTab(sortedYears[0]);
            }
        } else if (esgData && activeYearTab !== null && !esgData[activeYearTab]) {
            const sortedYears = getSortedYears();
            if (sortedYears.length > 0) {
                setActiveYearTab(sortedYears[0]);
            } else {
                setActiveYearTab(null);
            }
        }
    }, [esgData, activeYearTab, getSortedYears]);

    // Add this handler for the download button
    const handleDownloadPDF = () => {
        if (esgData) {
            generatePDF(esgData);
        }
    };

    const formatYesNo = (value: boolean | null | undefined): string => {
        if (value === true) return 'Yes';
        if (value === false) return 'No';
        return '-';
    };

    if (isLoading) {
        // ... (loading state remains the same)
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">ESG Summary Dashboard</h1>
                        <button
                            className="mt-2 sm:mt-0 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm cursor-pointer"
                            onClick={handleDownloadPDF} // Add the onClick handler
                        >
                            Download Summary (PDF)
                        </button>
                    </div>

                    {/* ... (rest of the component remains the same) ... */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-sm">
                            Error: {error}
                        </div>
                    )}

                    {esgData && Object.keys(esgData).length > 0 ? (
                        <div>
                            <p className="text-gray-600 mb-6">Overview of your ESG performance across financial years.</p>
                            <hr className="border-gray-300" />

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
                            <hr className="border-gray-300" />
                            {/* --- PARTIAL UPDATE: Tabbed Questionnaire Data Section --- */}
                            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Entered Questionnaire Data</h2>
                            {esgData && Object.keys(esgData).length > 0 ? (
                                <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                                    {/* --- Year Tabs --- */}
                                    <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
                                        {getSortedYears().map((year) => (
                                            <button
                                                key={year}
                                                type="button"
                                                onClick={() => setActiveYearTab(year)}
                                                className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors ${activeYearTab === year
                                                    ? 'bg-teal-100 text-gray-700 border border-gray-300 -mb-px z-10 relative'
                                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
                                                    }`}
                                            >
                                                FY {year}
                                            </button>
                                        ))}
                                    </div>

                                    {/* --- PARTIAL UPDATE: Questionnaire Data Section with Consistent Colored-Border Cards --- */}
                                    {activeYearTab !== null && esgData[activeYearTab] ? (
                                        (() => {
                                            const ESGData = esgData[activeYearTab] || {};
                                            return (
                                                <div className="mt-4">
                                                    {/* --- Environmental Metrics Section --- */}
                                                    <div className="mb-8">
                                                        <h3 className="text-lg font-semibold text-teal-700 mb-4 pb-2 border-b border-teal-200">Environmental Metrics</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                                            {/* --- Pass categoryColor for Environmental --- */}
                                                            <DataCard
                                                                label="Total Electricity Consumption"
                                                                value={ESGData.totalElectricityConsumption?.toString() ?? '-'}
                                                                unit="kWh"
                                                                categoryColor="border-l-green-500" // Green for Environmental
                                                            />
                                                            <DataCard
                                                                label="Renewable Electricity Consumption"
                                                                value={ESGData.renewableElectricityConsumption?.toString() ?? '-'}
                                                                unit="kWh"
                                                                categoryColor="border-l-green-500"
                                                            />
                                                            <DataCard
                                                                label="Total Fuel Consumption"
                                                                value={ESGData.totalFuelConsumption?.toString() ?? '-'}
                                                                unit="liters"
                                                                categoryColor="border-l-green-500"
                                                            />
                                                            <DataCard
                                                                label="Carbon Emissions"
                                                                value={ESGData.carbonEmissions?.toString() ?? '-'}
                                                                unit="T CO2e"
                                                                categoryColor="border-l-green-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* --- Social Metrics Section --- */}
                                                    <div className="mb-8">
                                                        <h3 className="text-lg font-semibold text-teal-700 mb-4 pb-2 border-b border-teal-200">Social Metrics</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                                            {/* --- Pass categoryColor for Social --- */}
                                                            <DataCard
                                                                label="Total Number of Employees"
                                                                value={ESGData.totalEmployees?.toString() ?? '-'}
                                                                categoryColor="border-l-blue-500" // Blue for Social
                                                            />
                                                            <DataCard
                                                                label="Number of Female Employees"
                                                                value={ESGData.femaleEmployees?.toString() ?? '-'}
                                                                categoryColor="border-l-blue-500"
                                                            />
                                                            <DataCard
                                                                label="Avg. Training Hours per Employee"
                                                                value={ESGData.averageTrainingHours?.toString() ?? '-'}
                                                                unit="hrs/yr"
                                                                categoryColor="border-l-blue-500"
                                                            />
                                                            <DataCard
                                                                label="Community Investment Spend"
                                                                value={ESGData.communityInvestment?.toString() ?? '-'}
                                                                unit="INR"
                                                                categoryColor="border-l-blue-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* --- Governance Metrics Section --- */}
                                                    <div className="mb-8">
                                                        <h3 className="text-lg font-semibold text-teal-700 mb-4 pb-2 border-b border-teal-200">Governance Metrics</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                                            {/* --- Pass categoryColor for Governance --- */}
                                                            <DataCard
                                                                label="% Independent Board Members"
                                                                value={ESGData.independentBoardMembers?.toString() ?? '-'}
                                                                unit="%"
                                                                categoryColor="border-l-purple-500" // Purple for Governance
                                                            />
                                                            <DataCard
                                                                label="Data Privacy Policy"
                                                                value={formatYesNo(ESGData.hasDataPrivacyPolicy)}
                                                                categoryColor="border-l-purple-500"
                                                            />
                                                            <DataCard
                                                                label="Total Revenue"
                                                                value={ESGData.totalRevenue?.toString() ?? '-'}
                                                                unit="INR"
                                                                categoryColor="border-l-purple-500"
                                                            />

                                                        </div>
                                                    </div>

                                                    {/* --- Auto-Calculated Metrics Section --- */}
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-teal-700 mb-4 pb-2 border-b border-teal-200">Auto-Calculated Metrics</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                                            {/* --- Pass categoryColor for Auto-Calculated --- */}
                                                            <DataCard
                                                                label="Carbon Intensity"
                                                                value={ESGData.carbonIntensity !== undefined && ESGData.carbonIntensity !== null ? ESGData.carbonIntensity.toFixed(6) : '-'}
                                                                unit="T CO2e/INR"
                                                                categoryColor="border-l-yellow-500" // Yellow for Auto-Calculated
                                                            />
                                                            <DataCard
                                                                label="Renewable Electricity Ratio"
                                                                value={ESGData.renewableElectricityRatio !== undefined && ESGData.renewableElectricityRatio !== null ? ESGData.renewableElectricityRatio.toFixed(2) : '-'}
                                                                unit="%"
                                                                categoryColor="border-l-yellow-500"
                                                            />
                                                            <DataCard
                                                                label="Diversity Ratio"
                                                                value={ESGData.diversityRatio !== undefined && ESGData.diversityRatio !== null ? ESGData.diversityRatio.toFixed(2) : '-'}
                                                                unit="%"
                                                                categoryColor="border-l-yellow-500"
                                                            />
                                                            <DataCard
                                                                label="Community Spend Ratio"
                                                                value={ESGData.communitySpendRatio !== undefined && ESGData.communitySpendRatio !== null ? ESGData.communitySpendRatio.toFixed(2) : '-'}
                                                                unit="%"
                                                                categoryColor="border-l-yellow-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <div className="text-center py-10 text-gray-500">
                                            {activeYearTab === null ? 'Select a financial year.' : `No data found for FY ${activeYearTab}.`}
                                        </div>
                                    )}
                                    {/* --- END PARTIAL UPDATE --- */}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-600 mb-4">No ESG data found.</p>
                                    <p className="text-gray-500 text-sm">Please fill out the ESG questionnaire to see your summary.</p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => router.push('/questionnaire')}
                                            className="px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm cursor-pointer"
                                        >
                                            Go to Questionnaire
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* --- END PARTIAL UPDATE --- */}


                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-600 mb-4">No ESG data found.</p>
                            <p className="text-gray-500 text-sm">Please fill out the ESG questionnaire to see your summary.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => router.push('/questionnaire')}
                                    className="px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm cursor-pointer"
                                >
                                    Go to Questionnaire
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </Layout >
    );
};

export default SummaryPage;
// src/app/summary/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ESGFormData, ESGData } from '@/types/esg';
import { generateCumulativePDF, generatePerYearPDF } from '@/utils/pdfGenerator';

// Trend Charts (for Overall Summary)
import CarbonIntensityChart from '@/components/charts/CarbonIntensityChart';
import DiversityRatioChart from '@/components/charts/DiversityRatioChart';
import RenewableElectricityRatioChart from '@/components/charts/RenewableElectricityRatioChart';
import CommunitySpendRatioChart from '@/components/charts/CommunitySpendRatioChart';

// Per-Year Visuals
import RenewableEnergyDoughnutChart from '@/components/visuals/RenewableEnergyDoughnutChart';
import CommunitySpendDoughnutChart from '@/components/visuals/CommunitySpendDoughnutChart';
import CarbonIntensityMetricCard from '@/components/visuals/CarbonIntensityMetricCard';
import WorkforceDiversityDoughnutChart from '@/components/visuals/WorkforceDiversityDoughnutChart';

type View = 'perYear' | 'overall';

const SummaryPage: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [esgData, setEsgData] = useState<ESGFormData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<View>('perYear');
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const getSortedYears = useCallback(() => {
        if (!esgData) return [];
        return Object.keys(esgData)
            .map(Number)
            .filter(year => !isNaN(year))
            .sort((a, b) => b - a);
    }, [esgData]);

    useEffect(() => {
        const fetchData = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const response = await fetch('/api/responses', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setEsgData(data.responses || {});
                } else {
                    setError('Failed to load ESG data.');
                    if (response.status === 401) router.push('/login');
                }
            } catch (err) {
                setError('An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [router]);

    useEffect(() => {
        const sortedYears = getSortedYears();
        if (sortedYears.length > 0 && selectedYear === null) {
            setSelectedYear(sortedYears[0]);
        }
    }, [esgData, selectedYear, getSortedYears]);

    const handleDownloadPDF = () => {
        if (activeView === 'perYear' && selectedYear && esgData?.[selectedYear]) {
            generatePerYearPDF(esgData[selectedYear], selectedYear);
        } else if (activeView === 'overall' && esgData) {
            generateCumulativePDF(esgData);
        }
    };

    const formatValueWithUnit = (key: keyof ESGData, value: any): string => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';

        const units: Partial<Record<keyof ESGData, string>> = {
            totalElectricityConsumption: 'kWh',
            renewableElectricityConsumption: 'kWh',
            totalFuelConsumption: 'liters',
            carbonEmissions: 'T CO2e',
            averageTrainingHours: 'hrs/yr',
            communityInvestment: 'INR',
            independentBoardMembers: '%',
            totalRevenue: 'INR',
            carbonIntensity: 'T CO2e/INR',
            renewableElectricityRatio: '%',
            diversityRatio: '%',
            communitySpendRatio: '%',
        };

        let formattedValue = typeof value === 'number'
            ? (Number.isInteger(value) ? value.toString() : value.toFixed(2))
            : value.toString();

        if (key === 'carbonIntensity' && typeof value === 'number') {
            if (value.toString().includes('.') && Math.abs(value) < 1 && value !== 0) {
                formattedValue = value.toFixed(6);
            }
        }

        const unit = units[key];
        return unit ? `${formattedValue} ${unit}` : formattedValue;
    };


    const renderPerYearView = () => {
        const sortedYears = getSortedYears();
        const yearData = selectedYear ? esgData?.[selectedYear] : null;

        return (
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label htmlFor="year-select" className="font-medium text-gray-700 flex-shrink-0">Select Financial Year</label>
                        <div className="relative w-full sm:w-auto">
                            <select
                                id="year-select"
                                value={selectedYear ?? ''}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="w-full appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white cursor-pointer"
                                style={{ color: 'black' }}
                            >
                                {sortedYears.map(year => <option key={year} value={year}>FY {year}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleDownloadPDF} className="w-full sm:w-auto flex-shrink-0 px-4 py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors shadow-sm cursor-pointer">
                        Download Report for FY {selectedYear}
                    </button>
                </div>

                {yearData ? (
                    <>
                        {/* Key Metrics Snapshot charts */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Metrics Snapshot</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="h-72"><CarbonIntensityMetricCard data={yearData} /></div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-72"><RenewableEnergyDoughnutChart data={yearData} /></div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-72"><WorkforceDiversityDoughnutChart data={yearData} /></div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-72"><CommunitySpendDoughnutChart data={yearData} /></div>

                            </div>
                        </div>



                        {/* Detailed Questionnaire Data cards */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">Detailed Questionnaire Data</h2>
                            {/* Auto-Calculated Metrics card moved here */}
                            <div className="space-y-4 pb-4"> {/* This div maintains spacing below the charts */}

                                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                    <h3 className="text-lg font-semibold text-teal-700 mb-3 pb-2 border-b">Calculated Metrics</h3> {/* Changed heading to "Overview" as it summarizes */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 text-sm">
                                        <div className="text-center md:text-left">
                                            <p className="text-gray-600">Carbon Intensity</p>
                                            <p className="font-medium text-gray-800">{formatValueWithUnit('carbonIntensity', yearData.carbonIntensity)}</p>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-gray-600">Renewable Ratio</p>
                                            <p className="font-medium text-gray-800">{formatValueWithUnit('renewableElectricityRatio', yearData.renewableElectricityRatio)}</p>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-gray-600">Diversity Ratio</p>
                                            <p className="font-medium text-gray-800">{formatValueWithUnit('diversityRatio', yearData.diversityRatio)}</p>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-gray-600">Community Spend Ratio</p>
                                            <p className="font-medium text-gray-800">{formatValueWithUnit('communitySpendRatio', yearData.communitySpendRatio)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {renderDataTable(yearData)}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">Select a year to view data.</div>
                )}
            </div>
        );
    };

    const renderDataTable = (yearData: ESGData) => {
        const sections = {
            'Environmental': [
                { label: 'Total Electricity Consumption', key: 'totalElectricityConsumption' },
                { label: 'Renewable Electricity Consumption', key: 'renewableElectricityConsumption' },
                { label: 'Total Fuel Consumption', key: 'totalFuelConsumption' },
                { label: 'Carbon Emissions', key: 'carbonEmissions' },
            ],
            'Social': [
                { label: 'Total Number of Employees', key: 'totalEmployees' },
                { label: 'Number of Female Employees', key: 'femaleEmployees' },
                { label: 'Avg. Training Hours per Employee', key: 'averageTrainingHours' },
                { label: 'Community Investment Spend', key: 'communityInvestment' },
            ],
            'Governance': [
                { label: '% of Independent Board Members', key: 'independentBoardMembers' },
                { label: 'Data Privacy Policy', key: 'hasDataPrivacyPolicy' },
                { label: 'Total Revenue', key: 'totalRevenue' },
            ]
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(sections).map(([title, metrics]) => (
                    <div key={title} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <h3 className="text-lg font-semibold text-teal-700 mb-3 pb-2 border-b">{title}</h3>
                        <table className="w-full text-sm">
                            <tbody>
                                {metrics.map(({ label, key }) => (
                                    <tr key={key}>
                                        <td className="py-2 text-gray-600">{label}</td>
                                        <td className="py-2 text-right font-medium text-gray-800">
                                            {formatValueWithUnit(key as keyof ESGData, yearData[key as keyof ESGData])}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        );
    };

    const renderOverallSummaryView = () => (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 w-full">Calculated Metrics Trends</h2>
                <button onClick={handleDownloadPDF} className="w-full sm:w-auto flex-shrink-0 px-4 py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors shadow-sm cursor-pointer">
                    Download Cumulative Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg bg-white shadow-sm h-80"><CarbonIntensityChart data={esgData!} /></div>
                <div className="p-4 border rounded-lg bg-white shadow-sm h-80"><DiversityRatioChart data={esgData!} /></div>
                <div className="p-4 border rounded-lg bg-white shadow-sm h-80"><RenewableElectricityRatioChart data={esgData!} /></div>
                <div className="p-4 border rounded-lg bg-white shadow-sm h-80"><CommunitySpendRatioChart data={esgData!} /></div>
            </div>

            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Year-Over-Year Performance</h2>
                {renderCumulativeTable()}
            </div>
        </div>
    );

    const renderCumulativeTable = () => {
        const sortedYears = getSortedYears();
        const summaryMetrics: { label: string, key: keyof ESGData }[] = [
            { label: 'Carbon Intensity (T CO2e/INR)', key: 'carbonIntensity' },
            { label: 'Renewable Ratio (%)', key: 'renewableElectricityRatio' },
            { label: 'Diversity Ratio (%)', key: 'diversityRatio' },
            { label: 'Community Spend (%)', key: 'communitySpendRatio' }
        ];

        return (
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="py-3 px-4 border-b text-left font-semibold text-gray-800">Financial Year</th>
                            {summaryMetrics.map(m => <th key={m.key} className="py-3 px-4 border-b text-right font-semibold text-gray-800">{m.label}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sortedYears.map(year => (
                            <tr key={year} className="hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">FY {year}</td>
                                {summaryMetrics.map(m => (
                                    <td key={m.key} className="py-3 px-4 text-right text-gray-800">
                                        {formatValueWithUnit(m.key, esgData?.[year]?.[m.key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    if (isLoading) {
        return <Layout><div className="text-center py-10">Loading summary data...</div></Layout>;
    }

    if (error) {
        return <Layout><div className="text-center py-10 text-red-500">Error: {error}</div></Layout>;
    }

    if (!esgData || Object.keys(esgData).length === 0) {
        return (
            <Layout>
                <div className="bg-white shadow rounded-lg p-6 my-8 max-w-7xl mx-auto">
                    <div className="text-center py-16">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No ESG Data Found</h2>
                        <p className="text-gray-500 mb-6">Start by adding data to your first financial year.</p>
                        <button onClick={() => router.push('/questionnaire')} className="px-5 py-2.5 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 shadow-sm cursor-pointer">
                            Go to Questionnaire
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }


    return (
        <Layout>
            <div className="bg-gray-50 min-h-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">ESG Summary Dashboard</h1>
                            <p className="mt-1 text-gray-600">Visualize your ESG performance and track year-over-year trends.</p>
                        </div>

                        <div className="flex justify-center bg-gray-200 rounded-lg p-1">
                            <button onClick={() => setActiveView('perYear')} className={`w-1/2 px-6 py-2 font-medium rounded-md transition-colors cursor-pointer ${activeView === 'perYear' ? 'bg-white text-teal-700 shadow' : 'text-gray-600'}`}>
                                Per-Year Breakdown
                            </button>
                            <button onClick={() => setActiveView('overall')} className={`w-1/2 px-6 py-2 font-medium rounded-md transition-colors cursor-pointer ${activeView === 'overall' ? 'bg-white text-teal-700 shadow' : 'text-gray-600'}`}>
                                Overall Summary
                            </button>
                        </div>

                        {activeView === 'perYear' ? renderPerYearView() : renderOverallSummaryView()}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SummaryPage;
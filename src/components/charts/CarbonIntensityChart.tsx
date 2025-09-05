// src/components/charts/CarbonIntensityChart.tsx
'use client'; // Important for client-side rendering with Chart.js

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale, // For X-axis labels (years)
    LinearScale,   // For Y-axis values
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ESGFormData } from '@/types/esg'; // Import the type

// Register the components Chart.js needs
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Define the props for the component
interface CarbonIntensityChartProps {
    data: ESGFormData; // The ESG data fetched in the summary page
}

const CarbonIntensityChart: React.FC<CarbonIntensityChartProps> = ({ data }) => {
    // Prepare data for Chart.js
    // 1. Extract years and sort them
    const years = Object.keys(data).map(Number).sort((a, b) => a - b);

    // 2. Extract Carbon Intensity values for each year
    const carbonIntensityValues = years.map(year => {
        const yearData = data[year];
        // Handle potential null/undefined values gracefully
        return yearData?.carbonIntensity ?? null;
    });

    // 3. Filter out years where Carbon Intensity data is not available
    const validDataPoints = years.map((year, index) => ({
        year,
        value: carbonIntensityValues[index]
    })).filter(point => point.value !== null); // Keep only points with data

    const filteredYears = validDataPoints.map(point => point.year.toString()); // Convert years to strings for labels
    const filteredValues = validDataPoints.map(point => point.value);

    // Chart.js configuration object
    const chartData = {
        // X-axis labels
        labels: filteredYears, // Use the filtered years
        datasets: [
            {
                label: 'Carbon Intensity (T CO2e/INR)',
                // Y-axis data points
                data: filteredValues, // Use the filtered values
                borderColor: 'rgb(75, 192, 192)', // Line color
                backgroundColor: 'rgba(75, 192, 192, 0.5)', // Fill color under the line
                tension: 0.1, // Smoothness of the line
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const, // Position of the legend
            },
            title: {
                display: true,
                text: 'Carbon Intensity Trend', // Chart title
            },
        },
        scales: {
            y: {
                beginAtZero: true, // Y-axis starts at 0
                title: {
                    display: true,
                    text: 'T CO2e/INR'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Financial Year'
                }
            }
        }
    };

    // If there's no valid data to display, show a message instead of an empty chart
    if (filteredYears.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                Not enough data to display Carbon Intensity trend.
            </div>
        );
    }

    // Render the Line chart component
    return <Line data={chartData} options={options} />;
};

export default CarbonIntensityChart;
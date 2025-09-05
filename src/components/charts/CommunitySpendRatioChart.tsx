// src/components/charts/CommunitySpendRatioChart.tsx
'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement, // Using Bar chart
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2'; // Using Bar component
import { ESGFormData } from '@/types/esg';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface CommunitySpendRatioChartProps {
    data: ESGFormData;
}

const CommunitySpendRatioChart: React.FC<CommunitySpendRatioChartProps> = ({ data }) => {
    const years = Object.keys(data).map(Number).sort((a, b) => a - b);
    const communitySpendRatioValues = years.map(year => data[year]?.communitySpendRatio ?? null);

    const validDataPoints = years
        .map((year, index) => ({ year, value: communitySpendRatioValues[index] }))
        .filter(point => point.value !== null);

    const filteredYears = validDataPoints.map(point => point.year.toString());
    const filteredValues = validDataPoints.map(point => point.value);

    const chartData = {
        labels: filteredYears,
        datasets: [
            {
                label: 'Community Spend Ratio (%)',
                data: filteredValues,
                backgroundColor: 'rgba(75, 192, 192, 0.6)', // Teal bars
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Community Spend Ratio Trend',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Percentage (%)'
                },
                ticks: {
                    callback: function (value: any) {
                        return value + '%'; // Add % sign to Y-axis labels
                    }
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

    if (filteredYears.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                Not enough data to display Community Spend Ratio trend.
            </div>
        );
    }

    return <Bar data={chartData} options={options} />;
};

export default CommunitySpendRatioChart;
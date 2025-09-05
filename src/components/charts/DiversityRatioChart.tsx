// src/components/charts/DiversityRatioChart.tsx
'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement, // Changed to BarElement for Bar chart
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2'; // Changed to Bar
import { ESGFormData } from '@/types/esg';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement, // Register BarElement
    Title,
    Tooltip,
    Legend
);

interface DiversityRatioChartProps {
    data: ESGFormData;
}

const DiversityRatioChart: React.FC<DiversityRatioChartProps> = ({ data }) => {
    const years = Object.keys(data).map(Number).sort((a, b) => a - b);
    const diversityRatioValues = years.map(year => data[year]?.diversityRatio ?? null);

    const validDataPoints = years
        .map((year, index) => ({ year, value: diversityRatioValues[index] }))
        .filter(point => point.value !== null);

    const filteredYears = validDataPoints.map(point => point.year.toString());
    const filteredValues = validDataPoints.map(point => point.value);

    const chartData = {
        labels: filteredYears,
        datasets: [
            {
                label: 'Diversity Ratio (%)',
                data: filteredValues,
                backgroundColor: 'rgba(153, 102, 255, 0.6)', // Purple bars
                borderColor: 'rgba(153, 102, 255, 1)',
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
                text: 'Diversity Ratio Trend',
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
                Not enough data to display Diversity Ratio trend.
            </div>
        );
    }

    return <Bar data={chartData} options={options} />; // Use Bar component
};

export default DiversityRatioChart;
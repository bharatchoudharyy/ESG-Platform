// src/components/charts/RenewableElectricityRatioChart.tsx
'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2'; // Using Line chart
import { ESGFormData } from '@/types/esg';

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

interface RenewableElectricityRatioChartProps {
    data: ESGFormData;
}

const RenewableElectricityRatioChart: React.FC<RenewableElectricityRatioChartProps> = ({ data }) => {
    const years = Object.keys(data).map(Number).sort((a, b) => a - b);
    const renewableRatioValues = years.map(year => data[year]?.renewableElectricityRatio ?? null);

    const validDataPoints = years
        .map((year, index) => ({ year, value: renewableRatioValues[index] }))
        .filter(point => point.value !== null);

    const filteredYears = validDataPoints.map(point => point.year.toString());
    const filteredValues = validDataPoints.map(point => point.value);

    const chartData = {
        labels: filteredYears,
        datasets: [
            {
                label: 'Renewable Electricity Ratio (%)',
                data: filteredValues,
                borderColor: 'rgb(255, 99, 132)', // Red line
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.1,
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
                text: 'Renewable Electricity Ratio Trend',
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
                Not enough data to display Renewable Electricity Ratio trend.
            </div>
        );
    }

    return <Line data={chartData} options={options} />;
};

export default RenewableElectricityRatioChart;
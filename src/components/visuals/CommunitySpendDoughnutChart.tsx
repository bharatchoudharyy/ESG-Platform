// src/components/visuals/CommunitySpendDoughnutChart.tsx
'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ESGData } from '@/types/esg';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CommunitySpendDoughnutChartProps {
    data: ESGData;
}

const CommunitySpendDoughnutChart: React.FC<CommunitySpendDoughnutChartProps> = ({ data }) => {
    const communitySpend = data.communityInvestment ?? 0;
    const totalRevenue = data.totalRevenue ?? 0;
    const otherRevenue = totalRevenue > communitySpend ? totalRevenue - communitySpend : 0;

    if (totalRevenue === 0) {
        return <div className="text-center py-4 text-gray-500">Not enough data to display.</div>;
    }

    const chartData = {
        labels: ['Community Investment', 'Other Revenue'],
        datasets: [
            {
                data: [communitySpend, otherRevenue],
                backgroundColor: ['#3B82F6', '#D1D5DB'],
                borderColor: ['#FFFFFF', '#FFFFFF'],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            title: {
                display: true,
                text: 'Community Spend vs. Total Revenue',
                font: {
                    size: 14,
                }
            },
        },
        cutout: '60%',
    };

    return <Doughnut data={chartData} options={options} />;
};

export default CommunitySpendDoughnutChart;
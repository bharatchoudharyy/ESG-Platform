// src/components/visuals/WorkforceDiversityDoughnutChart.tsx
'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ESGData } from '@/types/esg';

ChartJS.register(ArcElement, Tooltip, Legend);

interface WorkforceDiversityDoughnutChartProps {
    data: ESGData;
}

const WorkforceDiversityDoughnutChart: React.FC<WorkforceDiversityDoughnutChartProps> = ({ data }) => {
    const female = data.femaleEmployees ?? 0;
    const total = data.totalEmployees ?? 0;
    const other = total > female ? total - female : 0;

    if (total === 0) {
        return <div className="text-center py-4 text-gray-500">Not enough data to display.</div>;
    }

    const chartData = {
        labels: ['Female', 'Other'],
        datasets: [
            {
                data: [female, other],
                backgroundColor: ['#8B5CF6', '#D1D5DB'],
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
                text: 'Workforce Diversity',
                font: {
                    size: 14,
                }
            },
        },
        cutout: '60%',
    };

    return <Doughnut data={chartData} options={options} />;
};

export default WorkforceDiversityDoughnutChart;
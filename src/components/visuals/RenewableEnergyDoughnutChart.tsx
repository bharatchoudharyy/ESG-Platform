// src/components/visuals/RenewableEnergyDoughnutChart.tsx
'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ESGData } from '@/types/esg';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RenewableEnergyDoughnutChartProps {
    data: ESGData;
}

const RenewableEnergyDoughnutChart: React.FC<RenewableEnergyDoughnutChartProps> = ({ data }) => {
    const renewable = data.renewableElectricityConsumption ?? 0;
    const total = data.totalElectricityConsumption ?? 0;
    const nonRenewable = total > renewable ? total - renewable : 0;

    if (total === 0) {
        return <div className="text-center py-4 text-gray-500">Not enough data to display.</div>;
    }

    const chartData = {
        labels: ['Renewable', 'Non-Renewable'],
        datasets: [
            {
                data: [renewable, nonRenewable],
                backgroundColor: ['#10B981', '#D1D5DB'],
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
                text: 'Renewable vs. Non-Renewable Electricity',
                font: {
                    size: 14,
                }
            },
        },
        cutout: '60%',
    };

    return <Doughnut data={chartData} options={options} />;
};

export default RenewableEnergyDoughnutChart;
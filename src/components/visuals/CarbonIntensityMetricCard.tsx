// src/components/visuals/CarbonIntensityMetricCard.tsx
import React from 'react';
import { ESGData } from '@/types/esg';

interface CarbonIntensityMetricCardProps {
    data: ESGData;
}

const formatNumber = (num: number | null | undefined, precision: number = 2) => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString(undefined, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    });
};

const CarbonIntensityMetricCard: React.FC<CarbonIntensityMetricCardProps> = ({ data }) => {
    const { carbonIntensity, carbonEmissions, totalRevenue } = data;

    return (
        <div className="flex flex-col justify-between h-full p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div>
                <h3 className="text-sm font-semibold text-gray-800 text-center">
                    Carbon Intensity
                </h3>
            </div>
            <div className="text-center py-4">
                <div className="text-4xl font-bold text-teal-600">
                    {carbonIntensity !== null && carbonIntensity !== undefined ? carbonIntensity.toFixed(6) : '-'}
                </div>
                <div className="text-xs text-gray-500">T CO2e / INR</div>
            </div>
            <div className="text-center w-full text-xs text-gray-600 border-t pt-2">
                <div className="flex justify-between">
                    <span>Emissions:</span>
                    <span className="font-medium">{formatNumber(carbonEmissions)} T CO2e</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>Revenue:</span>
                    <span className="font-medium">{formatNumber(totalRevenue)} INR</span>
                </div>
            </div>
        </div>
    );
};

export default CarbonIntensityMetricCard;
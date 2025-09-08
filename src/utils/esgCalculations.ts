// src/utils/esgCalculations.ts
import { ESGData } from '@/types/esg';

// Calculates the auto-derived ESG metrics for a single year based on the input data.
export function calculateESGMetrics(data: ESGData): ESGData {
    const calculatedData: ESGData = {};

    // --- Carbon Intensity ---
    // Formula: Carbon emissions (T CO2e) / Total revenue (INR)
    if (data.carbonEmissions != null && data.totalRevenue != null && data.totalRevenue !== 0) {
        calculatedData.carbonIntensity = data.carbonEmissions / data.totalRevenue;
    } else {
        calculatedData.carbonIntensity = null;
    }

    // --- Renewable Electricity Ratio ---
    // Formula: 100 * (Renewable electricity consumption kWh / Total electricity consumption kWh) %
    if (
        data.renewableElectricityConsumption != null &&
        data.totalElectricityConsumption != null &&
        data.totalElectricityConsumption !== 0
    ) {
        calculatedData.renewableElectricityRatio =
            100 * (data.renewableElectricityConsumption / data.totalElectricityConsumption);
    } else {
        calculatedData.renewableElectricityRatio = null;
    }

    // --- Diversity Ratio ---
    // Formula: 100 * (Female Employees / Total Employees) %
    if (data.femaleEmployees != null && data.totalEmployees != null && data.totalEmployees !== 0) {
        calculatedData.diversityRatio = 100 * (data.femaleEmployees / data.totalEmployees);
    } else {
        calculatedData.diversityRatio = null;
    }

    // --- Community Spend Ratio ---
    // Formula: 100 * (Community investment spend INR / Total Revenue INR) %
    if (data.communityInvestment != null && data.totalRevenue != null && data.totalRevenue !== 0) {
        calculatedData.communitySpendRatio = 100 * (data.communityInvestment / data.totalRevenue);
    } else {
        calculatedData.communitySpendRatio = null;
    }

    return calculatedData;
}
// src/utils/esgCalculations.ts
import { ESGData } from '@/types/esg';

/**
 * Calculates the auto-derived ESG metrics for a single year based on the input data.
 * @param data The ESGData object containing input values for a specific year.
 * @returns An ESGData object containing the calculated metrics.
 */
export function calculateESGMetrics(data: ESGData): ESGData {
    const calculatedData: ESGData = {};

    // --- Carbon Intensity ---
    // Formula: Carbon emissions (T CO2e) / Total revenue (INR)
    if (data.carbonEmissions != null && data.totalRevenue != null && data.totalRevenue !== 0) {
        calculatedData.carbonIntensity = data.carbonEmissions / data.totalRevenue;
    } else {
        calculatedData.carbonIntensity = null; // Cannot calculate if either is null or revenue is 0
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
        calculatedData.renewableElectricityRatio = null; // Cannot calculate if either is null or total consumption is 0
    }

    // --- Diversity Ratio ---
    // Formula: 100 * (Female Employees / Total Employees) %
    if (data.femaleEmployees != null && data.totalEmployees != null && data.totalEmployees !== 0) {
        calculatedData.diversityRatio = 100 * (data.femaleEmployees / data.totalEmployees);
    } else {
        calculatedData.diversityRatio = null; // Cannot calculate if either is null or total employees is 0
    }

    // --- Community Spend Ratio ---
    // Formula: 100 * (Community investment spend INR / Total Revenue INR) %
    if (data.communityInvestment != null && data.totalRevenue != null && data.totalRevenue !== 0) {
        calculatedData.communitySpendRatio = 100 * (data.communityInvestment / data.totalRevenue);
    } else {
        calculatedData.communitySpendRatio = null; // Cannot calculate if either is null or revenue is 0
    }

    return calculatedData;
}
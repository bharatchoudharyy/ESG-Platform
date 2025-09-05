// src/types/esg.ts

// Interface for the data related to a single financial year's ESG response
export interface ESGData {
    // --- Environmental Metrics ---
    totalElectricityConsumption?: number | null;     // kWh
    renewableElectricityConsumption?: number | null; // kWh
    totalFuelConsumption?: number | null;            // liters
    carbonEmissions?: number | null;                 // T CO2e

    // --- Social Metrics ---
    totalEmployees?: number | null;                  //
    femaleEmployees?: number | null;                 //
    averageTrainingHours?: number | null;            // per employee per year
    communityInvestment?: number | null;             // INR

    // --- Governance Metrics ---
    independentBoardMembers?: number | null;         // Percentage (%)
    hasDataPrivacyPolicy?: boolean | null;           // Yes/No -> Stored as Boolean
    totalRevenue?: number | null;                    // INR

    // --- Auto-Calculated Metrics ---
    carbonIntensity?: number | null;                 // T CO2e / INR
    renewableElectricityRatio?: number | null;       // 100 * (RE kWh / Total kWh) %
    diversityRatio?: number | null;                  // 100 * (Female / Total) %
    communitySpendRatio?: number | null;             // 100 * (Community INR / Total Revenue INR) %
}

// Type for the overall form state, mapping year (e.g., 2023) to its ESGData
export type ESGFormData = {
    [year: number]: ESGData;
};
// src/components/esg/ESGForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ESGFormData, ESGData } from '@/types/esg';
import { calculateESGMetrics } from '@/utils/esgCalculations';
import InputField from '@/components/ui/InputField';

// --- 1. Define a type for field-specific errors ---
type FieldErrors = Record<string, string>; // Key: fieldName, Value: errorMessage

// --- 2. Update ESGFormProps to include activeYear and onRemoveYear ---
interface ESGFormProps {
    initialData?: ESGFormData;
    onSubmit: (data: ESGFormData) => void;
    isSubmitting: boolean;
    setSubmitError: React.Dispatch<React.SetStateAction<string | null>>; // For general errors
    activeYear: number; // The year this form instance represents
    onRemoveYear: (year: number) => void; // Function to handle year removal
}

// --- 3. Helper function for field labels ---
const getFieldLabel = (field: keyof ESGData): string => {
    const labels: Record<keyof ESGData, string> = {
        totalElectricityConsumption: 'Total Electricity Consumption (kWh)',
        renewableElectricityConsumption: 'Renewable Electricity Consumption (kWh)',
        totalFuelConsumption: 'Total Fuel Consumption (liters)',
        carbonEmissions: 'Carbon Emissions (T CO2e)',
        totalEmployees: 'Total Number of Employees',
        femaleEmployees: 'Number of Female Employees',
        averageTrainingHours: 'Average Training Hours per Employee (per year)',
        communityInvestment: 'Community Investment Spend (INR)',
        independentBoardMembers: '% of Independent Board Members',
        hasDataPrivacyPolicy: 'Data Privacy Policy',
        totalRevenue: 'Total Revenue (INR)',
        carbonIntensity: 'Carbon Intensity',
        renewableElectricityRatio: 'Renewable Electricity Ratio',
        diversityRatio: 'Diversity Ratio',
        communitySpendRatio: 'Community Spend Ratio',
    };
    return labels[field] || field;
};

const ESGForm: React.FC<ESGFormProps> = ({
    initialData = {},
    onSubmit,
    isSubmitting,
    setSubmitError, // For general error message
    activeYear, // Receive the active year
    onRemoveYear, // Receive the remove handler
}) => {
    // --- 4. State for the single year's form data ---
    const [yearData, setYearData] = useState<ESGData>(initialData[activeYear] || {});

    // --- 5. State for calculated metrics for the single year ---
    const [calculatedData, setCalculatedData] = useState<ESGData>({});

    // --- 6. State for field-specific errors ---
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    // --- 7. Effect to recalculate metrics when yearData changes ---
    useEffect(() => {
        const newCalculatedData = calculateESGMetrics(yearData);
        setCalculatedData(newCalculatedData);
    }, [yearData]);

    // --- 8. Handler for input changes for the single year ---
    const handleInputChange = (fieldName: keyof ESGData, value: string | boolean | null) => {
        let parsedValue: number | boolean | null = null;
        if (typeof value === 'boolean') {
            parsedValue = value;
        } else if (value === '' || value === null) {
            parsedValue = null;
        } else {
            const num = parseFloat(value);
            parsedValue = isNaN(num) ? null : num;
        }

        setYearData((prevData) => ({
            ...prevData,
            [fieldName]: parsedValue,
        }));

        // --- 9. Clear the error for this field when it's changed ---
        if (fieldErrors[fieldName]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    // --- 10. Handler for form submission (prepares data for the single year) ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null); // Clear any previous general error
        setFieldErrors({}); // Clear any previous field errors

        const errors: { field: keyof ESGData; message: string }[] = []; // --- 11. Array to collect validation errors ---

        // --- 12. Individual Field Validity Checks (for the single year) ---
        const requiredFields: (keyof ESGData)[] = [
            'totalElectricityConsumption',
            'renewableElectricityConsumption',
            'totalFuelConsumption',
            'carbonEmissions',
            'totalEmployees',
            'femaleEmployees',
            'averageTrainingHours',
            'communityInvestment',
            'independentBoardMembers',
            'totalRevenue'
        ];

        requiredFields.forEach((field) => {
            if (yearData[field] === null || yearData[field] === undefined) {
                errors.push({ field, message: `${getFieldLabel(field)} is required. Please enter a value (use 0 if applicable).` });
            }
        });

        const nonNegativeFields: (keyof ESGData)[] = [
            'renewableElectricityConsumption',
            'totalFuelConsumption',
            'carbonEmissions',
            'communityInvestment',
            'totalRevenue',
            'independentBoardMembers',
        ];

        nonNegativeFields.forEach(field => {
            const value = yearData[field];
            if (value !== null && value !== undefined) {
                if (typeof value === 'number' && value < 0) {
                    errors.push({ field, message: `${getFieldLabel(field)} must be greater than or equal to 0.` });
                }
            }
        });

        // --- 13. Special Case Validations ---
        if (yearData.totalElectricityConsumption !== null && yearData.totalElectricityConsumption !== undefined) {
            if (typeof yearData.totalElectricityConsumption === 'number' && yearData.totalElectricityConsumption <= 0) {
                errors.push({ field: 'totalElectricityConsumption', message: 'Total Electricity Consumption (kWh) must be greater than 0.' });
            }
        }

        if (yearData.averageTrainingHours !== null && yearData.averageTrainingHours !== undefined) {
            if (typeof yearData.averageTrainingHours === 'number' && yearData.averageTrainingHours <= 0) {
                errors.push({ field: 'averageTrainingHours', message: 'Average Training Hours per Employee (per year) must be greater than 0.' });
            }
        }

        if (yearData.totalEmployees !== null && yearData.totalEmployees !== undefined) {
            if (typeof yearData.totalEmployees === 'number') {
                if (yearData.totalEmployees <= 0) {
                    errors.push({ field: 'totalEmployees', message: 'Total Number of Employees must be greater than 0.' });
                } else if (!Number.isInteger(yearData.totalEmployees)) {
                    errors.push({ field: 'totalEmployees', message: 'Total Number of Employees must be a whole number (integer).' });
                }
            }
        }

        if (yearData.femaleEmployees !== null && yearData.femaleEmployees !== undefined) {
            if (typeof yearData.femaleEmployees === 'number') {
                if (yearData.femaleEmployees <= 0) {
                    errors.push({ field: 'femaleEmployees', message: 'Number of Female Employees must be greater than 0.' });
                } else if (!Number.isInteger(yearData.femaleEmployees)) {
                    errors.push({ field: 'femaleEmployees', message: 'Number of Female Employees must be a whole number (integer).' });
                }
            }
        }

        if (yearData.hasDataPrivacyPolicy !== true && yearData.hasDataPrivacyPolicy !== false) {
            errors.push({ field: 'hasDataPrivacyPolicy', message: 'Please select an option for "Does the company have a data privacy policy?".' });
        }

        // --- 14. Cross-Field Validations ---
        if (
            yearData.femaleEmployees != null &&
            yearData.totalEmployees != null &&
            yearData.femaleEmployees > yearData.totalEmployees
        ) {
            errors.push({ field: 'femaleEmployees', message: 'Number of female employees cannot be greater than total employees.' });
        }

        if (
            yearData.renewableElectricityConsumption != null &&
            yearData.totalElectricityConsumption != null &&
            yearData.renewableElectricityConsumption > yearData.totalElectricityConsumption
        ) {
            errors.push({ field: 'renewableElectricityConsumption', message: 'Renewable electricity consumption cannot be greater than total electricity consumption.' });
        }

        if (
            yearData.communityInvestment != null &&
            yearData.totalRevenue != null &&
            yearData.communityInvestment > yearData.totalRevenue
        ) {
            errors.push({ field: 'communityInvestment', message: 'Community investment spend cannot be greater than total revenue.' });
        }

        if (
            yearData.independentBoardMembers != null &&
            (yearData.independentBoardMembers < 0 || yearData.independentBoardMembers > 100)
        ) {
            errors.push({ field: 'independentBoardMembers', message: '% of independent board members must be between 0 and 100.' });
        }

        // --- 15. Handle Validation Errors ---
        if (errors.length > 0) {

            // --- 17. Convert errors array to fieldErrors object ---
            const newFieldErrors: FieldErrors = {};
            errors.forEach(err => {
                newFieldErrors[err.field] = err.message;
            });
            setFieldErrors(newFieldErrors);

            // --- 18. Scroll to the top to show the general error message ---
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // --- 19. If validation passes, prepare data and call onSubmit ---
        // Calculate metrics before submitting
        const dataWithCalculations: ESGFormData = {
            [activeYear]: {
                ...yearData,
                ...calculateESGMetrics(yearData) // Include calculated metrics
            }
        };
        onSubmit(dataWithCalculations);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">


            {/* --- 21. General Error Message Display (at the top of the form section) --- */}
            {/* This will show if there are field errors */}
            {Object.keys(fieldErrors).length > 0 && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md text-sm">
                    Please check the fields below for required information.
                </div>
            )}

            {/* --- 22. Environmental Section --- */}
            <div className="bg-gray-50 p-5 rounded-lg border border-green-500">
                <fieldset className="mb-0">
                    <legend className="text-lg font-semibold text-teal-700 mb-4 pb-2 border-b border-gray-300">
                        Environmental Metrics
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Total Electricity Consumption (kWh)"
                            id={`totalElectricityConsumption-${activeYear}`}
                            type="number"
                            value={yearData.totalElectricityConsumption?.toString() ?? ''}
                            onChange={(e) => handleInputChange('totalElectricityConsumption', e.target.value)}
                            min="0"
                            step="any"
                            error={fieldErrors['totalElectricityConsumption']} // --- 23. Pass field error ---
                        />
                        <InputField
                            label="Renewable Electricity Consumption (kWh)"
                            id={`renewableElectricityConsumption-${activeYear}`}
                            type="number"
                            value={yearData.renewableElectricityConsumption?.toString() ?? ''}
                            onChange={(e) => handleInputChange('renewableElectricityConsumption', e.target.value)}
                            min="0"
                            step="any"
                            error={fieldErrors['renewableElectricityConsumption']} // --- 24. Pass field error ---
                        />
                        <InputField
                            label="Total Fuel Consumption (liters)"
                            id={`totalFuelConsumption-${activeYear}`}
                            type="number"
                            value={yearData.totalFuelConsumption?.toString() ?? ''}
                            onChange={(e) => handleInputChange('totalFuelConsumption', e.target.value)}
                            min="0"
                            step="any"
                            error={fieldErrors['totalFuelConsumption']} // --- 25. Pass field error ---
                        />
                        <InputField
                            label="Carbon Emissions (T CO2e)"
                            id={`carbonEmissions-${activeYear}`}
                            type="number"
                            value={yearData.carbonEmissions?.toString() ?? ''}
                            onChange={(e) => handleInputChange('carbonEmissions', e.target.value)}
                            min="0"
                            step="any"
                            error={fieldErrors['carbonEmissions']} // --- 26. Pass field error ---
                        />
                    </div>
                </fieldset>
            </div>

            {/* --- 27. Social Section --- */}
            <div className="bg-gray-50 p-5 rounded-lg border border-blue-500">
                <fieldset className="mb-0">
                    <legend className="text-lg font-semibold text-teal-700 mb-4 pb-2 border-b border-gray-300">
                        Social Metrics
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Total Number of Employees"
                            id={`totalEmployees-${activeYear}`}
                            type="number"
                            value={yearData.totalEmployees?.toString() ?? ''}
                            onChange={(e) => handleInputChange('totalEmployees', e.target.value)}
                            min="0"
                            step="1"
                            error={fieldErrors['totalEmployees']} // --- 28. Pass field error ---
                        />
                        <InputField
                            label="Number of Female Employees"
                            id={`femaleEmployees-${activeYear}`}
                            type="number"
                            value={yearData.femaleEmployees?.toString() ?? ''}
                            onChange={(e) => handleInputChange('femaleEmployees', e.target.value)}
                            min="0"
                            step="1"
                            error={fieldErrors['femaleEmployees']} // --- 29. Pass field error ---
                        />
                        <InputField
                            label="Average Training Hours per Employee (per year)"
                            id={`averageTrainingHours-${activeYear}`}
                            type="number"
                            value={yearData.averageTrainingHours?.toString() ?? ''}
                            onChange={(e) => handleInputChange('averageTrainingHours', e.target.value)}
                            min="0"
                            step="any"
                            error={fieldErrors['averageTrainingHours']} // --- 30. Pass field error ---
                        />
                        <InputField
                            label="Community Investment Spend (INR)"
                            id={`communityInvestment-${activeYear}`}
                            type="number"
                            value={yearData.communityInvestment?.toString() ?? ''}
                            onChange={(e) => handleInputChange('communityInvestment', e.target.value)}
                            min="0"
                            step="any"
                            error={fieldErrors['communityInvestment']} // --- 31. Pass field error ---
                        />
                    </div>
                </fieldset>
            </div>

            {/* --- 32. Governance Section --- */}
            <div className="bg-gray-50 p-5 rounded-lg border border-purple-500">
                <fieldset className="mb-0">
                    <legend className="text-lg font-semibold text-teal-700 mb-4 pb-2 border-b border-gray-300">
                        Governance Metrics
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="% of Independent Board Members"
                            id={`independentBoardMembers-${activeYear}`}
                            type="number"
                            value={yearData.independentBoardMembers?.toString() ?? ''}
                            onChange={(e) => handleInputChange('independentBoardMembers', e.target.value)}
                            min="0"
                            max="100"
                            step="any"
                            error={fieldErrors['independentBoardMembers']} // --- 33. Pass field error ---
                        />
                        <div className="mb-4">
                            <label htmlFor={`hasDataPrivacyPolicy-${activeYear}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Does the company have a data privacy policy?
                            </label>
                            {/* Note: InputField component doesn't handle select errors directly in this version.
                                You might need to create a separate SelectField component or handle the error display manually here. */}
                            <select
                                id={`hasDataPrivacyPolicy-${activeYear}`}
                                className={`w-full px-4 py-3 border ${fieldErrors['hasDataPrivacyPolicy'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors cursor-pointer`} // --- 34. Apply error styling ---
                                style={{ color: 'black' }}
                                value={yearData.hasDataPrivacyPolicy === true ? 'yes' : yearData.hasDataPrivacyPolicy === false ? 'no' : ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === 'yes') {
                                        handleInputChange('hasDataPrivacyPolicy', true);
                                    } else if (value === 'no') {
                                        handleInputChange('hasDataPrivacyPolicy', false);
                                    } else {
                                        handleInputChange('hasDataPrivacyPolicy', null);
                                    }
                                    // --- 35. Clear error for this field ---
                                    if (fieldErrors['hasDataPrivacyPolicy']) {
                                        setFieldErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors['hasDataPrivacyPolicy'];
                                            return newErrors;
                                        });
                                    }
                                }}
                            >
                                <option value="">Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                            {/* --- 36. Display error for select field --- */}
                            {fieldErrors['hasDataPrivacyPolicy'] && (
                                <p id={`hasDataPrivacyPolicy-${activeYear}-error`} className="mt-1 text-sm text-red-600">
                                    {fieldErrors['hasDataPrivacyPolicy']}
                                </p>
                            )}
                        </div>
                        <InputField
                            label="Total Revenue (INR)"
                            id={`totalRevenue-${activeYear}`}
                            type="number"
                            value={yearData.totalRevenue?.toString() ?? ''}
                            onChange={(e) => handleInputChange('totalRevenue', e.target.value)}
                            min="0"
                            step="any"
                            error={fieldErrors['totalRevenue']} // --- 37. Pass field error ---
                        />
                    </div>
                </fieldset>
            </div>

            {/* --- 38. Auto-Calculated Metrics Section --- */}
            <div className="bg-teal-50 p-5 rounded-lg border border-teal-200">
                <fieldset className="mb-0">
                    <legend className="text-lg font-semibold text-teal-800 mb-4 pb-2 border-b border-teal-300">
                        Auto-Calculated Metrics
                    </legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Carbon Intensity</p>
                            <p className="text-base font-semibold text-gray-900 truncate">
                                {calculatedData.carbonIntensity !== undefined && calculatedData.carbonIntensity !== null
                                    ? calculatedData.carbonIntensity.toFixed(6)
                                    : '-'} <span className="text-xs text-gray-500">T CO2e/INR</span>
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Renewable Ratio</p>
                            <p className="text-base font-semibold text-gray-900 truncate">
                                {calculatedData.renewableElectricityRatio !== undefined && calculatedData.renewableElectricityRatio !== null
                                    ? calculatedData.renewableElectricityRatio.toFixed(2)
                                    : '-'}% <span className="text-xs text-gray-500"></span>
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Diversity Ratio</p>
                            <p className="text-base font-semibold text-gray-900 truncate">
                                {calculatedData.diversityRatio !== undefined && calculatedData.diversityRatio !== null
                                    ? calculatedData.diversityRatio.toFixed(2)
                                    : '-'}% <span className="text-xs text-gray-500"></span>
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-md border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Community Spend Ratio</p>
                            <p className="text-base font-semibold text-gray-900 truncate">
                                {calculatedData.communitySpendRatio !== undefined && calculatedData.communitySpendRatio !== null
                                    ? calculatedData.communitySpendRatio.toFixed(2)
                                    : '-'}% <span className="text-xs text-gray-500"></span>
                            </p>
                        </div>
                    </div>
                </fieldset>
            </div>

            {/* --- 39. Submit + Remove Buttons --- */}
            <div className="flex justify-center gap-4 mt-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${isSubmitting
                        ? 'bg-gray-400 cursor-pointer'
                        : 'bg-teal-600 hover:bg-teal-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm cursor-pointer`}
                >
                    {isSubmitting ? 'Saving...' : 'Save Responses'}
                </button>

                <button
                    type="button"
                    onClick={() => onRemoveYear(activeYear)} // Call the passed handler
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none cursor-pointer border border-red-500 rounded-md hover:bg-red-50 transition-colors"
                >
                    Remove This Year
                </button>
            </div>

        </form>
    );
};

export default ESGForm;
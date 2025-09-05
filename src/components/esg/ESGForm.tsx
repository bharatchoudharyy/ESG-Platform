// src/components/esg/ESGForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ESGFormData, ESGData } from '@/types/esg';
import { calculateESGMetrics } from '@/utils/esgCalculations';
import InputField from '@/components/ui/InputField';


interface ESGFormProps {
    initialData?: ESGFormData;
    onSubmit: (data: ESGFormData) => void;
    isSubmitting: boolean;
    setSubmitError: React.Dispatch<React.SetStateAction<string | null>>; // Function to set error state in parent
}

const ESGForm: React.FC<ESGFormProps> = ({ initialData = {}, onSubmit, isSubmitting, setSubmitError }) => {
    const [formData, setFormData] = useState<ESGFormData>(initialData);
    const [calculatedData, setCalculatedData] = useState<ESGFormData>({});
    // Change years state to be an object mapping year to a boolean indicating if it's expanded/visible
    const [expandedYears, setExpandedYears] = useState<{ [key: number]: boolean }>(() => {
        const initialExpandedYears: { [key: number]: boolean } = {};
        Object.keys(initialData).forEach(yearStr => {
            const year = parseInt(yearStr, 10);
            if (!isNaN(year)) {
                initialExpandedYears[year] = true; // Start with existing years expanded
            }
        });
        return initialExpandedYears;
    });

    useEffect(() => {
        const newCalculatedData: ESGFormData = {};
        Object.keys(expandedYears).forEach(yearStr => {
            const year = parseInt(yearStr, 10);
            if (expandedYears[year] && formData[year]) { // Only calculate for expanded years with data
                newCalculatedData[year] = calculateESGMetrics(formData[year]);
            }
        });
        setCalculatedData(newCalculatedData);
    }, [formData, expandedYears]);

    const handleInputChange = (year: number, fieldName: keyof ESGData, value: string | boolean | null) => {
        setFormData((prevData) => {
            const yearData: ESGData = prevData[year] || {};
            let parsedValue: number | boolean | null = null;
            if (typeof value === 'boolean') {
                parsedValue = value;
            } else if (value === '' || value === null) {
                parsedValue = null;
            } else {
                const num = parseFloat(value);
                parsedValue = isNaN(num) ? null : num;
            }
            return {
                ...prevData,
                [year]: {
                    ...yearData,
                    [fieldName]: parsedValue,
                },
            };
        });
    };

    // State for the new year input modal/prompt
    const [isAddingYear, setIsAddingYear] = useState(false);
    const [newYearInput, setNewYearInput] = useState<string>('');
    const [newYearError, setNewYearError] = useState<string | null>(null);

    const handleStartAddYear = () => {
        setIsAddingYear(true);
        setNewYearInput(''); // Clear input when opening
        setNewYearError(null); // Clear previous errors
    };

    const handleConfirmAddYear = () => {
        const year = parseInt(newYearInput, 10);
        if (isNaN(year) || year < 1900 || year > 2024) { // Basic validation
            setNewYearError('Please enter a valid year between 1900-2024');
            return;
        }
        if (expandedYears[year]) {
            setNewYearError(`Financial Year ${year} is already added.`);
            return;
        }
        // Add the year and mark it as expanded
        setExpandedYears(prev => ({ ...prev, [year]: true }));
        // Initialize data for the new year
        setFormData(prev => ({ ...prev, [year]: {} }));
        setIsAddingYear(false);
        setNewYearInput('');
        setNewYearError(null);
    };

    const handleCancelAddYear = () => {
        setIsAddingYear(false);
        setNewYearInput('');
        setNewYearError(null);
    };

    const handleRemoveYear = async (yearToRemove: number) => {
        if (Object.keys(expandedYears).length <= 1) {
            alert("You must have at least one financial year.");
            return;
        }

        // Call the backend API to delete the data ---
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        try {
            const response = await fetch(`/api/responses/${yearToRemove}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                // Handle API errors (e.g., 404 if year data didn't exist, 500 server error)
                const errorData = await response.json();
                console.error(`Failed to delete year ${yearToRemove}:`, errorData.error);
            }
            // If response is ok (200 or 404), we consider the intent fulfilled.
        } catch (err: any) {
            // Handle network errors
            console.error(`Network error deleting year ${yearToRemove}:`, err);
        }


        setExpandedYears((prev) => {
            const newData = { ...prev };
            delete newData[yearToRemove];
            return newData;
        });
        setFormData((prevData) => {
            const newData = { ...prevData };
            delete newData[yearToRemove];
            return newData;
        });
        setCalculatedData((prevData) => {
            const newData = { ...prevData };
            delete newData[yearToRemove];
            return newData;
        });
    };

    // Add a type for validation errors
    type ValidationError = {
        year: number;
        field: string; // The field name causing the error
        message: string; // The error message
    };

    // Helper function to get user-friendly labels for fields
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
            // Calculated fields (not typically validated directly from input)
            carbonIntensity: 'Carbon Intensity',
            renewableElectricityRatio: 'Renewable Electricity Ratio',
            diversityRatio: 'Diversity Ratio',
            communitySpendRatio: 'Community Spend Ratio',
        };
        return labels[field] || field; // Fallback to the field name if not found
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null); // Clear any previous submission errors

        const errors: ValidationError[] = [];
        // Iterate through each year's data to perform validations
        Object.entries(formData).forEach(([yearStr, yearData]) => {
            const year = parseInt(yearStr, 10);

            // --- Validation Rules ---
            // --- 1. Check for Required Fields ---
            // Define a list of fields that MUST have a value (even if that value is 0)
            // Exclude calculated fields and the Yes/No dropdown which can be null
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
                // 'hasDataPrivacyPolicy' is optional as per requirements (Yes/No dropdown)
            ];
            requiredFields.forEach((field) => {
                // Check if the field value is null or undefined
                if (yearData[field] === null || yearData[field] === undefined) {
                    errors.push({
                        year,
                        field,
                        message: `${getFieldLabel(field)} is required. Please enter a value (use 0 if applicable).`,
                    });
                }
            });

            // Ensure fields that should be >= 0 are not negative
            const nonNegativeFields: (keyof ESGData)[] = [
                'renewableElectricityConsumption',
                'totalFuelConsumption',
                'carbonEmissions',
                'communityInvestment', // Community Investment Spend (INR) >= 0
                'totalRevenue', // Total Revenue >= 0
                'independentBoardMembers', // % of Independent Board Members >= 0
            ];

            nonNegativeFields.forEach(field => {
                const value = yearData[field];
                // Only validate if the field has a value entered
                if (value !== null && value !== undefined) {
                    if (typeof value === 'number' && value < 0) {
                        errors.push({
                            year,
                            field,
                            message: `${getFieldLabel(field)} must be greater than or equal to 0.`, // Generic message for >= 0 fields
                        });
                    }
                }
            });

            // --- 2. Check for Data Privacy Policy Selection ---
            // The hasDataPrivacyPolicy field must be explicitly true or false (Yes or No selected)
            if (yearData.hasDataPrivacyPolicy !== true && yearData.hasDataPrivacyPolicy !== false) {
                // If it's null, undefined, or any other value, it's considered unselected
                errors.push({
                    year,
                    field: 'hasDataPrivacyPolicy',
                    message: 'Please select an option for "Does the company have a data privacy policy?".',
                });
            }

            // --- Special Cases ---
            // Total Electricity Consumption must be > 0 ---
            if (yearData.totalElectricityConsumption !== null && yearData.totalElectricityConsumption !== undefined) {
                if (typeof yearData.totalElectricityConsumption === 'number' && yearData.totalElectricityConsumption <= 0) {
                    errors.push({
                        year,
                        field: 'totalElectricityConsumption',
                        message: 'Total Electricity Consumption (kWh) must be greater than 0.',
                    });
                }
            }
            // Average Training Hours per Employee (per year) > 0
            if (yearData.averageTrainingHours !== null && yearData.averageTrainingHours !== undefined) {
                if (typeof yearData.averageTrainingHours === 'number' && yearData.averageTrainingHours <= 0) {
                    errors.push({
                        year,
                        field: 'averageTrainingHours',
                        message: 'Average Training Hours per Employee (per year) must be greater than 0.',
                    });
                }
            }

            // Total Number of Employees > 0 and Integer
            if (yearData.totalEmployees !== null && yearData.totalEmployees !== undefined) {
                if (typeof yearData.totalEmployees === 'number') {
                    if (yearData.totalEmployees <= 0) {
                        errors.push({
                            year,
                            field: 'totalEmployees',
                            message: 'Total Number of Employees must be greater than 0.',
                        });
                    } else if (!Number.isInteger(yearData.totalEmployees)) {
                        errors.push({
                            year,
                            field: 'totalEmployees',
                            message: 'Total Number of Employees must be a whole number (integer).',
                        });
                    }
                }
            }

            // Number of Female Employees > 0 and Integer
            if (yearData.femaleEmployees !== null && yearData.femaleEmployees !== undefined) {
                if (typeof yearData.femaleEmployees === 'number') {
                    if (yearData.femaleEmployees <= 0) {
                        errors.push({
                            year,
                            field: 'femaleEmployees',
                            message: 'Number of Female Employees must be greater than 0.',
                        });
                    } else if (!Number.isInteger(yearData.femaleEmployees)) {
                        errors.push({
                            year,
                            field: 'femaleEmployees',
                            message: 'Number of Female Employees must be a whole number (integer).',
                        });
                    }
                }
            }

            // 1. Female Employees <= Total Employees
            if (
                yearData.femaleEmployees != null &&
                yearData.totalEmployees != null &&
                yearData.femaleEmployees > yearData.totalEmployees
            ) {
                errors.push({
                    year,
                    field: 'femaleEmployees',
                    message: 'Number of female employees cannot be greater than total employees.',
                });
            }

            // 2. Renewable Electricity <= Total Electricity
            if (
                yearData.renewableElectricityConsumption != null &&
                yearData.totalElectricityConsumption != null &&
                yearData.renewableElectricityConsumption > yearData.totalElectricityConsumption
            ) {
                errors.push({
                    year,
                    field: 'renewableElectricityConsumption',
                    message: 'Renewable electricity consumption cannot be greater than total electricity consumption.',
                });
            }

            // 3. Community Spend <= Total Revenue
            if (
                yearData.communityInvestment != null &&
                yearData.totalRevenue != null &&
                yearData.communityInvestment > yearData.totalRevenue
            ) {
                errors.push({
                    year,
                    field: 'communityInvestment',
                    message: 'Community investment spend cannot be greater than total revenue.',
                });
            }

            // 4. Independent Board Members % should be between 0 and 100
            if (
                yearData.independentBoardMembers != null &&
                (yearData.independentBoardMembers < 0 || yearData.independentBoardMembers > 100)
            ) {
                errors.push({
                    year,
                    field: 'independentBoardMembers',
                    message: '% of independent board members must be between 0 and 100.',
                });
            }
        });

        // If there are validation errors, display them and prevent submission
        if (errors.length > 0) {
            // Create a user-friendly error message string
            const errorMessages = errors.map(err => `Year ${err.year} : ${err.message}`).join('\n');
            setSubmitError(`${errorMessages}`);
            // Scroll to the top to show the error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return; // Stop the submission process
        }

        // If validation passes, prepare the data including calculated metrics before submitting
        // Create a copy of formData to avoid mutating the state directly
        const dataToSend: ESGFormData = {};

        // Iterate through each year's input data
        Object.entries(formData).forEach(([year, yearData]) => {
            // Calculate the metrics for this year's data using the utility function
            const calculatedMetrics = calculateESGMetrics(yearData);

            // Merge the original input data with the calculated metrics
            // The calculated metrics will overwrite any potentially existing null/undefined placeholders
            dataToSend[parseInt(year, 10)] = {
                ...yearData,         // Include all original input fields
                ...calculatedMetrics // Include the freshly calculated derived fields
            };
        });
        // Proceed with the original onSubmit handler, passing the enriched data
        onSubmit(dataToSend);
    };

    // Get sorted list of years
    const years = Object.keys(expandedYears).map(Number).sort((a, b) => b - a);

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Conditional rendering for the initial "Add Year" button or the form sections */}
            {years.length === 0 && !isAddingYear ? (
                <div className="text-center py-10">
                    <p className="text-gray-600 mb-6">No financial years added yet.</p>
                    <button
                        type="button"
                        onClick={handleStartAddYear}
                        className="px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm"
                    >
                        Add Financial Year's ESG Data
                    </button>
                </div>
            ) : (
                <>
                    {/* Render form sections for each expanded year */}
                    {years.map((year) => (
                        <div key={year} className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Financial Year: {year}</h2>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }))}
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                    >
                                        {expandedYears[year] ? 'Collapse' : 'Expand'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveYear(year)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        disabled={years.length <= 1}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {expandedYears[year] && (
                                <>
                                    {/* Environmental Section */}
                                    <fieldset className="mb-6">
                                        <legend className="text-lg font-medium text-gray-700 mb-3 pb-2 border-b border-gray-100">Environmental Metrics</legend>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField
                                                label="Total Electricity Consumption (kWh)"
                                                id={`totalElectricityConsumption-${year}`}
                                                type="number"
                                                value={formData[year]?.totalElectricityConsumption?.toString() ?? ''}
                                                onChange={(e) => handleInputChange(year, 'totalElectricityConsumption', e.target.value)}
                                                min="0"
                                                step="any"
                                            />
                                            <InputField
                                                label="Renewable Electricity Consumption (kWh)"
                                                id={`renewableElectricityConsumption-${year}`}
                                                type="number"
                                                value={formData[year]?.renewableElectricityConsumption?.toString() ?? ''}
                                                onChange={(e) => handleInputChange(year, 'renewableElectricityConsumption', e.target.value)}
                                                min="0"
                                                step="any"
                                            />
                                            <InputField
                                                label="Total Fuel Consumption (liters)"
                                                id={`totalFuelConsumption-${year}`}
                                                type="number"
                                                value={formData[year]?.totalFuelConsumption?.toString() ?? ''}
                                                onChange={(e) => handleInputChange(year, 'totalFuelConsumption', e.target.value)}
                                                min="0"
                                                step="any"
                                            />
                                            <InputField
                                                label="Carbon Emissions (T CO2e)"
                                                id={`carbonEmissions-${year}`}
                                                type="number"
                                                value={formData[year]?.carbonEmissions?.toString() ?? ''}
                                                onChange={(e) => handleInputChange(year, 'carbonEmissions', e.target.value)}
                                                min="0"
                                                step="any"
                                            />
                                        </div>
                                    </fieldset>

                                    {/* Social Section */}
                                    <fieldset className="mb-6">
                                        <legend className="text-lg font-medium text-gray-700 mb-3 pb-2 border-b border-gray-100">Social Metrics</legend>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField
                                                label="Total Number of Employees"
                                                id={`totalEmployees-${year}`}
                                                type="number"
                                                value={formData[year]?.totalEmployees?.toString() ?? ''}
                                                onChange={(e) => handleInputChange(year, 'totalEmployees', e.target.value)}
                                                min="0"
                                                step="1"
                                            />
                                            <InputField
                                                label="Number of Female Employees"
                                                id={`femaleEmployees-${year}`}
                                                type="number"
                                                value={formData[year]?.femaleEmployees?.toString() ?? ''}
                                                onChange={(e) => handleInputChange(year, 'femaleEmployees', e.target.value)}
                                                min="0"
                                                step="1"
                                            />
                                            <InputField
                                                label="Average Training Hours per Employee (per year)"
                                                id={`averageTrainingHours-${year}`}
                                                type="number"
                                                value={formData[year]?.averageTrainingHours?.toString() ?? ''}
                                                onChange={(e) => handleInputChange(year, 'averageTrainingHours', e.target.value)}
                                                min="0"
                                                step="any"
                                            />
                                            <InputField
                                                label="Community Investment Spend (INR)"
                                                id={`communityInvestment-${year}`}
                                                type="number"
                                                value={formData[year]?.communityInvestment?.toString() ?? ''}
                                                onChange={(e) => handleInputChange(year, 'communityInvestment', e.target.value)}
                                                min="0"
                                                step="any"
                                            />
                                        </div>
                                    </fieldset>

                                    {/* Governance Section */}
                                    <fieldset className="mb-6">
                                        <legend className="text-lg font-medium text-gray-700 mb-3 pb-2 border-b border-gray-100">Governance Metrics</legend>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField
                                                label="% of Independent Board Members"
                                                id={`independentBoardMembers-${year}`}
                                                type="number"
                                                value={formData[year]?.independentBoardMembers?.toString() ?? ''}
                                                onChange={(e) => handleInputChange(year, 'independentBoardMembers', e.target.value)}
                                                min="0"
                                                max="100"
                                                step="any"
                                            />
                                            <div className="mb-4">
                                                <label htmlFor={`hasDataPrivacyPolicy-${year}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                    Does the company have a data privacy policy?
                                                </label>
                                                <select
                                                    id={`hasDataPrivacyPolicy-${year}`}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                                    style={{ color: 'black' }}
                                                    value={formData[year]?.hasDataPrivacyPolicy === true ? 'yes' : formData[year]?.hasDataPrivacyPolicy === false ? 'no' : ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === 'yes') {
                                                            handleInputChange(year, 'hasDataPrivacyPolicy', true);
                                                        } else if (value === 'no') {
                                                            handleInputChange(year, 'hasDataPrivacyPolicy', false);
                                                        } else {
                                                            handleInputChange(year, 'hasDataPrivacyPolicy', null);
                                                        }
                                                    }}
                                                >
                                                    <option value="">Select</option>
                                                    <option value="yes">Yes</option>
                                                    <option value="no">No</option>
                                                </select>
                                            </div>
                                            <InputField
                                                label="Total Revenue (INR)"
                                                id={`totalRevenue-${year}`}
                                                type="number"
                                                value={formData[year]?.totalRevenue?.toString() ?? ''}
                                                onChange={(e) => handleInputChange(year, 'totalRevenue', e.target.value)}
                                                min="0"
                                                step="any"
                                            />
                                        </div>
                                    </fieldset>

                                    {/* Calculated Metrics Section */}
                                    <fieldset className="mb-4">
                                        <legend className="text-lg font-medium text-gray-700 mb-3 pb-2 border-b border-gray-100">Auto-Calculated Metrics</legend>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Carbon Intensity (T CO2e/INR)</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {calculatedData[year]?.carbonIntensity !== undefined && calculatedData[year]?.carbonIntensity !== null
                                                        ? calculatedData[year]?.carbonIntensity?.toFixed(6)
                                                        : '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Renewable Electricity Ratio (%)</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {calculatedData[year]?.renewableElectricityRatio !== undefined && calculatedData[year]?.renewableElectricityRatio !== null
                                                        ? calculatedData[year]?.renewableElectricityRatio?.toFixed(2)
                                                        : '-'}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Diversity Ratio (%)</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {calculatedData[year]?.diversityRatio !== undefined && calculatedData[year]?.diversityRatio !== null
                                                        ? calculatedData[year]?.diversityRatio?.toFixed(2)
                                                        : '-'}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Community Spend Ratio (%)</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {calculatedData[year]?.communitySpendRatio !== undefined && calculatedData[year]?.communitySpendRatio !== null
                                                        ? calculatedData[year]?.communitySpendRatio?.toFixed(2)
                                                        : '-'}%
                                                </p>
                                            </div>
                                        </div>
                                    </fieldset>
                                </>
                            )}
                        </div>
                    ))}

                    {/* Add Year Button (always visible if there are years) */}
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleStartAddYear}
                            className="px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm"
                        >
                            Add Another Financial Year
                        </button>
                    </div>
                </>
            )}

            {/* Modal/Overlay for Adding New Year */}
            {isAddingYear && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm" onClick={handleCancelAddYear} aria-hidden="true"></div>

                    {/* Modal Content */}
                    <div
                        className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-10 border border-black/30"
                        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside it
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Financial Year</h3>
                        <div className="mb-4">
                            <label htmlFor="newYearInput" className="block text-sm font-medium text-gray-700 mb-1">
                                Enter Financial Year (e.g., 2023)
                            </label>
                            {/* Updated Input Field for Year */}
                            <input
                                type="text" // Changed from 'number' to 'text' to have more control
                                inputMode="numeric" // Suggests numeric keyboard on mobile
                                pattern="[0-9]*" // Suggests numeric input (doesn't prevent 'e' in all browsers but helps)
                                id="newYearInput"
                                value={newYearInput}
                                onChange={(e) => {
                                    // Allow only digits
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) { // Regex to allow only digits (0-9)
                                        setNewYearInput(value);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    // If the user presses Enter, trigger the confirm action
                                    if (e.key === 'Enter') {
                                        e.preventDefault(); // Prevent default form submission
                                        handleConfirmAddYear(); // Call the function to add the year
                                    }
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-gray-900" // Added text-gray-900
                                placeholder="YYYY"
                                aria-describedby="year-error" // For accessibility
                            />
                            {newYearError && (
                                <p id="year-error" className="mt-1 text-sm text-red-600">
                                    {newYearError}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCancelAddYear}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAddYear}
                                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                                Add Year
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button (only shown if there are years) */}
            {years.length > 0 && (
                <div className="flex justify-center mt-8">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${isSubmitting ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-sm`}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Responses'}
                    </button>
                </div>
            )}
        </form>
    );
};

export default ESGForm;
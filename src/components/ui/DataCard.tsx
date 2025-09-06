// src/components/ui/DataCard.tsx
import React from 'react';

interface DataCardProps {
    label: string;
    value: string | number | null | undefined;
    unit?: string;
    // --- 1. Add a prop for the category border color ---
    categoryColor?: 'border-l-green-500' | 'border-l-blue-500' | 'border-l-purple-500' | 'border-l-yellow-500' | 'border-l-gray-500'; // Add more colors as needed
}

// --- 2. Define default category colors if needed ---
// We can also pass specific colors from the parent component based on the section

const DataCard: React.FC<DataCardProps> = ({
    label,
    value,
    unit = '',
    // --- 3. Default category color ---
    categoryColor = 'border-l-gray-500', // Default to gray if not specified
}) => {
    // Format the value for display
    let displayValue: string;
    if (value === null || value === undefined) {
        displayValue = '-';
    } else {
        displayValue = value.toString();
    }

    return (
        // --- 4. Update the card styling ---
        // Use a uniform white background
        // Add a left border using the categoryColor prop
        // Add padding and rounded corners for a clean look
        <div className={`bg-white p-3 rounded-md shadow-sm border border-gray-200 ${categoryColor} pl-4`}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-semibold text-gray-900 flex items-center">
                {displayValue} {unit && <span className="text-xs font-medium text-gray-500 ml-1">{unit}</span>}
            </p>
        </div>
    );
};

export default DataCard;
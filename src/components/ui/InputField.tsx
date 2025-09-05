// src/components/ui/InputField.tsx
import React, { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, error, ...props }) => {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-1">
                {label}
            </label>
            {/* Added text-gray-900 to make the input text black */}
            <input
                id={id}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900 ${error ? 'border-red-500' : ''
                    }`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default InputField;
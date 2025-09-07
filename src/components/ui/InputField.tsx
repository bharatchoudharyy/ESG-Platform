// src/components/ui/InputField.tsx
import React, { InputHTMLAttributes, useState } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, error, type, ...props }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const isPasswordField = type === 'password';

    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type}
                    className={`w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-gray-900 ${isPasswordField ? 'pr-16' : ''}`} // Increased padding for text
                    {...props}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-semibold text-teal-600 hover:text-teal-700"
                        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    >
                        {isPasswordVisible ? 'Hide' : 'Show'}
                    </button>
                )}
            </div>
            {error && (
                <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
};

export default InputField;

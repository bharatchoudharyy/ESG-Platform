// src/components/ui/Button.tsx
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ isLoading = false, children, ...props }) => {
    return (
        <button
            type="submit"
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors cursor-pointer ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
};

export default Button;
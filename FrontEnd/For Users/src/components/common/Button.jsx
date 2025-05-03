import React from 'react';

export default function Button({
    children,
    variant = 'primary',
    className = '',
    disabled = false,
    ...props
}) {
    const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
        success: "bg-green-600 text-white hover:bg-green-700",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };

    const disabledStyles = "opacity-50 cursor-not-allowed";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${disabled ? disabledStyles : ''} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}

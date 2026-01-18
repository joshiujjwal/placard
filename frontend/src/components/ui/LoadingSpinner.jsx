import React from 'react';

const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
};

const variants = {
    primary: 'border-indigo-200 border-t-indigo-600',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-200 border-t-gray-600',
};

export function LoadingSpinner({ size = 'md', variant = 'primary', className = '' }) {
    return (
        <div
            className={`${sizes[size]} ${variants[variant]} rounded-full animate-spin ${className}`}
            role="status"
            aria-label="Loading"
        />
    );
}

export function LoadingOverlay({ message = 'Loading...', size = 'lg' }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-xl">
                <LoadingSpinner size={size} />
                <p className="text-gray-700 font-medium">{message}</p>
            </div>
        </div>
    );
}

export function LoadingState({ message, size = 'lg', className = '' }) {
    return (
        <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
            <LoadingSpinner size={size} />
            {message && <p className="mt-4 text-gray-600">{message}</p>}
        </div>
    );
}

export default LoadingSpinner;

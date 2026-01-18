import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400',
};

const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
};

export function Button({
    variant = 'primary',
    size = 'md',
    children,
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    className = '',
    ...props
}) {
    const isDisabled = disabled || loading;

    return (
        <button
            className={`
                inline-flex items-center justify-center gap-2
                rounded-lg font-semibold
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
            disabled={isDisabled}
            {...props}
        >
            {loading ? (
                <>
                    <LoadingSpinner
                        size="sm"
                        variant={variant === 'primary' || variant === 'danger' || variant === 'success' ? 'white' : 'gray'}
                    />
                    <span>{children}</span>
                </>
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
                    <span>{children}</span>
                    {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
                </>
            )}
        </button>
    );
}

export function IconButton({
    variant = 'ghost',
    size = 'md',
    children,
    label,
    className = '',
    ...props
}) {
    const iconSizes = {
        xs: 'p-1',
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
        xl: 'p-4',
    };

    return (
        <button
            className={`
                inline-flex items-center justify-center
                rounded-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant]}
                ${iconSizes[size]}
                ${className}
            `}
            aria-label={label}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;

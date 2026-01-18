import React, { forwardRef } from 'react';

export const Input = forwardRef(({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    return (
        <div className={containerClassName}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
                        w-full rounded-lg border transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-offset-0
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                        ${leftIcon ? 'pl-10' : 'pl-4'}
                        ${rightIcon ? 'pr-10' : 'pr-4'}
                        py-2.5
                        ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                        }
                        ${className}
                    `}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                        {rightIcon}
                    </div>
                )}
            </div>
            {(error || helperText) && (
                <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export const Select = forwardRef(({
    label,
    error,
    options = [],
    placeholder,
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    return (
        <div className={containerClassName}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`
                    w-full rounded-lg border py-2.5 px-4 bg-white
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-0
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                    }
                    ${className}
                `}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export const TextArea = forwardRef(({
    label,
    error,
    helperText,
    className = '',
    containerClassName = '',
    rows = 4,
    ...props
}, ref) => {
    return (
        <div className={containerClassName}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                rows={rows}
                className={`
                    w-full rounded-lg border py-2.5 px-4
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-0
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    resize-none
                    ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                    }
                    ${className}
                `}
                {...props}
            />
            {(error || helperText) && (
                <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

TextArea.displayName = 'TextArea';

export default Input;

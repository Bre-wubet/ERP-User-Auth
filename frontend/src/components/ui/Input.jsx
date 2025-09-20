import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * Input Component
 * Reusable input component with validation states
 */

const Input = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  ...props
}, ref) => {
  const inputClasses = clsx(
    'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
    {
      'border-gray-300 focus:ring-blue-500 focus:border-blue-500': !error,
      'border-red-300 focus:ring-red-500 focus:border-red-500': error,
      'bg-gray-50 cursor-not-allowed': disabled,
    },
    className
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

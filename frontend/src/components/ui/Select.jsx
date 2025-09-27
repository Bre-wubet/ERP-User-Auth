import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Select Component
 * Reusable select dropdown component
 */
const Select = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  icon,
  placeholder = "Select an option",
  children,
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-forest-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <select
          ref={ref}
          className={cn(
            "block w-full px-3 py-2 border border-sage-300 rounded-md shadow-sm placeholder-sage-400",
            "focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500",
            "disabled:bg-sage-50 disabled:text-sage-500 disabled:cursor-not-allowed",
            "text-sm",
            icon ? "pl-10" : "pl-3",
            error 
              ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
              : "border-sage-300",
            className
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {children}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-sage-400" />
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-sage-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

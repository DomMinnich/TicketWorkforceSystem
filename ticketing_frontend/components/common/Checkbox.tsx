
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <input
          id={id}
          type="checkbox"
          className={`h-4 w-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary ${className}`}
          {...props}
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

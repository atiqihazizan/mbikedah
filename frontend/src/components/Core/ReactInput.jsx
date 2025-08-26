import React from 'react';
import InputMask from 'react-input-mask';

const ReactInput = ({ 
  mask, 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  required = false,
  label,
  error,
  id,
  type = "text",
  ...props 
}) => {
  const baseClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
  `.trim();

  // If no mask is provided OR it's a date/time input, use regular input
  // InputMask doesn't work well with date/time inputs
  const InputComponent = (mask && type === "text") ? InputMask : 'input';
  const inputProps = (mask && type === "text") ? { mask, ...props } : { type, ...props };

  return (
    <div className="space-y-1 w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <InputComponent
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`${baseClasses} ${className}`}
        id={id}
        {...inputProps}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ReactInput;

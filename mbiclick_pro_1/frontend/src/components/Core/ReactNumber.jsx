import React from 'react';
import { NumericFormat, PatternFormat } from 'react-number-format';

const ReactNumber = ({ 
  type = 'number', // 'number', 'currency', 'percentage', 'phone', 'pattern'
  value, 
  onChange, 
  placeholder,
  className = '', 
  disabled = false,
  required = false,
  label,
  error,
  id,
  // Number format specific props
  thousandSeparator = ',',
  decimalSeparator = '.',
  decimalScale,
  fixedDecimalScale = false,
  allowNegative = true,
  prefix = '',
  suffix = '',
  // Pattern format specific props
  format, // for pattern format like "#### #### #### ####"
  mask = '_',
  // Common props
  min,
  max,
  step,
  ...props 
}) => {
  const baseClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
  `.trim();

  const handleValueChange = (values) => {
    const { formattedValue, value: numericValue, floatValue } = values;
    
    // Create synthetic event for consistency with regular inputs
    const syntheticEvent = {
      target: {
        value: type === 'pattern' ? formattedValue : numericValue,
        name: props.name,
        floatValue: floatValue
      }
    };
    
    onChange?.(syntheticEvent);
  };

  // Currency formatting (for Malaysian Ringgit)
  if (type === 'currency') {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <NumericFormat
          value={value}
          onValueChange={handleValueChange}
          thousandSeparator={thousandSeparator}
          decimalSeparator={decimalSeparator}
          decimalScale={2}
          fixedDecimalScale={true}
          allowNegative={allowNegative}
          prefix="RM "
          placeholder={placeholder || "RM 0.00"}
          className={`${baseClasses} ${className}`}
          disabled={disabled}
          id={id}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // Pattern formatting (for phone, IC, etc.)
  if (type === 'pattern' && format) {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <PatternFormat
          format={format}
          mask={mask}
          value={value}
          onValueChange={handleValueChange}
          placeholder={placeholder}
          className={`${baseClasses} ${className}`}
          disabled={disabled}
          id={id}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // Phone number formatting (Malaysian format)
  if (type === 'phone') {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <PatternFormat
          format="###-#### ####"
          mask="_"
          value={value}
          onValueChange={handleValueChange}
          placeholder={placeholder || "012-3456 7890"}
          className={`${baseClasses} ${className}`}
          disabled={disabled}
          id={id}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // Percentage formatting
  if (type === 'percentage') {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <NumericFormat
          value={value}
          onValueChange={handleValueChange}
          thousandSeparator={thousandSeparator}
          decimalSeparator={decimalSeparator}
          decimalScale={decimalScale || 2}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={allowNegative}
          suffix="%"
          placeholder={placeholder || "0.00%"}
          className={`${baseClasses} ${className}`}
          disabled={disabled}
          id={id}
          isAllowed={(values) => {
            const { floatValue } = values;
            return floatValue >= 0 && floatValue <= 100;
          }}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  // Default number formatting
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <NumericFormat
        value={value}
        onValueChange={handleValueChange}
        thousandSeparator={thousandSeparator}
        decimalSeparator={decimalSeparator}
        decimalScale={decimalScale}
        fixedDecimalScale={fixedDecimalScale}
        allowNegative={allowNegative}
        prefix={prefix}
        suffix={suffix}
        placeholder={placeholder}
        className={`${baseClasses} ${className}`}
        disabled={disabled}
        id={id}
        isAllowed={(values) => {
          const { floatValue } = values;
          if (min !== undefined && floatValue < min) return false;
          if (max !== undefined && floatValue > max) return false;
          return true;
        }}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ReactNumber;

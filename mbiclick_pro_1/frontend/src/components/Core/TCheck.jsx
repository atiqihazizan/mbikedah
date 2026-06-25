const TCheck = ({ 
  id = 'checkbox', 
  name = '',
  checked = false,
  onChange = () => {},
  className = '',
  label = '',
  labelClassName = '',
  disabled = false,
  size = 'md',
  color = 'primary'
}) => {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const colors = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  };

  const baseClasses = `form-checkbox text-${colors[color]} focus:ring-${colors[color]} border-gray-300 rounded ${sizes[size]}`;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`${baseClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {label && (
        <label 
          htmlFor={id}
          className={`ml-2 text-sm ${labelClassName}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default TCheck;
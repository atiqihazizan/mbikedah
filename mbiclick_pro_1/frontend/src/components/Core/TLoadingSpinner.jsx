// components/Core/TLoadingSpinner.jsx

const TLoadingSpinner = ({ 
  className = '',
  size = 'h-12 w-12',
  thickness = 'border-t-2 border-b-2',
  color = 'border-blue-500',
  containerHeight = 'h-64',
  containerClass = 'flex justify-center items-center'
}) => {
  return (
    <div className={`${containerClass} ${containerHeight} ${className}`}>
      <div className={`animate-spin rounded-full ${size} ${thickness} ${color}`}></div>
    </div>
  );
};

// Custom positions
TLoadingSpinner.Position = {
  FULL: 'flex justify-center items-center h-full',
  SCREEN: 'fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center',
  CENTER: 'flex justify-center items-center h-64'
};

export default TLoadingSpinner;
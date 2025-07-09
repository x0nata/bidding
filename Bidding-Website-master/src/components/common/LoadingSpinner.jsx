import React from 'react';

export const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  className = '',
  text = null 
}) => {
  // Size configurations
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      default: // medium
        return 'w-8 h-8';
    }
  };

  // Color configurations
  const getColorConfig = () => {
    switch (color) {
      case 'white':
        return 'border-white border-t-transparent';
      case 'gray':
        return 'border-gray-300 border-t-gray-600';
      case 'gold':
        return 'border-yellow-300 border-t-yellow-600';
      default: // primary
        return 'border-blue-300 border-t-blue-600';
    }
  };

  const sizeClass = getSizeConfig();
  const colorClass = getColorConfig();

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`
          ${sizeClass} 
          ${colorClass}
          border-4 border-solid rounded-full animate-spin
        `}
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

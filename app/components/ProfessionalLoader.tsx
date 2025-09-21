import React from 'react';

interface ProfessionalLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProfessionalLoader: React.FC<ProfessionalLoaderProps> = ({ 
  message = "Loading...", 
  size = 'md',
  className = ""
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Spinner */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-2 border-slate-200 rounded-full animate-spin`}>
          <div className={`${sizeClasses[size]} border-2 border-transparent border-t-blue-600 rounded-full absolute top-0 left-0 animate-spin`} 
               style={{ animationDuration: '0.8s' }}>
          </div>
        </div>
        
        {/* Inner ring */}
        <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} border border-transparent border-t-blue-400 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin`}
             style={{ animationDuration: '1.2s', animationDirection: 'reverse' }}>
        </div>
      </div>
      
      {/* Loading text */}
      <p className={`${textSizeClasses[size]} text-slate-600 font-medium animate-pulse`}>
        {message}
      </p>
    </div>
  );
};

export default ProfessionalLoader;

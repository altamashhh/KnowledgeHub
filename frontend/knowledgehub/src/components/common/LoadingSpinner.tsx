import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full border-[#222733] border-t-indigo-500 animate-spin`}
      />
      {label && <p className="mt-3 text-xs text-[#94A3B8] font-medium">{label}</p>}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#11151B] p-4 rounded-xl border border-[#222733] shadow-xs animate-pulse space-y-3">
      <div className="flex justify-between items-start">
        <div className="h-4 bg-[#1F242E] rounded w-3/4"></div>
        <div className="h-3 bg-[#171B22] rounded w-16"></div>
      </div>
      <div className="h-3 bg-[#171B22] rounded w-full"></div>
      <div className="h-3 bg-[#171B22] rounded w-2/3"></div>
      <div className="flex gap-2 pt-2">
        <div className="h-5 bg-[#1F242E] rounded-md w-24"></div>
        <div className="h-5 bg-indigo-950/40 rounded-md w-16"></div>
      </div>
    </div>
  );
};

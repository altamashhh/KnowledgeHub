import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-bold',
    lg: 'text-2xl font-extrabold',
    xl: 'text-3xl font-extrabold',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Knowledge node glyph icon with electric indigo tint */}
      <div
        className={`${iconSizes[size]} bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-600/30 border border-indigo-400/30 flex-shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5/7 h-5/7"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <path d="M10 6.5h4" />
          <path d="M17.5 10v4" />
          <path d="M6.5 10v7.5a2 2 0 0 0 2 2h5.5" />
        </svg>
      </div>
      {showText && (
        <span className={`tracking-tight text-[#F3F4F6] flex items-center gap-1 ${textSizes[size]}`}>
          Knowledge<span className="text-indigo-400">Hub</span>
        </span>
      )}
    </div>
  );
};

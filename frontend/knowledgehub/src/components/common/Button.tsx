import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0D10] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
  };

  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-xs shadow-indigo-600/25 focus:ring-indigo-500 border border-indigo-500/30',
    secondary:
      'bg-[#171B22] hover:bg-[#1E242E] text-[#E2E8F0] hover:text-white border border-[#262D38] shadow-xs focus:ring-slate-500',
    outline:
      'bg-transparent hover:bg-indigo-950/30 text-indigo-400 border border-indigo-500/40 focus:ring-indigo-500',
    danger:
      'bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-800/40 focus:ring-red-500',
    ghost:
      'bg-transparent hover:bg-[#171B22] text-[#94A3B8] hover:text-[#F3F4F6] focus:ring-slate-600 border border-transparent',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

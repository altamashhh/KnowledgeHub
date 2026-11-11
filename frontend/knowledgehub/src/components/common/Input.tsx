import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightAction,
      isPassword = false,
      type = 'text',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={inputId} className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              {label}
            </label>
            {rightAction}
          </div>
        )}
        <div className="relative rounded-lg">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={`
              block w-full rounded-lg border bg-[#11151B] px-3.5 py-2 text-sm text-[#F3F4F6] placeholder:text-[#64748B]
              transition-colors duration-150
              ${leftIcon ? 'pl-10' : ''}
              ${isPassword ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-[#222733] hover:border-[#333B4D] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none'
              }
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#94A3B8] focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-[#64748B]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

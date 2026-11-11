import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-lg border bg-[#11151B] px-3.5 py-2.5 text-sm text-[#F3F4F6] placeholder:text-[#64748B]
            transition-colors duration-150
            ${
              error
                ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-[#222733] hover:border-[#333B4D] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-[#64748B]">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

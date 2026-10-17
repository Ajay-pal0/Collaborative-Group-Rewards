import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  rightElement,
  className = '',
  disabled,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#44403c] tracking-wide"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[#a8a29e] pointer-events-none flex items-center">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={`w-full bg-[#fafafa] focus:bg-white border rounded-xl py-2.5 text-sm text-[#0c0a09] placeholder-[#a8a29e] transition-all focus:outline-none focus:ring-2 focus:ring-[#0c0a09] focus:border-transparent disabled:bg-[#f5f5f4] disabled:text-[#78716c] disabled:cursor-not-allowed ${
            icon ? 'pl-10' : 'pl-3.5'
          } ${
            rightElement ? 'pr-11' : 'pr-3.5'
          } ${
            error
              ? 'border-[#dc2626] focus:ring-[#dc2626]/20'
              : 'border-[#e7e5e4] hover:border-[#d6d3d1]'
          } ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[#dc2626] text-xs font-medium animate-fade-in">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#78716c]">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

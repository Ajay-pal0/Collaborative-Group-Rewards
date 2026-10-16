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
          className="block text-xs font-bold text-[#667085] uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[#98A2B3] pointer-events-none flex items-center">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={`w-full bg-[#F8F9FC] border rounded-xl py-2.5 text-sm text-[#171923] placeholder-[#98A2B3] transition-all focus:outline-none focus:ring-2 focus:ring-[#635BFF] disabled:bg-[#F2F4F7] disabled:text-[#667085] disabled:cursor-not-allowed ${
            icon ? 'pl-10' : 'pl-3.5'
          } ${
            rightElement ? 'pr-11' : 'pr-3.5'
          } ${
            error
              ? 'border-[#F04438] focus:border-[#F04438] focus:ring-[#F04438]/20'
              : 'border-[#E7E9EE] focus:border-[#635BFF]'
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
        <p className="text-[#F04438] text-xs font-medium animate-fade-in">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#98A2B3]">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus:ring-2 focus:ring-offset-1';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3.5 gap-2.5',
  }[size];

  const variantStyles = {
    primary: 'bg-[#635BFF] hover:bg-[#4F46E5] text-white shadow-xs hover:shadow-md focus:ring-[#635BFF]',
    secondary: 'bg-white hover:bg-[#F8F9FC] text-[#171923] border border-[#E7E9EE] hover:border-[#D0D5DD] shadow-xs focus:ring-[#635BFF]',
    outline: 'border border-[#635BFF] text-[#635BFF] hover:bg-[#635BFF]/5 focus:ring-[#635BFF]',
    ghost: 'text-[#667085] hover:text-[#171923] hover:bg-[#F2F4F7] focus:ring-[#667085]',
    danger: 'bg-[#F04438] hover:bg-[#D92D20] text-white shadow-xs focus:ring-[#F04438]',
    success: 'bg-[#12B76A] hover:bg-[#039855] text-white shadow-xs focus:ring-[#12B76A]',
  }[variant];

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;

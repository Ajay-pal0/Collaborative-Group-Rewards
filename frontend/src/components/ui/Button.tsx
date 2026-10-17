import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success';
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
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus:ring-2 focus:ring-[#0c0a09] focus:ring-offset-1 active:scale-[0.99]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 min-h-[40px]',
    lg: 'text-sm sm:text-base px-6 py-2.5 gap-2.5 min-h-[44px]',
  }[size];

  const variantStyles = {
    primary: 'bg-[#0c0a09] hover:bg-[#292524] text-white shadow-xs hover:shadow-sm',
    secondary: 'bg-white hover:bg-[#f5f5f4] text-[#0c0a09] border border-[#e7e5e4] hover:border-[#d6d3d1] shadow-xs',
    accent: 'bg-[#b4552d] hover:bg-[#9a4420] text-white shadow-xs hover:shadow-sm focus:ring-[#b4552d]',
    outline: 'border border-[#0c0a09] text-[#0c0a09] hover:bg-[#0c0a09]/5',
    ghost: 'text-[#57534e] hover:text-[#0c0a09] hover:bg-[#0c0a09]/5',
    danger: 'bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-xs focus:ring-[#dc2626]',
    success: 'bg-[#059669] hover:bg-[#047857] text-white shadow-xs focus:ring-[#059669]',
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

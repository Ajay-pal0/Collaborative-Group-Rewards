import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral' | 'shimmer';
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 gap-1',
    sm: 'text-[11px] font-medium px-2.5 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-3 py-1 gap-1.5',
  }[size];

  const variantStyles = {
    primary: 'bg-[#0c0a09] text-white border border-[#0c0a09]',
    accent: 'bg-[#fff7ed] text-[#9a3412] border border-[#ffedd5]',
    success: 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]',
    warning: 'bg-[#fffbeb] text-[#92400e] border border-[#fde68a]',
    error: 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]',
    neutral: 'bg-[#f5f5f4] text-[#44403c] border border-[#e7e5e4]',
    shimmer: 'badge-shimmer border-none',
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;

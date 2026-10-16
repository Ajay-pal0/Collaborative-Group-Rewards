import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'gold';
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1',
    sm: 'text-[10px] font-bold px-2 py-0.5 gap-1',
    md: 'text-xs font-bold px-2.5 py-1 gap-1.5',
  }[size];

  const variantStyles = {
    primary: 'bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20',
    success: 'bg-[#ECFDF3] text-[#027A48] border border-[#12B76A]/30',
    warning: 'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]',
    error: 'bg-[#FEF3F2] text-[#B42318] border border-[#F04438]/20',
    neutral: 'bg-[#F2F4F7] text-[#667085] border border-[#E7E9EE]',
    gold: 'bg-[#FFFDF5] text-[#B45309] border border-[#F5B942]/40 shadow-2xs',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full uppercase tracking-wider ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;

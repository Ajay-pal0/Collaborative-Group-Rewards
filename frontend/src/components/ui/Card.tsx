import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  variant?: 'default' | 'elevated' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-[#e7e5e4] shadow-xs',
    elevated: 'bg-white border border-[#e7e5e4] shadow-sm',
    subtle: 'bg-[#fafafa] border border-[#e7e5e4]',
  }[variant];

  const hoverStyle = hoverEffect
    ? 'transition-all duration-200 hover:border-[#d6d3d1] hover:shadow-md hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`rounded-2xl ${variantStyles} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`p-5 sm:p-6 pb-2 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3 className={`text-base sm:text-lg font-semibold text-[#0c0a09] tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p className={`text-xs sm:text-sm text-[#78716c] mt-1 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`p-5 sm:p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`p-4 sm:p-6 pt-0 border-t border-[#f0efed] flex items-center ${className}`} {...props}>
    {children}
  </div>
);

export default Card;

import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'primary' | 'gold' | 'accent' | 'success';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'primary',
  size = 'md',
  animated = false,
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size];

  const colorStyles = {
    primary: 'bg-[#0c0a09]',
    gold: 'bg-gradient-to-r from-[#d97706] to-[#b45309]',
    accent: 'bg-gradient-to-r from-[#b4552d] to-[#d98a5a]',
    success: 'bg-[#059669]',
  }[color];

  return (
    <div
      className={`w-full bg-[#e7e5e4] rounded-full overflow-hidden ${heightStyles} ${className}`}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles} ${
          animated ? 'animate-pulse' : ''
        }`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};

export default ProgressBar;

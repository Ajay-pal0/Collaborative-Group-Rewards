import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'primary' | 'gold' | 'success';
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
    lg: 'h-4',
  }[size];

  const colorStyles = {
    primary: 'bg-gradient-to-r from-[#635BFF] to-[#4F46E5]',
    gold: 'bg-gradient-to-r from-[#F5B942] to-[#D97706]',
    success: 'bg-gradient-to-r from-[#12B76A] to-[#059669]',
  }[color];

  return (
    <div
      className={`w-full bg-[#E7E9EE] rounded-full overflow-hidden ${heightStyles} ${className}`}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles} ${
          animated ? 'animate-pulse-subtle' : ''
        }`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};

export default ProgressBar;

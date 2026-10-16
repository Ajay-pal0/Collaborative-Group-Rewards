import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#d6d3d1] bg-[#fafafa] ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#e7e5e4] shadow-xs flex items-center justify-center mb-3 text-[#78716c]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#0c0a09]">{title}</h3>
      {description && <p className="text-xs sm:text-sm text-[#78716c] mt-1 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

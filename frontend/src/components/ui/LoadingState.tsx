import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  description?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  description,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center ${className}`}>
      <div className="w-10 h-10 rounded-full bg-[#f5f5f4] border border-[#e7e5e4] flex items-center justify-center mb-3">
        <Loader2 className="w-5 h-5 text-[#0c0a09] animate-spin" />
      </div>
      <p className="text-sm font-semibold text-[#0c0a09]">{message}</p>
      {description && <p className="text-xs text-[#78716c] mt-1 max-w-sm">{description}</p>}
    </div>
  );
};

export default LoadingState;

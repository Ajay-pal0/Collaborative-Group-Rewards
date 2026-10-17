import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 sm:p-10 text-center rounded-2xl border border-[#fecaca] bg-[#fef2f2] ${className}`}>
      <div className="w-10 h-10 rounded-full bg-white border border-[#fecaca] flex items-center justify-center mb-3 text-[#dc2626]">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#991b1b]">{title}</h3>
      <p className="text-xs text-[#b91c1c] mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          className="mt-4"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

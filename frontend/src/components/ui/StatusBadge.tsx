import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, MinusCircle } from 'lucide-react';

export type VerificationState = 'verified' | 'pending' | 'not_started' | 'failed' | 'expired' | 'completed';

export interface StatusBadgeProps {
  status: VerificationState | string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
  size = 'sm',
}) => {
  const normStatus = (status || '').toLowerCase().replace(/_/g, ' ');

  const getStatusConfig = () => {
    switch (normStatus) {
      case 'verified':
      case 'completed':
        return {
          bg: 'bg-[#ecfdf5]',
          text: 'text-[#065f46]',
          border: 'border-[#a7f3d0]',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />,
          defaultLabel: 'Verified',
        };
      case 'pending':
      case 'in progress':
      case 'pending provider access':
        return {
          bg: 'bg-[#fffbeb]',
          text: 'text-[#92400e]',
          border: 'border-[#fde68a]',
          icon: <Clock className="w-3.5 h-3.5 text-[#d97706]" />,
          defaultLabel: 'Pending',
        };
      case 'failed':
        return {
          bg: 'bg-[#fef2f2]',
          text: 'text-[#991b1b]',
          border: 'border-[#fecaca]',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626]" />,
          defaultLabel: 'Failed',
        };
      case 'expired':
        return {
          bg: 'bg-[#fafafa]',
          text: 'text-[#78716c]',
          border: 'border-[#e7e5e4]',
          icon: <XCircle className="w-3.5 h-3.5 text-[#78716c]" />,
          defaultLabel: 'Expired',
        };
      case 'not started':
      case 'not requested':
      default:
        return {
          bg: 'bg-[#f5f5f4]',
          text: 'text-[#57534e]',
          border: 'border-[#e7e5e4]',
          icon: <MinusCircle className="w-3.5 h-3.5 text-[#a8a29e]" />,
          defaultLabel: 'Not Started',
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = label || config.defaultLabel;
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1.5' : 'text-sm px-3.5 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {config.icon}
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;

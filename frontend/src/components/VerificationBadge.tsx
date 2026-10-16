import { ShieldCheck, ShieldAlert, Clock, AlertCircle } from 'lucide-react';
import type { VerificationStatus } from '../types';

export interface VerificationBadgeProps {
  type: 'pan' | 'aadhaar' | 'credit';
  status: VerificationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function VerificationBadge({
  type,
  status,
  size = 'md',
  showLabel = true,
  className = '',
}: VerificationBadgeProps) {
  const normStatus = (status || 'NOT_STARTED').toUpperCase();

  const labelMap = {
    pan: 'PAN',
    aadhaar: 'Aadhaar',
    credit: 'Credit',
  };

  const docName = labelMap[type] || type.toUpperCase();

  let badgeColor = 'bg-[#f5f5f5] text-[#78716c] border-[#e7e5e4]';
  let icon = <ShieldAlert className="w-3 h-3 text-[#a8a29e] shrink-0" />;
  let statusText = 'Not Verified';

  if (normStatus === 'VERIFIED' || normStatus === 'COMPLETED') {
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs font-semibold';
    icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    statusText = 'Verified';
  } else if (normStatus === 'PENDING' || normStatus === 'PENDING_PROVIDER_ACCESS') {
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
    icon = <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-spin-slow" />;
    statusText = normStatus === 'PENDING_PROVIDER_ACCESS' ? 'Access Pending' : 'Pending';
  } else if (normStatus === 'FAILED') {
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200 font-semibold';
    icon = <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
    statusText = 'Failed';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-xs px-3 py-1 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border transition-all ${badgeColor} ${sizeClasses} ${className}`}
      title={`${docName}: ${statusText}`}
      role="status"
    >
      {icon}
      {showLabel && (
        <span className="leading-tight">
          <span className="font-bold">{docName}</span> {statusText}
        </span>
      )}
    </span>
  );
}

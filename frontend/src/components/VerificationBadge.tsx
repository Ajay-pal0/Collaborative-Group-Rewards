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

  let badgeColor = 'bg-slate-800/80 text-slate-400 border-slate-700/60';
  let icon = <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />;
  let statusText = 'Not Verified';

  if (normStatus === 'VERIFIED' || normStatus === 'COMPLETED') {
    badgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-950/40';
    icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    statusText = 'Verified';
  } else if (normStatus === 'PENDING' || normStatus === 'PENDING_PROVIDER_ACCESS') {
    badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    icon = <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />;
    statusText = normStatus === 'PENDING_PROVIDER_ACCESS' ? 'Access Pending' : 'Pending';
  } else if (normStatus === 'FAILED') {
    badgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    icon = <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
    statusText = 'Failed';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-all ${badgeColor} ${sizeClasses} ${className}`}
      title={`${docName}: ${statusText}`}
      role="status"
    >
      {icon}
      {showLabel && (
        <span>
          <span className="font-semibold">{docName}</span> {statusText}
        </span>
      )}
    </span>
  );
}

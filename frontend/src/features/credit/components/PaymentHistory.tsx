import React from 'react';
import type { MonthlyPayStatus } from '../../../types';

interface PaymentHistoryProps {
  history: MonthlyPayStatus[];
  className?: string;
}

function parsePayStatus(code: string): {
  label: string;
  symbol: string;
  bg: string;
  text: string;
  border: string;
  isGood: boolean;
  isWarning: boolean;
  isDanger: boolean;
} {
  const norm = (code || '').trim().toUpperCase();

  if (norm === '000' || norm === 'STD') {
    return {
      label: 'On Time (0 DPD)',
      symbol: '✓',
      bg: 'bg-[#ecfdf5]',
      text: 'text-[#065f46]',
      border: 'border-[#a7f3d0]',
      isGood: true,
      isWarning: false,
      isDanger: false,
    };
  }

  const numVal = parseInt(norm, 10);
  if (!isNaN(numVal)) {
    if (numVal < 30) {
      return {
        label: `${numVal} DPD`,
        symbol: '✓',
        bg: 'bg-[#ecfdf5]',
        text: 'text-[#065f46]',
        border: 'border-[#a7f3d0]',
        isGood: true,
        isWarning: false,
        isDanger: false,
      };
    }
    if (numVal < 90) {
      return {
        label: `${numVal} DPD (Past Due)`,
        symbol: '!',
        bg: 'bg-[#fffbeb]',
        text: 'text-[#92400e]',
        border: 'border-[#fde68a]',
        isGood: false,
        isWarning: true,
        isDanger: false,
      };
    }
    return {
      label: `${numVal}+ DPD (Default)`,
      symbol: '!!',
      bg: 'bg-[#fef2f2]',
      text: 'text-[#991b1b]',
      border: 'border-[#fecaca]',
      isGood: false,
      isWarning: false,
      isDanger: true,
    };
  }

  if (norm === 'SUB' || norm === 'DBT' || norm === 'LSS') {
    return {
      label: norm === 'SUB' ? 'Substandard' : norm === 'DBT' ? 'Doubtful' : 'Loss',
      symbol: '✕',
      bg: 'bg-[#fef2f2]',
      text: 'text-[#991b1b]',
      border: 'border-[#fecaca]',
      isGood: false,
      isWarning: false,
      isDanger: true,
    };
  }

  return {
    label: norm ? `Status ${norm}` : 'No Data',
    symbol: '—',
    bg: 'bg-[#f5f5f4]',
    text: 'text-[#78716c]',
    border: 'border-[#e7e5e4]',
    isGood: false,
    isWarning: false,
    isDanger: false,
  };
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ history, className = '' }) => {
  if (!history || history.length === 0) {
    return (
      <div className={`p-4 text-center rounded-xl bg-[#fafafa] border border-[#e7e5e4] ${className}`}>
        <p className="text-xs text-[#78716c]">No detailed monthly repayment history recorded for this line.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-[#0c0a09]">
        <span>Repayment Timeline (Recent Months)</span>
        <span className="text-[11px] text-[#78716c] font-normal">
          {history.length} cycles recorded
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {history.map((item, idx) => {
          const parsed = parsePayStatus(item.status);
          return (
            <div
              key={idx}
              title={`${item.month}: ${parsed.label}`}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border ${parsed.bg} ${parsed.border} min-w-[58px] transition-transform hover:scale-105`}
            >
              <span className="text-[10px] font-semibold text-[#78716c] mb-0.5">
                {item.month}
              </span>
              <div className="flex items-center gap-0.5">
                <span className={`text-xs font-bold ${parsed.text}`}>
                  {parsed.symbol}
                </span>
                <span className={`text-[11px] font-bold ${parsed.text}`}>
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accessible Non-Color Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-[#78716c] border-t border-[#f0efed]">
        <span className="font-medium text-[#0c0a09]">Legend:</span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3.5 h-3.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-[9px] font-bold flex items-center justify-center">✓</span>
          000 (On-time)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3.5 h-3.5 rounded-full bg-[#fffbeb] border border-[#fde68a] text-[#92400e] text-[9px] font-bold flex items-center justify-center">!</span>
          030+ (30-89 DPD)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3.5 h-3.5 rounded-full bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-[9px] font-bold flex items-center justify-center">!!</span>
          090+ (90+ DPD)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3.5 h-3.5 rounded-full bg-[#f5f5f4] border border-[#e7e5e4] text-[#78716c] text-[9px] font-bold flex items-center justify-center">—</span>
          No Data
        </span>
      </div>
    </div>
  );
};

export default PaymentHistory;

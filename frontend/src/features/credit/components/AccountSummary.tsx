import React from 'react';
import type { AccountSummaryData } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui';
import { Layers, AlertCircle, CheckCircle2, Calendar, DollarSign } from 'lucide-react';

interface AccountSummaryProps {
  summary: AccountSummaryData;
  className?: string;
}

export const AccountSummary: React.FC<AccountSummaryProps> = ({ summary, className = '' }) => {
  const formatCurrency = (val: number | undefined | null) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const metrics = [
    {
      label: 'Total Accounts',
      value: summary.total_accounts ?? 0,
      icon: <Layers className="w-4 h-4 text-[#0c0a09]" />,
      desc: 'Active & closed accounts',
    },
    {
      label: 'Current Balance',
      value: formatCurrency(summary.current_balance),
      icon: <DollarSign className="w-4 h-4 text-[#0c0a09]" />,
      desc: 'Total outstanding liability',
    },
    {
      label: 'High Credit / Limit',
      value: formatCurrency(summary.high_credit_amount),
      icon: <DollarSign className="w-4 h-4 text-[#0c0a09]" />,
      desc: 'Highest sanctioned amount',
    },
    {
      label: 'Overdue Accounts',
      value: summary.overdue_account_count ?? 0,
      icon: <AlertCircle className={`w-4 h-4 ${(summary.overdue_account_count || 0) > 0 ? 'text-[#dc2626]' : 'text-[#059669]'}`} />,
      desc: summary.overdue_balance ? `Overdue: ${formatCurrency(summary.overdue_balance)}` : 'Zero overdue payments',
      isWarning: (summary.overdue_account_count || 0) > 0,
    },
    {
      label: 'Zero Balance Accounts',
      value: summary.zero_balance_account_count ?? 0,
      icon: <CheckCircle2 className="w-4 h-4 text-[#059669]" />,
      desc: 'Paid off & settled accounts',
    },
    {
      label: 'Credit History Age',
      value: summary.oldest_account_date || 'N/A',
      icon: <Calendar className="w-4 h-4 text-[#78716c]" />,
      desc: summary.recent_account_date ? `Latest: ${summary.recent_account_date}` : 'Oldest reported date',
    },
  ];

  return (
    <Card className={`border border-[#e7e5e4] ${className}`}>
      <CardHeader>
        <CardTitle className="text-sm sm:text-base font-semibold text-[#0c0a09] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#0c0a09]" />
          Bureau Account Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {metrics.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 sm:p-4 rounded-xl border ${
                item.isWarning
                  ? 'bg-[#fef2f2] border-[#fecaca]'
                  : 'bg-[#fafafa] border-[#e7e5e4]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] sm:text-xs font-medium text-[#78716c]">
                  {item.label}
                </span>
                <span className="shrink-0">{item.icon}</span>
              </div>
              <div
                className={`text-base sm:text-lg font-bold tracking-tight ${
                  item.isWarning ? 'text-[#991b1b]' : 'text-[#0c0a09]'
                }`}
              >
                {item.value}
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#78716c] mt-0.5 truncate">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSummary;

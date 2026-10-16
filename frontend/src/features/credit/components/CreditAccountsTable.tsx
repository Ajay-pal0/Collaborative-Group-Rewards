import React, { useState } from 'react';
import type { CreditAccountItem } from '../../../types';
import { Card, CardContent, Badge, Button } from '../../../components/ui';
import { CreditCard, ChevronDown, ChevronUp, AlertCircle, Building2 } from 'lucide-react';
import PaymentHistory from './PaymentHistory';

interface CreditAccountsTableProps {
  accounts: CreditAccountItem[];
  className?: string;
}

export const CreditAccountsTable: React.FC<CreditAccountsTableProps> = ({
  accounts,
  className = '',
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const formatCurrency = (val: number | undefined | null) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (!accounts || accounts.length === 0) {
    return (
      <div className={`p-8 text-center rounded-2xl border border-dashed border-[#d6d3d1] bg-[#fafafa] ${className}`}>
        <CreditCard className="w-8 h-8 text-[#a8a29e] mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-[#0c0a09]">No Credit Accounts Reported</h4>
        <p className="text-xs text-[#78716c] mt-1 max-w-sm mx-auto">
          No loan or credit card lines were returned in this bureau report.
        </p>
      </div>
    );
  }

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {accounts.map((acc, idx) => {
        const isExpanded = expandedIndex === idx;
        const hasOverdue = (acc.overdue_amount || 0) > 0;

        return (
          <Card
            key={idx}
            className={`transition-all duration-200 border ${
              hasOverdue ? 'border-[#fecaca] bg-[#fffdfd]' : 'border-[#e7e5e4] bg-white'
            }`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f5f5f4] border border-[#e7e5e4] flex items-center justify-center shrink-0 text-[#0c0a09]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[#0c0a09]">
                        {acc.account_type || 'Credit Account'}
                      </h4>
                      <Badge variant="neutral" size="xs">
                        {acc.masked_account_number}
                      </Badge>
                      {hasOverdue && (
                        <Badge variant="error" size="xs" icon={<AlertCircle className="w-3 h-3" />}>
                          Past Due
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#78716c] mt-0.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#a8a29e]" />
                      <span>{acc.lender_name || 'Financial Institution'}</span>
                      {acc.opened_date && (
                        <>
                          <span>•</span>
                          <span>Opened: {acc.opened_date}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-[#78716c] block">
                      Current Balance
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-[#0c0a09]">
                      {formatCurrency(acc.current_balance)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(idx)}
                    icon={isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Collapse account details' : 'Expand account details'}
                  >
                    <span className="hidden sm:inline">{isExpanded ? 'Less' : 'Details'}</span>
                  </Button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[#f0efed] space-y-4 animate-slide-up">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#fafafa] border border-[#e7e5e4]">
                      <span className="text-[11px] text-[#78716c] block">High Credit / Limit</span>
                      <span className="font-bold text-[#0c0a09] mt-0.5 block">
                        {formatCurrency(acc.high_credit_amount)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#fafafa] border border-[#e7e5e4]">
                      <span className="text-[11px] text-[#78716c] block">Overdue Amount</span>
                      <span className={`font-bold mt-0.5 block ${hasOverdue ? 'text-[#dc2626]' : 'text-[#059669]'}`}>
                        {formatCurrency(acc.overdue_amount)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#fafafa] border border-[#e7e5e4]">
                      <span className="text-[11px] text-[#78716c] block">Monthly EMI</span>
                      <span className="font-bold text-[#0c0a09] mt-0.5 block">
                        {(acc.emi_amount || 0) > 0 ? formatCurrency(acc.emi_amount) : 'N/A'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#fafafa] border border-[#e7e5e4]">
                      <span className="text-[11px] text-[#78716c] block">Reported Date</span>
                      <span className="font-bold text-[#0c0a09] mt-0.5 block">
                        {acc.reported_date || 'Recent'}
                      </span>
                    </div>
                  </div>

                  {acc.payment_history && acc.payment_history.length > 0 && (
                    <PaymentHistory history={acc.payment_history} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CreditAccountsTable;

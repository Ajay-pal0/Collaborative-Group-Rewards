import React from 'react';
import type { InquirySummaryData, CreditEnquiryItem } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../../components/ui';
import { Search, Building2, Calendar } from 'lucide-react';

interface EnquiryListProps {
  summary?: InquirySummaryData;
  enquiries: CreditEnquiryItem[];
  className?: string;
}

export const EnquiryList: React.FC<EnquiryListProps> = ({
  summary,
  enquiries,
  className = '',
}) => {
  const formatCurrency = (val: number | undefined | null) => {
    if (!val) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Card className={`border border-[#e7e5e4] ${className}`}>
      <CardHeader>
        <CardTitle className="text-sm sm:text-base font-semibold text-[#0c0a09] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#0c0a09]" />
            Bureau Credit Enquiries
          </span>
          {summary && (
            <Badge variant="neutral" size="sm">
              {summary.total_enquiries ?? enquiries.length} Total
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#e7e5e4] text-center text-xs">
            <div>
              <span className="text-[11px] text-[#78716c] block">Past 30 Days</span>
              <span className="font-bold text-[#0c0a09] mt-0.5 block">
                {summary.past_30_days ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#78716c] block">Past 12 Months</span>
              <span className="font-bold text-[#0c0a09] mt-0.5 block">
                {summary.past_12_months ?? 0}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#78716c] block">Past 24 Months</span>
              <span className="font-bold text-[#0c0a09] mt-0.5 block">
                {summary.past_24_months ?? 0}
              </span>
            </div>
          </div>
        )}

        {enquiries && enquiries.length > 0 ? (
          <div className="divide-y divide-[#f0efed]">
            {enquiries.map((inq, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#f5f5f4] border border-[#e7e5e4] flex items-center justify-center shrink-0 text-[#0c0a09]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0c0a09]">{inq.institution}</h5>
                    <p className="text-[11px] text-[#78716c] mt-0.5">{inq.purpose}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-semibold text-[#0c0a09] block">
                    {formatCurrency(inq.amount)}
                  </span>
                  <span className="text-[11px] text-[#78716c] flex items-center gap-1 justify-end mt-0.5">
                    <Calendar className="w-3 h-3 text-[#a8a29e]" />
                    {inq.date || 'Recent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#78716c] text-center py-4">
            No recent credit enquiries found in this reporting window.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default EnquiryList;

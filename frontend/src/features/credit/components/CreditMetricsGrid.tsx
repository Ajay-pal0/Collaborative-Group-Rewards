import React from 'react';
import { Layers, DollarSign, AlertCircle } from 'lucide-react';
import type { CreditProfile } from '../../../types';

interface CreditMetricsGridProps {
  profile: CreditProfile;
}

export const CreditMetricsGrid: React.FC<CreditMetricsGridProps> = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-3.5 space-y-1">
        <div className="flex items-center gap-1.5 text-[#667085] text-[10px] font-bold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-[#635BFF]" />
          <span>Active Accounts</span>
        </div>
        <p className="text-xl font-black text-[#171923]">
          {profile.active_accounts_count ?? 0}
        </p>
        <span className="text-[10px] text-[#98A2B3] block">Reporting lines</span>
      </div>

      <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-3.5 space-y-1">
        <div className="flex items-center gap-1.5 text-[#667085] text-[10px] font-bold uppercase tracking-wider">
          <DollarSign className="w-3.5 h-3.5 text-[#12B76A]" />
          <span>Total Balance</span>
        </div>
        <p className="text-xl font-black text-[#171923]">
          ₹{Number(profile.total_outstanding || 0).toLocaleString('en-IN')}
        </p>
        <span className="text-[10px] text-[#98A2B3] block">Total exposure</span>
      </div>

      <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-3.5 space-y-1">
        <div className="flex items-center gap-1.5 text-[#667085] text-[10px] font-bold uppercase tracking-wider">
          <AlertCircle className="w-3.5 h-3.5 text-[#F04438]" />
          <span>Overdue Balance</span>
        </div>
        <p className={`text-xl font-black ${Number(profile.overdue_amount || 0) > 0 ? 'text-[#F04438]' : 'text-[#12B76A]'}`}>
          ₹{Number(profile.overdue_amount || 0).toLocaleString('en-IN')}
        </p>
        <span className="text-[10px] text-[#98A2B3] block">Past due liability</span>
      </div>
    </div>
  );
};

export default CreditMetricsGrid;

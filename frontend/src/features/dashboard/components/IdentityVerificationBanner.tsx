import React from 'react';
import { ShieldCheck, CreditCard, TrendingUp } from 'lucide-react';
import type { User } from '../../../types';
import VerificationBadge from '../../../components/VerificationBadge';

interface IdentityVerificationBannerProps {
  user: User | null;
  onOpenKycTab: () => void;
  onOpenCreditModal: () => void;
}

export const IdentityVerificationBanner: React.FC<IdentityVerificationBannerProps> = ({
  user,
  onOpenKycTab,
  onOpenCreditModal,
}) => {
  const isFullVerified = user?.pan_verified && user?.aadhaar_verified;

  return (
    <div className="bg-white border border-[#E7E9EE] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#635BFF]/10 to-[#12B76A]/10 border border-[#635BFF]/20 flex items-center justify-center text-[#635BFF] shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-[#171923] flex items-center gap-2">
            <span>Identity Verification & Badges</span>
            {isFullVerified && (
              <span className="text-[10px] font-bold text-[#027A48] bg-[#ECFDF3] border border-[#12B76A]/30 px-2 py-0.5 rounded-full">
                100% Verified
              </span>
            )}
          </h3>
          <p className="text-xs text-[#667085] mt-0.5">
            Verify your Aadhaar and PAN to earn trusted badges and unlock member rewards.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        {/* Aadhaar Badge / Action */}
        {user?.aadhaar_verified ? (
          <VerificationBadge type="aadhaar" status="VERIFIED" />
        ) : (
          <button
            type="button"
            onClick={onOpenKycTab}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#ECFDF3] text-[#027A48] border border-[#12B76A]/40 hover:bg-[#D1FADF] transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#12B76A]" />
            <span>Verify Aadhaar (+Badge)</span>
          </button>
        )}

        {/* PAN Badge / Action */}
        {user?.pan_verified ? (
          <VerificationBadge type="pan" status="VERIFIED" />
        ) : (
          <button
            type="button"
            onClick={onOpenKycTab}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#EFF8FF] text-[#175CD3] border border-[#84CAFF] hover:bg-[#D1E9FF] transition-all cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#2E90FA]" />
            <span>Verify PAN (+50 pts & Badge)</span>
          </button>
        )}

        {/* Financial & Credit Insights Button */}
        <button
          type="button"
          onClick={onOpenCreditModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#171923] text-white hover:bg-[#344054] transition-all cursor-pointer shadow-xs"
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#A4BCFD]" />
          <span>Credit & Financial Insights</span>
        </button>
      </div>
    </div>
  );
};

export default IdentityVerificationBanner;

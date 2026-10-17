import React from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import type { User } from '../../../types';

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
  const isAadhaarVerified = Boolean(user?.aadhaar_verified);
  const isPanVerified = Boolean(user?.pan_verified);
  const isFullVerified = isAadhaarVerified && isPanVerified;

  return (
    <section className="bg-white rounded-2xl border border-[#e7e5e4] p-5 custom-card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-[#0c0a09] text-base">Identity Verification & Badges</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>{' '}
              {isFullVerified ? '100% Verified' : isAadhaarVerified || isPanVerified ? 'Partially Verified' : 'Action Required'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs">
            <span
              onClick={onOpenKycTab}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer transition-colors ${
                isAadhaarVerified
                  ? 'bg-[#f8fafc] text-[#0c0a09] border-[#e7e5e4]'
                  : 'bg-[#fff7ed] text-[#b4552d] border-[#fed7aa] hover:bg-[#ffedd5]'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isAadhaarVerified ? 'text-[#059669]' : 'text-[#b4552d]'}`} />
              <span>Aadhaar: {isAadhaarVerified ? 'Verified (DigiLocker)' : 'Pending Verification'}</span>
            </span>

            <span
              onClick={onOpenKycTab}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer transition-colors ${
                isPanVerified
                  ? 'bg-[#f8fafc] text-[#0c0a09] border-[#e7e5e4]'
                  : 'bg-[#fff7ed] text-[#b4552d] border-[#fed7aa] hover:bg-[#ffedd5]'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isPanVerified ? 'text-[#059669]' : 'text-[#b4552d]'}`} />
              <span>PAN: {isPanVerified ? 'Verified (Income Tax Registry)' : 'Pending Verification'}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenCreditModal}
          className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0c0a09] text-xs font-bold border border-[#e7e5e4] transition-colors cursor-pointer shadow-2xs"
        >
          <span>Credit & Financial Insights</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};

export default IdentityVerificationBanner;

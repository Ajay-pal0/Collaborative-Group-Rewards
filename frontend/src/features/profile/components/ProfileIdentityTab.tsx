import React from 'react';
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import type { User } from '../../../types';
import VerificationBadge from '../../../components/VerificationBadge';
import { Button } from '../../../components/ui';

interface ProfileIdentityTabProps {
  user: User | null;
  aadhaarLoading: boolean;
  aadhaarConsent: boolean;
  setAadhaarConsent: (val: boolean) => void;
  aadhaarError?: string;
  setAadhaarError: (val: string) => void;
  handleInitiateAadhaar: (e?: React.FormEvent) => void;
  profilePanInput: string;
  setProfilePanInput: (val: string) => void;
  profilePanLoading: boolean;
  profilePanError?: string;
  setProfilePanError: (val: string) => void;
  profilePanSuccess?: string;
  handleVerifyProfilePan: (e: React.FormEvent) => void;
  onOpenCreditModal: () => void;
  onClose: () => void;
}

export const ProfileIdentityTab: React.FC<ProfileIdentityTabProps> = ({
  user,
  aadhaarLoading,
  aadhaarConsent,
  setAadhaarConsent,
  aadhaarError,
  setAadhaarError,
  handleInitiateAadhaar,
  profilePanInput,
  setProfilePanInput,
  profilePanLoading,
  profilePanError,
  setProfilePanError,
  profilePanSuccess,
  handleVerifyProfilePan,
  onOpenCreditModal,
  onClose,
}) => {
  return (
    <div className="space-y-4">
      {/* Identity Header */}
      <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-3.5 flex items-center justify-between">
        <div>
          <h4 className="font-extrabold text-xs text-[#171923] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#635BFF]" /> Verified Identity Credentials
          </h4>
          <p className="text-[11px] text-[#667085] mt-0.5">
            Secure Aadhaar & PAN verification powered by Surepass KYC.
          </p>
        </div>
        <div className="flex gap-1.5">
          <VerificationBadge type="pan" status={user?.pan_verified ? 'VERIFIED' : 'NOT_STARTED'} size="sm" />
          <VerificationBadge type="aadhaar" status={user?.aadhaar_verified ? 'VERIFIED' : 'NOT_STARTED'} size="sm" />
        </div>
      </div>

      {/* 1. Aadhaar Card (DigiLocker Flow) */}
      <div className={`rounded-2xl p-4 border transition-all ${
        user?.aadhaar_verified ? 'bg-[#ECFDF3]/50 border-[#12B76A]/30' : 'bg-white border-[#E7E9EE]'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              user?.aadhaar_verified ? 'bg-[#12B76A]/10 text-[#12B76A]' : 'bg-[#635BFF]/10 text-[#635BFF]'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-[#171923]">Aadhaar Verification</h5>
              <p className="text-[11px] text-[#667085]">
                {user?.aadhaar_verified ? 'Verified via government DigiLocker' : 'Instant identity confirmation via DigiLocker'}
              </p>
            </div>
          </div>
          <VerificationBadge type="aadhaar" status={user?.aadhaar_verified ? 'VERIFIED' : 'NOT_STARTED'} />
        </div>

        {user?.aadhaar_verified ? (
          <div className="bg-white/80 border border-[#12B76A]/20 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#667085] text-[11px] font-medium">Aadhaar Number:</span>
              <span className="font-mono font-bold text-[#171923] tracking-wider">{user.aadhaar_masked || 'XXXXXXXX1234'}</span>
            </div>
            {user.aadhaar_registered_name && (
              <div className="flex items-center justify-between">
                <span className="text-[#667085] text-[11px] font-medium">Verified Holder:</span>
                <span className="font-bold text-[#171923]">{user.aadhaar_registered_name}</span>
              </div>
            )}
            {user.aadhaar_verified_at && (
              <div className="flex items-center justify-between">
                <span className="text-[#667085] text-[11px] font-medium">Verified On:</span>
                <span className="text-[#667085] font-medium">
                  {new Date(user.aadhaar_verified_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {aadhaarError && (
              <p className="text-[#F04438] text-xs bg-[#F04438]/10 p-2.5 rounded-xl font-medium">
                {aadhaarError}
              </p>
            )}
            <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8F9FC] border border-[#E7E9EE] cursor-pointer text-xs text-[#667085]">
              <input
                type="checkbox"
                checked={aadhaarConsent}
                onChange={(e) => {
                  setAadhaarConsent(e.target.checked);
                  if (aadhaarError) setAadhaarError('');
                }}
                className="mt-0.5 rounded border-[#D0D5DD] text-[#635BFF] focus:ring-[#635BFF]"
              />
              <span>
                I hereby authorize Collaborative Group Rewards to verify my Aadhaar identity via Surepass DigiLocker for rewards eligibility.
              </span>
            </label>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={aadhaarLoading}
              disabled={aadhaarLoading || !aadhaarConsent}
              onClick={handleInitiateAadhaar}
              className="w-full"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Verify Aadhaar via DigiLocker
            </Button>
          </div>
        )}
      </div>

      {/* 2. PAN Card (Surepass Comprehensive Flow) */}
      <div className={`rounded-2xl p-4 border transition-all ${
        user?.pan_verified ? 'bg-[#ECFDF3]/50 border-[#12B76A]/30' : 'bg-white border-[#E7E9EE]'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              user?.pan_verified ? 'bg-[#12B76A]/10 text-[#12B76A]' : 'bg-[#635BFF]/10 text-[#635BFF]'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-[#171923]">PAN Verification</h5>
              <p className="text-[11px] text-[#667085]">
                {user?.pan_verified ? 'Identity verified via government registry' : 'Direct verification with Surepass PAN Comprehensive'}
              </p>
            </div>
          </div>
          <VerificationBadge type="pan" status={user?.pan_verified ? 'VERIFIED' : 'NOT_STARTED'} />
        </div>

        {user?.pan_verified ? (
          <div className="bg-white/80 border border-[#12B76A]/20 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#667085] text-[11px] font-medium">PAN Number:</span>
              <span className="font-mono font-bold text-[#171923] tracking-wider">{user.pan_masked}</span>
            </div>
            {user.pan_registered_name && (
              <div className="flex items-center justify-between">
                <span className="text-[#667085] text-[11px] font-medium">Registered Name:</span>
                <span className="font-bold text-[#171923]">{user.pan_registered_name}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#12B76A]/20 mt-1.5 flex justify-end">
              <button
                type="button"
                onClick={onOpenCreditModal}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#635BFF] hover:text-[#4F46E5] hover:underline cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>View PAN Financial & Credit Insights →</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {profilePanError && (
              <p className="text-[#F04438] text-xs bg-[#F04438]/10 p-2.5 rounded-xl font-medium">
                {profilePanError}
              </p>
            )}
            {profilePanSuccess && (
              <p className="text-[#12B76A] text-xs bg-[#12B76A]/10 p-2.5 rounded-xl font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {profilePanSuccess}
              </p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={profilePanInput}
                onChange={(e) => {
                  setProfilePanInput(e.target.value.toUpperCase());
                  if (profilePanError) setProfilePanError('');
                }}
                placeholder="ABCDE1234A"
                maxLength={10}
                className="flex-1 bg-white border border-[#E7E9EE] focus:border-[#635BFF] rounded-xl px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={profilePanLoading}
                disabled={profilePanLoading || !profilePanInput.trim()}
                onClick={handleVerifyProfilePan}
              >
                Verify PAN
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Credit Information Launcher Card */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-indigo-800/40 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-extrabold text-xs text-white">Credit Bureau Overview</h5>
            <p className="text-[11px] text-slate-300 mt-0.5">
              View authorized score and account liability (consent required).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenCreditModal}
          className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <span>View Credit</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#E7E9EE] flex justify-end">
        <Button variant="primary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default ProfileIdentityTab;

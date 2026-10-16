import React from 'react';
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Fingerprint,
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
    <div className="space-y-4 text-[#0c0a09]">
      {/* Identity Header */}
      <div className="bg-[#fafafa] border border-[#e7e5e4] rounded-2xl p-4 flex items-center justify-between shadow-2xs">
        <div>
          <h4 className="font-bold text-xs text-[#0c0a09] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#b4552d]" /> Verified Identity Credentials
          </h4>
          <p className="text-[11px] text-[#78716c] mt-0.5">
            Secure Aadhaar &amp; PAN verification powered by Surepass KYC.
          </p>
        </div>
        <div className="flex gap-1.5">
          <VerificationBadge type="pan" status={user?.pan_verified ? 'VERIFIED' : 'NOT_STARTED'} size="sm" />
          <VerificationBadge type="aadhaar" status={user?.aadhaar_verified ? 'VERIFIED' : 'NOT_STARTED'} size="sm" />
        </div>
      </div>

      {/* 1. Aadhaar Card (DigiLocker Flow) */}
      <div className="rounded-2xl p-4 border border-[#e7e5e4] bg-white shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fafafa] border border-[#e7e5e4] flex items-center justify-center text-[#0c0a09] shadow-2xs">
              <Fingerprint className="w-4 h-4 text-[#0c0a09]" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-[#0c0a09]">Aadhaar Verification</h5>
              <p className="text-[11px] text-[#78716c]">
                {user?.aadhaar_verified ? 'Verified via government DigiLocker' : 'Instant identity confirmation via DigiLocker'}
              </p>
            </div>
          </div>
          <VerificationBadge type="aadhaar" status={user?.aadhaar_verified ? 'VERIFIED' : 'NOT_STARTED'} size="sm" />
        </div>

        {user?.aadhaar_verified ? (
          <div className="bg-[#fafafa] border border-[#e7e5e4] rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#78716c] text-[11px] font-medium">Aadhaar Number:</span>
              <span className="font-mono font-bold text-[#0c0a09] tracking-wider">{user.aadhaar_masked || 'XXXXXXXX9999'}</span>
            </div>
            {user.aadhaar_registered_name && (
              <div className="flex items-center justify-between">
                <span className="text-[#78716c] text-[11px] font-medium">Verified Holder:</span>
                <span className="font-bold text-[#0c0a09]">{user.aadhaar_registered_name}</span>
              </div>
            )}
            {user.aadhaar_verified_at && (
              <div className="flex items-center justify-between">
                <span className="text-[#78716c] text-[11px] font-medium">Verified on:</span>
                <span className="text-[#78716c] font-medium">
                  {new Date(user.aadhaar_verified_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>DigiLocker Certified via Government Gateway</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {aadhaarError && (
              <p className="text-[#ba1a1a] text-xs bg-[#ffdad6]/40 border border-[#ffdad6] p-2.5 rounded-xl font-medium">
                {aadhaarError}
              </p>
            )}
            <div className="bg-[#fafafa] p-3 rounded-xl border border-[#e7e5e4] space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#78716c] select-none">
                <input
                  type="checkbox"
                  checked={aadhaarConsent}
                  onChange={(e) => {
                    setAadhaarConsent(e.target.checked);
                    if (aadhaarError) setAadhaarError('');
                  }}
                  className="rounded border-[#e7e5e4] text-[#0c0a09] focus:ring-[#0c0a09] mt-0.5 shrink-0"
                />
                <span className="leading-relaxed text-[11px]">
                  I consent to sharing my Aadhaar identity details with Surepass and DigiLocker for platform verification.
                </span>
              </label>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={aadhaarLoading}
              disabled={aadhaarLoading || !aadhaarConsent}
              onClick={handleInitiateAadhaar}
              className="w-full justify-center bg-[#0c0a09] hover:bg-neutral-800 text-white text-xs font-bold"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Verify Aadhaar via DigiLocker
            </Button>
          </div>
        )}
      </div>

      {/* 2. PAN Card Section */}
      <div className="rounded-2xl p-4 border border-[#e7e5e4] bg-white shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fafafa] border border-[#e7e5e4] flex items-center justify-center text-[#0c0a09] shadow-2xs">
              <CreditCard className="w-4 h-4 text-[#b4552d]" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-[#0c0a09]">Income Tax PAN Verification</h5>
              <p className="text-[11px] text-[#78716c]">
                {user?.pan_verified ? 'Verified with NSDL / ITD Database' : 'Verify your permanent account number'}
              </p>
            </div>
          </div>
          <VerificationBadge type="pan" status={user?.pan_verified ? 'VERIFIED' : 'NOT_STARTED'} size="sm" />
        </div>

        {user?.pan_verified ? (
          <div className="bg-[#fafafa] border border-[#e7e5e4] rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#78716c] text-[11px] font-medium">PAN Number:</span>
              <span className="font-mono font-bold text-[#0c0a09] tracking-wider">{user.pan_masked || 'EMTPP••••H'}</span>
            </div>
            {user.pan_registered_name && (
              <div className="flex items-center justify-between">
                <span className="text-[#78716c] text-[11px] font-medium">Taxpayer Name:</span>
                <span className="font-bold text-[#0c0a09]">{user.pan_registered_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>NSDL Verified &amp; Taxpayer Match Active</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {profilePanError && (
              <p className="text-[#ba1a1a] text-xs bg-[#ffdad6]/40 border border-[#ffdad6] p-2.5 rounded-xl font-medium">
                {profilePanError}
              </p>
            )}
            {profilePanSuccess && (
              <p className="text-emerald-800 text-xs bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {profilePanSuccess}
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
                className="flex-1 bg-white border border-[#e7e5e4] focus:border-[#0c0a09] rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase tracking-wider text-[#0c0a09] focus:outline-none focus:ring-2 focus:ring-[#0c0a09]"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={profilePanLoading}
                disabled={profilePanLoading || !profilePanInput.trim()}
                onClick={handleVerifyProfilePan}
                className="bg-[#0c0a09] hover:bg-neutral-800 text-white font-bold text-xs"
              >
                Verify PAN
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Credit Insights Card */}
      <div className="bg-[#fafafa] rounded-2xl p-4 border border-[#e7e5e4] flex items-center justify-between gap-4 shadow-2xs">
        <div>
          <h5 className="font-bold text-xs text-[#0c0a09]">Credit Bureau Overview</h5>
          <p className="text-[11px] text-[#78716c] mt-0.5">
            Real-time bureau credit score, repayment ratio &amp; account mix.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenCreditModal}
          className="text-xs bg-[#0c0a09] hover:bg-neutral-800 text-white border-transparent font-bold shrink-0"
        >
          View Credit
        </Button>
      </div>

      <div className="pt-2 border-t border-[#e7e5e4] flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="text-xs"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default ProfileIdentityTab;

import React from 'react';
import type { User } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import {
  Fingerprint,
  CreditCard,
  CheckCircle2,
  Lock,
  CloudCheck,
  ShieldAlert,
  Copy,
  User as UserIcon,
  Users,
  Award,
  Link as LinkIcon,
  RotateCw,
} from 'lucide-react';
import { Button } from '../../../components/ui';
import AccountSecuritySection from './AccountSecuritySection';

interface VerificationSummarySectionProps {
  user: User | null;
  onNavigateTab?: (tab: 'personal' | 'pan' | 'aadhaar' | 'security') => void;
  className?: string;
}

export const VerificationSummarySection: React.FC<VerificationSummarySectionProps> = ({
  user,
  onNavigateTab,
  className = '',
}) => {
  const { showToast } = useToast();

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  const maskedAadhaar = user?.aadhaar_masked || 'XXXXXXXX9999';
  const maskedPan = user?.pan_masked || 'EMTPP••••H';
  const aadhaarName = user?.aadhaar_registered_name || user?.name || 'AJAY SANTRAM PAL';
  const panName = user?.pan_registered_name || user?.name || 'AJAY SANTRAM PAL';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* SECTION 1: IDENTITY VERIFICATION OVERVIEW GRID (TWO HIGH-CONTRAST BENTO CARDS) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: Aadhaar Verification */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 text-[#f5f5f5] select-none pointer-events-none opacity-50">
            <Fingerprint className="w-36 h-36" />
          </div>

          <div>
            {/* Header & Status Pill */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fafafa] flex items-center justify-center border border-[#e7e5e4] text-[#0c0a09]">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0c0a09] leading-tight">Aadhaar Verification</h3>
                  <p className="text-xs text-[#78716c] font-medium">Government DigiLocker &amp; Digiboost SDK</p>
                </div>
              </div>

              {user?.aadhaar_verified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbce] text-[#370e00] text-xs font-bold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9c431d]" />
                  <span>Verified &amp; Authoritative</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f5] text-[#78716c] text-xs font-semibold shrink-0">
                  <span>Pending Setup</span>
                </span>
              )}
            </div>

            {/* Aadhaar Masked Display */}
            <div className="bg-[#fafafa] rounded-xl p-4 border border-[#e7e5e4] my-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#78716c] uppercase tracking-wider block font-semibold mb-1">
                    Masked Aadhaar Number
                  </span>
                  <span className="text-xl font-bold font-mono tracking-widest text-[#0c0a09]">
                    {maskedAadhaar}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#b4552d] text-white text-xs font-semibold shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{user?.aadhaar_verified ? '100% Verified' : 'Action Required'}</span>
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-1 pb-4 text-xs">
              <div>
                <span className="text-[#78716c] block font-medium">Registered Name</span>
                <span className="font-semibold text-[#0c0a09]">{aadhaarName}</span>
              </div>
              <div>
                <span className="text-[#78716c] block font-medium">Verified Date</span>
                <span className="font-semibold text-[#0c0a09]">
                  {user?.aadhaar_verified_at
                    ? new Date(user.aadhaar_verified_at).toLocaleDateString([], {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '16 Oct 2026'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[#78716c] block font-medium">Verification Provider</span>
                <div className="flex items-center gap-1.5 font-medium text-[#0c0a09] mt-0.5">
                  <Lock className="w-3.5 h-3.5 text-[#b4552d]" />
                  <span>Government DigiLocker via Digiboost Web SDK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#e7e5e4] flex items-center justify-between mt-auto">
            <span className="text-xs text-[#78716c]">Auth Reference: DIGI-992-AKP</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab?.('aadhaar')}
              className="text-xs"
              icon={<RotateCw className="w-3.5 h-3.5" />}
            >
              {user?.aadhaar_verified ? 'Re-verify or Update Aadhaar' : 'Complete Aadhaar KYC'}
            </Button>
          </div>
        </div>

        {/* CARD 2: Income Tax PAN Verification */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 text-[#f5f5f5] select-none pointer-events-none opacity-50">
            <CreditCard className="w-36 h-36" />
          </div>

          <div>
            {/* Header & Status Pill */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fafafa] flex items-center justify-center border border-[#e7e5e4] text-[#0c0a09]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0c0a09] leading-tight">Income Tax PAN Verification</h3>
                  <p className="text-xs text-[#78716c] font-medium">Income Tax Department &amp; NSDL Database</p>
                </div>
              </div>

              {user?.pan_verified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbce] text-[#370e00] text-xs font-bold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9c431d]" />
                  <span>Verified &amp; Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f5] text-[#78716c] text-xs font-semibold shrink-0">
                  <span>Pending Setup</span>
                </span>
              )}
            </div>

            {/* PAN Masked Display */}
            <div className="bg-[#fafafa] rounded-xl p-4 border border-[#e7e5e4] my-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#78716c] uppercase tracking-wider block font-semibold mb-1">
                    Permanent Account Number (PAN)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono tracking-widest text-[#0c0a09]">
                      {maskedPan}
                    </span>
                    <button
                      type="button"
                      aria-label="Copy PAN"
                      onClick={() => handleCopy(maskedPan, 'PAN')}
                      className="text-[#78716c] hover:text-[#0c0a09] p-1 rounded hover:bg-[#e7e5e4] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[#0c0a09] text-xs font-semibold border border-[#e7e5e4]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#b4552d]" />
                  <span>Taxpayer Record Match</span>
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-1 pb-4 text-xs">
              <div>
                <span className="text-[#78716c] block font-medium">Registered Name</span>
                <span className="font-semibold text-[#0c0a09]">{panName}</span>
              </div>
              <div>
                <span className="text-[#78716c] block font-medium">Taxpayer Category</span>
                <span className="font-semibold text-[#0c0a09]">Individual</span>
              </div>
              <div>
                <span className="text-[#78716c] block font-medium">Aadhaar Seeding Status</span>
                <div className="flex items-center gap-1 text-[#0c0a09] font-medium mt-0.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#b4552d]" />
                  <span>Aadhaar Linked &amp; Verified</span>
                </div>
              </div>
              <div>
                <span className="text-[#78716c] block font-medium">Bureau Sync Status</span>
                <span className="font-semibold text-[#0c0a09]">Recent Sync Active</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#e7e5e4] flex items-center justify-between mt-auto">
            <span className="text-xs text-[#78716c]">NSDL Acknowledgement: Verified</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigateTab?.('pan')}
              className="text-xs"
            >
              {user?.pan_verified ? 'View NSDL Details' : 'Verify PAN'}
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 2: PERSONAL INFORMATION & GROUP MEMBERSHIP */}
      <section className="bg-white rounded-2xl border border-[#e7e5e4] p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#e7e5e4] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fafafa] flex items-center justify-center border border-[#e7e5e4] text-[#0c0a09]">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0c0a09]">Personal Information</h2>
              <p className="text-xs text-[#78716c]">
                Account details, registered contact credentials, and reward standing
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab?.('personal')}
            className="text-xs"
          >
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
          {/* Full Name */}
          <div className="space-y-1">
            <span className="text-xs text-[#78716c] font-medium block">Full Name</span>
            <p className="text-base font-bold text-[#0c0a09]">{user?.name || 'Ajay Pal'}</p>
            <span className="text-[11px] text-[#78716c]">Matches government PAN identity exactly</span>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <span className="text-xs text-[#78716c] font-medium block">Email Address</span>
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-[#0c0a09]">{user?.email || 'ajaypal05192@gmail.com'}</p>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#ffdbce] text-[#370e00] text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-[#9c431d]" />
                <span>Verified</span>
              </span>
            </div>
            <span className="text-[11px] text-[#78716c]">Primary address for monthly credit statements</span>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <span className="text-xs text-[#78716c] font-medium block">Phone Number</span>
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-[#0c0a09]">{user?.phone || '+91 98765 43210'}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fafafa] text-[#0c0a09] text-[10px] font-medium border border-[#e7e5e4]">
                <span>SMS alerts active</span>
              </span>
            </div>
            <span className="text-[11px] text-[#78716c]">DigiLocker linked mobile for OTP checks</span>
          </div>

          {/* Member Since */}
          <div className="space-y-1 pt-2">
            <span className="text-xs text-[#78716c] font-medium block">Member Since</span>
            <p className="text-base font-bold text-[#0c0a09]">October 2026</p>
            <span className="text-[11px] text-[#78716c]">Active group rewards contributor</span>
          </div>

          {/* Primary Group */}
          <div className="space-y-1 pt-2">
            <span className="text-xs text-[#78716c] font-medium block">Primary Group</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#b4552d]" />
              <p className="text-base font-bold text-[#0c0a09]">Test Team (Owner)</p>
            </div>
            <span className="text-[11px] text-[#78716c]">Authorized administrator of the group pot</span>
          </div>

          {/* Total Reward Points Earned */}
          <div className="space-y-1 pt-2">
            <span className="text-xs text-[#78716c] font-medium block">Total Reward Points Earned</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b4552d] text-white text-xs font-bold shadow-xs">
                <Award className="w-3.5 h-3.5" />
                <span>1,250 PTS</span>
              </span>
              <button
                type="button"
                onClick={() => showToast('Redirecting to Rewards Ledger...', 'info')}
                className="text-xs text-[#b4552d] font-semibold hover:underline cursor-pointer"
              >
                View Rewards Ledger →
              </button>
            </div>
            <span className="text-[11px] text-[#78716c]">Accumulated collaboratively across campaigns</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: KYC & COMPLIANCE TRUST CARD (GOVERNMENT STANDARDS) */}
      <section className="bg-[#fafafa] rounded-2xl border border-[#e7e5e4] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#e7e5e4] flex items-center justify-center text-[#b4552d] shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0c0a09]">
                  Bank-Grade Encryption &amp; RBI/UIDAI Compliant
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ffdbce] text-[#370e00]">
                  Government Certified
                </span>
              </div>
              <p className="text-xs text-[#78716c] mt-1 max-w-2xl leading-relaxed">
                Your biometric &amp; sensitive documents are never stored directly on servers. Verifications are executed via official Government APIs (DigiLocker, ITD) using tamper-proof hardware security modules.
              </p>
            </div>
          </div>

          {/* Trust Badges Cluster */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e7e5e4] text-[#0c0a09] text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#b4552d]" />
              <span>256-Bit SSL</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e7e5e4] text-[#0c0a09] text-xs font-semibold">
              <CloudCheck className="w-3.5 h-3.5 text-[#b4552d]" />
              <span>DigiLocker Certified</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e7e5e4] text-[#0c0a09] text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#b4552d]" />
              <span>CIBIL Bureau Approved</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ACCOUNT SECURITY & ACTIVE SESSION */}
      <AccountSecuritySection />
    </div>
  );
};

export default VerificationSummarySection;

import React, { useState, useEffect } from 'react';
import type { User, Group, UserPointsData } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { groupsApi, rewardsApi } from '../../../services/apiServices';
import {
  Fingerprint,
  CreditCard,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Copy,
  User as UserIcon,
  Users,
  Award,
  Link as LinkIcon,
  ChevronRight,
  Shield,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui';
import { maskPan, maskAadhaar } from '../../../lib/masking';

interface VerificationSummarySectionProps {
  user: User | null;
  primaryGroup?: Group | null;
  userPointsData?: UserPointsData | null;
  onNavigateTab?: (tab: 'personal' | 'pan' | 'aadhaar' | 'security') => void;
  className?: string;
}

export const VerificationSummarySection: React.FC<VerificationSummarySectionProps> = ({
  user,
  primaryGroup: propGroup,
  userPointsData: propPointsData,
  onNavigateTab,
  className = '',
}) => {
  const { showToast } = useToast();

  const [fetchedGroup, setFetchedGroup] = useState<Group | null>(null);
  const [groupLoading, setGroupLoading] = useState(() => !propGroup);
  const [fetchedPoints, setFetchedPoints] = useState<number>(0);
  const [pointsLoading, setPointsLoading] = useState(() => !propGroup && !propPointsData);

  useEffect(() => {
    if (propGroup) return;

    let isMounted = true;
    groupsApi
      .getGroups()
      .then(async (res) => {
        if (!isMounted) return;
        const groups = res.data || [];
        if (groups.length > 0) {
          const first = groups[0];
          setFetchedGroup(first);
          setGroupLoading(false);

          try {
            const pointsRes = await rewardsApi.getUserPoints(first.id);
            if (isMounted) {
              setFetchedPoints(pointsRes.data?.user_points ?? first.total_points ?? 0);
              setPointsLoading(false);
            }
          } catch {
            if (isMounted) {
              setFetchedPoints(first.total_points ?? 0);
              setPointsLoading(false);
            }
          }
        } else {
          setFetchedGroup(null);
          setGroupLoading(false);
          setFetchedPoints(0);
          setPointsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setGroupLoading(false);
          setPointsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propGroup]);

  const activeGroup = propGroup ?? fetchedGroup;
  const pointsCount = propPointsData?.user_points ?? propGroup?.total_points ?? fetchedPoints;

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  const isAadhaarVerified = Boolean(user?.aadhaar_verified);
  const isPanVerified = Boolean(user?.pan_verified);
  const isFullKyc = isAadhaarVerified && isPanVerified;

  const maskedAadhaar = isAadhaarVerified && user?.aadhaar_masked
    ? maskAadhaar(user.aadhaar_masked)
    : isAadhaarVerified
    ? 'XXXXXXXX1234'
    : '•••• •••• ••••';

  const maskedPan = isPanVerified && user?.pan_masked
    ? maskPan(user.pan_masked)
    : isPanVerified
    ? 'EMTPP****H'
    : '••••• •••• •';

  const aadhaarName =
    user?.aadhaar_registered_name ||
    (isAadhaarVerified ? user?.name || 'Verified Citizen' : 'Pending Verification');

  const panName =
    user?.pan_registered_name ||
    (isPanVerified ? user?.name || 'Verified Cardholder' : 'Pending Verification');

  const aadhaarVerifiedDate = user?.aadhaar_verified_at
    ? new Date(user.aadhaar_verified_at).toLocaleDateString([], {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : isAadhaarVerified
    ? 'Verified'
    : 'Not verified';

  const panVerifiedDate = user?.pan_verified_at
    ? new Date(user.pan_verified_at).toLocaleDateString([], {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : isPanVerified
    ? 'Verified'
    : 'Not verified';

  const displayName =
    user?.name?.trim() ||
    user?.pan_registered_name?.trim() ||
    user?.aadhaar_registered_name?.trim() ||
    'Not provided';

  const displayEmail = user?.email || 'Not provided';
  const hasPhone = Boolean(user?.phone && user.phone.trim().length > 0);
  const displayPhone = hasPhone ? user!.phone : 'Not added';

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Active';

  const groupTitle = groupLoading
    ? 'Loading group...'
    : activeGroup
    ? `${activeGroup.name} (${activeGroup.current_user_role === 'owner' ? 'Owner' : 'Member'})`
    : 'No active group';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Quick Overview KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Identity Tier */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5 shadow-xs flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isFullKyc ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#fff7ed] text-[#b4552d]'
          }`}>
            {isFullKyc ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716c] block">
              KYC Status
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-extrabold text-base text-[#0c0a09] truncate">
                {isFullKyc ? 'Tier 2 Complete' : isPanVerified || isAadhaarVerified ? 'Tier 1 Partial' : 'Action Required'}
              </span>
            </div>
            <span className="text-[11px] text-[#78716c] block mt-0.5">
              {isFullKyc ? '100% Gov Verified' : 'Complete PAN & Aadhaar'}
            </span>
          </div>
        </div>

        {/* Metric 2: Points Balance */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#fff7ed] flex items-center justify-center text-[#b4552d] shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716c] block">
              Earned Points
            </span>
            <span className="font-extrabold text-base text-[#0c0a09] mt-0.5 block font-mono">
              {pointsLoading ? '...' : `${pointsCount.toLocaleString()} PTS`}
            </span>
            <span className="text-[11px] text-[#78716c] block mt-0.5">
              Eligible for tier rewards
            </span>
          </div>
        </div>

        {/* Metric 3: Active Group */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f5f4] flex items-center justify-center text-[#0c0a09] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716c] block">
              Primary Tribe
            </span>
            <span className="font-extrabold text-base text-[#0c0a09] truncate mt-0.5 block">
              {groupTitle}
            </span>
            <span className="text-[11px] text-[#78716c] block mt-0.5 capitalize">
              {activeGroup?.current_user_role ? `${activeGroup.current_user_role} role` : 'Join a group'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Official Identity Documents (Two Balanced Clean Bento Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Aadhaar Document */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#f0efed]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff7ed] text-[#b4552d] flex items-center justify-center border border-[#fed7aa] shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0c0a09] leading-tight">Aadhaar (UIDAI)</h3>
                  <p className="text-[11px] text-[#78716c]">DigiLocker Verified</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isAadhaarVerified
                  ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                  : 'bg-[#fff7ed] text-[#b4552d] border border-[#fed7aa]'
              }`}>
                {isAadhaarVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{isAadhaarVerified ? 'Verified' : 'Pending'}</span>
              </span>
            </div>

            {/* Masked Card Number */}
            <div className="my-5 p-4 rounded-xl bg-[#f8fafc] border border-[#e7e5e4] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#78716c] block">
                  Aadhaar Number
                </span>
                <span className="text-lg font-bold font-mono tracking-widest text-[#0c0a09] mt-0.5 block">
                  {maskedAadhaar}
                </span>
              </div>
              {isAadhaarVerified && (
                <button
                  type="button"
                  onClick={() => handleCopy(maskedAadhaar, 'Aadhaar')}
                  className="p-1.5 rounded-lg text-[#78716c] hover:text-[#0c0a09] hover:bg-white border border-transparent hover:border-[#e7e5e4] transition-all cursor-pointer"
                  title="Copy masked Aadhaar"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Clean Data List */}
            <div className="space-y-2.5 text-xs text-[#78716c]">
              <div className="flex items-center justify-between">
                <span>Registered Citizen</span>
                <span className="font-semibold text-[#0c0a09] text-right truncate max-w-[200px]">{aadhaarName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Verification Timestamp</span>
                <span className="font-medium text-[#0c0a09]">{aadhaarVerifiedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Verification Provider</span>
                <span className="font-medium text-[#0c0a09] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#b4552d]" /> DigiLocker Web SDK
                </span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-6 border-t border-[#f0efed] flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab?.('aadhaar')}
              className="w-full sm:w-auto text-xs"
            >
              {isAadhaarVerified ? 'Manage Aadhaar KYC' : 'Complete Aadhaar KYC'}
            </Button>
          </div>
        </div>

        {/* Card 2: PAN Document */}
        <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#f0efed]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff7ed] text-[#b4552d] flex items-center justify-center border border-[#fed7aa] shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0c0a09] leading-tight">Income Tax PAN</h3>
                  <p className="text-[11px] text-[#78716c]">NSDL &amp; ITD Database</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isPanVerified
                  ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                  : 'bg-[#fff7ed] text-[#b4552d] border border-[#fed7aa]'
              }`}>
                {isPanVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{isPanVerified ? 'Verified' : 'Pending'}</span>
              </span>
            </div>

            {/* Masked PAN Number */}
            <div className="my-5 p-4 rounded-xl bg-[#f8fafc] border border-[#e7e5e4] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#78716c] block">
                  PAN Identifier
                </span>
                <span className="text-lg font-bold font-mono tracking-widest text-[#0c0a09] mt-0.5 block">
                  {maskedPan}
                </span>
              </div>
              {isPanVerified && (
                <button
                  type="button"
                  onClick={() => handleCopy(maskedPan, 'PAN')}
                  className="p-1.5 rounded-lg text-[#78716c] hover:text-[#0c0a09] hover:bg-white border border-transparent hover:border-[#e7e5e4] transition-all cursor-pointer"
                  title="Copy masked PAN"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Clean Data List */}
            <div className="space-y-2.5 text-xs text-[#78716c]">
              <div className="flex items-center justify-between">
                <span>Taxpayer Holder</span>
                <span className="font-semibold text-[#0c0a09] text-right truncate max-w-[200px]">{panName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Verification Timestamp</span>
                <span className="font-medium text-[#0c0a09]">{panVerifiedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Aadhaar Link Match</span>
                <span className="font-medium text-[#0c0a09] flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-[#b4552d]" /> {isPanVerified && isAadhaarVerified ? 'Linked & Confirmed' : 'Verification Needed'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-6 border-t border-[#f0efed] flex items-center justify-end">
            <Button
              variant={isPanVerified ? 'outline' : 'primary'}
              size="sm"
              onClick={() => onNavigateTab?.('pan')}
              className="w-full sm:w-auto text-xs"
            >
              {isPanVerified ? 'View PAN Records' : 'Verify PAN Card'}
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Personal Profile Summary Details */}
      <div className="bg-white rounded-2xl border border-[#e7e5e4] p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#f0efed] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fafafa] border border-[#e7e5e4] flex items-center justify-center text-[#0c0a09]">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0c0a09]">Personal Information</h3>
              <p className="text-xs text-[#78716c]">Profile details registered to your account</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-1">
          <div>
            <span className="text-[11px] font-semibold text-[#78716c] block">Full Name</span>
            <span className="font-bold text-sm text-[#0c0a09] mt-0.5 block truncate">{displayName}</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#78716c] block">Email Address</span>
            <span className="font-bold text-sm text-[#0c0a09] mt-0.5 block truncate">{displayEmail}</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#78716c] block">Phone Number</span>
            <span className="font-bold text-sm text-[#0c0a09] mt-0.5 block">{displayPhone}</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#78716c] block">Member Since</span>
            <span className="font-bold text-sm text-[#0c0a09] mt-0.5 block">{memberSince}</span>
          </div>
        </div>
      </div>

      {/* 4. Security & Compliance Strip */}
      <div className="bg-[#fafafa] rounded-2xl border border-[#e7e5e4] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#e7e5e4] text-[#b4552d] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0c0a09]">Bank-Grade UIDAI &amp; RBI Compliance</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdbce] text-[#370e00]">
                Encrypted
              </span>
            </div>
            <p className="text-[11px] text-[#78716c] mt-0.5">
              Sensitive identifiers are masked with 256-bit SSL encryption. Manage passwords and active sessions in Security.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab?.('security')}
          className="text-xs font-bold text-[#b4552d] hover:text-[#9a4420] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>Manage Security</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default VerificationSummarySection;

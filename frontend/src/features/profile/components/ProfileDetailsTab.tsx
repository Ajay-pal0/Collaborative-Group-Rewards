import React from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import type { User } from '../../../types';
import VerificationBadge from '../../../components/VerificationBadge';
import { Button, Input } from '../../../components/ui';

interface ProfileDetailsTabProps {
  user: User | null;
  name: string;
  setName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  loading: boolean;
  error?: string;
  successMsg?: string;
  handleSubmit: (e: React.FormEvent) => void;
  handleClose: () => void;
  profilePanInput: string;
  setProfilePanInput: (val: string) => void;
  profilePanLoading: boolean;
  profilePanError?: string;
  setProfilePanError: (val: string) => void;
  profilePanSuccess?: string;
  handleVerifyProfilePan: (e: React.FormEvent) => void;
  onOpenCreditModal?: () => void;
}

export const ProfileDetailsTab: React.FC<ProfileDetailsTabProps> = ({
  user,
  name,
  setName,
  phone,
  setPhone,
  loading,
  error,
  successMsg,
  handleSubmit,
  handleClose,
  profilePanInput,
  setProfilePanInput,
  profilePanLoading,
  profilePanError,
  setProfilePanError,
  profilePanSuccess,
  handleVerifyProfilePan,
  onOpenCreditModal,
}) => {
  const isPanVerified = Boolean(user?.pan_verified);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-[#F04438] text-xs bg-[#F04438]/10 p-3 rounded-xl font-medium">
          {error}
        </p>
      )}

      {successMsg && (
        <p className="text-[#12B76A] text-xs bg-[#12B76A]/10 p-3 rounded-xl font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </p>
      )}

      {/* PAN Verification Section */}
      <div className={`rounded-2xl p-4 border transition-all ${
        isPanVerified ? 'bg-[#ECFDF3]/50 border-[#12B76A]/30' : 'bg-white border-[#E7E9EE]'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              isPanVerified ? 'bg-[#12B76A]/10 text-[#12B76A]' : 'bg-[#635BFF]/10 text-[#635BFF]'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-[#171923]">PAN Verification</h5>
              <p className="text-[11px] text-[#667085]">
                {isPanVerified ? 'Identity verified via official registry' : 'Your PAN is not verified.'}
              </p>
            </div>
          </div>
          <VerificationBadge type="pan" status={isPanVerified ? 'VERIFIED' : 'NOT_STARTED'} />
        </div>

        {isPanVerified ? (
          <div className="bg-white/80 border border-[#12B76A]/20 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#667085] text-[11px] font-medium">PAN Number:</span>
              <span className="font-mono font-bold text-[#171923] tracking-wider">{user?.pan_masked || 'Verified'}</span>
            </div>
            {user?.pan_registered_name && (
              <div className="flex items-center justify-between">
                <span className="text-[#667085] text-[11px] font-medium">Name:</span>
                <span className="font-bold text-[#171923]">{user.pan_registered_name}</span>
              </div>
            )}
            {user?.pan_verified_at && (
              <div className="flex items-center justify-between">
                <span className="text-[#667085] text-[11px] font-medium">Verified on:</span>
                <span className="text-[#667085] font-medium">
                  {new Date(user.pan_verified_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
            {onOpenCreditModal && (
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
            )}
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

      {/* Reward Banner */}
      <div className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${
        isPanVerified
          ? 'bg-gradient-to-r from-[#5C4EFE]/10 to-[#635BFF]/10 border-[#635BFF]/30'
          : 'bg-[#FFF9F5] border-[#F79009]/40'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            isPanVerified ? 'bg-[#635BFF] text-white' : 'bg-[#F79009] text-white shadow-2xs'
          }`}>
            {isPanVerified ? (
              <Sparkles className="w-5 h-5 fill-white/20" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#171923] flex items-center gap-1.5">
              Profile Completion Bonus
              {!isPanVerified && (
                <span className="text-[10px] font-extrabold text-[#B54708] bg-[#FFFAEB] border border-[#FEDF89] px-2 py-0.5 rounded-full">
                  Locked
                </span>
              )}
            </h4>
            <p className="text-[11px] text-[#667085]">
              {isPanVerified
                ? 'Complete details to earn group points'
                : 'PAN verification required. Verify your PAN above to unlock this bonus.'}
            </p>
          </div>
        </div>
        <span className={`text-xs font-extrabold px-3 py-1 rounded-full shadow-xs ${
          isPanVerified
            ? 'text-[#635BFF] bg-white border border-[#635BFF]/30'
            : 'text-[#B54708] bg-[#FFFAEB] border border-[#FEDF89]'
        }`}>
          {isPanVerified ? '+50 pts' : 'Locked (+50 pts)'}
        </span>
      </div>

      <Input
        label="Full Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        maxLength={255}
        icon={<UserIcon className="w-4 h-4" />}
      />

      <Input
        label="Email Address"
        type="email"
        value={user?.email || ''}
        disabled
        icon={<Mail className="w-4 h-4" />}
      />

      <Input
        label="Phone Number (Optional)"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+1 234 567 8900"
        maxLength={32}
        icon={<Phone className="w-4 h-4" />}
      />

      {!isPanVerified && (
        <div className="bg-[#FFFAEB] border border-[#FEDF89] text-[#B54708] px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 font-medium">
          <Lock className="w-4 h-4 shrink-0 text-[#F79009]" />
          <span>
            Profile Completion Bonus can only be added once your PAN is verified. Please verify your PAN above.
          </span>
        </div>
      )}

      <div className="pt-3 flex justify-end gap-3 border-t border-[#E7E9EE]">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleClose}
        >
          Close
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={loading}
          disabled={loading || Boolean(successMsg) || !isPanVerified}
          title={!isPanVerified ? 'Please verify your PAN to claim this bonus' : ''}
        >
          Save Profile & Claim +50 pts
        </Button>
      </div>
    </form>
  );
};

export default ProfileDetailsTab;

import React from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Sparkles,
  CheckCircle2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import type { User } from '../../../types';
import { Button, Input } from '../../../components/ui';
import VerificationBadge from '../../../components/VerificationBadge';
import { maskPan } from '../../../lib/masking';

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
  profilePanInput?: string;
  setProfilePanInput?: (val: string) => void;
  profilePanLoading?: boolean;
  profilePanError?: string;
  setProfilePanError?: (val: string) => void;
  profilePanSuccess?: string;
  handleVerifyProfilePan?: (e: React.FormEvent) => void;
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
  profilePanInput = '',
  setProfilePanInput,
  profilePanLoading = false,
  profilePanError,
  setProfilePanError,
  profilePanSuccess,
  handleVerifyProfilePan,
}) => {
  const isPanVerified = Boolean(user?.pan_verified);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-[#0c0a09]">
      {error && (
        <p className="text-[#ba1a1a] text-xs bg-[#ffdad6]/40 border border-[#ffdad6] p-3 rounded-xl font-medium">
          {error}
        </p>
      )}

      {successMsg && (
        <p className="text-emerald-800 text-xs bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMsg}
        </p>
      )}

      {/* PAN Verification Section */}
      <div className="p-4 rounded-2xl border transition-all bg-[#fafafa] border-[#e7e5e4]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
              isPanVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-white text-[#0c0a09] border border-[#e7e5e4]'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#0c0a09]">PAN Verification</h4>
              <p className="text-[11px] text-[#78716c]">
                {isPanVerified
                  ? 'Identity verified with Income Tax Dept'
                  : 'Your PAN is not verified.'}
              </p>
            </div>
          </div>
          <VerificationBadge
            type="pan"
            status={isPanVerified ? 'VERIFIED' : 'NOT_STARTED'}
            size="sm"
          />
        </div>

        {isPanVerified ? (
          <div className="bg-white border border-[#e7e5e4] rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#78716c] text-[11px]">PAN Number:</span>
              <span className="font-mono font-bold text-[#0c0a09]">{maskPan(user?.pan_masked)}</span>
            </div>
            {user?.pan_registered_name && (
              <div className="flex items-center justify-between">
                <span className="text-[#78716c] text-[11px]">Registered Name:</span>
                <span className="font-bold text-[#0c0a09]">{user.pan_registered_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Identity verified via official registry</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
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
                  setProfilePanInput?.(e.target.value.toUpperCase());
                  if (profilePanError) setProfilePanError?.('');
                }}
                placeholder="ABCDE1234A"
                maxLength={10}
                className="flex-1 bg-white border border-[#e7e5e4] focus:border-[#0c0a09] rounded-xl px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-[#0c0a09] focus:outline-none focus:ring-1 focus:ring-[#0c0a09]"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                loading={profilePanLoading}
                disabled={profilePanLoading || !profilePanInput.trim()}
                onClick={handleVerifyProfilePan}
                className="bg-[#0c0a09] hover:bg-neutral-800 text-white text-xs font-bold"
              >
                Verify PAN
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Completion Bonus Callout */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
        isPanVerified
          ? 'bg-[#fafafa] border-[#e7e5e4]'
          : 'bg-[#fff7ed] border-[#fed7aa]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
            isPanVerified
              ? 'bg-white border-[#e7e5e4] text-[#b4552d]'
              : 'bg-white border-[#fed7aa] text-[#b4552d]'
          }`}>
            {isPanVerified ? (
              <Sparkles className="w-5 h-5 text-[#b4552d]" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#0c0a09] flex items-center gap-1.5">
              Profile Completion Bonus
              {!isPanVerified && (
                <span className="text-[10px] font-bold text-[#7c2d12] bg-[#ffedd5] border border-[#fed7aa] px-2 py-0.5 rounded-full">
                  Locked
                </span>
              )}
            </h4>
            <p className="text-[11px] text-[#78716c]">
              {isPanVerified
                ? 'Complete your profile details to earn group points.'
                : 'PAN verification required. Verify your PAN above to unlock this bonus.'}
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          isPanVerified
            ? 'text-[#0c0a09] bg-white border border-[#e7e5e4]'
            : 'text-[#7c2d12] bg-[#ffedd5] border border-[#fed7aa]'
        }`}>
          {isPanVerified ? '+50 pts' : 'Locked (+50 pts)'}
        </span>
      </div>

      {/* Input Fields */}
      <div className="space-y-3">
        <Input
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={255}
          icon={<UserIcon className="w-4 h-4 text-[#78716c]" />}
        />

        <Input
          label="Email Address"
          type="email"
          value={user?.email || ''}
          disabled
          icon={<Mail className="w-4 h-4 text-[#78716c]" />}
        />

        <Input
          label="Phone Number (Optional)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          maxLength={32}
          icon={<Phone className="w-4 h-4 text-[#78716c]" />}
        />
      </div>

      {!isPanVerified && (
        <div className="bg-[#fff7ed] border border-[#fed7aa] text-[#7c2d12] px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 font-medium">
          <Lock className="w-4 h-4 shrink-0 text-[#b4552d]" />
          <span>
            Profile Completion Bonus can only be added once your PAN is verified. Please verify your PAN above.
          </span>
        </div>
      )}

      <div className="pt-3 flex justify-end gap-3 border-t border-[#e7e5e4]">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleClose}
          className="text-xs"
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
          className="bg-[#0c0a09] hover:bg-neutral-800 text-white text-xs font-bold"
        >
          Save Profile &amp; Claim +50 pts
        </Button>
      </div>
    </form>
  );
};

export default ProfileDetailsTab;

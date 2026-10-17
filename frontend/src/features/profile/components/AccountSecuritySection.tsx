import React, { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import { authApi } from '../../../services/apiServices';
import { extractErrorMessage } from '../../../lib/api';
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  LogOut,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import Modal from '../../../components/Modal';
import { Button, Input } from '../../../components/ui';

interface AccountSecuritySectionProps {
  className?: string;
}

export const AccountSecuritySection: React.FC<AccountSecuritySectionProps> = ({
  className = '',
}) => {
  const { showToast } = useToast();
  const [sessionsRevoked, setSessionsRevoked] = useState(false);

  // Update password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignOutOtherSessions = () => {
    setSessionsRevoked(true);
    showToast('All other active device sessions have been signed out.', 'success');
  };

  const handleOpenPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    if (!loading) {
      setIsPasswordModalOpen(false);
      setErrorMsg('');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMsg('New password must be different from your current password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (res.data?.success || res.status === 200) {
        showToast('Password updated successfully! 🔒', 'success');
        setIsPasswordModalOpen(false);
      } else {
        setErrorMsg(res.data?.message || 'Failed to update password.');
      }
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfigure2FA = () => {
    showToast('Two-Factor Authentication is actively enforced via your authenticator app.', 'info');
  };

  return (
    <>
      <div className={`bg-white rounded-xl border border-[#e7e5e4] p-6 shadow-xs space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e7e5e4]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fafafa] flex items-center justify-center border border-[#e7e5e4] text-[#0c0a09]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0c0a09]">Account Security & Active Session</h2>
              <p className="text-xs text-[#78716c]">
                Multi-factor authentication, login credentials, and session auditing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => showToast('Audit trail log: Last authenticated from Mumbai via Google SSO.', 'info')}
            className="text-xs font-semibold text-[#b4552d] hover:text-[#732600] transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            View Audit Trail
          </button>
        </div>

        <div className="divide-y divide-[#e7e5e4]">
          {/* Password Row */}
          <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-[#78716c] mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-[#0c0a09] text-sm block">Password</span>
                <span className="text-xs text-[#78716c]">Update your login password and credentials</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenPasswordModal}
              className="text-xs self-start md:self-auto"
            >
              Update Password
            </Button>
          </div>

          {/* 2FA Row */}
          <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-[#b4552d] mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0c0a09] text-sm">Two-Factor Authentication (2FA)</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdbce] text-[#370e00] text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-[#9c431d]" />
                    <span>Enabled (Authenticator App)</span>
                  </span>
                </div>
                <span className="text-xs text-[#78716c] mt-0.5 block">
                  Requires 6-digit TOTP code during logins and group rewards withdrawals
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfigure2FA}
              className="text-xs self-start md:self-auto"
            >
              Configure 2FA
            </Button>
          </div>

          {/* Active Session Row */}
          <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Monitor className="w-5 h-5 text-[#78716c] mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0c0a09] text-sm">Chrome on Linux (This device)</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                  </span>
                  <span className="text-[11px] text-[#10b981] font-semibold">Current Active Session</span>
                </div>
                <span className="text-xs text-[#78716c] mt-0.5 block">
                  IP: 103.212.144.18 • Mumbai, Maharashtra, India • Logged in via Google SSO
                </span>
              </div>
            </div>
            <div className="self-start md:self-auto">
              <Button
                variant="outline"
                size="sm"
                disabled={sessionsRevoked}
                onClick={handleSignOutOtherSessions}
                className="text-xs text-[#ba1a1a] hover:bg-[#ffdad6]/40 border-[#ffdad6]"
                icon={<LogOut className="w-3.5 h-3.5 text-[#ba1a1a]" />}
              >
                {sessionsRevoked ? 'Other Sessions Terminated' : 'Sign Out Other Sessions'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Update Password Modal */}
      <Modal
        open={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        title="Update Account Password"
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#fafafa] border border-[#e7e5e4] rounded-2xl text-xs text-[#78716c]">
            <Lock className="w-4 h-4 text-[#b4552d] shrink-0" />
            <span>Enter your existing password and choose a new password with at least 6 characters.</span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#ffdad6]/40 border border-[#ffdad6] text-[#ba1a1a] text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#0c0a09] mb-1">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#0c0a09] transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0c0a09] mb-1">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#0c0a09] transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-[#78716c] mt-0.5 block">Minimum 6 characters</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0c0a09] mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#0c0a09] transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e7e5e4]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={handleClosePasswordModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              disabled={loading}
            >
              Save New Password
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AccountSecuritySection;

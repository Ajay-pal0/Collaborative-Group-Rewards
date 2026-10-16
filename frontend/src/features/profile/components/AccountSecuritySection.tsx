import React, { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import { Shield, Key, Smartphone, Monitor, LogOut, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui';

interface AccountSecuritySectionProps {
  className?: string;
}

export const AccountSecuritySection: React.FC<AccountSecuritySectionProps> = ({
  className = '',
}) => {
  const { showToast } = useToast();
  const [sessionsRevoked, setSessionsRevoked] = useState(false);

  const handleSignOutOtherSessions = () => {
    setSessionsRevoked(true);
    showToast('All other active device sessions have been signed out.', 'success');
  };

  const handleUpdatePasswordClick = () => {
    showToast('To update your password, use the reset password link sent to your registered email.', 'info');
  };

  const handleConfigure2FA = () => {
    showToast('Two-Factor Authentication is actively enforced via your authenticator app.', 'info');
  };

  return (
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
              <span className="text-xs text-[#78716c]">Last changed recently (30 days ago)</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpdatePasswordClick}
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
  );
};

export default AccountSecuritySection;

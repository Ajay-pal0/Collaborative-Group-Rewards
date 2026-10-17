import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { authApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';

export default function ResetPasswordPage() {
  const { token: paramToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = paramToken || searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Requirements check
  const hasMinLength = newPassword.length >= 6;
  const hasAlphaNum = /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;

  const strengthCount = (hasMinLength ? 1 : 0) + (hasAlphaNum ? 1 : 0) + (isMatching ? 1 : 0);
  let strengthLabel = 'Checking';
  let strengthBadgeClass = 'bg-[#f5f5f5] text-[#78716c]';

  if (newPassword.length > 0) {
    if (strengthCount === 3) {
      strengthLabel = 'Strong';
      strengthBadgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    } else if (strengthCount === 2) {
      strengthLabel = 'Medium';
      strengthBadgeClass = 'bg-amber-50 text-amber-700 border border-amber-200';
    } else {
      strengthLabel = 'Weak';
      strengthBadgeClass = 'bg-red-50 text-red-700 border border-red-200';
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from the link. Please check your email.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#f8fafc] text-[#0c0a09] font-sans min-h-screen flex flex-col justify-between antialiased selection:bg-[#ffdbce] selection:text-[#370e00] relative">
      {/* Top App Bar */}
      <header className="w-full bg-white border-b border-[#e7e5e4] shadow-xs z-20 relative">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          {/* Brand Logo & Compliance Cluster */}
          <div className="flex items-center gap-4">
            <Link to="/login" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#0c0a09] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-150">
                <Shield className="w-5 h-5 text-[#fd8d60]" />
              </div>
              <span className="text-base font-bold tracking-tight text-[#0c0a09]">
                Collaborative Group Rewards
              </span>
            </Link>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f5] border border-[#e7e5e4] text-[#78716c] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b4552d]"></span>
              <span>RBI &amp; UIDAI Compliant • 256-Bit SSL</span>
            </div>
          </div>

          {/* Trailing Cluster */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Support & Help"
              className="text-[#78716c] hover:text-[#0c0a09] transition-colors p-1.5 rounded-lg hover:bg-[#f5f5f5]"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-[#0c0a09] border border-[#e7e5e4] rounded-xl bg-white hover:bg-[#f5f5f5] transition-colors shadow-xs active:scale-95"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 z-10 relative">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-[#e7e5e4] shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_12px_28px_0_rgba(0,0,0,0.03)] p-8 sm:p-10 transition-all duration-200">
          {/* Card Header: Lock Icon & Headings */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#f5f5f5] border border-[#e7e5e4] flex items-center justify-center relative shadow-xs mb-4">
              <KeyRound className="w-7 h-7 text-[#0c0a09]" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#b4552d] border-2 border-white flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffdbce]"></span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0c0a09] tracking-tight">
              {success ? 'Password Updated!' : 'Set New Password'}
            </h1>
            <p className="text-xs sm:text-sm text-[#78716c] mt-1.5 max-w-sm leading-relaxed">
              {success
                ? 'Your password has been changed successfully. You can now log in.'
                : 'Choose a strong password for your verified Collaborative Group Rewards account.'}
            </p>
          </div>

          {/* Missing Token Alert */}
          {!token && (
            <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-2xl p-4 text-center space-y-3 mt-6">
              <AlertCircle className="w-6 h-6 text-[#b4552d] mx-auto" />
              <p className="text-xs font-semibold text-[#7c2d12]">
                Invalid or missing reset token. Please request a new password reset link from the login page.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b4552d] hover:underline"
              >
                Go to Sign In <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Success State */}
          {token && success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 mt-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-emerald-900">
                  Password Reset Successful!
                </h2>
                <p className="text-xs text-[#78716c] mt-1.5">
                  Your password has been updated. Please sign in with your new credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="w-full bg-[#0c0a09] hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                Proceed to Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form */}
          {token && !success && (
            <form onSubmit={handleResetPassword} noValidate className="mt-8 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Field 1: New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#78716c] uppercase tracking-wider">
                  NEW PASSWORD
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-[#78716c] flex items-center pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    maxLength={128}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Min. 6 characters"
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-3 bg-[#f8fafc] rounded-xl border border-[#e7e5e4] text-[#0c0a09] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c0a09] focus:border-[#0c0a09] transition-all placeholder:text-[#a8a29e]"
                  />
                  <button
                    type="button"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 p-1 rounded-lg text-[#78716c] hover:text-[#0c0a09] transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 2: Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#78716c] uppercase tracking-wider">
                  CONFIRM NEW PASSWORD
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-[#78716c] flex items-center pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    maxLength={128}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Re-enter new password"
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-3 bg-[#f8fafc] rounded-xl border border-[#e7e5e4] text-[#0c0a09] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c0a09] focus:border-[#0c0a09] transition-all placeholder:text-[#a8a29e]"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 p-1 rounded-lg text-[#78716c] hover:text-[#0c0a09] transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Real-time Security Requirements Checklist Card */}
              <div className="bg-[#fafafa] border border-[#e7e5e4] rounded-2xl p-4 my-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#0c0a09]">Password Strength Requirements</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${strengthBadgeClass}`}>
                    {strengthLabel}
                  </span>
                </div>
                <ul className="space-y-2 text-xs">
                  <li
                    className={`flex items-center gap-2 transition-colors duration-150 ${
                      hasMinLength ? 'text-emerald-700 font-semibold' : 'text-[#78716c]'
                    }`}
                  >
                    {hasMinLength ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#a8a29e]" />
                    )}
                    <span>At least 6 characters in length</span>
                  </li>
                  <li
                    className={`flex items-center gap-2 transition-colors duration-150 ${
                      hasAlphaNum ? 'text-emerald-700 font-semibold' : 'text-[#78716c]'
                    }`}
                  >
                    {hasAlphaNum ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#a8a29e]" />
                    )}
                    <span>Contains letters and numbers</span>
                  </li>
                  <li
                    className={`flex items-center gap-2 transition-colors duration-150 ${
                      isMatching ? 'text-emerald-700 font-semibold' : 'text-[#78716c]'
                    }`}
                  >
                    {isMatching ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#a8a29e]" />
                    )}
                    <span>Both passwords match</span>
                  </li>
                </ul>
              </div>

              {/* Primary Call to Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#0c0a09] hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Back to Sign In */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716c] hover:text-[#0c0a09] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>

              {/* Security Reassurance Notice */}
              <div className="bg-[#fafafa] border border-[#e7e5e4] p-3.5 rounded-xl flex items-start gap-2.5 mt-6 text-[#78716c]">
                <AlertTriangle className="w-4 h-4 text-[#b4552d] shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Resetting your password will invalidate active sessions on other devices for your security.
                </p>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-[#e7e5e4] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#78716c]">
        <p>&copy; 2026 Collaborative Group Rewards. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Privacy &amp; Security
          </span>
          <span>Terms</span>
        </div>
      </footer>
    </div>
  );
}

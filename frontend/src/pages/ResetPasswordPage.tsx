import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8F9FC] text-[#171923] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigate('/login')}
        >
          <div className="w-9 h-9 rounded-xl bg-[#635BFF] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#171923]">
            Collaborative Group Rewards
          </span>
        </div>

        <Link
          to="/login"
          className="border border-[#635BFF] text-[#635BFF] hover:bg-[#635BFF]/5 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
        >
          Sign In
        </Link>
      </header>

      {/* Main Body Card */}
      <main className="max-w-md mx-auto w-full my-auto py-8">
        <div className="bg-white border border-[#E7E9EE] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6 text-[#635BFF]" />
            </div>
            <h1 className="text-2xl font-black text-[#171923] tracking-tight">
              {success ? 'Password Updated!' : 'Set New Password'}
            </h1>
            <p className="text-xs text-[#667085] max-w-xs mx-auto">
              {success
                ? 'Your password has been changed successfully. You can now log in.'
                : 'Please enter and confirm your new password below.'}
            </p>
          </div>

          {!token && (
            <div className="bg-[#FFF4ED] border border-[#FB6514]/30 rounded-2xl p-4 text-center space-y-3">
              <AlertCircle className="w-6 h-6 text-[#FB6514] mx-auto" />
              <p className="text-xs font-semibold text-[#B93815]">
                Invalid or missing reset token. Please request a new password reset link from the login page.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#635BFF] hover:underline"
              >
                Go to Sign In <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {token && success && (
            <div className="bg-[#ECFDF3] border border-[#12B76A]/30 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#12B76A]/20 text-[#12B76A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-[#12B76A]" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-[#027A48]">Password Reset Successful!</h2>
                <p className="text-xs text-[#667085] mt-1.5">
                  Your password has been updated. Please sign in with your new credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="w-full bg-[#12B76A] hover:bg-[#039855] text-white font-bold py-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Proceed to Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {token && !success && (
            <form onSubmit={handleResetPassword} noValidate className="space-y-4">
              {error && (
                <div className="bg-[#F04438]/10 border border-[#F04438]/20 text-[#F04438] text-xs p-3.5 rounded-xl font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    maxLength={128}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Min. 6 characters"
                    className="w-full bg-[#F8F9FC] border border-[#E7E9EE] focus:border-[#635BFF] rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#171923] transition-colors cursor-pointer p-1"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    maxLength={128}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Re-enter new password"
                    className="w-full bg-[#F8F9FC] border border-[#E7E9EE] focus:border-[#635BFF] rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#171923] transition-colors cursor-pointer p-1"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#635BFF] hover:bg-[#4F46E5] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>

              <div className="pt-2 text-center border-t border-[#E7E9EE]">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[#635BFF] hover:underline"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs text-[#98A2B3] py-4 border-t border-[#E7E9EE] mt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Collaborative Group Rewards. All rights reserved.</p>
        <div className="flex items-center gap-4 text-[#667085]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A]" /> Privacy & Security
          </span>
          <span>Terms</span>
        </div>
      </footer>
    </div>
  );
}

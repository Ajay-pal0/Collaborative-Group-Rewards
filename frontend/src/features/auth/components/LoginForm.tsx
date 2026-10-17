import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui';

interface LoginFormProps {
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  showLoginPassword: boolean;
  setShowLoginPassword: (val: boolean) => void;
  loginError?: string;
  loginFieldErrors: { email?: string; password?: string };
  setLoginFieldErrors: React.Dispatch<React.SetStateAction<{ email?: string; password?: string }>>;
  loginLoading: boolean;
  handleLogin: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onContinueDigiLocker?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  showLoginPassword,
  setShowLoginPassword,
  loginError,
  loginFieldErrors,
  setLoginFieldErrors,
  loginLoading,
  handleLogin,
  onForgotPassword,
  onContinueDigiLocker,
}) => {
  const [rememberDays, setRememberDays] = useState(true);

  const handleAutofillDemo = () => {
    setLoginEmail('ajaypal05192@gmail.com');
    setLoginPassword('DemoPass@2025');
    setLoginFieldErrors({});
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail);

  return (
    <div className="space-y-4">
      <form onSubmit={handleLogin} noValidate className="space-y-4">
        {loginError && (
          <div className="text-xs bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] p-3 rounded-xl font-medium animate-fade-in">
            {loginError}
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-[#0c0a09] mb-1.5" htmlFor="login-email">
            Email Address
          </label>
          <div className="relative rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#78716c]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-email"
              type="email"
              value={loginEmail}
              maxLength={254}
              onChange={(e) => {
                setLoginEmail(e.target.value);
                setLoginFieldErrors((p) => ({ ...p, email: '' }));
              }}
              placeholder="you@example.com"
              className={`block w-full pl-10 pr-10 py-2.5 bg-[#f8fafc] border rounded-xl text-[#0c0a09] text-sm placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-[#0c0a09] focus:bg-white transition-all ${loginFieldErrors.email ? 'border-[#dc2626]' : 'border-[#e7e5e4] hover:border-[#d6d3d1]'
                }`}
            />
            {isEmailValid && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#059669]">
                <CheckCircle className="w-4 h-4" />
              </div>
            )}
          </div>
          {loginFieldErrors.email && (
            <p className="text-[#dc2626] text-xs mt-1 font-medium">{loginFieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#0c0a09]" htmlFor="login-password">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-medium text-[#b4552d] hover:text-[#9a4420] hover:underline cursor-pointer transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#78716c]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              type={showLoginPassword ? 'text' : 'password'}
              value={loginPassword}
              maxLength={128}
              onChange={(e) => {
                setLoginPassword(e.target.value);
                setLoginFieldErrors((p) => ({ ...p, password: '' }));
              }}
              placeholder="••••••••••••"
              className={`block w-full pl-10 pr-10 py-2.5 bg-[#f8fafc] border rounded-xl text-[#0c0a09] text-sm placeholder:text-[#a8a29e] focus:outline-none focus:ring-2 focus:ring-[#0c0a09] focus:bg-white transition-all ${loginFieldErrors.password ? 'border-[#dc2626]' : 'border-[#e7e5e4] hover:border-[#d6d3d1]'
                }`}
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#78716c] hover:text-[#0c0a09] cursor-pointer"
              aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
            >
              {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {loginFieldErrors.password && (
            <p className="text-[#dc2626] text-xs mt-1 font-medium">{loginFieldErrors.password}</p>
          )}
        </div>

        {/* Remember Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberDays}
              onChange={(e) => setRememberDays(e.target.checked)}
              className="h-4 w-4 rounded border-[#e7e5e4] text-[#0c0a09] focus:ring-[#0c0a09] accent-[#0c0a09]"
            />
            <span className="ml-2 text-xs text-[#78716c] font-medium">Remember 30 days</span>
          </label>
        </div>

        {/* Primary CTA */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loginLoading}
          disabled={loginLoading}
          className="w-full flex items-center justify-center gap-2 shadow-xs"
        >
          <span>Sign In to Account</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Alternative Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e7e5e4]"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-[#78716c]">or continue with verified credentials</span>
        </div>
      </div>

      {/* DigiLocker Direct Auth Button */}
      <button
        type="button"
        onClick={onContinueDigiLocker || handleAutofillDemo}
        className="w-full border border-[#e7e5e4] bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0c0a09] transition-colors rounded-xl py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
      >
        <Shield className="w-4 h-4 text-[#10b981]" />
        <span>Continue with DigiLocker / Aadhaar ID</span>
      </button>

      {/* Disclaimer */}
      <p className="text-[11px] text-[#78716c] text-center leading-relaxed pt-2">
        By signing in, you agree to our Terms of Service & Privacy Policy. Governed by RBI Information Security Guidelines.
      </p>
    </div>
  );
};

export default LoginForm;

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../../../components/ui';

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
}) => {
  return (
    <form onSubmit={handleLogin} noValidate className="space-y-4">
      {loginError && (
        <p className="text-[#F04438] text-xs bg-[#F04438]/10 p-3 rounded-xl font-semibold">
          {loginError}
        </p>
      )}

      <div>
        <Input
          label="Email"
          type="email"
          value={loginEmail}
          maxLength={254}
          onChange={(e) => {
            setLoginEmail(e.target.value);
            setLoginFieldErrors((p) => ({ ...p, email: '' }));
          }}
          placeholder="ajay.pal@example.com"
          error={loginFieldErrors.email}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider">
            Password
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-semibold text-[#635BFF] hover:underline cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        <div className="relative">
          <input
            type={showLoginPassword ? 'text' : 'password'}
            value={loginPassword}
            maxLength={128}
            onChange={(e) => {
              setLoginPassword(e.target.value);
              setLoginFieldErrors((p) => ({ ...p, password: '' }));
            }}
            placeholder="••••••••"
            className={`w-full bg-[#F8F9FC] border rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF] ${
              loginFieldErrors.password ? 'border-[#F04438]' : 'border-[#E7E9EE]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowLoginPassword(!showLoginPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#171923] transition-colors cursor-pointer p-1"
            aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
          >
            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {loginFieldErrors.password && (
          <p className="text-[#F04438] text-xs mt-1 font-medium">{loginFieldErrors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={loginLoading}
        disabled={loginLoading}
        className="w-full"
      >
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;

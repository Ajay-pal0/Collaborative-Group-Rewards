import React from 'react';
import { KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button, Input } from '../../../components/ui';

interface ForgotPasswordFormProps {
  forgotEmail: string;
  setForgotEmail: (val: string) => void;
  forgotError?: string;
  setForgotError: (val: string) => void;
  forgotSuccess?: string;
  forgotLoading: boolean;
  handleForgotPassword: (e: React.FormEvent) => void;
  handleBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  forgotEmail,
  setForgotEmail,
  forgotError,
  setForgotError,
  forgotSuccess,
  forgotLoading,
  handleForgotPassword,
  handleBackToLogin,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mx-auto mb-1.5">
          <KeyRound className="w-5 h-5 text-[#635BFF]" />
        </div>
        <h3 className="text-base font-extrabold text-[#171923]">
          {forgotSuccess ? 'Check Your Inbox' : 'Forgot Password'}
        </h3>
        <p className="text-xs text-[#667085]">
          {forgotSuccess
            ? 'A password reset link has been dispatched.'
            : 'Enter your registered email address to receive a secure reset link.'}
        </p>
      </div>

      {!forgotSuccess ? (
        <form onSubmit={handleForgotPassword} noValidate className="space-y-4">
          {forgotError && (
            <p className="text-[#F04438] text-xs bg-[#F04438]/10 p-3 rounded-xl font-semibold">
              {forgotError}
            </p>
          )}

          <div>
            <Input
              label="Registered Email"
              type="email"
              value={forgotEmail}
              maxLength={254}
              onChange={(e) => {
                setForgotEmail(e.target.value);
                if (forgotError) setForgotError('');
              }}
              placeholder="ajay.pal@example.com"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={forgotLoading}
            disabled={forgotLoading}
            className="w-full"
          >
            Send Reset Link
          </Button>

          <div className="pt-2 text-center border-t border-[#E7E9EE]">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-xs font-semibold text-[#635BFF] hover:underline cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#ECFDF3] border border-[#12B76A]/30 rounded-2xl p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#12B76A]/20 text-[#12B76A] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-[#12B76A]" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#027A48]">Password Reset Email Sent</h4>
              <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
                {forgotSuccess}
              </p>
              <p className="text-[11px] text-[#98A2B3] mt-2">
                The reset link is valid for <strong>20 minutes</strong>.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleBackToLogin}
            className="w-full"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Back to Sign In
          </Button>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;

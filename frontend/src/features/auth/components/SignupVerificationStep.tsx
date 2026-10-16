import React from 'react';
import { ShieldCheck, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import VerificationBadge from '../../../components/VerificationBadge';
import { Button } from '../../../components/ui';

interface SignupVerificationStepProps {
  signupVerificationTab: 'pan' | 'aadhaar';
  setSignupVerificationTab: (val: 'pan' | 'aadhaar') => void;
  // Aadhaar
  aadhaarLoading: boolean;
  aadhaarError?: string;
  setAadhaarError: (val: string) => void;
  aadhaarConsent: boolean;
  setAadhaarConsent: (val: boolean) => void;
  aadhaarSuccess: boolean;
  aadhaarVerifiedData?: { name?: string; aadhaar_masked?: string } | null;
  handleVerifySignupAadhaar: () => void;
  // PAN
  signupPan: string;
  setSignupPan: (val: string) => void;
  panLoading: boolean;
  panError?: string;
  setPanError: (val: string) => void;
  panSuccess: boolean;
  panVerifiedData?: { name?: string; pan_masked?: string } | null;
  handleVerifySignupPan: (e: React.FormEvent) => void;
  // Common
  handleSkipSignupPan: () => void;
  handleCompleteSignup: () => void;
}

export const SignupVerificationStep: React.FC<SignupVerificationStepProps> = ({
  signupVerificationTab,
  setSignupVerificationTab,
  aadhaarLoading,
  aadhaarError,
  setAadhaarError,
  aadhaarConsent,
  setAadhaarConsent,
  aadhaarSuccess,
  aadhaarVerifiedData,
  handleVerifySignupAadhaar,
  signupPan,
  setSignupPan,
  panLoading,
  panError,
  setPanError,
  panSuccess,
  panVerifiedData,
  handleVerifySignupPan,
  handleSkipSignupPan,
  handleCompleteSignup,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mx-auto mb-1.5">
          <ShieldCheck className="w-5 h-5 text-[#635BFF]" />
        </div>
        <h3 className="text-base font-extrabold text-[#171923]">PAN Verification (Optional)</h3>
        <p className="text-xs text-[#667085]">
          Verify your PAN or Aadhaar now for instant reward verification badges, or skip and do it later.
        </p>
      </div>

      {/* Verification Method Switcher */}
      <div className="flex bg-[#F2F4F7] p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setSignupVerificationTab('pan')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            signupVerificationTab === 'pan' ? 'bg-white text-[#171923] shadow-xs' : 'text-[#667085] hover:text-[#171923]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-[#635BFF]" />
          <span>PAN Card</span>
        </button>
        <button
          type="button"
          onClick={() => setSignupVerificationTab('aadhaar')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            signupVerificationTab === 'aadhaar' ? 'bg-white text-[#171923] shadow-xs' : 'text-[#667085] hover:text-[#171923]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#12B76A]" />
          <span>Aadhaar (DigiLocker)</span>
        </button>
      </div>

      {/* Aadhaar Tab Flow */}
      {signupVerificationTab === 'aadhaar' && (
        <div>
          {aadhaarSuccess && aadhaarVerifiedData ? (
            <div className="bg-[#ECFDF3] border border-[#12B76A]/30 rounded-2xl p-4 text-center space-y-3">
              <div className="w-9 h-9 rounded-full bg-[#12B76A]/20 text-[#12B76A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5 text-[#12B76A]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 mb-1">
                  <VerificationBadge type="aadhaar" status="VERIFIED" size="md" />
                </div>
                <h4 className="font-extrabold text-sm text-[#027A48]">✓ Aadhaar Verified</h4>
                <p className="text-xs font-semibold text-[#171923] mt-1">Holder: {aadhaarVerifiedData.name}</p>
                <p className="text-[11px] font-mono text-[#667085]">Aadhaar: {aadhaarVerifiedData.aadhaar_masked}</p>
              </div>
              <Button
                variant="success"
                size="md"
                onClick={handleCompleteSignup}
                className="w-full"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Continue to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="p-3 bg-[#F8F9FC] border border-[#E7E9EE] rounded-xl text-xs text-[#667085] flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#635BFF] shrink-0" />
                <span>Verify your Aadhaar via DigiLocker to earn your <strong>Aadhaar Verified</strong> trust badge.</span>
              </div>
              {aadhaarError && (
                <p className="text-[#F04438] text-xs bg-[#F04438]/10 p-3 rounded-xl font-semibold">{aadhaarError}</p>
              )}
              <label className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F8F9FC] border border-[#E7E9EE] cursor-pointer text-xs text-[#667085]">
                <input
                  type="checkbox"
                  checked={aadhaarConsent}
                  onChange={(e) => {
                    setAadhaarConsent(e.target.checked);
                    if (aadhaarError) setAadhaarError('');
                  }}
                  className="mt-0.5 rounded border-[#D0D5DD] text-[#635BFF] focus:ring-[#635BFF]"
                />
                <span>
                  I authorize Collaborative Group Rewards to verify my Aadhaar identity via Surepass DigiLocker for rewards eligibility.
                </span>
              </label>
              <Button
                type="button"
                variant="success"
                size="md"
                onClick={handleVerifySignupAadhaar}
                disabled={aadhaarLoading || !aadhaarConsent}
                loading={aadhaarLoading}
                className="w-full"
                icon={<ShieldCheck className="w-4 h-4" />}
              >
                Verify Aadhaar & Get Badge
              </Button>
              <div className="pt-2 text-center space-y-1.5 border-t border-[#E7E9EE]">
                <p className="text-[11px] text-[#667085]">
                  This is optional. You can also verify your PAN or skip for now.
                </p>
                <button
                  type="button"
                  onClick={handleSkipSignupPan}
                  className="text-xs font-bold text-[#635BFF] hover:underline py-1 cursor-pointer"
                >
                  Skip for now →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PAN Tab Flow */}
      {signupVerificationTab === 'pan' && (
        <div>
          {panSuccess && panVerifiedData ? (
            <div className="bg-[#ECFDF3] border border-[#12B76A]/30 rounded-2xl p-4 text-center space-y-3">
              <div className="w-9 h-9 rounded-full bg-[#12B76A]/20 text-[#12B76A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5 text-[#12B76A]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 mb-1">
                  <VerificationBadge type="pan" status="VERIFIED" size="md" />
                </div>
                <h4 className="font-extrabold text-sm text-[#027A48]">✓ PAN Verified</h4>
                <p className="text-xs font-semibold text-[#171923] mt-1">Name: {panVerifiedData.name}</p>
                <p className="text-[11px] font-mono text-[#667085]">PAN: {panVerifiedData.pan_masked}</p>
              </div>
              <Button
                variant="success"
                size="md"
                onClick={handleCompleteSignup}
                className="w-full"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Continue to Dashboard
              </Button>
            </div>
          ) : (
            <form onSubmit={handleVerifySignupPan} className="space-y-3.5">
              {panError && (
                <p className="text-[#F04438] text-xs bg-[#F04438]/10 p-3 rounded-xl font-semibold">{panError}</p>
              )}
              <div>
                <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={signupPan}
                  onChange={(e) => {
                    setSignupPan(e.target.value.toUpperCase());
                    if (panError) setPanError('');
                  }}
                  placeholder="ABCDE1234A"
                  maxLength={10}
                  className="w-full bg-[#F8F9FC] border border-[#E7E9EE] focus:border-[#635BFF] rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                />
                <p className="text-[10px] text-[#98A2B3] mt-1">
                  Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234A)
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={panLoading}
                disabled={panLoading}
                className="w-full"
              >
                Verify PAN
              </Button>

              <div className="pt-2 text-center space-y-1.5 border-t border-[#E7E9EE]">
                <p className="text-[11px] text-[#667085]">
                  This is optional. You can verify your PAN later from My Profile & Points.
                </p>
                <button
                  type="button"
                  onClick={handleSkipSignupPan}
                  className="text-xs font-bold text-[#635BFF] hover:underline py-1 cursor-pointer"
                >
                  Skip for now →
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default SignupVerificationStep;

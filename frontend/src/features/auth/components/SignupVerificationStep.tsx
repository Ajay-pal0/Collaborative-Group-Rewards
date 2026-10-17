import React from 'react';
import { ShieldCheck, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import VerificationBadge from '../../../components/VerificationBadge';
import { Button } from '../../../components/ui';
import { maskPan } from '../../../lib/masking';

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
        <div className="w-10 h-10 rounded-2xl bg-[#0c0a09]/5 text-[#0c0a09] flex items-center justify-center mx-auto mb-1.5 border border-[#e7e5e4]">
          <ShieldCheck className="w-5 h-5 text-[#0c0a09]" />
        </div>
        <h3 className="text-base font-bold text-[#0c0a09]">PAN Verification (Optional)</h3>
        <p className="text-xs text-[#78716c]">
          Verify your PAN or Aadhaar now for instant reward verification badges, or skip and do it later.
        </p>
      </div>

      {/* Verification Method Switcher */}
      <div className="flex bg-[#f5f5f4] p-1 rounded-full border border-[#e7e5e4]">
        <button
          type="button"
          onClick={() => setSignupVerificationTab('pan')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            signupVerificationTab === 'pan' ? 'bg-white text-[#0c0a09] shadow-xs' : 'text-[#78716c] hover:text-[#0c0a09]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-[#0c0a09]" />
          <span>PAN Card</span>
        </button>
        <button
          type="button"
          onClick={() => setSignupVerificationTab('aadhaar')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            signupVerificationTab === 'aadhaar' ? 'bg-white text-[#0c0a09] shadow-xs' : 'text-[#78716c] hover:text-[#0c0a09]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
          <span>Aadhaar (DigiLocker)</span>
        </button>
      </div>

      {/* Aadhaar Tab Flow */}
      {signupVerificationTab === 'aadhaar' && (
        <div>
          {aadhaarSuccess && aadhaarVerifiedData ? (
            <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-4 text-center space-y-3">
              <div className="w-9 h-9 rounded-full bg-[#a7f3d0]/30 text-[#059669] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 mb-1">
                  <VerificationBadge type="aadhaar" status="VERIFIED" size="md" />
                </div>
                <h4 className="font-bold text-sm text-[#065f46]">✓ Aadhaar Verified</h4>
                <p className="text-xs font-semibold text-[#0c0a09] mt-1">Holder: {aadhaarVerifiedData.name}</p>
                <p className="text-[11px] font-mono text-[#78716c]">Aadhaar: {aadhaarVerifiedData.aadhaar_masked}</p>
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
              <div className="p-3 bg-[#fafafa] border border-[#e7e5e4] rounded-xl text-xs text-[#78716c] flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#0c0a09] shrink-0" />
                <span>Verify your Aadhaar via DigiLocker to earn your <strong>Aadhaar Verified</strong> trust badge.</span>
              </div>
              {aadhaarError && (
                <div className="text-xs bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] p-3 rounded-xl font-medium">{aadhaarError}</div>
              )}
              <label className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-[#e7e5e4] cursor-pointer text-xs text-[#78716c]">
                <input
                  type="checkbox"
                  checked={aadhaarConsent}
                  onChange={(e) => {
                    setAadhaarConsent(e.target.checked);
                    if (aadhaarError) setAadhaarError('');
                  }}
                  className="mt-0.5 rounded border-[#d6d3d1] text-[#0c0a09] focus:ring-[#0c0a09]"
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
              <div className="pt-2 text-center space-y-1.5 border-t border-[#e7e5e4]">
                <p className="text-[11px] text-[#78716c]">
                  This is optional. You can also verify your PAN or skip for now.
                </p>
                <button
                  type="button"
                  onClick={handleSkipSignupPan}
                  className="text-xs font-semibold text-[#0c0a09] hover:underline py-1 cursor-pointer"
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
            <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-4 text-center space-y-3">
              <div className="w-9 h-9 rounded-full bg-[#a7f3d0]/30 text-[#059669] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 mb-1">
                  <VerificationBadge type="pan" status="VERIFIED" size="md" />
                </div>
                <h4 className="font-bold text-sm text-[#065f46]">✓ PAN Verified</h4>
                <p className="text-xs font-semibold text-[#0c0a09] mt-1">Name: {panVerifiedData.name || 'Verified Citizen'}</p>
                <p className="text-[11px] font-mono text-[#78716c]">PAN: {maskPan(panVerifiedData.pan_masked || signupPan)}</p>
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
                <div className="text-xs bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] p-3 rounded-xl font-medium">{panError}</div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#0c0a09] mb-1.5">
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
                  className="w-full bg-white border border-[#e7e5e4] focus:border-[#0c0a09] rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-[#0c0a09] focus:outline-none focus:ring-2 focus:ring-[#0c0a09]"
                />
                <p className="text-[10px] text-[#78716c] mt-1">
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

              <div className="pt-2 text-center space-y-1.5 border-t border-[#e7e5e4]">
                <p className="text-[11px] text-[#78716c]">
                  This is optional. You can verify your PAN later from My Profile & Points.
                </p>
                <button
                  type="button"
                  onClick={handleSkipSignupPan}
                  className="text-xs font-semibold text-[#0c0a09] hover:underline py-1 cursor-pointer"
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

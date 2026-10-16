import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { kycApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import VerificationBadge from '../components/VerificationBadge';
import { Sparkles, AlertCircle, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, Card } from '../components/ui';

export default function KycCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedData, setVerifiedData] = useState<{
    masked_id?: string;
    registered_name?: string;
  } | null>(null);

  useEffect(() => {
    confirmDigiLocker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmDigiLocker() {
    setLoading(true);
    setErrorMsg('');
    const clientId = searchParams.get('client_id') || undefined;
    const providerStatus = searchParams.get('status');

    if (providerStatus === 'failed' || providerStatus === 'cancelled') {
      setLoading(false);
      setErrorMsg('DigiLocker authorization was cancelled or unsuccessful.');
      return;
    }

    try {
      const res = await kycApi.verifyAadhaar({ client_id: clientId });
      if (res.data.success) {
        setSuccess(true);
        setVerifiedData({
          masked_id: res.data.data?.masked_id,
          registered_name: res.data.data?.registered_name,
        });

        if (user) {
          updateUser({
            ...user,
            aadhaar_verified: true,
            aadhaar_masked: res.data.data?.masked_id,
            aadhaar_registered_name: res.data.data?.registered_name,
            aadhaar_verified_at: res.data.data?.verified_at,
          });
        }
        showToast('Aadhaar verified successfully via DigiLocker! 🛡️', 'success');
      } else {
        setErrorMsg(res.data.error || res.data.message || 'Verification could not be confirmed.');
      }
    } catch (err) {
      setErrorMsg(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#171923] flex flex-col justify-between p-4 sm:p-8">
      {/* Brand Header */}
      <header className="max-w-md mx-auto w-full flex items-center justify-center py-4">
        <div
          onClick={() => navigate('/groups')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#171923]">
            Collaborative Group Rewards
          </span>
        </div>
      </header>

      {/* Main Card */}
      <main className="max-w-md mx-auto w-full my-auto py-6">
        <Card className="p-6 sm:p-8 text-center space-y-6 shadow-xl border-[#E7E9EE] animate-slide-up">
          {loading ? (
            <div className="py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mx-auto">
                <RefreshCw className="w-7 h-7 text-[#635BFF] animate-spin" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#171923]">
                  Verifying DigiLocker Session
                </h2>
                <p className="text-xs text-[#667085] mt-1.5 max-w-xs mx-auto">
                  Retrieving authorized Aadhaar identity confirmation from Surepass government gateway...
                </p>
              </div>
            </div>
          ) : success ? (
            <div className="space-y-5 py-2">
              <div className="w-16 h-16 rounded-full bg-[#ECFDF3] text-[#12B76A] flex items-center justify-center mx-auto ring-8 ring-[#ECFDF3]">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-[#171923]">
                  Aadhaar Verified!
                </h2>
                <p className="text-xs text-[#667085] max-w-xs mx-auto">
                  Your identity has been successfully authenticated through DigiLocker.
                </p>
              </div>

              <div className="flex justify-center pt-1">
                <VerificationBadge type="aadhaar" status="VERIFIED" size="lg" />
              </div>

              {verifiedData?.masked_id && (
                <div className="p-4 rounded-2xl bg-[#F8F9FC] border border-[#E7E9EE] text-xs text-[#171923] text-left space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#667085]">Masked Aadhaar:</span>
                    <span className="font-mono font-bold">{verifiedData.masked_id}</span>
                  </div>
                  {verifiedData.registered_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#667085]">Registered Name:</span>
                      <span className="font-semibold">{verifiedData.registered_name}</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/groups')}
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              <div className="w-16 h-16 rounded-full bg-[#FEF3F2] text-[#F04438] flex items-center justify-center mx-auto">
                <AlertCircle className="w-9 h-9 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-[#171923]">
                  Verification Incomplete
                </h2>
                <p className="text-xs text-[#F04438] bg-[#FEF3F2] p-3 rounded-xl font-medium mt-2">
                  {errorMsg}
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <Button
                  variant="primary"
                  onClick={confirmDigiLocker}
                  className="w-full"
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Retry Confirmation
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/groups')}
                  className="w-full"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto w-full text-center text-[11px] text-[#98A2B3] py-4">
        © 2026 Collaborative Group Rewards • Secured via Surepass KYC
      </footer>
    </div>
  );
}

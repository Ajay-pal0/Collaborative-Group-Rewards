import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { kycApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import VerificationBadge from '../components/VerificationBadge';
import { ShieldCheck, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl shadow-indigo-950/40 space-y-6">
        {loading ? (
          <div className="py-8 space-y-4">
            <RefreshCw className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Verifying DigiLocker Session...</h2>
            <p className="text-xs text-slate-400">
              Retrieving authorized Aadhaar identity confirmation from Surepass.
            </p>
          </div>
        ) : success ? (
          <div className="space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">Aadhaar Verified!</h2>
              <p className="text-sm text-slate-400 mt-1">
                Your identity was successfully verified through DigiLocker.
              </p>
            </div>

            <div className="flex justify-center">
              <VerificationBadge type="aadhaar" status="VERIFIED" size="lg" />
            </div>

            {verifiedData?.masked_id && (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                <span className="text-slate-400">Masked Aadhaar: </span>
                <span className="font-mono font-semibold">{verifiedData.masked_id}</span>
                {verifiedData.registered_name && (
                  <div className="text-slate-400 mt-1">
                    Name: <span className="text-slate-200">{verifiedData.registered_name}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/40"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Verification Incomplete</h2>
              <p className="text-xs text-rose-300 mt-1">{errorMsg}</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={confirmDigiLocker}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Confirmation</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

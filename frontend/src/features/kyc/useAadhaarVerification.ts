import { useState } from 'react';
import { kycApi } from '../../services/apiServices';
import { extractErrorMessage } from '../../lib/api';
import { mountDigiboostSdk } from './digiboostSdk';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export interface AadhaarVerifiedPayload {
  masked_id: string;
  name: string;
  verified_at?: string;
}

export function useAadhaarVerification() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifiedData, setVerifiedData] = useState<AadhaarVerifiedPayload | null>(null);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  async function startVerification(options?: {
    redirectUrl?: string;
    onSuccessCallback?: (data: AadhaarVerifiedPayload) => void;
  }) {
    setError('');
    if (!consent) {
      setError('Please check the informed consent box to authorize DigiLocker verification.');
      return;
    }

    setLoading(true);
    const callbackTarget = options?.redirectUrl || `${window.location.origin}/kyc/callback`;

    try {
      // 1. Initialize session with backend
      const initRes = await kycApi.initiateAadhaar({
        consent: true,
        redirect_url: callbackTarget,
      });

      if (!initRes.data.success) {
        setError(initRes.data.error || 'Failed to initialize DigiLocker session with provider.');
        setLoading(false);
        return;
      }

      const clientId = initRes.data.client_id;
      const sdkToken = initRes.data.token;
      setActiveClientId(clientId);

      // Helper to confirm verification with backend
      const confirmWithBackend = async () => {
        try {
          const verifyRes = await kycApi.verifyAadhaar({ client_id: clientId });
          if (verifyRes.data.success) {
            const confirmedPayload: AadhaarVerifiedPayload = {
              masked_id: verifyRes.data.data?.masked_id || 'XXXXXXXX1234',
              name: verifyRes.data.data?.registered_name || user?.name || 'Verified Citizen',
              verified_at: verifyRes.data.data?.verified_at || new Date().toISOString(),
            };

            setSuccess(true);
            setVerifiedData(confirmedPayload);

            if (user) {
              updateUser({
                ...user,
                aadhaar_verified: true,
                aadhaar_masked: confirmedPayload.masked_id,
                aadhaar_registered_name: confirmedPayload.name,
                aadhaar_verified_at: confirmedPayload.verified_at,
              });
            }

            showToast('Aadhaar verified successfully via DigiLocker! 🛡️', 'success');
            if (options?.onSuccessCallback) {
              options.onSuccessCallback(confirmedPayload);
            }
          } else {
            setError(verifyRes.data.error || 'Aadhaar verification could not be confirmed by provider.');
          }
        } catch (confirmErr) {
          setError(extractErrorMessage(confirmErr));
        } finally {
          setLoading(false);
        }
      };

      // 2. Launch Surepass Digiboost Web SDK
      if (sdkToken && !sdkToken.startsWith('mock_')) {
        try {
          await mountDigiboostSdk({
            token: sdkToken,
            gateway: 'sandbox',
            buttonTitle: 'Verify with DigiLocker',
            onSuccess: async () => {
              // Digiboost completed -> verify server-side
              await confirmWithBackend();
            },
            onFailure: (err) => {
              loggerWarningOrError(err);
              setError(typeof err === 'string' ? err : 'DigiLocker verification was cancelled or failed.');
              setLoading(false);
            },
          });
          // Also set up window message listener for digilocker completion events
          const messageListener = async (event: MessageEvent) => {
            const data = event.data;
            if (data?.type === 'digilocker:complete') {
              window.removeEventListener('message', messageListener);
              await confirmWithBackend();
            } else if (data?.type === 'digilocker:failed') {
              window.removeEventListener('message', messageListener);
              setError('DigiLocker verification was cancelled or failed. Please retry.');
              setLoading(false);
            }
          };
          window.addEventListener('message', messageListener);
        } catch {
          // If popup is blocked or script error, fallback to URL or direct confirmation
          if (initRes.data.authorization_url) {
            window.open(initRes.data.authorization_url, '_blank');
          }
        }
      } else {
        // Simulated sandbox / demo mode fallback
        await confirmWithBackend();
      }
    } catch (err) {
      setError(extractErrorMessage(err));
      setLoading(false);
    }
  }

  async function cancelVerification() {
    if (activeClientId) {
      try {
        await kycApi.cancelAadhaar({ client_id: activeClientId });
      } catch {
        // ignore cancellation error
      }
    }
    setLoading(false);
    setError('');
  }

  function resetState() {
    setLoading(false);
    setError('');
    setSuccess(false);
    setVerifiedData(null);
    setActiveClientId(null);
  }

  return {
    loading,
    error,
    setError,
    consent,
    setConsent,
    success,
    verifiedData,
    startVerification,
    cancelVerification,
    resetState,
  };
}

function loggerWarningOrError(err: unknown) {
  if (import.meta.env?.DEV) {
    console.warn('[DigiboostSDK] Callback failure/notice:', err);
  }
}

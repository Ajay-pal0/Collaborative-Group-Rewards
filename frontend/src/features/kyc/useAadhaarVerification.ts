import { useState, useRef, useEffect, useCallback } from 'react';
import { kycApi } from '../../services/apiServices';
import { extractErrorMessage } from '../../lib/api';
import {
  preOpenAuthWindow,
  openDigilockerInNewTab,
  buildDigiboostUrl,
} from './digiboostSdk';
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
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null);
  const [isWaitingInNewTab, setIsWaitingInNewTab] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setInterval>>(null);
  const cleanupTabRef = useRef<(() => void) | null>(null);
  const activeWindowRef = useRef<Window | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const cleanupSession = useCallback(() => {
    stopPolling();
    if (cleanupTabRef.current) {
      cleanupTabRef.current();
      cleanupTabRef.current = null;
    }
    setIsWaitingInNewTab(false);
  }, [stopPolling]);

  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, [cleanupSession]);

  // Helper to confirm verification with backend
  const confirmWithBackend = useCallback(
    async (
      clientId: string,
      options?: { onSuccessCallback?: (data: AadhaarVerifiedPayload) => void }
    ): Promise<boolean> => {
      try {
        const verifyRes = await kycApi.verifyAadhaar({ client_id: clientId });
        if (verifyRes.data.success && verifyRes.data.status === 'verified') {
          const confirmedPayload: AadhaarVerifiedPayload = {
            masked_id: verifyRes.data.data?.masked_id || 'XXXXXXXX1234',
            name: verifyRes.data.data?.registered_name || user?.name || 'Verified Citizen',
            verified_at: verifyRes.data.data?.verified_at || new Date().toISOString(),
          };

          setSuccess(true);
          setVerifiedData(confirmedPayload);
          cleanupSession();

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
          setLoading(false);
          return true;
        } else {
          // If still pending during background polling, do not fail immediately
          return false;
        }
      } catch (confirmErr) {
        loggerWarningOrError(confirmErr);
        return false;
      }
    },
    [cleanupSession, showToast, updateUser, user]
  );

  // Manual status check for user
  const checkVerificationStatus = useCallback(
    async (targetClientId?: string) => {
      const cId = targetClientId || activeClientId;
      if (!cId) {
        setError('No active verification session to check.');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const verifyRes = await kycApi.verifyAadhaar({ client_id: cId });
        if (verifyRes.data.success && verifyRes.data.status === 'verified') {
          const confirmedPayload: AadhaarVerifiedPayload = {
            masked_id: verifyRes.data.data?.masked_id || 'XXXXXXXX1234',
            name: verifyRes.data.data?.registered_name || user?.name || 'Verified Citizen',
            verified_at: verifyRes.data.data?.verified_at || new Date().toISOString(),
          };

          setSuccess(true);
          setVerifiedData(confirmedPayload);
          cleanupSession();

          if (user) {
            updateUser({
              ...user,
              aadhaar_verified: true,
              aadhaar_masked: confirmedPayload.masked_id,
              aadhaar_registered_name: confirmedPayload.name,
              aadhaar_verified_at: confirmedPayload.verified_at,
            });
          }

          showToast('Aadhaar verification confirmed! 🛡️', 'success');
        } else {
          setError(verifyRes.data.message || verifyRes.data.error || 'Verification is still pending. Please complete DigiLocker authorization.');
        }
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [activeClientId, cleanupSession, showToast, updateUser, user]
  );

  async function startVerification(options?: {
    redirectUrl?: string;
    onSuccessCallback?: (data: AadhaarVerifiedPayload) => void;
  }) {
    setError('');
    if (!consent) {
      setError('Please check the informed consent box to authorize DigiLocker verification.');
      return;
    }

    // Pre-open blank tab synchronously in click event to ensure browser popup blockers do not block it
    const preOpenedTab = preOpenAuthWindow();
    activeWindowRef.current = preOpenedTab;

    setLoading(true);
    const callbackTarget = options?.redirectUrl || `${window.location.origin}/kyc/callback`;

    try {
      // 1. Initialize session with backend
      const initRes = await kycApi.initiateAadhaar({
        consent: true,
        redirect_url: callbackTarget,
      });

      if (!initRes.data.success) {
        if (preOpenedTab && !preOpenedTab.closed) preOpenedTab.close();
        setError(initRes.data.error || 'Failed to initialize DigiLocker session with provider.');
        setLoading(false);
        return;
      }

      const clientId = initRes.data.client_id;
      const sdkToken = initRes.data.token;
      let authUrl = initRes.data.authorization_url;

      setActiveClientId(clientId);

      // 2. Mock mode handling
      if (!sdkToken || sdkToken.startsWith('mock_')) {
        if (preOpenedTab && !preOpenedTab.closed) preOpenedTab.close();
        await confirmWithBackend(clientId, options);
        return;
      }

      // 3. Build target DigiLocker verification URL if not full URL
      if (!authUrl && sdkToken) {
        authUrl = buildDigiboostUrl({
          token: sdkToken,
          gateway: 'sandbox',
          origin: window.location.origin,
        });
      }

      if (authUrl && !authUrl.includes('origin=')) {
        const org = encodeURIComponent(window.location.origin);
        const delim = authUrl.includes('?') ? '&' : '?';
        authUrl = `${authUrl}${delim}origin=${org}`;
      }

      setAuthorizationUrl(authUrl);
      setIsWaitingInNewTab(true);

      // 4. Open in the pre-opened tab and attach postMessage listener
      const { authWindow, cleanup } = openDigilockerInNewTab({
        authorizationUrl: authUrl,
        token: sdkToken,
        gateway: 'sandbox',
        windowRef: preOpenedTab,
        onSuccess: async () => {
          stopPolling();
          await confirmWithBackend(clientId, options);
        },
        onFailure: async (failReason) => {
          // If window was closed, do one quick confirmation attempt before declaring failure
          const didVerify = await confirmWithBackend(clientId, options);
          if (!didVerify) {
            setError(typeof failReason === 'string' ? failReason : 'DigiLocker verification was cancelled.');
            setIsWaitingInNewTab(false);
            setLoading(false);
          }
        },
      });

      cleanupTabRef.current = cleanup;
      activeWindowRef.current = authWindow;

      // 5. Background Auto-Polling (checks every 3 seconds while new tab is open)
      stopPolling();
      let pollCount = 0;
      const maxPolls = 100; // 5 minutes max

      pollTimerRef.current = setInterval(async () => {
        pollCount++;
        if (pollCount > maxPolls) {
          stopPolling();
          setIsWaitingInNewTab(false);
          setLoading(false);
          return;
        }

        const isVerified = await confirmWithBackend(clientId, options);
        if (isVerified) {
          stopPolling();
          if (activeWindowRef.current && !activeWindowRef.current.closed) {
            try {
              activeWindowRef.current.close();
            } catch {
              // ignore
            }
          }
        }
      }, 3000);
    } catch (err) {
      if (preOpenedTab && !preOpenedTab.closed) preOpenedTab.close();
      setError(extractErrorMessage(err));
      setLoading(false);
      setIsWaitingInNewTab(false);
    }
  }

  const reopenTab = useCallback(() => {
    if (authorizationUrl) {
      window.open(authorizationUrl, '_blank');
    }
  }, [authorizationUrl]);

  async function cancelVerification() {
    cleanupSession();
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
    cleanupSession();
    setLoading(false);
    setError('');
    setSuccess(false);
    setVerifiedData(null);
    setActiveClientId(null);
    setAuthorizationUrl(null);
  }

  return {
    loading,
    error,
    setError,
    consent,
    setConsent,
    success,
    verifiedData,
    activeClientId,
    authorizationUrl,
    isWaitingInNewTab,
    startVerification,
    checkVerificationStatus,
    reopenTab,
    cancelVerification,
    resetState,
  };
}

function loggerWarningOrError(err: unknown) {
  if (import.meta.env?.DEV) {
    console.warn('[DigiboostSDK] Callback failure/notice:', err);
  }
}

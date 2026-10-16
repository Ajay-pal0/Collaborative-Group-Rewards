import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { User } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../../../components/ui';
import { ShieldCheck, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Check } from 'lucide-react';
import { preOpenAuthWindow, openDigilockerInNewTab } from '../../kyc/digiboostSdk';
import { kycApi } from '../../../services/apiServices';
import { extractErrorMessage } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

interface AadhaarVerificationSectionProps {
  user: User | null;
  onInitiateAadhaar: (consent: boolean) => Promise<{ authorization_url?: string; client_id?: string; token?: string }>;
  onCancelAadhaar?: () => Promise<void>;
  loading?: boolean;
}

export const AadhaarVerificationSection: React.FC<AadhaarVerificationSectionProps> = ({
  user,
  onInitiateAadhaar,
  loading = false,
}) => {
  const { updateUser } = useAuth();
  const { showToast } = useToast();

  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isWaitingInNewTab, setIsWaitingInNewTab] = useState(false);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [activeAuthUrl, setActiveAuthUrl] = useState<string | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setInterval>>(null);
  const cleanupTabRef = useRef<(() => void) | null>(null);
  const activeWindowRef = useRef<Window | null>(null);

  const isVerified = Boolean(user?.aadhaar_verified);

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
    setSubmitting(false);
  }, [stopPolling]);

  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, [cleanupSession]);

  const confirmWithBackend = useCallback(
    async (clientId: string): Promise<boolean> => {
      try {
        const verifyRes = await kycApi.verifyAadhaar({ client_id: clientId });
        if (verifyRes.data.success) {
          if (user) {
            updateUser({
              ...user,
              aadhaar_verified: true,
              aadhaar_masked: verifyRes.data.data?.masked_id || 'XXXXXXXX1234',
              aadhaar_registered_name: verifyRes.data.data?.registered_name || user.name,
              aadhaar_verified_at: verifyRes.data.data?.verified_at || new Date().toISOString(),
            });
          }
          cleanupSession();
          showToast('Aadhaar verified successfully via DigiLocker! 🛡️', 'success');
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [cleanupSession, showToast, updateUser, user]
  );

  const handleManualCheck = async () => {
    if (!activeClientId) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const verified = await confirmWithBackend(activeClientId);
      if (!verified) {
        setErrorMsg('Verification is still pending in DigiLocker. Please complete the authorization in the opened tab.');
      }
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStart = async () => {
    if (!consent && !isVerified) {
      setErrorMsg('Please review and check the informed consent box to continue with DigiLocker verification.');
      return;
    }

    // Pre-open window synchronously in the user click event to bypass popup blockers
    const preOpenedTab = preOpenAuthWindow();
    activeWindowRef.current = preOpenedTab;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await onInitiateAadhaar(true);
      const clientId = res.client_id;
      const authUrl = res.authorization_url;

      if (clientId) setActiveClientId(clientId);
      if (authUrl) setActiveAuthUrl(authUrl);

      if (!authUrl) {
        if (preOpenedTab && !preOpenedTab.closed) preOpenedTab.close();
        if (clientId) {
          await confirmWithBackend(clientId);
        }
        setSubmitting(false);
        return;
      }

      setIsWaitingInNewTab(true);

      // Open and listen to messages in the new tab
      const { authWindow, cleanup } = openDigilockerInNewTab({
        authorizationUrl: authUrl,
        token: res.token,
        windowRef: preOpenedTab,
        onSuccess: async () => {
          stopPolling();
          if (clientId) {
            await confirmWithBackend(clientId);
          }
        },
        onFailure: async (failReason) => {
          // If tab closed, attempt one final check
          if (clientId) {
            const ok = await confirmWithBackend(clientId);
            if (!ok) {
              setErrorMsg(typeof failReason === 'string' ? failReason : 'DigiLocker verification was cancelled or closed.');
              setIsWaitingInNewTab(false);
              setSubmitting(false);
            }
          }
        },
      });

      cleanupTabRef.current = cleanup;
      activeWindowRef.current = authWindow;

      // Start automatic polling every 3 seconds
      if (clientId) {
        stopPolling();
        let polls = 0;
        pollTimerRef.current = setInterval(async () => {
          polls++;
          if (polls > 100) {
            stopPolling();
            setIsWaitingInNewTab(false);
            setSubmitting(false);
            return;
          }
          const isDone = await confirmWithBackend(clientId);
          if (isDone) {
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
      }
    } catch (err: unknown) {
      if (preOpenedTab && !preOpenedTab.closed) preOpenedTab.close();
      setErrorMsg(extractErrorMessage(err) || 'Failed to initiate DigiLocker session.');
      setIsWaitingInNewTab(false);
      setSubmitting(false);
    }
  };

  const handleReopenTab = () => {
    if (activeAuthUrl) {
      window.open(activeAuthUrl, '_blank');
    }
  };

  return (
    <Card className={`border ${isVerified ? 'border-[#a7f3d0] bg-white' : 'border-[#e7e5e4] bg-white'}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-[#0c0a09] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0c0a09]" />
            Aadhaar Verification (DigiLocker)
          </CardTitle>
          <p className="text-xs text-[#78716c] mt-0.5">
            Instant paperless identity verification powered by Surepass DigiLocker gateway.
          </p>
        </div>
        <Badge
          variant={isVerified ? 'success' : 'neutral'}
          size="sm"
          icon={isVerified ? <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> : undefined}
        >
          {isVerified ? 'Verified' : isWaitingInNewTab ? 'In Progress' : 'Not Started'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerified ? (
          <div className="p-4 rounded-xl bg-[#ecfdf5]/60 border border-[#a7f3d0] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-[#065f46] font-medium block">Masked Aadhaar UID</span>
                <span className="font-mono font-bold text-sm text-[#0c0a09] mt-0.5 block tracking-wider">
                  {user?.aadhaar_masked || 'XXXXXXXX1234'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#065f46] font-medium block">Verified Citizen Name</span>
                <span className="font-semibold text-xs text-[#0c0a09] mt-0.5 block">
                  {user?.aadhaar_registered_name || user?.name || 'Verified Citizen'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#065f46] font-medium block">Verification Timestamp</span>
                <span className="text-xs text-[#78716c] mt-0.5 block">
                  {user?.aadhaar_verified_at ? new Date(user.aadhaar_verified_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#065f46] flex items-center gap-1.5 pt-1 border-t border-[#a7f3d0]/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
              Authorized UIDAI document digitally confirmed via Government of India DigiLocker.
            </p>
          </div>
        ) : isWaitingInNewTab ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] text-xs text-[#1e40af] space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#2563eb]" />
                <span className="font-bold text-sm text-[#1e3a8a]">DigiLocker Opened in a New Tab</span>
              </div>
              <p className="text-[#1e40af] leading-relaxed">
                Please complete OTP verification in the newly opened tab. Once authorized, this window will automatically detect completion and confirm your identity.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#bfdbfe]/60">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleManualCheck}
                  loading={submitting}
                  icon={<Check className="w-3.5 h-3.5" />}
                >
                  I've Authorized - Check Status
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReopenTab}
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Reopen DigiLocker Tab
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={cleanupSession}
                >
                  Cancel
                </Button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-xs text-[#991b1b] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#dc2626]" />
                <p className="font-semibold">{errorMsg}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e7e5e4] text-xs text-[#57534e] space-y-2">
              <p className="font-semibold text-[#0c0a09]">
                How DigiLocker Verification Works:
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-[#78716c]">
                <li>DigiLocker opens securely in a dedicated new tab.</li>
                <li>Authenticate using your mobile OTP or DigiLocker PIN.</li>
                <li>Grant consent to share verified identity credentials with Surepass.</li>
                <li>This dashboard automatically verifies your credentials upon completion.</li>
              </ol>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-xs text-[#991b1b] flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#dc2626]" />
                <div>
                  <p className="font-semibold">{errorMsg}</p>
                  <p className="text-[11px] text-[#b91c1c] mt-0.5">You can retry initiation or proceed with PAN verification first.</p>
                </div>
              </div>
            )}

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#e7e5e4] hover:bg-[#fafafa] cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded border-[#d6d3d1] text-[#0c0a09] focus:ring-[#0c0a09]"
              />
              <span className="text-xs text-[#0c0a09] font-medium leading-relaxed">
                I hereby grant affirmative consent to verify my Aadhaar credentials via Government DigiLocker.
              </span>
            </label>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#78716c]">
                Opens securely in a new tab
              </span>
              <Button
                variant="primary"
                size="md"
                onClick={handleStart}
                loading={submitting || loading}
                disabled={!consent}
                icon={<ExternalLink className="w-4 h-4" />}
              >
                Launch DigiLocker (New Tab)
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AadhaarVerificationSection;

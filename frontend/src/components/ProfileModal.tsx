import { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import { panApi, kycApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import VerificationBadge from './VerificationBadge';
import CreditDashboardModal from './CreditDashboardModal';
import { preOpenAuthWindow, openDigilockerInNewTab } from '../features/kyc/digiboostSdk';
import { maskPan } from '../lib/masking';
import {
  User as UserIcon,
  Activity as ActivityIcon,
  ShieldCheck,
} from 'lucide-react';
import type { UserPointsData, Activity } from '../types';
import { ProfileOverviewTab } from '../features/profile/components/ProfileOverviewTab';
import { ProfileDetailsTab } from '../features/profile/components/ProfileDetailsTab';
import { ProfileIdentityTab } from '../features/profile/components/ProfileIdentityTab';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  groupId?: string;
  userPointsData?: UserPointsData | null;
  activities?: Activity[];
  onSuccess?: () => void;
  initialTab?: ProfileTab;
}

type ProfileTab = 'overview' | 'details' | 'kyc';

export default function ProfileModal({
  open,
  onClose,
  groupId,
  userPointsData,
  activities = [],
  onSuccess,
  initialTab = 'overview',
}: ProfileModalProps) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [tabOverride, setTabOverride] = useState<ProfileTab | null>(null);
  const activeTab = tabOverride ?? initialTab;
  const setActiveTab = (tab: ProfileTab) => setTabOverride(tab);

  // Modal and KYC state
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [aadhaarError, setAadhaarError] = useState('');

  // PAN Verification state
  const [profilePanInput, setProfilePanInput] = useState('');
  const [profilePanLoading, setProfilePanLoading] = useState(false);
  const [profilePanError, setProfilePanError] = useState('');
  const [profilePanSuccess, setProfilePanSuccess] = useState('');

  async function handleVerifyProfilePan(e: React.FormEvent) {
    e.preventDefault();
    setProfilePanError('');
    setProfilePanSuccess('');
    const cleanPan = profilePanInput.trim().toUpperCase();
    if (!cleanPan) {
      setProfilePanError('Please enter your 10-character PAN.');
      return;
    }
    const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!PAN_RE.test(cleanPan)) {
      setProfilePanError('Invalid PAN format (e.g. ABCDE1234A).');
      return;
    }

    setProfilePanLoading(true);
    try {
      const res = await panApi.verifyPan({ pan: cleanPan });

      if (res.data.success) {
        setProfilePanSuccess('PAN verified successfully!');
        showToast('PAN verified successfully! 🛡️', 'success');
        const rawMasked = res.data.data?.masked_id || res.data.data?.pan_masked;
        const masked = maskPan(rawMasked || cleanPan);
        const regName = res.data.data?.registered_name || res.data.data?.name;
        const verifiedAt = res.data.data?.verified_at || undefined;
        if (user) {
          updateUser({
            ...user,
            pan_verified: true,
            pan_masked: masked,
            pan_registered_name: regName,
            pan_verified_at: verifiedAt,
          });
        }
      } else {
        setProfilePanError(res.data.error || res.data.message || 'PAN verification failed.');
      }
    } catch (err: unknown) {
      setProfilePanError(extractErrorMessage(err));
    } finally {
      setProfilePanLoading(false);
    }
  }

  async function handleInitiateAadhaar(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!aadhaarConsent) {
      setAadhaarError('Please check the informed consent checkbox to proceed.');
      return;
    }

    const preOpenedTab = preOpenAuthWindow();
    setAadhaarLoading(true);
    setAadhaarError('');

    try {
      const redirectUrl = `${window.location.origin}/kyc/callback`;
      const res = await kycApi.initiateAadhaar({ consent: true, redirect_url: redirectUrl });
      if (!res.data.success) {
        if (preOpenedTab && !preOpenedTab.closed) preOpenedTab.close();
        setAadhaarError(res.data.error || 'Failed to initialize DigiLocker session.');
        setAadhaarLoading(false);
        return;
      }

      const clientId = res.data.client_id;
      const sdkToken = res.data.token;
      const authUrl = res.data.authorization_url;

      const confirmVerification = async (): Promise<boolean> => {
        try {
          const verifyRes = await kycApi.verifyAadhaar({ client_id: clientId });
          if (verifyRes.data.success && verifyRes.data.status === 'verified') {
            if (user) {
              updateUser({
                ...user,
                aadhaar_verified: true,
                aadhaar_masked: verifyRes.data.data?.masked_id || 'XXXXXXXX1234',
                aadhaar_registered_name: verifyRes.data.data?.registered_name || user.name,
                aadhaar_verified_at: new Date().toISOString(),
              });
            }
            showToast('Aadhaar verified successfully via DigiLocker! 🛡️', 'success');
            setAadhaarLoading(false);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      };

      if (sdkToken && !sdkToken.startsWith('mock_')) {
        showToast('Opening DigiLocker authorization in a new tab...', 'info');

        let isDone = false;
        let pollTimer: ReturnType<typeof setInterval> | null = null;

        const stopPolling = () => {
          if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
        };

        const { authWindow, cleanup } = openDigilockerInNewTab({
          authorizationUrl: authUrl,
          token: sdkToken,
          gateway: 'sandbox',
          windowRef: preOpenedTab,
          onSuccess: async () => {
            if (isDone) return;
            isDone = true;
            stopPolling();
            cleanup();
            await confirmVerification();
          },
          onFailure: async (failReason) => {
            if (isDone) return;
            const ok = await confirmVerification();
            if (!ok) {
              isDone = true;
              stopPolling();
              cleanup();
              setAadhaarError(typeof failReason === 'string' ? failReason : 'DigiLocker verification was cancelled or closed.');
              setAadhaarLoading(false);
            }
          },
        });

        // Background auto-polling
        let polls = 0;
        pollTimer = setInterval(async () => {
          polls++;
          if (polls > 100 || isDone) {
            stopPolling();
            if (!isDone) setAadhaarLoading(false);
            return;
          }
          const ok = await confirmVerification();
          if (ok) {
            isDone = true;
            stopPolling();
            cleanup();
            if (authWindow && !authWindow.closed) {
              try {
                authWindow.close();
              } catch {
                // ignore
              }
            }
          }
        }, 3000);
      } else {
        if (preOpenedTab && !preOpenedTab.closed) preOpenedTab.close();
        await confirmVerification();
      }
    } catch (err: unknown) {
      if (preOpenedTab && !preOpenedTab.closed) preOpenedTab.close();
      setAadhaarError(extractErrorMessage(err));
      setAadhaarLoading(false);
    }
  }

  const {
    name,
    setName,
    phone,
    setPhone,
    loading,
    error,
    successMsg,
    handleSubmit,
    resetStatus,
  } = useProfileCompletion(groupId, onSuccess);

  // Filter activities to show only logged-in user's activity
  const userActivities = activities.filter((act) => {
    if (!user) return false;
    const memberName = (act.member_name || '').toLowerCase();
    const userName = (user.name || '').toLowerCase();
    const userEmail = (user.email || '').toLowerCase();

    if (memberName && (memberName === userName || memberName === userEmail)) return true;
    if (act.metadata?.user_email && String(act.metadata.user_email).toLowerCase() === userEmail) return true;
    if (act.metadata?.user_id && act.metadata.user_id === user.id) return true;
    return false;
  });

  function handleClose() {
    resetStatus();
    onClose();
  }

  return (
    <>
      <Modal open={open} onClose={handleClose} title="My Profile & Points" maxWidth="max-w-xl">
        <div className="space-y-5 text-[#0c0a09]">
          {/* User Summary Card */}
          <div className="bg-[#fafafa] border border-[#e7e5e4] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0c0a09] to-[#292524] text-white flex items-center justify-center font-extrabold text-base shadow-xs ring-2 ring-[#e7e5e4] shrink-0">
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-[#0c0a09] truncate">
                    {user?.name || user?.email || 'User'}
                  </h3>
                  <span className="text-[10px] font-bold text-[#370e00] bg-[#ffdbce] px-2 py-0.5 rounded-full shrink-0">
                    You
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <VerificationBadge
                    type="pan"
                    status={user?.pan_verified ? 'VERIFIED' : 'NOT_STARTED'}
                    size="sm"
                  />
                  <VerificationBadge
                    type="aadhaar"
                    status={user?.aadhaar_verified ? 'VERIFIED' : 'NOT_STARTED'}
                    size="sm"
                  />
                </div>
                <p className="text-[11px] text-[#78716c] truncate mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="bg-white border border-[#e7e5e4] px-4 py-2 rounded-2xl shadow-2xs text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider block">
                Your Points
              </span>
              <span className="text-base font-extrabold text-[#b4552d]">
                {userPointsData?.user_points || 0} pts
              </span>
            </div>
          </div>

          {/* Segmented Tab Switcher (Fits single row in max-w-xl) */}
          <div className="grid grid-cols-3 gap-1 bg-[#f5f5f4] p-1.5 rounded-2xl border border-[#e7e5e4]">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-white text-[#0c0a09] shadow-xs'
                  : 'text-[#78716c] hover:text-[#0c0a09]'
              }`}
            >
              <ActivityIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'details'
                  ? 'bg-white text-[#0c0a09] shadow-xs'
                  : 'text-[#78716c] hover:text-[#0c0a09]'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Edit Profile Details</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kyc')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'kyc'
                  ? 'bg-white text-[#0c0a09] shadow-xs'
                  : 'text-[#78716c] hover:text-[#0c0a09]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Identity &amp; Verification</span>
            </button>
          </div>

          {/* Content Pane */}
          {activeTab === 'overview' ? (
            <ProfileOverviewTab
              userPointsData={userPointsData}
              userActivities={userActivities}
              onClose={handleClose}
            />
          ) : activeTab === 'details' ? (
            <ProfileDetailsTab
              user={user}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              loading={loading}
              error={error}
              successMsg={successMsg}
              handleSubmit={handleSubmit}
              handleClose={handleClose}
              profilePanInput={profilePanInput}
              setProfilePanInput={setProfilePanInput}
              profilePanLoading={profilePanLoading}
              profilePanError={profilePanError}
              setProfilePanError={setProfilePanError}
              profilePanSuccess={profilePanSuccess}
              handleVerifyProfilePan={handleVerifyProfilePan}
            />
          ) : (
            <ProfileIdentityTab
              user={user}
              aadhaarLoading={aadhaarLoading}
              aadhaarConsent={aadhaarConsent}
              setAadhaarConsent={setAadhaarConsent}
              aadhaarError={aadhaarError}
              setAadhaarError={setAadhaarError}
              handleInitiateAadhaar={handleInitiateAadhaar}
              profilePanInput={profilePanInput}
              setProfilePanInput={setProfilePanInput}
              profilePanLoading={profilePanLoading}
              profilePanError={profilePanError}
              setProfilePanError={setProfilePanError}
              profilePanSuccess={profilePanSuccess}
              handleVerifyProfilePan={handleVerifyProfilePan}
              onOpenCreditModal={() => setCreditModalOpen(true)}
              onClose={handleClose}
            />
          )}
        </div>
      </Modal>

      <CreditDashboardModal
        open={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
      />
    </>
  );
}

import { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import { panApi, kycApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import VerificationBadge from './VerificationBadge';
import CreditDashboardModal from './CreditDashboardModal';
import { mountDigiboostSdk } from '../features/kyc/digiboostSdk';
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
        const masked = res.data.data?.masked_id || res.data.data?.pan_masked;
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
    setAadhaarLoading(true);
    setAadhaarError('');
    try {
      const redirectUrl = `${window.location.origin}/kyc/callback`;
      const res = await kycApi.initiateAadhaar({ consent: true, redirect_url: redirectUrl });
      if (!res.data.success) {
        setAadhaarError(res.data.error || 'Failed to initialize DigiLocker session.');
        setAadhaarLoading(false);
        return;
      }

      const clientId = res.data.client_id;
      const sdkToken = res.data.token;

      const confirmVerification = async () => {
        try {
          const verifyRes = await kycApi.verifyAadhaar({ client_id: clientId });
          if (verifyRes.data.success) {
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
          } else {
            setAadhaarError(verifyRes.data.error || 'Aadhaar verification could not be confirmed.');
          }
        } catch (confirmErr) {
          setAadhaarError(extractErrorMessage(confirmErr));
        } finally {
          setAadhaarLoading(false);
        }
      };

      if (sdkToken && !sdkToken.startsWith('mock_')) {
        showToast('Opening DigiLocker authorization popup...', 'info');
        try {
          await mountDigiboostSdk({
            token: sdkToken,
            gateway: 'sandbox',
            buttonTitle: 'Verify with DigiLocker',
            onSuccess: async () => {
              await confirmVerification();
            },
            onFailure: (err) => {
              setAadhaarError(typeof err === 'string' ? err : 'DigiLocker verification was cancelled.');
              setAadhaarLoading(false);
            },
          });
          const onMessage = async (event: MessageEvent) => {
            if (event.data?.type === 'digilocker:complete') {
              window.removeEventListener('message', onMessage);
              await confirmVerification();
            } else if (event.data?.type === 'digilocker:failed') {
              window.removeEventListener('message', onMessage);
              setAadhaarError('DigiLocker verification was cancelled.');
              setAadhaarLoading(false);
            }
          };
          window.addEventListener('message', onMessage);
        } catch {
          if (res.data.authorization_url) {
            window.location.href = res.data.authorization_url;
          } else {
            await confirmVerification();
          }
        }
      } else {
        await confirmVerification();
      }
    } catch (err: unknown) {
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
      <Modal open={open} onClose={handleClose} title="My Profile & Points">
        <div className="space-y-4 text-[#171923]">
          {/* User Summary Card */}
          <div className="bg-gradient-to-r from-[#635BFF]/10 via-[#635BFF]/5 to-transparent border border-[#635BFF]/20 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] text-white flex items-center justify-center font-black text-lg shadow-sm border border-white/20">
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-sm text-[#171923]">
                    {user?.name || user?.email || 'User'}
                  </h3>
                  <span className="text-[9px] font-extrabold text-[#635BFF] bg-[#635BFF]/10 px-2 py-0.5 rounded-full">
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
                <p className="text-[11px] text-[#667085] mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-white border border-[#E7E9EE] px-3 py-1.5 rounded-xl shadow-2xs text-center">
                <span className="text-[9px] uppercase font-bold text-[#667085] block">Your Points</span>
                <span className="text-sm font-black text-[#635BFF]">
                  {userPointsData?.user_points || 0} pts
                </span>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center gap-1.5 bg-[#F2F4F7] p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-white text-[#635BFF] shadow-xs'
                  : 'text-[#667085] hover:text-[#171923]'
              }`}
            >
              <ActivityIcon className="w-3.5 h-3.5" /> Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'details'
                  ? 'bg-white text-[#635BFF] shadow-xs'
                  : 'text-[#667085] hover:text-[#171923]'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" /> Edit Profile Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('kyc')}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'kyc'
                  ? 'bg-white text-[#635BFF] shadow-xs'
                  : 'text-[#667085] hover:text-[#171923]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Identity & Verification
            </button>
          </div>

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
              onOpenCreditModal={() => setCreditModalOpen(true)}
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

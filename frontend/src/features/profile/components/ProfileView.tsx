import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { kycApi, authApi } from '../../../services/apiServices';
import { extractErrorMessage } from '../../../lib/api';
import { maskPan } from '../../../lib/masking';
import {
  User as UserIcon,
  CreditCard,
  ShieldCheck,
  Layers,
  Shield,
} from 'lucide-react';
import { Tabs } from '../../../components/ui';
import PersonalProfileSection from './PersonalProfileSection';
import PanVerificationSection from './PanVerificationSection';
import AadhaarVerificationSection from './AadhaarVerificationSection';
import VerificationSummarySection from './VerificationSummarySection';
import AccountSecuritySection from './AccountSecuritySection';

type ProfileTabType = 'summary' | 'personal' | 'pan' | 'aadhaar' | 'security';

interface ProfileViewProps {
  initialTab?: ProfileTabType;
  onClose?: () => void;
  className?: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  initialTab = 'summary',
  className = '',
}) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ProfileTabType>(initialTab);
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (data: { name: string; phone?: string }) => {
    setLoading(true);
    try {
      const res = await authApi.updateProfile(data);
      if (updateUser && res.data) {
        updateUser(res.data);
      }
      showToast('Profile updated successfully!', 'success');
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      showToast(msg, 'error');
      throw new Error(msg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPan = async (pan: string) => {
    setLoading(true);
    try {
      const res = await kycApi.verifyPan({ pan_number: pan, consent: true });
      if (res.data.success) {
        if (updateUser && user) {
          updateUser({
            ...user,
            pan_verified: true,
            pan_masked: maskPan(res.data.data?.masked_id || pan),
            pan_registered_name: res.data.data?.registered_name,
            pan_verified_at: res.data.data?.verified_at,
          });
        }
        showToast('PAN verified successfully with government registry!', 'success');
      }
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      showToast(msg, 'error');
      throw new Error(msg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateAadhaar = async (consent: boolean) => {
    setLoading(true);
    try {
      const callbackUrl = `${window.location.origin}/kyc/callback`;
      const res = await kycApi.initiateAadhaar({
        redirect_url: callbackUrl,
        consent,
      });
      return {
        authorization_url: res.data.authorization_url,
        client_id: res.data.client_id,
      };
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      showToast(msg, 'error');
      throw new Error(msg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAadhaar = async () => {
    setLoading(true);
    try {
      await kycApi.cancelAadhaar({});
      showToast('DigiLocker verification session cancelled.', 'info');
    } catch (err: unknown) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const profileTabs = [
    { id: 'summary', label: 'Summary', icon: <Layers className="w-4 h-4" /> },
    { id: 'personal', label: 'Personal Info', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'pan', label: 'PAN Verification', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'aadhaar', label: 'Aadhaar (DigiLocker)', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <Tabs
        tabs={profileTabs}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as ProfileTabType)}
      />

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-fade-in">
          <VerificationSummarySection
            user={user}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        </div>
      )}

      {activeTab === 'personal' && (
        <div className="animate-fade-in">
          <PersonalProfileSection
            user={user}
            onUpdateProfile={handleUpdateProfile}
            loading={loading}
          />
        </div>
      )}

      {activeTab === 'pan' && (
        <div className="animate-fade-in">
          <PanVerificationSection
            user={user}
            onVerifyPan={handleVerifyPan}
            loading={loading}
          />
        </div>
      )}

      {activeTab === 'aadhaar' && (
        <div className="animate-fade-in">
          <AadhaarVerificationSection
            user={user}
            onInitiateAadhaar={handleInitiateAadhaar}
            onCancelAadhaar={handleCancelAadhaar}
            loading={loading}
          />
        </div>
      )}

      {activeTab === 'security' && (
        <div className="animate-fade-in">
          <AccountSecuritySection />
        </div>
      )}
    </div>
  );
};

export default ProfileView;

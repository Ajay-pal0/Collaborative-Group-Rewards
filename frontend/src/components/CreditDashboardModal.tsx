import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { creditApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { CreditProfile } from '../types';
import {
  CreditCard,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from './ui';
import { CreditScoreGauge } from '../features/credit/components/CreditScoreGauge';
import { PanFinancialCard } from '../features/credit/components/PanFinancialCard';
import { CreditMetricsGrid } from '../features/credit/components/CreditMetricsGrid';

interface CreditDashboardModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: 'pan_financial' | 'bureau';
  onOpenPanVerification?: () => void;
}

export default function CreditDashboardModal({
  open,
  onClose,
  initialTab,
  onOpenPanVerification,
}: CreditDashboardModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const defaultTab = initialTab || (user?.pan_verified ? 'pan_financial' : 'bureau');
  const [tabOverride, setTabOverride] = useState<'pan_financial' | 'bureau' | null>(null);
  const activeTab = tabOverride ?? defaultTab;
  const setActiveTab = (tab: 'pan_financial' | 'bureau') => setTabOverride(tab);

  const [profile, setProfile] = useState<CreditProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function loadCreditProfile() {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await creditApi.getProfile();
      setProfile(res.data);
    } catch (err) {
      setErrorMsg(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadCreditProfile();
    }
  }, [open]);

  async function handleRequestReport(e: React.FormEvent) {
    e.preventDefault();
    if (!consentGiven) {
      setErrorMsg('Please review and check the informed consent box to continue.');
      return;
    }

    setRequesting(true);
    setErrorMsg('');
    try {
      const res = await creditApi.requestReport({
        consent: true,
        purpose: 'Collaborative Group Rewards financial eligibility assessment',
      });
      setProfile(res.data);
      if (res.data.status === 'COMPLETED') {
        showToast('Credit profile retrieved successfully!', 'success');
      } else {
        showToast('Consent recorded! Provider access is being provisioned.', 'info');
      }
    } catch (err) {
      setErrorMsg(extractErrorMessage(err));
    } finally {
      setRequesting(false);
    }
  }

  const isPanVerified = Boolean(
    user?.pan_verified || profile?.pan_financial_info?.is_pan_verified
  );
  const panMasked =
    user?.pan_masked ||
    profile?.pan_financial_info?.pan_masked ||
    'ABCDE••••F';
  const registeredName =
    user?.pan_registered_name ||
    profile?.pan_financial_info?.registered_name ||
    user?.name ||
    'VERIFIED CARDHOLDER';
  const panCategory = profile?.pan_financial_info?.category || 'Individual';
  const panStatus = profile?.pan_financial_info?.pan_status || 'Active';
  const aadhaarLinked = Boolean(
    profile?.pan_financial_info?.aadhaar_linked ?? user?.aadhaar_verified ?? true
  );

  const hasScore = Boolean(profile?.credit_score);

  return (
    <Modal open={open} onClose={onClose} title="Financial & Credit Insights">
      <div className="space-y-4 text-[#171923]">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#F2F4F7] p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('pan_financial')}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pan_financial'
                ? 'bg-white text-[#635BFF] shadow-xs'
                : 'text-[#667085] hover:text-[#171923]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> PAN Financial Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bureau')}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'bureau'
                ? 'bg-white text-[#635BFF] shadow-xs'
                : 'text-[#667085] hover:text-[#171923]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Bureau Credit Score
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FEF3F2] border border-[#F04438]/20 text-[#B42318] text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#F04438]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#635BFF] animate-spin mx-auto" />
            <p className="text-xs text-[#667085] font-semibold">
              Loading financial insights...
            </p>
          </div>
        ) : activeTab === 'pan_financial' ? (
          /* TAB 1: PAN Financial Profile */
          <div className="space-y-4">
            <PanFinancialCard
              isPanVerified={isPanVerified}
              panMasked={panMasked}
              registeredName={registeredName}
              panCategory={panCategory}
              panStatus={panStatus}
              aadhaarLinked={aadhaarLinked}
              onOpenPanVerification={onOpenPanVerification}
            />

            {/* Quick Switch CTA */}
            <div className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#E7E9EE] flex items-center justify-between">
              <div>
                <h5 className="font-extrabold text-xs text-[#171923]">
                  Want Bureau Credit Information?
                </h5>
                <p className="text-[11px] text-[#667085]">
                  Check authorized credit score, active accounts, and liability.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('bureau')}
              >
                View Score →
              </Button>
            </div>
          </div>
        ) : (
          /* TAB 2: Bureau Credit Score */
          <div className="space-y-4">
            {hasScore ? (
              <div className="space-y-4">
                <CreditScoreGauge
                  score={profile?.credit_score}
                  scoreBand={profile?.score_band}
                  fetchedAt={profile?.last_report_date}
                />

                {profile && <CreditMetricsGrid profile={profile} />}
              </div>
            ) : (
              /* Request Report Form */
              <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#635BFF]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#171923]">
                      Authorized Credit Profile Check
                    </h4>
                    <p className="text-xs text-[#667085] mt-0.5">
                      Request your authorized credit score and active liabilities via Surepass bureau gateway.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E7E9EE] text-xs text-[#667085] space-y-1">
                  <span className="font-bold text-[#171923] block">Safe & Authorized Inquiry:</span>
                  <p className="text-[11px] leading-relaxed">
                    This inquiry is securely processed with full compliance. Checking your score here will not negatively impact your bureau credit score.
                  </p>
                </div>

                <form onSubmit={handleRequestReport} className="space-y-4 pt-1">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E7E9EE] cursor-pointer text-xs text-[#667085] hover:border-[#635BFF]/30 transition-all">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => {
                        setConsentGiven(e.target.checked);
                        if (errorMsg) setErrorMsg('');
                      }}
                      className="mt-0.5 rounded border-[#D0D5DD] text-[#635BFF] focus:ring-[#635BFF]"
                    />
                    <span className="leading-relaxed">
                      I authorize Collaborative Group Rewards to obtain my credit information from authorized bureaus via Surepass for reward tier eligibility.
                    </span>
                  </label>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={requesting}
                    disabled={!consentGiven}
                    className="w-full"
                    icon={<ShieldCheck className="w-4 h-4" />}
                  >
                    Request Credit Profile
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#E7E9EE] flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

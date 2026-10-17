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
  ExternalLink,
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
      if (res.data.status === 'PENDING_PROVIDER_ACCESS' || res.data.status === 'FAILED') {
        const err = res.data.error || res.data.status_message || res.data.message;
        if (err) setErrorMsg(err);
      }
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
      } else if (res.data.status === 'PENDING_PROVIDER_ACCESS' || res.data.status === 'FAILED') {
        const err =
          res.data.error ||
          res.data.status_message ||
          res.data.message ||
          'Credit bureau API access is currently pending provisioning on this account.';
        setErrorMsg(err);
        showToast(err, 'error');
      } else {
        showToast(
          res.data.status_message ||
            res.data.message ||
            'Consent recorded! Provider access is being provisioned.',
          'info'
        );
      }
    } catch (err) {
      setErrorMsg(extractErrorMessage(err));
      showToast(extractErrorMessage(err), 'error');
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
    <Modal open={open} onClose={onClose} title="Financial & Credit Insights" maxWidth="max-w-2xl">
      <div className="space-y-4 text-[#0c0a09]">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#f5f5f4] p-1.5 rounded-2xl border border-[#e7e5e4]">
          <button
            type="button"
            onClick={() => setActiveTab('pan_financial')}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pan_financial'
                ? 'bg-white text-[#0c0a09] shadow-xs'
                : 'text-[#78716c] hover:text-[#0c0a09]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> PAN Financial Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bureau')}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'bureau'
                ? 'bg-white text-[#0c0a09] shadow-xs'
                : 'text-[#78716c] hover:text-[#0c0a09]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Bureau Credit Score
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#dc2626]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0c0a09] animate-spin mx-auto" />
            <p className="text-xs text-[#78716c] font-semibold">
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
            <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e7e5e4] flex items-center justify-between">
              <div>
                <h5 className="font-extrabold text-xs text-[#0c0a09]">
                  Want Bureau Credit Information?
                </h5>
                <p className="text-[11px] text-[#78716c]">
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
                  status={profile?.status}
                  statusMessage={profile?.error || profile?.status_message || profile?.message}
                />

                {profile && <CreditMetricsGrid profile={profile} />}

                <div className="p-4 rounded-2xl bg-[#fff7ed] border border-[#ffedd5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-xs text-[#9a3412]">
                      TransUnion CIBIL Bureau Dashboard Available
                    </h5>
                    <p className="text-[11px] text-[#78716c]">
                      View full credit accounts, payment history, and bureau inquiries on the dedicated dashboard.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onClose();
                      window.location.href = '/credit';
                    }}
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Open Full Bureau Hub
                  </Button>
                </div>
              </div>
            ) : (
              /* Request Report Form */
              <div className="bg-[#fafafa] border border-[#e7e5e4] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0c0a09]/5 text-[#0c0a09] flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#0c0a09]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#0c0a09]">
                      Authorized Credit Profile Check
                    </h4>
                    <p className="text-xs text-[#78716c] mt-0.5">
                      Request your authorized credit score and active liabilities via Surepass bureau gateway.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#e7e5e4] text-xs text-[#78716c] space-y-1">
                  <span className="font-bold text-[#0c0a09] block">Safe & Authorized Inquiry:</span>
                  <p className="text-[11px] leading-relaxed">
                    This inquiry is securely processed with full compliance. Checking your score here will not negatively impact your bureau credit score.
                  </p>
                </div>

                <form onSubmit={handleRequestReport} className="space-y-4 pt-1">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#e7e5e4] cursor-pointer text-xs text-[#78716c] hover:border-[#0c0a09]/30 transition-all">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => {
                        setConsentGiven(e.target.checked);
                        if (errorMsg) setErrorMsg('');
                      }}
                      className="mt-0.5 rounded border-[#d6d3d1] text-[#0c0a09] focus:ring-[#0c0a09]"
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
        <div className="pt-3 border-t border-[#e7e5e4] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              window.location.href = '/credit';
            }}
            className="text-xs font-semibold text-[#0c0a09] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Dedicated CIBIL Bureau Page</span>
          </button>
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

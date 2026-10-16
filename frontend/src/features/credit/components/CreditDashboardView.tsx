import React, { useState, useEffect } from 'react';
import { creditApi } from '../../../services/apiServices';
import { extractErrorMessage } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import type { CreditProfile, DetailedCreditReport } from '../../../types';
import {
  CreditCard,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  FileText,
  Search,
  Lock,
  Layers,
  Calendar,
} from 'lucide-react';
import {
  Button,
  Badge,
  Tabs,
  LoadingState,
  ErrorState,
} from '../../../components/ui';
import { CreditScoreGauge } from './CreditScoreGauge';
import { PanFinancialCard } from './PanFinancialCard';
import { AccountSummary } from './AccountSummary';
import { CreditAccountsTable } from './CreditAccountsTable';
import { EnquiryList } from './EnquiryList';
import { PaymentHistory } from './PaymentHistory';

interface CreditDashboardViewProps {
  onOpenPanVerification?: () => void;
  className?: string;
}

export const CreditDashboardView: React.FC<CreditDashboardViewProps> = ({
  onOpenPanVerification,
  className = '',
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<CreditProfile | null>(null);
  const [detailedReport, setDetailedReport] = useState<DetailedCreditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingScore, setFetchingScore] = useState(false);
  const [fetchingReport, setFetchingReport] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'score' | 'full_report' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'history' | 'enquiries' | 'report'>('overview');

  async function loadCreditProfile() {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await creditApi.getProfile();
      setProfile(res.data);
      // If profile indicates full report exists, attempt to load it
      if (res.data.has_full_report) {
        try {
          const repRes = await creditApi.getFullReport();
          setDetailedReport(repRes.data);
        } catch {
          // Non-blocking if full report hasn't been fetched yet
        }
      }
    } catch (err) {
      setErrorMsg(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function init() {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await creditApi.getProfile();
        if (!ignore) {
          setProfile(res.data);
          if (res.data.has_full_report) {
            try {
              const repRes = await creditApi.getFullReport();
              if (!ignore) setDetailedReport(repRes.data);
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        if (!ignore) setErrorMsg(extractErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleInitiateScore = () => {
    setPendingAction('score');
    setShowConsentModal(true);
  };

  const handleInitiateFullReport = () => {
    setPendingAction('full_report');
    setShowConsentModal(true);
  };

  const executeConsentAction = async () => {
    if (!consentGiven) {
      showToast('Please check the affirmative consent box to proceed.', 'error');
      return;
    }

    setShowConsentModal(false);

    if (pendingAction === 'full_report') {
      setFetchingReport(true);
      try {
        const res = await creditApi.requestFullReport({
          consent: true,
          purpose: 'Comprehensive credit bureau assessment for rewards eligibility',
        });
        setDetailedReport(res.data);
        // Refresh profile
        await loadCreditProfile();
        showToast('Comprehensive CIBIL report fetched successfully!', 'success');
        setActiveTab('accounts');
      } catch (err) {
        showToast(extractErrorMessage(err), 'error');
      } finally {
        setFetchingReport(false);
      }
    } else {
      setFetchingScore(true);
      try {
        const res = await creditApi.getScore({
          consent: true,
          purpose: 'Official CIBIL credit score assessment',
        });
        setProfile(res.data);
        if (res.data.status === 'COMPLETED') {
          showToast('CIBIL score retrieved successfully!', 'success');
        } else {
          showToast(res.data.status_message || 'Informed consent recorded!', 'info');
        }
      } catch (err) {
        showToast(extractErrorMessage(err), 'error');
      } finally {
        setFetchingScore(false);
      }
    }
  };

  const isPanVerified = Boolean(
    user?.pan_verified || profile?.pan_financial_info?.is_pan_verified
  );

  const tabsList = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    {
      id: 'accounts',
      label: 'Accounts',
      icon: <CreditCard className="w-4 h-4" />,
      badge: detailedReport?.accounts?.length ? (
        <Badge variant="neutral" size="xs">
          {detailedReport.accounts.length}
        </Badge>
      ) : undefined,
    },
    { id: 'history', label: 'Payment History', icon: <Calendar className="w-4 h-4" /> },
    {
      id: 'enquiries',
      label: 'Enquiries',
      icon: <Search className="w-4 h-4" />,
      badge: detailedReport?.enquiries?.length ? (
        <Badge variant="neutral" size="xs">
          {detailedReport.enquiries.length}
        </Badge>
      ) : undefined,
    },
    { id: 'report', label: 'Report Details', icon: <FileText className="w-4 h-4" /> },
  ];

  if (loading && !profile) {
    return <LoadingState message="Loading CIBIL credit dashboard..." className={className} />;
  }

  if (errorMsg && !profile) {
    return (
      <ErrorState
        title="Unable to load credit profile"
        message={errorMsg}
        onRetry={loadCreditProfile}
        className={className}
      />
    );
  }

  const allPaymentHistories = detailedReport?.accounts?.flatMap((a) => a.payment_history || []) || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white border border-[#e7e5e4] rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0c0a09]">
              CIBIL Credit Intelligence
            </h2>
            <Badge variant="accent" size="sm">
              Surepass Bureau API
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#78716c] mt-1 max-w-xl">
            Access official TransUnion CIBIL credit score, detailed loan accounts, and repayment histories.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleInitiateScore}
            loading={fetchingScore}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {profile?.has_report ? 'Refresh Score' : 'Query CIBIL Score'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleInitiateFullReport}
            loading={fetchingReport}
            icon={<FileText className="w-3.5 h-3.5" />}
          >
            {detailedReport ? 'Update Full Report' : 'Fetch Full Report'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        tabs={tabsList}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as 'overview' | 'accounts' | 'history' | 'enquiries' | 'report')}
      />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CreditScoreGauge
              score={profile?.credit_score}
              scoreBand={profile?.score_band}
              fetchedAt={profile?.last_report_date}
              onFetchScore={handleInitiateScore}
              loading={fetchingScore}
            />

            <PanFinancialCard
              isPanVerified={Boolean(user?.pan_verified || profile?.pan_financial_info?.is_pan_verified)}
              panMasked={user?.pan_masked || profile?.pan_financial_info?.pan_masked || 'ABCDE••••F'}
              registeredName={user?.pan_registered_name || profile?.pan_financial_info?.registered_name || user?.name || 'CARDHOLDER'}
              panCategory={profile?.pan_financial_info?.category || 'Individual'}
              panStatus={profile?.pan_financial_info?.pan_status || 'Active'}
              aadhaarLinked={Boolean(profile?.pan_financial_info?.aadhaar_linked ?? user?.aadhaar_verified ?? true)}
              onOpenPanVerification={onOpenPanVerification}
            />
          </div>

          {/* Account Summary */}
          {detailedReport?.account_summary ? (
            <AccountSummary summary={detailedReport.account_summary} />
          ) : profile?.accounts_summary ? (
            <AccountSummary summary={profile.accounts_summary} />
          ) : (
            <div className="p-6 text-center rounded-2xl border border-dashed border-[#d6d3d1] bg-[#fafafa]">
              <Layers className="w-8 h-8 text-[#a8a29e] mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-[#0c0a09]">Detailed Summary Pending</h4>
              <p className="text-xs text-[#78716c] mt-1 max-w-sm mx-auto mb-4">
                Fetch your full CIBIL report to unlock high-credit limits, zero-balance accounts, and age breakdown.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleInitiateFullReport}
                loading={fetchingReport}
                icon={<FileText className="w-3.5 h-3.5" />}
              >
                Fetch Full Report
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Accounts */}
      {activeTab === 'accounts' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0c0a09]">
              Reported Credit & Loan Accounts
            </h3>
            {detailedReport?.accounts?.length ? (
              <span className="text-xs text-[#78716c]">
                {detailedReport.accounts.length} active and closed accounts
              </span>
            ) : null}
          </div>

          {detailedReport?.accounts && detailedReport.accounts.length > 0 ? (
            <CreditAccountsTable accounts={detailedReport.accounts} />
          ) : (
            <div className="p-8 text-center rounded-2xl border border-dashed border-[#d6d3d1] bg-[#fafafa]">
              <CreditCard className="w-10 h-10 text-[#a8a29e] mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-[#0c0a09]">No Account Details Loaded</h4>
              <p className="text-xs text-[#78716c] mt-1 max-w-sm mx-auto mb-4">
                Retrieve your detailed report to view individual credit lines, EMI details, and masked account numbers.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleInitiateFullReport}
                loading={fetchingReport}
              >
                Fetch Full CIBIL Report
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Payment History */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0c0a09]">
              Repayment Timeline & Compliance
            </h3>
          </div>

          {allPaymentHistories.length > 0 ? (
            <div className="p-6 bg-white border border-[#e7e5e4] rounded-2xl shadow-xs">
              <PaymentHistory history={allPaymentHistories} />
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border border-dashed border-[#d6d3d1] bg-[#fafafa]">
              <Calendar className="w-10 h-10 text-[#a8a29e] mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-[#0c0a09]">Payment History Not Loaded</h4>
              <p className="text-xs text-[#78716c] mt-1 max-w-sm mx-auto mb-4">
                Monthly repayment statuses (000 / On-time, 30+ DPD) are populated when fetching the comprehensive report.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleInitiateFullReport}
                loading={fetchingReport}
              >
                Fetch Full CIBIL Report
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Enquiries */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4 animate-fade-in">
          {detailedReport ? (
            <EnquiryList
              summary={detailedReport.inquiry_summary}
              enquiries={detailedReport.enquiries}
            />
          ) : (
            <div className="p-8 text-center rounded-2xl border border-dashed border-[#d6d3d1] bg-[#fafafa]">
              <Search className="w-10 h-10 text-[#a8a29e] mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-[#0c0a09]">Bureau Inquiries Not Loaded</h4>
              <p className="text-xs text-[#78716c] mt-1 max-w-sm mx-auto mb-4">
                Fetch your full CIBIL report to inspect bank and lender enquiries from the past 30 days to 24 months.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleInitiateFullReport}
                loading={fetchingReport}
              >
                Fetch Full CIBIL Report
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Report Details */}
      {activeTab === 'report' && (
        <div className="p-6 bg-white border border-[#e7e5e4] rounded-2xl shadow-xs space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f0efed]">
            <FileText className="w-5 h-5 text-[#0c0a09]" />
            <h3 className="text-sm font-bold text-[#0c0a09]">Audit & Compliance Metadata</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e7e5e4]">
              <span className="text-[11px] text-[#78716c] block">Integration Provider</span>
              <span className="font-semibold text-[#0c0a09] mt-0.5 block">
                TransUnion CIBIL via Surepass India
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e7e5e4]">
              <span className="text-[11px] text-[#78716c] block">Provider Reference</span>
              <span className="font-semibold text-[#0c0a09] mt-0.5 block font-mono">
                {detailedReport?.provider_reference || profile?.status_message || 'sp_ref_active'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e7e5e4]">
              <span className="text-[11px] text-[#78716c] block">Report Timestamp</span>
              <span className="font-semibold text-[#0c0a09] mt-0.5 block">
                {profile?.last_report_date || detailedReport?.fetched_at || 'Recent session'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e7e5e4]">
              <span className="text-[11px] text-[#78716c] block">Data Minimization Policy</span>
              <span className="font-semibold text-[#059669] mt-0.5 block">
                Enforced (Masked account numbers & safe metadata only)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#f5f5f4] border border-[#e7e5e4] text-xs text-[#78716c] flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#0c0a09] shrink-0 mt-0.5" />
            <p>
              Your credit bureau data is protected under banking security guidelines. Collaborative Group Rewards never sells or shares your personal credit reports. All raw PII is encrypted and access-controlled to your authenticated session.
            </p>
          </div>
        </div>
      )}

      {/* Informed Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#e7e5e4] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fff7ed] border border-[#ffedd5] flex items-center justify-center text-[#9a3412]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0c0a09]">
                  Informed Consent for Credit Inquiry
                </h3>
                <p className="text-xs text-[#78716c]">
                  Regulatory disclosure for TransUnion CIBIL bureau access
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e7e5e4] text-xs text-[#57534e] space-y-2">
              <p>
                By proceeding, you grant explicit authorization to Collaborative Group Rewards and Surepass Technologies to query your credit records from TransUnion CIBIL.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[#78716c]">
                <li>This inquiry will be used solely for financial eligibility and tier benefits.</li>
                <li>Your PAN and registered mobile number will be securely verified.</li>
                <li>All inquiries are recorded in compliance with Reserve Bank of India (RBI) guidelines.</li>
              </ul>
            </div>

            {!isPanVerified && (
              <div className="p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-xs text-[#92400e] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Tip: Verifying your PAN beforehand ensures immediate matching with official government credit registry records.
                </p>
              </div>
            )}

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#e7e5e4] hover:bg-[#fafafa] cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded border-[#d6d3d1] text-[#0c0a09] focus:ring-[#0c0a09]"
              />
              <span className="text-xs text-[#0c0a09] font-medium leading-relaxed">
                I hereby grant affirmative consent to retrieve my CIBIL credit score and bureau details.
              </span>
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowConsentModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={executeConsentAction}
                disabled={!consentGiven}
              >
                Authorize & Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditDashboardView;

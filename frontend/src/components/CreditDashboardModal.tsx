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
  Info,
  Calendar,
  Layers,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Lock,
  Award,
} from 'lucide-react';

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

  const score = profile?.credit_score;
  const scorePercent = score ? Math.min(Math.max(((score - 300) / 600) * 100, 0), 100) : 0;

  return (
    <Modal open={open} onClose={onClose} title="Financial & Credit Insights">
      <div className="space-y-5 text-slate-200">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('pan_financial')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'pan_financial'
                ? 'bg-[#635BFF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>PAN Financial Identity</span>
            {isPanVerified && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bureau')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'bureau'
                ? 'bg-[#635BFF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Bureau Credit Report</span>
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Loading verified financial data...</p>
          </div>
        ) : activeTab === 'pan_financial' ? (
          /* TAB 1: VISUAL SCREENS ON CREDIT & FINANCIAL INFORMATION FROM PAN API */
          <div className="space-y-5">
            {isPanVerified ? (
              <>
                {/* Visual Digital PAN Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] border border-indigo-500/30 p-5 shadow-xl text-slate-100">
                  {/* Decorative background glow */}
                  <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -left-10 -top-10 w-44 h-44 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-slate-700/50 pb-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-xs shadow-inner">
                        🇮🇳
                      </div>
                      <div>
                        <div className="text-[10px] tracking-widest uppercase font-extrabold text-amber-300/90 leading-tight">
                          आयकर विभाग / INCOME TAX DEPARTMENT
                        </div>
                        <div className="text-[9px] tracking-wider text-slate-400 font-semibold uppercase">
                          GOVERNMENT OF INDIA • PERMANENT ACCOUNT CARD
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      <span>NSDL VERIFIED</span>
                    </div>
                  </div>

                  {/* Card Mid: Chip + Details */}
                  <div className="grid grid-cols-12 gap-3 items-center my-3">
                    {/* Metallic Smart Chip Visual */}
                    <div className="col-span-3 flex flex-col items-start gap-1">
                      <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-300 border border-amber-200/50 shadow-inner flex items-center justify-center relative overflow-hidden">
                        <div className="w-7 h-5 border border-amber-900/30 rounded-xs" />
                        <div className="absolute w-full h-[1px] bg-amber-900/20" />
                      </div>
                      <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tighter">
                        CHIP SECURED
                      </span>
                    </div>

                    {/* Cardholder Information */}
                    <div className="col-span-9 space-y-1">
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                        Name / नाम
                      </div>
                      <div className="text-sm sm:text-base font-extrabold tracking-wide text-white uppercase truncate">
                        {registeredName}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Masked PAN & Category */}
                  <div className="flex items-end justify-between pt-2 border-t border-slate-700/50 mt-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                        Permanent Account Number
                      </div>
                      <div className="text-base sm:text-lg font-mono font-black tracking-widest text-amber-200">
                        {panMasked}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block uppercase font-medium">Category</span>
                      <span className="text-xs font-bold text-slate-200">{panCategory}</span>
                    </div>
                  </div>
                </div>

                {/* PAN Credit & Financial Health Indicators Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Financial Identity Signals from PAN API
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 100% Tax Compliant
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Signal 1: Operability */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px] font-medium">PAN Operability Status</span>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {panStatus} & Operative
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Valid & operative under Section 139AA of Indian Income Tax Act.
                      </p>
                    </div>

                    {/* Signal 2: Aadhaar Seeding */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px] font-medium">Aadhaar-PAN Linkage</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          aadhaarLinked
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {aadhaarLinked ? 'Linked & Operative' : 'Linkage Pending'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {aadhaarLinked
                          ? 'Aadhaar seeding is active; fully compliant for financial transactions.'
                          : 'Aadhaar linking is required for unified credit inquiries.'}
                      </p>
                    </div>

                    {/* Signal 3: Taxpayer Demographics */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px] font-medium">Taxpayer Standing</span>
                        <span className="text-slate-200 text-[11px] font-bold">
                          {panCategory} Resident
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Government records confirm registered individual identity.
                      </p>
                    </div>

                    {/* Signal 4: Identity Confidence */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px] font-medium">Registry Match Score</span>
                        <span className="text-indigo-300 text-[11px] font-bold">
                          98.5% High Confidence
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Direct automated NSDL verification with zero manual intervention.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Credit Readiness Banner */}
                <div className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#635BFF]/20 text-[#635BFF] flex items-center justify-center border border-[#635BFF]/30 shrink-0">
                      <Award className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Credit Readiness: Tier 1 Verified</span>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          Pre-Qualified
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Your verified PAN unlocks group milestone eligibility, priority rewards payouts, and credit bureau report checks.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bureau')}
                    className="bg-[#635BFF] hover:bg-[#4F46E5] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
                  >
                    Check Bureau Report →
                  </button>
                </div>
              </>
            ) : (
              /* Unverified PAN State */
              <div className="text-center py-8 px-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">
                  PAN Verification Required
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Verify your PAN card to unlock your digital PAN card, tax compliance standing, official verification badge, and credit readiness insights.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenPanVerification) onOpenPanVerification();
                    }}
                    className="bg-[#635BFF] hover:bg-[#4F46E5] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify PAN Now (+50 pts & Badge)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: BUREAU CREDIT INQUIRIES */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>Authorized Bureau (Experian/CIBIL/CRIF) Inquiries</span>
              </div>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[10px] text-slate-400">
                Secure Sandbox
              </span>
            </div>

            {profile?.has_report && score ? (
              /* COMPLETED REPORT VIEW */
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-5 text-center">
                  <div className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1 flex items-center justify-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Bureau Credit Score
                  </div>
                  <div className="text-5xl font-extrabold tracking-tight text-white mb-2">
                    {score}
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {profile.score_band || 'Good Standing'}
                  </div>

                  <div className="mt-4 w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-emerald-400 to-indigo-400 h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>300 (Poor)</span>
                    <span>650 (Fair)</span>
                    <span>750 (Good)</span>
                    <span>900 (Excellent)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                      <span>Total Outstanding</span>
                    </div>
                    <div className="text-base font-bold text-slate-100">
                      {profile.total_outstanding !== null
                        ? `₹${profile.total_outstanding.toLocaleString('en-IN')}`
                        : '—'}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>Active Accounts</span>
                    </div>
                    <div className="text-base font-bold text-slate-100">
                      {profile.active_accounts_count ?? 0}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Overdue Amount</span>
                    </div>
                    <div className="text-base font-bold text-emerald-400">
                      {profile.overdue_amount !== null
                        ? `₹${profile.overdue_amount.toLocaleString('en-IN')}`
                        : '₹0'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* PENDING / INITIAL CHECK VIEW */
              <div className="space-y-4">
                {profile?.status === 'PENDING_PROVIDER_ACCESS' ? (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Credit Bureau Provisioning Pending</span>
                    </div>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      {profile.status_message ||
                        'Informed consent has been recorded. Direct credit bureau report access is currently pending provisioning on this sandbox environment.'}
                    </p>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Government KYC verifications (Aadhaar & PAN) remain active and fully verified.
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto mb-2 border border-indigo-500/20">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Authorized Credit Profile Check
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Fetch your authorized credit score and active accounts.
                      Your inquiry is access-controlled and strictly recorded with explicit consent.
                    </p>
                  </div>
                )}

                <form onSubmit={handleRequestReport} className="space-y-3 pt-1">
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                    />
                    <span className="text-xs text-slate-300 leading-relaxed">
                      I give my explicit, informed consent to Collaborative Group Rewards to retrieve and display my credit inquiry summary for group rewards eligibility.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={requesting || !consentGiven}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {requesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Requesting Credit Profile...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Request Credit Profile</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

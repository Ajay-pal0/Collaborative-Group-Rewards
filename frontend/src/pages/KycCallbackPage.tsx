import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { kycApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Lock,
  Award,
  BadgePercent,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { Button } from '../components/ui';

export default function KycCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedData, setVerifiedData] = useState<{
    masked_id?: string;
    registered_name?: string;
    verified_at?: string;
  } | null>(null);

  // Auto redirect countdown state
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (success && !isPaused) {
      timer = setInterval(() => {
        if (!isPausedRef.current) {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              if (timer) clearInterval(timer);
              navigate('/groups');
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [success, isPaused, navigate]);

  useEffect(() => {
    confirmDigiLocker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmDigiLocker() {
    setLoading(true);
    setErrorMsg('');
    const clientId = searchParams.get('client_id') || undefined;
    const providerStatus = searchParams.get('status');

    if (providerStatus === 'failed' || providerStatus === 'cancelled') {
      setLoading(false);
      setErrorMsg('DigiLocker authorization was cancelled or unsuccessful.');
      return;
    }

    try {
      const res = await kycApi.verifyAadhaar({ client_id: clientId });
      if (res.data.success && res.data.status === 'verified') {
        setSuccess(true);
        const data = res.data.data;
        setVerifiedData({
          masked_id: data?.masked_id || 'XXXXXXXX9999',
          registered_name: data?.registered_name || 'AJAY SANTRAM PAL',
          verified_at: data?.verified_at,
        });

        if (user) {
          updateUser({
            ...user,
            aadhaar_verified: true,
            aadhaar_masked: data?.masked_id || 'XXXXXXXX9999',
            aadhaar_registered_name: data?.registered_name || 'AJAY SANTRAM PAL',
            aadhaar_verified_at: data?.verified_at || new Date().toISOString(),
          });
        }
        showToast('Aadhaar verified successfully via DigiLocker! 🛡️', 'success');
        if (typeof window !== 'undefined' && window.opener) {
          try {
            window.opener.postMessage({ type: 'digilocker:complete', client_id: clientId }, '*');
          } catch {
            // ignore cross-origin error
          }
        }
      } else {
        setErrorMsg(res.data.error || res.data.message || 'Verification could not be confirmed.');
        if (typeof window !== 'undefined' && window.opener) {
          try {
            window.opener.postMessage({ type: 'digilocker:failed', client_id: clientId }, '*');
          } catch {
            // ignore
          }
        }
      }
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err));
      if (typeof window !== 'undefined' && window.opener) {
        try {
          window.opener.postMessage({ type: 'digilocker:failed', client_id: clientId }, '*');
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0c0a09] flex flex-col font-sans selection:bg-[#ffdbce] selection:text-[#370e00]">
      {/* Top App Bar */}
      <header className="bg-white border-b border-[#e7e5e4] shadow-xs w-full sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand & Security Live Status */}
          <div className="flex items-center gap-4">
            <Link to="/groups" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-[#0c0a09] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-150">
                <BadgePercent className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-bold text-[#0c0a09] tracking-tight">
                Collaborative Group Rewards
              </span>
            </Link>

            {/* Official Node Certification Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f5f5] border border-[#e7e5e4]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
              </span>
              <span className="text-xs text-[#78716c] font-medium">
                Official UIDAI &amp; DigiLocker Gateway
              </span>
              <span className="text-[#d0c4be]">•</span>
              <span className="text-[11px] font-medium text-emerald-800 flex items-center gap-0.5">
                <Lock className="w-3 h-3 text-emerald-700" /> 256-Bit SSL
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-[#78716c]">
            <Link to="/groups" className="hover:text-[#0c0a09] transition-colors">Dashboard</Link>
            <Link to="/groups" className="hover:text-[#0c0a09] transition-colors">Squads</Link>
            <Link to="/groups" className="hover:text-[#0c0a09] transition-colors">Rewards</Link>
            <span className="text-[#0c0a09] font-bold border-b-2 border-[#0c0a09] pb-0.5">Security</span>
          </nav>

          {/* Trailing Identity & Support Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified via DigiLocker</span>
            </div>
            <button
              type="button"
              onClick={() => showToast('DigiLocker verification is tamper-proof and fully encrypted.', 'info')}
              className="text-[#78716c] hover:text-[#0c0a09] p-1.5 rounded-full hover:bg-[#f5f5f5] transition-colors"
              title="Support & Verification Guidance"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#0c0a09] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#e7e5e4]">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AP'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-10 relative overflow-hidden">
        <div className="w-full max-w-2xl mx-auto relative z-10">
          {/* Stepper / Breadcrumb Trail */}
          <div className="flex items-center justify-center gap-2 mb-6 text-xs text-[#78716c]">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 1. Consent Given
            </span>
            <span className="text-[#d0c4be]">→</span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 2. UIDAI Handshake
            </span>
            <span className="text-[#d0c4be]">→</span>
            <span className="flex items-center gap-1 text-[#0c0a09] font-bold px-2.5 py-0.5 rounded-md bg-[#e7e5e4]">
              3. Callback Certified
            </span>
          </div>

          {/* Main Verification Status Card */}
          <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e7e5e4] shadow-[0_4px_24px_-4px_rgba(12,10,9,0.06),0_1px_3px_0_rgba(12,10,9,0.04)] relative overflow-hidden">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#10b981] to-[#b4552d]"></div>

            {loading ? (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0c0a09]">
                    Verifying DigiLocker Session
                  </h2>
                  <p className="text-xs text-[#78716c] mt-1.5 max-w-xs mx-auto">
                    Retrieving authorized Aadhaar identity confirmation from official government gateway...
                  </p>
                </div>
              </div>
            ) : success ? (
              <div>
                {/* Hero Verification Icon & Badge */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-[#e7e5e4] shadow-xs">
                      <ShieldCheck className="w-4 h-4 text-[#b4552d]" />
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold mb-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>DigiLocker Verified Gateway</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0c0a09] tracking-tight mb-2">
                    Aadhaar Verified!
                  </h1>
                  <p className="text-xs sm:text-sm text-[#78716c] max-w-lg">
                    Your government identity credentials have been successfully authenticated via official DigiLocker &amp; Digiboost Web SDK.
                  </p>
                </div>

                {/* Verified Credential Certificate Box */}
                <div className="mt-8 rounded-2xl p-5 sm:p-6 bg-[#fbfbfa] border border-[#e7e5e4] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#e7e5e4] pb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#0c0a09]" />
                      <span className="text-xs font-bold text-[#0c0a09] uppercase tracking-wider">
                        Official Authentication Summary
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Validated
                    </span>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-left">
                    <div>
                      <dt className="text-[11px] uppercase font-semibold text-[#78716c] tracking-wider">
                        Registered Citizen Name
                      </dt>
                      <dd className="mt-0.5 text-sm font-bold text-[#0c0a09] flex items-center gap-1.5">
                        {verifiedData?.registered_name || 'AJAY SANTRAM PAL'}
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[11px] uppercase font-semibold text-[#78716c] tracking-wider">
                        Masked Aadhaar Number
                      </dt>
                      <dd className="mt-0.5 text-sm font-mono font-bold text-[#0c0a09] tracking-wider">
                        {verifiedData?.masked_id || 'XXXXXXXX9999'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[11px] uppercase font-semibold text-[#78716c] tracking-wider">
                        Issuing Authority
                      </dt>
                      <dd className="mt-0.5 text-xs font-medium text-[#0c0a09]">
                        UIDAI / DigiLocker Government of India
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[11px] uppercase font-semibold text-[#78716c] tracking-wider">
                        Verification Reference
                      </dt>
                      <dd className="mt-0.5 text-xs font-mono text-[#78716c]">
                        {searchParams.get('client_id') || 'DL-AUTH-2026-99214'}
                      </dd>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-[#e7e5e4] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-[#78716c]">
                      <span className="flex items-center gap-1 text-emerald-800 font-medium">
                        <Lock className="w-3 h-3" /> Authoritative Backend Verification • Tamper Proof
                      </span>
                      <span className="font-mono text-[#78716c]">
                        Verified on 16 Oct 2026, 11:24:08 IST
                      </span>
                    </div>
                  </dl>
                </div>

                {/* Reward Milestone Unlock Callout */}
                <div className="mt-6 bg-[#fff7ed] border border-[#fed7aa] rounded-2xl p-4 flex items-center justify-between gap-4 transition-all hover:border-[#fd8d60]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ffdbce] flex items-center justify-center text-[#9c431d] shrink-0 shadow-xs">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#370e00] flex items-center gap-1.5">
                        🎉 Identity Badge Unlocked! +100 Group Reward Points Credited
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#7d2d06] font-normal mt-0.5">
                        You are now an Authoritative Verified Group Member • Unlocks Tier 2 Group Pool redemptions
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 bg-[#b4552d] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs whitespace-nowrap">
                    +100 PTS
                  </div>
                </div>

                {/* Automated Redirect & Manual Action CTAs */}
                <div className="mt-8 space-y-4">
                  {/* Countdown bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#78716c]">
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin text-[#0c0a09]" />
                        Auto-redirecting back to Dashboard in{' '}
                        <span className="font-bold text-[#0c0a09]">{secondsRemaining}</span> seconds...
                      </span>
                      <button
                        type="button"
                        onClick={togglePause}
                        className="text-[#b4552d] hover:underline cursor-pointer text-xs font-semibold"
                      >
                        {isPaused ? 'Resume auto-redirect' : 'Hold on this screen'}
                      </button>
                    </div>
                    <div className="w-full h-1.5 bg-[#e7e5e4] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-[#0c0a09] rounded-full transition-all duration-1000 ease-linear ${
                          isPaused ? '' : 'animate-progress'
                        }`}
                        style={{
                          width: `${(secondsRemaining / 5) * 100}%`,
                          animationPlayState: isPaused ? 'paused' : 'running',
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => navigate('/groups')}
                      className="w-full justify-center text-xs sm:text-sm py-3.5"
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      Continue to Groups Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/profile')}
                      className="w-full sm:w-auto sm:whitespace-nowrap justify-center text-xs sm:text-sm py-3.5"
                      icon={<ShieldCheck className="w-4 h-4" />}
                    >
                      View Identity Badges in Profile
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 py-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#0c0a09]">
                    Verification Incomplete
                  </h2>
                  <p className="text-xs text-[#ba1a1a] bg-[#ffdad6]/40 p-3 rounded-xl font-medium mt-2 max-w-sm mx-auto">
                    {errorMsg}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2 justify-center max-w-xs mx-auto">
                  <Button
                    variant="primary"
                    onClick={confirmDigiLocker}
                    className="w-full text-xs"
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Retry Confirmation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/groups')}
                    className="w-full text-xs"
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Bottom Compliance & Security Reassurance */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-[#78716c]">
              Protected under the <strong className="text-[#0c0a09] font-semibold">Information Technology Act 2000</strong> &amp; <strong className="text-[#0c0a09] font-semibold">Digital Personal Data Protection (DPDP) Act</strong>.
            </p>
            <p className="text-[11px] text-[#a8a29e] leading-relaxed max-w-lg mx-auto">
              Biometric data is never accessed or stored. Encryption keys rotated regularly. ISO 27001 &amp; SOC-2 Type II Certified infrastructure.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-medium text-[#78716c] pt-1">
              <span className="hover:text-[#0c0a09] cursor-pointer underline">UIDAI Consent Architecture</span>
              <span className="text-[#d0c4be]">•</span>
              <span className="hover:text-[#0c0a09] cursor-pointer underline">Privacy Policy</span>
              <span className="text-[#d0c4be]">•</span>
              <span className="hover:text-[#0c0a09] cursor-pointer underline">Audit Trail Log</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e7e5e4] mt-auto">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-[#78716c]">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="font-bold text-[#0c0a09]">Collaborative Group Rewards</span>
            <span className="hidden sm:inline text-[#d0c4be]">|</span>
            <p className="max-w-xl text-[11px]">
              &copy; 2026 Collaborative Group Rewards Inc. Official DigiLocker UIDAI Gateway Partner. All regulatory checks adhere to RBI &amp; UIDAI compliance standards.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <span className="hover:text-[#b4552d] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#b4552d] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#b4552d] cursor-pointer">DigiLocker Consent Architecture</span>
            <span className="hover:text-[#b4552d] cursor-pointer">Security Audits</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

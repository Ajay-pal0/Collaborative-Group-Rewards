import { useAuthForm } from '../hooks/useAuthForm';
import {
  Shield,
  UsersRound,
  ShieldCheck,
  LineChart,
  Lock,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm';
import { SignupVerificationStep } from '../features/auth/components/SignupVerificationStep';

export default function OnboardingPage() {
  const {
    mode,
    setMode,
    regName,
    setRegName,
    regEmail,
    setRegEmail,
    regPassword,
    setRegPassword,
    showRegPassword,
    setShowRegPassword,
    regErrors,
    setRegErrors,
    regLoading,
    handleRegister,
    registerStep,
    signupVerificationTab,
    setSignupVerificationTab,
    signupPan,
    setSignupPan,
    panLoading,
    panError,
    setPanError,
    panSuccess,
    panVerifiedData,
    handleVerifySignupPan,
    handleSkipSignupPan,
    handleCompleteSignup,
    aadhaarLoading,
    aadhaarError,
    setAadhaarError,
    aadhaarConsent,
    setAadhaarConsent,
    aadhaarSuccess,
    aadhaarVerifiedData,
    handleVerifySignupAadhaar,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    showLoginPassword,
    setShowLoginPassword,
    loginError,
    loginLoading,
    loginFieldErrors,
    setLoginFieldErrors,
    handleLogin,
    forgotEmail,
    setForgotEmail,
    forgotError,
    setForgotError,
    forgotSuccess,
    forgotLoading,
    handleForgotPassword,
    handleBackToLogin,
    navigate,
  } = useAuthForm();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0c0a09] flex flex-col justify-between selection:bg-[#0c0a09] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#e7e5e4] shadow-xs w-full sticky top-0 z-50">
        <div className="w-full h-16 px-4 sm:px-8 lg:px-12 flex items-center justify-between mx-auto max-w-7xl">
          {/* Left Brand Cluster */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/groups')}>
            <div className="w-9 h-9 rounded-xl bg-[#0c0a09] flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5 fill-white/20 text-[#ffdcc3]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-[#0c0a09]">Collaborative Group Rewards</span>
            </div>
          </div>

          {/* Right Metadata & Security Node */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 text-[#78716c] text-xs">
              <Lock className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="hidden sm:inline font-medium">256-Bit SSL Secured</span>
            </div>
            <div className="h-4 w-px bg-[#e7e5e4] hidden sm:block"></div>
            <a
              href="#help"
              className="text-[#78716c] hover:text-[#0c0a09] text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Need help?</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Split Canvas */}
      <main className="flex-1 flex items-center py-8 lg:py-12 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Left Column: Hero & Brand Showcase (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            {/* Next-Gen Pill Badge */}
            <div className="inline-flex items-center gap-2 self-start bg-[#fff7ed] text-[#b4552d] px-3.5 py-1.5 rounded-full border border-[#fed7aa] text-xs font-semibold">
              <UsersRound className="w-4 h-4 text-[#b4552d]" />
              <span>Next-Gen Collaborative Wealth & Rewards</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0c0a09] tracking-tight leading-[1.15]">
              Unlock exclusive financial perks together with your trusted circle.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#78716c] max-w-xl leading-relaxed">
              Form collaborative groups, verify government credentials, track collective milestones, and unlock premium lifestyle & financial rewards.
            </p>

            {/* Feature Highlights Bento Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              {/* Card 1 */}
              <div className="bg-white border border-[#e7e5e4] rounded-2xl p-4 flex flex-col justify-between hover:border-[#b4552d]/40 transition-colors shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#f5f5f4] text-[#b4552d] flex items-center justify-center mb-3">
                  <UsersRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0c0a09]">Collaborative Milestones</h2>
                  <p className="text-xs text-[#78716c] mt-1 leading-relaxed">Pool points with teammates for accelerated benefits.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-[#e7e5e4] rounded-2xl p-4 flex flex-col justify-between hover:border-[#b4552d]/40 transition-colors shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#fff7ed] text-[#b4552d] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0c0a09]">Government KYC</h2>
                  <p className="text-xs text-[#78716c] mt-1 leading-relaxed">Instant Aadhaar & DigiLocker verification for zero fraud.</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-[#e7e5e4] rounded-2xl p-4 flex flex-col justify-between hover:border-[#b4552d]/40 transition-colors shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#f5f5f4] text-[#0c0a09] flex items-center justify-center mb-3">
                  <LineChart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0c0a09]">Bureau Intelligence</h2>
                  <p className="text-xs text-[#78716c] mt-1 leading-relaxed">TransUnion CIBIL credit insights and health tracking.</p>
                </div>
              </div>
            </div>

            {/* Social Proof & Trust Card */}
            <div className="bg-white border border-[#e7e5e4] rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar Stack */}
                  <div className="flex -space-x-2 overflow-hidden">
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                      alt="User 1"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                      alt="User 2"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80"
                      alt="User 3"
                    />
                    <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-[#0c0a09] text-white text-[11px] items-center justify-center font-bold">
                      +12k
                    </div>
                  </div>
                  <p className="text-xs text-[#0c0a09] font-semibold">
                    Active group members across India
                  </p>
                </div>

                {/* Floating Achievement Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fff7ed] text-[#b4552d] rounded-full text-xs font-semibold border border-[#fed7aa] shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#b4552d]" />
                  <span>Milestone Reached! +500 PTS</span>
                </div>
              </div>

              {/* Compliance row */}
              <div className="pt-3 border-t border-[#e7e5e4] flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#78716c]">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#10b981]" />
                  Bank-grade 256-bit encryption
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                  RBI & UIDAI Compliant
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                  CIBIL Bureau Approved
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Form Card (6 Cols) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-white border border-[#e7e5e4] rounded-3xl p-6 sm:p-8 custom-shadow-card max-w-md w-full relative">
              {/* Segmented Tab Switcher */}
              {mode !== 'forgot' && registerStep === 'credentials' && (
                <div className="bg-[#f5f5f4] p-1 rounded-full flex items-center justify-between mb-6 border border-[#e7e5e4]">
                  <button
                    onClick={() => setMode('login')}
                    className={`w-1/2 py-2 text-center rounded-full text-xs font-bold transition-all cursor-pointer ${mode === 'login'
                      ? 'bg-[#0c0a09] text-white shadow-xs'
                      : 'text-[#78716c] hover:text-[#0c0a09]'
                      }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setMode('register')}
                    className={`w-1/2 py-2 text-center rounded-full text-xs font-bold transition-all cursor-pointer ${mode === 'register'
                      ? 'bg-[#0c0a09] text-white shadow-xs'
                      : 'text-[#78716c] hover:text-[#0c0a09]'
                      }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* Header */}
              <div className="mb-5">
                <h2 className="text-xl font-extrabold text-[#0c0a09] tracking-tight">
                  {mode === 'login'
                    ? 'Welcome back'
                    : mode === 'register' && registerStep === 'credentials'
                      ? 'Create your account'
                      : mode === 'register' && registerStep === 'optional_pan'
                        ? 'Verify Government KYC'
                        : 'Account Recovery'}
                </h2>
                <p className="text-xs text-[#78716c] mt-1">
                  {mode === 'login'
                    ? 'Sign in to access your collaborative pool dashboard and milestone points.'
                    : mode === 'register' && registerStep === 'credentials'
                      ? 'Start building wealth and unlocking group rewards together.'
                      : mode === 'register' && registerStep === 'optional_pan'
                        ? 'Link Aadhaar or PAN to verify your identity and boost group tier standings.'
                        : 'Enter your registered email address to receive a secure recovery link.'}
                </p>
              </div>

              {/* REGISTER FORM */}
              {mode === 'register' && registerStep === 'credentials' && (
                <RegisterForm
                  regName={regName}
                  setRegName={setRegName}
                  regEmail={regEmail}
                  setRegEmail={setRegEmail}
                  regPassword={regPassword}
                  setRegPassword={setRegPassword}
                  showRegPassword={showRegPassword}
                  setShowRegPassword={setShowRegPassword}
                  regErrors={regErrors}
                  setRegErrors={setRegErrors}
                  regLoading={regLoading}
                  handleRegister={handleRegister}
                />
              )}

              {/* OPTIONAL PAN & AADHAAR VERIFICATION STEP */}
              {mode === 'register' && registerStep === 'optional_pan' && (
                <SignupVerificationStep
                  signupVerificationTab={signupVerificationTab}
                  setSignupVerificationTab={setSignupVerificationTab}
                  aadhaarLoading={aadhaarLoading}
                  aadhaarError={aadhaarError}
                  setAadhaarError={setAadhaarError}
                  aadhaarConsent={aadhaarConsent}
                  setAadhaarConsent={setAadhaarConsent}
                  aadhaarSuccess={aadhaarSuccess}
                  aadhaarVerifiedData={aadhaarVerifiedData}
                  handleVerifySignupAadhaar={handleVerifySignupAadhaar}
                  signupPan={signupPan}
                  setSignupPan={setSignupPan}
                  panLoading={panLoading}
                  panError={panError}
                  setPanError={setPanError}
                  panSuccess={panSuccess}
                  panVerifiedData={panVerifiedData}
                  handleVerifySignupPan={handleVerifySignupPan}
                  handleSkipSignupPan={handleSkipSignupPan}
                  handleCompleteSignup={handleCompleteSignup}
                />
              )}

              {/* LOGIN FORM */}
              {mode === 'login' && (
                <LoginForm
                  loginEmail={loginEmail}
                  setLoginEmail={setLoginEmail}
                  loginPassword={loginPassword}
                  setLoginPassword={setLoginPassword}
                  showLoginPassword={showLoginPassword}
                  setShowLoginPassword={setShowLoginPassword}
                  loginError={loginError}
                  loginFieldErrors={loginFieldErrors}
                  setLoginFieldErrors={setLoginFieldErrors}
                  loginLoading={loginLoading}
                  handleLogin={handleLogin}
                  onForgotPassword={() => {
                    if (loginEmail) setForgotEmail(loginEmail);
                    setMode('forgot');
                    setForgotError('');
                  }}
                  onContinueDigiLocker={() => {
                    setMode('register');
                  }}
                />
              )}

              {/* FORGOT PASSWORD FORM */}
              {mode === 'forgot' && (
                <ForgotPasswordForm
                  forgotEmail={forgotEmail}
                  setForgotEmail={setForgotEmail}
                  forgotError={forgotError}
                  setForgotError={setForgotError}
                  forgotSuccess={forgotSuccess}
                  forgotLoading={forgotLoading}
                  handleForgotPassword={handleForgotPassword}
                  handleBackToLogin={handleBackToLogin}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="bg-white border-t border-[#e7e5e4] w-full mt-auto">
        <div className="w-full px-4 sm:px-8 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#0c0a09] text-xs">Collaborative Group Rewards</span>
            <span className="text-[#78716c] text-[11px]">
              © 2026 Collaborative Group Rewards Technologies Pvt. Ltd. Bank-grade security with RBI & DigiLocker compliance.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a className="text-[#78716c] hover:text-[#0c0a09] transition-colors" href="#privacy">Privacy Policy</a>
            <a className="text-[#78716c] hover:text-[#0c0a09] transition-colors" href="#terms">Terms of Service</a>
            <a className="text-[#78716c] hover:text-[#0c0a09] transition-colors" href="#security">Security Architecture</a>
            <a className="text-[#78716c] hover:text-[#0c0a09] transition-colors" href="#bureau">Bureau Disclosure</a>
            <a className="text-[#78716c] hover:text-[#0c0a09] transition-colors" href="#grievance">Grievance Redressal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

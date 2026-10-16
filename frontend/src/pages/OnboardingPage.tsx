import { useAuthForm } from '../hooks/useAuthForm';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui';
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
    <div className="min-h-screen bg-[#F8F9FC] text-[#171923] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/groups')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#171923]">
            Collaborative Group Rewards
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#667085]">
          <a href="#features" className="hover:text-[#171923] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#171923] transition-colors">How it works</a>
          <a href="#about" className="hover:text-[#171923] transition-colors">About</a>
        </nav>

        {/* Action Button */}
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="border border-[#635BFF] text-[#635BFF] hover:bg-[#635BFF]/5 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
        >
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </header>

      {/* Hero Body */}
      <main className="max-w-6xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline & Action Buttons */}
        <div className="lg:col-span-7 space-y-6 animate-fade-in">
          <h1 className="text-4xl sm:text-6xl font-black text-[#171923] tracking-tight leading-[1.1]">
            Do more together. <br />
            <span className="text-[#635BFF]">Unlock more together.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#667085] leading-relaxed max-w-lg font-normal">
            Create a private group, invite your people, complete actions and unlock amazing rewards together.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setMode('register')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Create a group
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setMode('login')}
            >
              Join a group
            </Button>
          </div>

          {/* Microcopy Bullet Chips */}
          <div className="flex items-center gap-3 text-xs text-[#667085] font-semibold pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#12B76A]" /> Private groups
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#12B76A]" /> Easy to use
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#12B76A]" /> Rewarding
            </span>
          </div>
        </div>

        {/* Right Column: Auth Card */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E7E9EE] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            {/* Mode Switcher */}
            {mode !== 'forgot' && (
              <div className="flex rounded-xl bg-[#F8F9FC] p-1 border border-[#E7E9EE]">
                {(['login', 'register'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      mode === m
                        ? 'bg-white shadow-xs text-[#635BFF]'
                        : 'text-[#667085] hover:text-[#171923]'
                    }`}
                  >
                    {m === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>
            )}

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
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs text-[#98A2B3] py-4 border-t border-[#E7E9EE] mt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Collaborative Group Rewards. All rights reserved.</p>
        <div className="flex items-center gap-4 text-[#667085]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A]" /> Privacy & Security
          </span>
          <span>Terms</span>
        </div>
      </footer>
    </div>
  );
}

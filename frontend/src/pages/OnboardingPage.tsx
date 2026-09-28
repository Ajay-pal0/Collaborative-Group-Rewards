import { useAuthForm } from '../hooks/useAuthForm';
import { Sparkles, ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';

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
    forgotResetUrl,
    forgotLoading,
    handleForgotPassword,
    handleBackToLogin,
    navigate,
  } = useAuthForm();

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#171923] flex flex-col justify-between p-4 sm:p-8">
      {/* Screen 01 Top Header Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/groups')}>
          <div className="w-9 h-9 rounded-xl bg-[#635BFF] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#171923]">Collaborative Group Rewards</span>
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

      {/* Screen 01 Hero Body */}
      <main className="max-w-6xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline & Action Buttons */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-4xl sm:text-6xl font-black text-[#171923] tracking-tight leading-[1.1]">
            Do more together. <br />
            <span className="text-[#635BFF]">Unlock more together.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#667085] leading-relaxed max-w-lg font-normal">
            Create a private group, invite your people, complete actions and unlock amazing rewards together.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setMode('register')}
              className="bg-[#635BFF] hover:bg-[#4F46E5] text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              Create a group <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMode('login')}
              className="bg-white border border-[#E7E9EE] hover:bg-[#F8F9FC] text-[#171923] text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Join a group
            </button>
          </div>

          {/* Microcopy Bullet Chips */}
          <div className="flex items-center gap-3 text-xs text-[#667085] font-semibold pt-2">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#12B76A]" /> Private groups</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#12B76A]" /> Easy to use</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#12B76A]" /> Rewarding</span>
          </div>
        </div>

        {/* Right Column: Hero Form / Auth Card */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E7E9EE] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex rounded-xl bg-[#F8F9FC] p-1 border border-[#E7E9EE]">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === m ? 'bg-white shadow-xs text-[#635BFF]' : 'text-[#667085] hover:text-[#171923]'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {/* REGISTER FORM */}
            {mode === 'register' && registerStep === 'credentials' && (
              <form onSubmit={handleRegister} noValidate className="space-y-4">
                {regErrors.general && (
                  <p className="text-[#F04438] text-xs bg-[#F04438]/10 p-3 rounded-xl font-semibold">{regErrors.general}</p>
                )}
                <div>
                  <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => { setRegName(e.target.value); setRegErrors((p) => ({ ...p, name: '' })); }}
                    placeholder="Ajay Pal"
                    maxLength={255}
                    className={`w-full bg-[#F8F9FC] border rounded-xl px-3.5 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF] ${
                      regErrors.name ? 'border-[#F04438]' : 'border-[#E7E9EE]'
                    }`}
                  />
                  {regErrors.name && <p className="text-[#F04438] text-xs mt-1 font-medium">{regErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => { setRegEmail(e.target.value); setRegErrors((p) => ({ ...p, email: '' })); }}
                    placeholder="ajay.pal@example.com"
                    className={`w-full bg-[#F8F9FC] border rounded-xl px-3.5 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF] ${
                      regErrors.email ? 'border-[#F04438]' : 'border-[#E7E9EE]'
                    }`}
                  />
                  {regErrors.email && <p className="text-[#F04438] text-xs mt-1 font-medium">{regErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => { setRegPassword(e.target.value); setRegErrors((p) => ({ ...p, password: '' })); }}
                      placeholder="Min. 6 characters"
                      className={`w-full bg-[#F8F9FC] border rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF] ${
                        regErrors.password ? 'border-[#F04438]' : 'border-[#E7E9EE]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#171923] transition-colors cursor-pointer p-1"
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {regErrors.password && <p className="text-[#F04438] text-xs mt-1 font-medium">{regErrors.password}</p>}
                </div>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-[#635BFF] hover:bg-[#4F46E5] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {regLoading ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
                  ) : 'Create Account'}
                </button>
              </form>
            )}

            {/* OPTIONAL PAN VERIFICATION STEP */}
            {mode === 'register' && registerStep === 'optional_pan' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mx-auto mb-1.5">
                    <ShieldCheck className="w-5 h-5 text-[#635BFF]" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#171923]">PAN Verification (Optional)</h3>
                  <p className="text-xs text-[#667085]">
                    Verify your PAN now for instant reward verification, or skip and do it later.
                  </p>
                </div>

                {panSuccess && panVerifiedData ? (
                  <div className="bg-[#ECFDF3] border border-[#12B76A]/30 rounded-2xl p-4 text-center space-y-3">
                    <div className="w-9 h-9 rounded-full bg-[#12B76A]/20 text-[#12B76A] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5 text-[#12B76A]" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#027A48]">✓ PAN Verified</h4>
                      <p className="text-xs font-semibold text-[#171923] mt-1">Name: {panVerifiedData.name}</p>
                      <p className="text-[11px] text-[#667085]">PAN: {panVerifiedData.pan_masked}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCompleteSignup}
                      className="w-full bg-[#12B76A] hover:bg-[#039855] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Continue to Dashboard <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifySignupPan} className="space-y-3.5">
                    {panError && (
                      <p className="text-[#F04438] text-xs bg-[#F04438]/10 p-3 rounded-xl font-semibold">{panError}</p>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={signupPan}
                        onChange={(e) => {
                          setSignupPan(e.target.value.toUpperCase());
                          if (panError) setPanError('');
                        }}
                        placeholder="ABCDE1234A"
                        maxLength={10}
                        className="w-full bg-[#F8F9FC] border border-[#E7E9EE] focus:border-[#635BFF] rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                      />
                      <p className="text-[10px] text-[#98A2B3] mt-1">
                        Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234A)
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={panLoading}
                      className="w-full bg-[#635BFF] hover:bg-[#4F46E5] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {panLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying PAN...
                        </>
                      ) : (
                        'Verify PAN'
                      )}
                    </button>

                    <div className="pt-2 text-center space-y-1.5 border-t border-[#E7E9EE]">
                      <p className="text-[11px] text-[#667085]">
                        This is optional. You can verify your PAN later from My Profile & Points.
                      </p>
                      <button
                        type="button"
                        onClick={handleSkipSignupPan}
                        className="text-xs font-bold text-[#635BFF] hover:underline py-1 cursor-pointer"
                      >
                        Skip for now →
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} noValidate className="space-y-4">
                {loginError && (
                  <p className="text-[#F04438] text-xs bg-[#F04438]/10 p-3 rounded-xl font-semibold">{loginError}</p>
                )}
                <div>
                  <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    maxLength={254}
                    onChange={(e) => { setLoginEmail(e.target.value); setLoginFieldErrors((p) => ({ ...p, email: '' })); }}
                    placeholder="ajay.pal@example.com"
                    className={`w-full bg-[#F8F9FC] border rounded-xl px-3.5 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF] ${
                      loginFieldErrors.email ? 'border-[#F04438]' : 'border-[#E7E9EE]'
                    }`}
                  />
                  {loginFieldErrors.email && <p className="text-[#F04438] text-xs mt-1 font-medium">{loginFieldErrors.email}</p>}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (loginEmail) setForgotEmail(loginEmail);
                        setMode('forgot');
                        setForgotError('');
                      }}
                      className="text-xs font-semibold text-[#635BFF] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      maxLength={128}
                      onChange={(e) => { setLoginPassword(e.target.value); setLoginFieldErrors((p) => ({ ...p, password: '' })); }}
                      placeholder="••••••••"
                      className={`w-full bg-[#F8F9FC] border rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF] ${
                        loginFieldErrors.password ? 'border-[#F04438]' : 'border-[#E7E9EE]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#171923] transition-colors cursor-pointer p-1"
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginFieldErrors.password && <p className="text-[#F04438] text-xs mt-1 font-medium">{loginFieldErrors.password}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-[#635BFF] hover:bg-[#4F46E5] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loginLoading ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
                  ) : 'Sign In'}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FLOW */}
            {mode === 'forgot' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mx-auto mb-1.5">
                    <KeyRound className="w-5 h-5 text-[#635BFF]" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#171923]">
                    {forgotSuccess ? 'Check Your Inbox' : 'Forgot Password'}
                  </h3>
                  <p className="text-xs text-[#667085]">
                    {forgotSuccess
                      ? 'A password reset link has been dispatched.'
                      : 'Enter your registered email address to receive a secure reset link.'}
                  </p>
                </div>

                {!forgotSuccess ? (
                  <form onSubmit={handleForgotPassword} noValidate className="space-y-4">
                    {forgotError && (
                      <p className="text-[#F04438] text-xs bg-[#F04438]/10 p-3 rounded-xl font-semibold">{forgotError}</p>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">Registered Email</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        maxLength={254}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          if (forgotError) setForgotError('');
                        }}
                        placeholder="ajay.pal@example.com"
                        className={`w-full bg-[#F8F9FC] border rounded-xl px-3.5 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF] ${
                          forgotError ? 'border-[#F04438]' : 'border-[#E7E9EE]'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-[#635BFF] hover:bg-[#4F46E5] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending reset link...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>

                    <div className="pt-2 text-center border-t border-[#E7E9EE]">
                      <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="text-xs font-semibold text-[#635BFF] hover:underline cursor-pointer"
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-[#ECFDF3] border border-[#12B76A]/30 rounded-2xl p-5 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-[#12B76A]/20 text-[#12B76A] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6 text-[#12B76A]" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#027A48]">Password Reset Email Sent</h4>
                        <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
                          {forgotSuccess}
                        </p>
                        <p className="text-[11px] text-[#98A2B3] mt-2">
                          The reset link is valid for <strong>20 minutes</strong>.
                        </p>
                      </div>
                    </div>

                    {forgotResetUrl && (
                      <div className="bg-[#F8F9FC] border border-[#635BFF]/30 rounded-2xl p-4 text-left space-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] bg-[#635BFF]/10 px-2 py-0.5 rounded">
                            Dev / Sandbox Link
                          </span>
                        </div>
                        <p className="text-xs text-[#667085]">
                          Direct reset link generated for instant testing:
                        </p>
                        <a
                          href={forgotResetUrl}
                          className="text-xs font-semibold text-[#635BFF] hover:underline break-all block"
                        >
                          {forgotResetUrl}
                        </a>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="w-full bg-[#635BFF] hover:bg-[#4F46E5] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Back to Sign In <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs text-[#98A2B3] py-4 border-t border-[#E7E9EE] mt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Collaborative Group Rewards. All rights reserved.</p>
        <div className="flex items-center gap-4 text-[#667085]">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A]" /> Privacy & Security</span>
          <span>Terms</span>
        </div>
      </footer>
    </div>
  );
}

import { useAuthForm } from '../hooks/useAuthForm';
import { Sparkles, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

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
            {mode === 'register' && (
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
                  <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">Password</label>
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

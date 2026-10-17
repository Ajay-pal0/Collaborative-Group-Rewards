import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJoinGroup } from '../hooks/useJoinGroup';
import {
  Shield,
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Gift,
  Building2,
  Key,
  Timer,
  X,
  LayoutDashboard,
} from 'lucide-react';

export default function JoinGroupPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, status: authStatus } = useAuth();
  const { invitation, loading, joining, error, alreadyMember, handleJoin } = useJoinGroup(token);

  if (loading || authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0c0a09] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#0c0a09] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#78716c] text-xs font-bold">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  /* Screen: Invalid Invite (Error State) */
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0c0a09] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#e7e5e4] rounded-3xl p-8 text-center space-y-5 custom-shadow-card">
          <div className="w-16 h-16 bg-[#fef2f2] text-[#dc2626] rounded-2xl flex items-center justify-center mx-auto border border-[#fecaca]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-[#0c0a09]">Unable to join group</h2>
            <p className="text-[#78716c] text-xs leading-relaxed max-w-xs mx-auto">
              {error}
            </p>
          </div>
          <button
            onClick={() => navigate('/groups')}
            className="w-full bg-[#0c0a09] hover:bg-[#292524] text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  /* Screen: Already a Member (Error State) */
  if (alreadyMember) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-[#0c0a09] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#e7e5e4] rounded-3xl p-8 text-center space-y-5 custom-shadow-card">
          <div className="w-16 h-16 bg-[#ecfdf5] text-[#059669] rounded-2xl flex items-center justify-center mx-auto border border-[#a7f3d0]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-[#0c0a09]">You're already a member!</h2>
            <p className="text-[#78716c] text-xs leading-relaxed">
              You are already part of this collective reward circle.
            </p>
          </div>
          <button
            onClick={() => navigate('/groups')}
            className="w-full bg-[#0c0a09] hover:bg-[#292524] text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!invitation) return null;

  const inviterName = invitation.created_by_name || 'Group Organizer';
  const groupInitials = invitation.group_name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0c0a09] flex flex-col justify-between selection:bg-[#0c0a09] selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-[#e7e5e4] shadow-xs sticky top-0 z-40">
        <div className="flex justify-between items-center w-full px-4 sm:px-8 max-w-7xl mx-auto h-16">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => navigate('/groups')}
            >
              <div className="w-9 h-9 rounded-xl bg-[#0c0a09] flex items-center justify-center text-white shadow-xs">
                <Shield className="w-5 h-5 fill-white/20 text-[#ffdcc3]" />
              </div>
              <span className="font-extrabold text-base text-[#0c0a09]">Collaborative Group Rewards</span>
            </div>

            <span className="text-[#e7e5e4] hidden sm:inline">|</span>

            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#f5f5f4] px-2.5 py-1 rounded-full text-[#78716c] text-xs font-semibold border border-[#e7e5e4]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span>RBI & DigiLocker Compliant</span>
              </div>
              <div className="flex items-center gap-1 bg-[#f5f5f4] px-2.5 py-1 rounded-full text-[#78716c] text-xs font-semibold border border-[#e7e5e4]">
                <Lock className="w-3.5 h-3.5 text-[#10b981]" />
                <span>256-Bit SSL Secured</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0c0a09] text-white font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-bold text-[#0c0a09] hidden sm:inline">{user.name}</span>
              </div>
            ) : (
              <Link
                to={`/login?redirect=/join/${token}`}
                className="text-xs font-bold text-[#0c0a09] hover:underline"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col justify-center">
        {/* Breadcrumb Indicator */}
        <div className="flex items-center gap-2 mb-6 text-[#78716c] text-xs font-semibold">
          <button
            onClick={() => navigate('/groups')}
            className="hover:text-[#0c0a09] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Circles
          </button>
          <span>/</span>
          <span className="text-[#b4552d]">Invitation #{token?.slice(0, 12).toUpperCase()}</span>
        </div>

        {/* Two-Column Invitation Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT COLUMN: Group Preview (6/12) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Celebration Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fff7ed] border border-[#fed7aa] text-[#b4552d] text-xs font-bold mb-4 shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#b4552d]" />
                <span>You've Been Invited to Join a Group!</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0c0a09] tracking-tight leading-tight">
                Join {inviterName}'s Circle & Unlock Perks Together
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#78716c] max-w-xl leading-relaxed">
                You have been personally invited to join <strong className="text-[#0c0a09] font-bold">'{invitation.group_name}'</strong>. Pool rewards, achieve collaborative financial milestones, and unlock tiered group perks.
              </p>

              {/* Group Highlight Card */}
              <div className="mt-6 bg-white rounded-2xl p-6 border border-[#e7e5e4] custom-card-shadow space-y-4">
                <div className="flex items-center justify-between border-b border-[#f0efed] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0c0a09] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                      {groupInitials || 'GP'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-[#0c0a09]">{invitation.group_name}</h2>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46] text-[10px] font-bold border border-[#a7f3d0]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span> Active Circle
                        </span>
                      </div>
                      <p className="text-xs text-[#78716c] mt-0.5">
                        Created by {inviterName} • FinOps & Cloud Rewards
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#fff7ed] text-[#b4552d] border border-[#fed7aa] text-xs font-bold shrink-0 capitalize">
                    {invitation.group_type || 'Private'} Group
                  </span>
                </div>

                {/* Key Stats Matrix */}
                <div className="grid grid-cols-2 gap-4 py-2 border-b border-[#f0efed]">
                  <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#e7e5e4]">
                    <span className="text-xs font-semibold text-[#78716c] block">Group Category</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-black text-[#0c0a09] capitalize">
                        {invitation.group_type || 'Friends & Family'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#78716c]">Collaborative Rewards Circle</span>
                  </div>

                  <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#e7e5e4]">
                    <span className="text-xs font-semibold text-[#78716c] block">Current Team Size</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-black text-[#0c0a09]">
                        {invitation.member_count} {invitation.member_count === 1 ? 'Member' : 'Members'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#78716c]">Active collaborators</span>
                  </div>
                </div>

                {/* Verified Members Cluster */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-[#78716c]">Invited By</span>
                    <span className="text-[11px] text-[#059669] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Invite Token
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-[#f8fafc] px-3 py-1.5 rounded-full border border-[#e7e5e4]">
                      <div className="w-6 h-6 rounded-full bg-[#0c0a09] text-white text-[10px] font-bold flex items-center justify-center">
                        {inviterName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-[#0c0a09]">{inviterName}</span>
                      <span className="text-[9px] px-2 py-0.5 bg-[#f5f5f4] rounded-full font-bold text-[#78716c]">Organizer</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What You Get by Joining */}
              <div className="mt-6 bg-white rounded-2xl p-6 border border-[#e7e5e4] custom-card-shadow">
                <h3 className="text-xs font-extrabold text-[#0c0a09] tracking-wider uppercase mb-3.5">
                  What You Get by Joining
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#fff7ed] text-[#b4552d] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0c0a09]">+50 Welcome Bonus Points immediately credited</p>
                      <p className="text-[11px] text-[#78716c]">Instant jumpstart to your balance upon accepted invite verification.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#f5f5f4] text-[#0c0a09] flex items-center justify-center shrink-0 mt-0.5">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0c0a09]">Access to Amazon & Swiggy ₹500 Group Vouchers</p>
                      <p className="text-[11px] text-[#78716c]">Subsidized co-shared redeem privileges refreshed every billing cycle.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#f5f5f4] text-[#0c0a09] flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0c0a09]">Co-working Day Passes & 10% cashbacks on subscriptions</p>
                      <p className="text-[11px] text-[#78716c]">Available for WeWork, Awfis, AWS credits, and Notion workspace bills.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#f5f5f4] text-[#10b981] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0c0a09]">Zero fees, verified community members only</p>
                      <p className="text-[11px] text-[#78716c]">Pure cooperative benefit pooling with strict RBI zero-liability compliance.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Acceptance Card (6/12) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e5e4] custom-shadow-card flex flex-col justify-between h-full">
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#f0efed]">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#0c0a09]">Accept Invitation</h2>
                    <p className="text-xs text-[#78716c] mt-0.5">Review your credentials and confirm circle membership</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                </div>

                {/* Signed-in User Pill */}
                {user ? (
                  <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e7e5e4]">
                    <span className="text-[10px] font-bold text-[#78716c] uppercase tracking-wide block mb-2">
                      Signed in as
                    </span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#0c0a09] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-[#0c0a09]">{user.name}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46] text-[10px] font-bold border border-[#a7f3d0]">
                              <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                              Aadhaar & PAN Verified
                            </span>
                          </div>
                          <span className="text-xs text-[#78716c]">{user.email}</span>
                        </div>
                      </div>
                      <Link
                        to={`/login?redirect=/join/${token}`}
                        className="text-xs font-bold text-[#b4552d] hover:underline cursor-pointer"
                      >
                        Switch
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] space-y-3">
                    <p className="text-xs text-[#92400e] font-semibold">
                      You need to sign in or create an account to accept this invitation.
                    </p>
                    <button
                      onClick={() => navigate(`/login?redirect=/join/${token}`)}
                      className="w-full bg-[#0c0a09] hover:bg-[#292524] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Sign In to Continue
                    </button>
                  </div>
                )}

                {/* Privacy & Security Reassurance Banner */}
                <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e7e5e4] flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white text-[#b4552d] shadow-2xs shrink-0 mt-0.5 border border-[#e7e5e4]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0c0a09]">Bank-Grade Privacy Reassurance</h4>
                    <p className="text-xs text-[#78716c] mt-1 leading-relaxed">
                      Your private financial accounts, account balances, and sensitive CIBIL score are <strong>never shared</strong>. Only your group point contributions and verified badge status are visible to circle members.
                    </p>
                  </div>
                </div>

                {/* Group Code & Expiration Badge */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#f5f5f4] border border-[#e7e5e4]">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#78716c]" />
                    <span className="text-xs font-mono font-bold text-[#0c0a09]">
                      Invite code: #{token?.slice(0, 12).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#b4552d]">
                    <Timer className="w-3.5 h-3.5" />
                    <span>Expires in 48 hours</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-8 pt-6 border-t border-[#f0efed] space-y-3">
                {user ? (
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full bg-[#0c0a09] hover:bg-[#292524] disabled:opacity-50 text-white py-3.5 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
                  >
                    {joining ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Join Group Now (+50 pts)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/login?redirect=/join/${token}`)}
                    className="w-full bg-[#0c0a09] hover:bg-[#292524] text-white py-3.5 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>Sign In to Join Group (+50 pts)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('/groups')}
                    className="w-full bg-white hover:bg-[#f8fafc] text-[#78716c] hover:text-[#0c0a09] border border-[#e7e5e4] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => navigate('/groups')}
                    className="w-full bg-white hover:bg-[#f8fafc] text-[#0c0a09] border border-[#e7e5e4] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>My Dashboard</span>
                  </button>
                </div>

                {/* Footer Reassurance Note */}
                <p className="text-[11px] text-[#78716c] text-center pt-2 leading-relaxed">
                  Need a new invite code? Contact your group admin. Governed by RBI Information Security Guidelines & SOC2 Type II Framework.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e7e5e4] mt-12 py-6">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#78716c]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#0c0a09]">Collaborative Group Rewards</span>
            <span>•</span>
            <p>© 2026 Collaborative Group Rewards Technologies Inc. RBI regulated partner institutions.</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="#security" className="hover:text-[#0c0a09] transition-colors">Security Architecture</a>
            <a href="#compliance" className="hover:text-[#0c0a09] transition-colors">Compliance</a>
            <a href="#terms" className="hover:text-[#0c0a09] transition-colors">Terms of Trust</a>
            <a href="#privacy" className="hover:text-[#0c0a09] transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

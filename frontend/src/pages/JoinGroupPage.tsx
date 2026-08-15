import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJoinGroup } from '../hooks/useJoinGroup';
import { Sparkles, UsersRound, AlertCircle, CheckCircle2, User } from 'lucide-react';

export default function JoinGroupPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, status: authStatus } = useAuth();
  const { invitation, loading, joining, error, alreadyMember, handleJoin } = useJoinGroup(token);

  if (loading || authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#F8F9FC] text-[#171923] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#635BFF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#667085] text-xs font-semibold">Loading invitation...</p>
        </div>
      </div>
    );
  }

  /* Screen 06: Invalid Invite (Error State) */
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] text-[#171923] flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white border border-[#E7E9EE] rounded-3xl p-8 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 bg-[#F04438]/10 text-[#F04438] rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-9 h-9 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-[#171923]">Unable to join group</h2>
            <p className="text-[#667085] text-xs leading-relaxed">
              {error}
            </p>
          </div>
          <button
            onClick={() => navigate('/groups')}
            className="w-full border border-[#E7E9EE] hover:bg-[#F8F9FC] text-[#635BFF] font-semibold py-3 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Go to home
          </button>
        </div>
      </div>
    );
  }

  /* Screen 07: Already a Member (Error State) */
  if (alreadyMember) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] text-[#171923] flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white border border-[#E7E9EE] rounded-3xl p-8 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 bg-[#12B76A]/10 text-[#12B76A] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-[#171923]">You're already a member!</h2>
            <p className="text-[#667085] text-xs leading-relaxed">
              You're already part of this group.
            </p>
          </div>
          <button
            onClick={() => navigate('/groups')}
            className="w-full border border-[#E7E9EE] hover:bg-[#F8F9FC] text-[#635BFF] font-semibold py-3 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!invitation) return null;

  /* Screen 05: Join Group (Invite Link) */
  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#171923] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-[#E7E9EE] rounded-3xl p-6 sm:p-10 shadow-xl">
        {/* Left Side: Invitation Details Card */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#635BFF] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4 fill-white/20" />
              </div>
              <span className="font-extrabold text-sm sm:text-base text-[#171923]">Collaborative Group Rewards</span>
            </div>

            <div className="space-y-1 pt-2">
              <h1 className="text-2xl font-extrabold text-[#171923]">You're invited! 🎉</h1>
              <p className="text-xs text-[#667085]">Join your friends and unlock rewards together.</p>
            </div>

            {/* Group Preview Card */}
            <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center font-bold">
                  <UsersRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#171923]">{invitation.group_name}</h3>
                  <p className="text-[11px] text-[#667085]">{invitation.member_count} members already joined</p>
                </div>
              </div>

              {/* Overlapping Avatar Stack */}
              <div className="flex items-center -space-x-2 pt-1">
                {[1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="w-7 h-7 rounded-full bg-[#635BFF] text-white border-2 border-white text-[10px] font-bold flex items-center justify-center"
                  >
                    <User className="w-3.5 h-3.5" />
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full bg-[#F2F4F7] text-[#667085] border-2 border-white text-[10px] font-bold flex items-center justify-center">
                  +1
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form / Join Action */}
        <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#171923]">Join this group</h2>

            {authStatus === 'unauthenticated' || !user ? (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-[#667085]">Sign in to join <strong className="text-[#171923]">{invitation.group_name}</strong> instantly.</p>
                <button
                  onClick={() => navigate(`/login?redirect=/join/${token}`)}
                  className="w-full bg-[#635BFF] hover:bg-[#4F46E5] text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                >
                  Sign In & Join Group
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1">Your name</label>
                    <input
                      type="text"
                      disabled
                      value={user.name}
                      className="w-full bg-white border border-[#E7E9EE] rounded-xl px-3.5 py-2 text-xs font-medium text-[#171923]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1">Email</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full bg-white border border-[#E7E9EE] rounded-xl px-3.5 py-2 text-xs font-medium text-[#171923]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full bg-[#635BFF] hover:bg-[#4F46E5] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {joining ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Join group'
                  )}
                </button>
              </div>
            )}
          </div>

          <p className="text-[11px] text-[#667085] text-center">
            Already a member?{' '}
            <Link to="/login" className="text-[#635BFF] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

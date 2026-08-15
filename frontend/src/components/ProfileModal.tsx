import { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { useProfileCompletion } from '../hooks/useProfileCompletion';
import {
  User as UserIcon,
  Phone,
  Mail,
  Sparkles,
  CheckCircle2,
  Zap,
  Activity as ActivityIcon,
  Clock,
  Gift,
} from 'lucide-react';
import type { UserPointsData, Activity } from '../types';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  groupId?: string;
  userPointsData?: UserPointsData | null;
  activities?: Activity[];
  onSuccess?: () => void;
}

type ProfileTab = 'overview' | 'details';

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ProfileModal({
  open,
  onClose,
  groupId,
  userPointsData,
  activities = [],
  onSuccess,
}: ProfileModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  const {
    name,
    setName,
    phone,
    setPhone,
    loading,
    error,
    successMsg,
    handleSubmit,
    resetStatus,
  } = useProfileCompletion(groupId, onSuccess);

  // Filter activities to show only logged-in user's activity
  const userActivities = activities.filter((act) => {
    if (!user) return false;
    const memberName = (act.member_name || '').toLowerCase();
    const userName = (user.name || '').toLowerCase();
    const userEmail = (user.email || '').toLowerCase();
    
    if (memberName && (memberName === userName || memberName === userEmail)) return true;
    if (act.metadata?.user_email && String(act.metadata.user_email).toLowerCase() === userEmail) return true;
    if (act.metadata?.user_id && act.metadata.user_id === user.id) return true;
    return false;
  });

  function handleClose() {
    resetStatus();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="My Profile & Points">
      <div className="space-y-4 text-[#171923]">
        {/* User Summary Card */}
        <div className="bg-gradient-to-r from-[#635BFF]/10 via-[#635BFF]/5 to-transparent border border-[#635BFF]/20 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] text-white flex items-center justify-center font-black text-lg shadow-sm border border-white/20">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#171923] flex items-center gap-1.5">
                {user?.name || user?.email || 'User'}
                <span className="text-[9px] font-extrabold text-[#635BFF] bg-[#635BFF]/10 px-2 py-0.5 rounded-full">
                  You
                </span>
              </h3>
              <p className="text-[11px] text-[#667085]">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white border border-[#E7E9EE] px-3 py-1.5 rounded-xl shadow-2xs text-center">
              <span className="text-[9px] uppercase font-bold text-[#667085] block">Your Points</span>
              <span className="text-sm font-black text-[#635BFF]">
                {userPointsData?.user_points || 0} pts
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 bg-[#F2F4F7] p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-white text-[#635BFF] shadow-xs'
                : 'text-[#667085] hover:text-[#171923]'
            }`}
          >
            <ActivityIcon className="w-3.5 h-3.5" /> My Points & Activity ({userActivities.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'details'
                ? 'bg-white text-[#635BFF] shadow-xs'
                : 'text-[#667085] hover:text-[#171923]'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" /> Edit Profile Details
          </button>
        </div>

        {activeTab === 'overview' ? (
          /* Tab 1: My Points & Activity Overview */
          <div className="space-y-4">
            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-3 text-center space-y-0.5">
                <span className="text-[9px] font-bold text-[#667085] uppercase tracking-wider block">
                  Earned Points
                </span>
                <span className="text-base font-black text-[#635BFF]">
                  {userPointsData?.user_points || 0}
                </span>
              </div>
              <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-3 text-center space-y-0.5">
                <span className="text-[9px] font-bold text-[#667085] uppercase tracking-wider block">
                  Group Share
                </span>
                <span className="text-base font-black text-[#12B76A]">
                  {userPointsData?.user_contribution_pct || 0}%
                </span>
              </div>
              <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-3 text-center space-y-0.5">
                <span className="text-[9px] font-bold text-[#667085] uppercase tracking-wider block">
                  Tasks Done
                </span>
                <span className="text-base font-black text-[#B45309]">
                  {userPointsData?.user_tasks_completed || 0}
                </span>
              </div>
            </div>

            {/* My Activity Stream Header */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-[#171923] uppercase tracking-wider flex items-center justify-between">
                <span>My Activity History</span>
                <span className="text-[#98A2B3] text-[10px] lowercase font-normal">
                  {userActivities.length} items
                </span>
              </h4>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {userActivities.length === 0 ? (
                  <div className="text-center py-8 bg-[#F8F9FC] rounded-2xl border border-dashed border-[#E7E9EE] space-y-2">
                    <Zap className="w-6 h-6 text-[#98A2B3] mx-auto" />
                    <p className="text-xs text-[#98A2B3]">You haven't completed any group actions yet.</p>
                  </div>
                ) : (
                  userActivities.map((act) => {
                    const timeFormatted = formatRelativeTime(act.created_at);
                    let points = 0;
                    let actionLabel = 'Group Action';

                    if (act.event_type === 'TASK_COMPLETED') {
                      points = Number(act.metadata?.points) || 150;
                      actionLabel = `Completed task "${act.metadata?.task_name || 'Task'}"`;
                    } else if (act.event_type === 'GROUP_CREATED') {
                      points = 100;
                      actionLabel = 'Created group';
                    } else if (act.event_type === 'INVITE_CREATED') {
                      points = 25;
                      actionLabel = 'Shared invitation token';
                    } else if (act.event_type === 'PARTICIPANT_JOINED') {
                      points = 100;
                      actionLabel = 'Joined group';
                    } else if (act.event_type === 'PROFILE_COMPLETED') {
                      points = 50;
                      actionLabel = 'Completed profile details';
                    } else if (act.event_type === 'BENEFIT_CLAIMED') {
                      actionLabel = `Claimed reward "${act.metadata?.benefit_name || 'Reward'}"`;
                    }

                    return (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E7E9EE] hover:border-[#635BFF]/30 transition-all text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center shrink-0 border border-[#635BFF]/20">
                            {act.event_type === 'TASK_COMPLETED' ? (
                              <Zap className="w-4 h-4 text-[#635BFF]" />
                            ) : act.event_type === 'BENEFIT_CLAIMED' ? (
                              <Gift className="w-4 h-4 text-[#12B76A]" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-[#B45309]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#171923] truncate">{actionLabel}</p>
                            <p className="text-[10px] text-[#98A2B3] flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5" /> {timeFormatted}
                            </p>
                          </div>
                        </div>

                        {points > 0 && (
                          <span className="text-[10px] font-extrabold text-[#12B76A] bg-[#ECFDF3] border border-[#12B76A]/30 px-2.5 py-1 rounded-full shrink-0">
                            +{points} pts
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Close Footer */}
            <div className="pt-3 border-t border-[#E7E9EE] flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 text-xs font-bold bg-[#635BFF] hover:bg-[#4F46E5] text-white rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Tab 2: Profile Details Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-[#F04438]/10 border border-[#F04438]/20 text-[#F04438] p-3 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-[#12B76A]/10 border border-[#12B76A]/20 text-[#12B76A] p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {successMsg}
              </div>
            )}

            {/* Reward Banner */}
            <div className="bg-gradient-to-r from-[#5C4EFE]/10 to-[#635BFF]/10 border border-[#635BFF]/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#635BFF] text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 fill-white/20" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#171923]">Profile Completion Bonus</h4>
                  <p className="text-[11px] text-[#667085]">Complete details to earn group points</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#635BFF] bg-white border border-[#635BFF]/30 px-3 py-1 rounded-full shadow-xs">
                +50 pts
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={255}
                className="w-full bg-[#F8F9FC] border border-[#E7E9EE] rounded-xl px-3.5 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-[#F2F4F7] border border-[#E7E9EE] rounded-xl px-3.5 py-2.5 text-sm text-[#667085] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                maxLength={32}
                className="w-full bg-[#F8F9FC] border border-[#E7E9EE] rounded-xl px-3.5 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-[#E7E9EE]">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 text-xs font-semibold text-[#667085] hover:text-[#171923] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading || Boolean(successMsg)}
                className="bg-[#635BFF] hover:bg-[#4F46E5] disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Save Profile & Claim +50 pts'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

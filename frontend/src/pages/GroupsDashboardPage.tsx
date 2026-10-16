import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import CreateGroupModal from '../components/CreateGroupModal';
import InviteModal from '../components/InviteModal';
import Modal from '../components/Modal';
import { Skeleton, CardSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useGroups } from '../hooks/useGroups';
import {
  Sparkles,
  UsersRound,
  Gift,
  Zap,
  User,
  Check,
  Bell,
  ChevronDown,
  Plus,
  LogOut,
  ShieldCheck,
  Lock,
} from 'lucide-react';

import MembersModal from '../components/MembersModal';
import ActivityModal from '../components/ActivityModal';
import BenefitsModal from '../components/BenefitsModal';
import ProfileModal from '../components/ProfileModal';
import CreditDashboardModal from '../components/CreditDashboardModal';
import VerificationBadge from '../components/VerificationBadge';
import { calculateSegmentedProgress } from '../lib/progress';
import { Button } from '../components/ui';

import { MilestoneProgressSection } from '../features/dashboard/components/MilestoneProgressSection';
import { IdentityVerificationBanner } from '../features/dashboard/components/IdentityVerificationBanner';
import { GroupTasksSection } from '../features/dashboard/components/GroupTasksSection';
import { MobileBottomNav } from '../features/dashboard/components/MobileBottomNav';

function getUserColor(name: string) {
  const colors = [
    { bg: 'bg-gradient-to-br from-[#635BFF] to-[#4F46E5]' },
    { bg: 'bg-gradient-to-br from-[#0D9488] to-[#059669]' },
    { bg: 'bg-gradient-to-br from-[#D97706] to-[#B45309]' },
    { bg: 'bg-gradient-to-br from-[#EC4899] to-[#DB2777]' },
    { bg: 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]' },
  ];
  let hash = 0;
  for (let i = 0; i < (name || 'Member').length; i++) {
    hash = (name || 'Member').charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export default function GroupsDashboardPage() {
  const { groupId } = useParams<{ groupId?: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const {
    groups,
    selectedGroup,
    benefits,
    tasks,
    activities,
    completedTaskIds,
    loadingGroups,
    loadingDetails,
    completingTaskId,
    unlockedBenefit,
    setUnlockedBenefit,
    claimedBenefit,
    setClaimedBenefit,
    fetchGroups,
    fetchGroupDetails,
    handleCompleteTask,
    handleClaimBenefit,
    selectGroup,
    userPointsData,
  } = useGroups(groupId);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [benefitsModalOpen, setBenefitsModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'overview' | 'details' | 'kyc'>('overview');
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const groupDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target as Node)) {
        setGroupDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate segmented multi-milestone threshold progress (0 -> 200 -> 500 -> 1000)
  const totalPoints = selectedGroup?.total_points || 0;
  const thresholds = [200, 500, 1000];
  const nextThreshold = thresholds.find((t) => totalPoints < t) || 1000;
  const pointsToGo = Math.max(0, nextThreshold - totalPoints);
  const progressPercent = Math.min(100, Math.round(calculateSegmentedProgress(totalPoints)));
  const userName = user?.name || 'User';

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#171923] flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#E7E9EE] px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* App Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#171923] hidden xs:inline">
              Collaborative Group Rewards
            </span>
          </div>

          <div className="h-6 w-px bg-[#E7E9EE]" />

          {/* Active Group Selector Dropdown */}
          <div className="relative" ref={groupDropdownRef}>
            <button
              onClick={() => setGroupDropdownOpen(!groupDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pl-2 pr-3 rounded-2xl bg-white border border-[#E7E9EE] hover:border-[#635BFF]/40 hover:shadow-xs transition-all cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-[#635BFF]/10 text-[#635BFF] font-bold flex items-center justify-center border border-[#635BFF]/20 shrink-0">
                {selectedGroup?.name ? selectedGroup.name.charAt(0).toUpperCase() : <UsersRound className="w-4 h-4" />}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-[#171923] max-w-[140px] truncate">
                    {selectedGroup?.name || 'Select Group'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#667085] transition-transform duration-200 ${groupDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#667085]">
                  <span className="capitalize">{selectedGroup?.group_type || 'Group'}</span>
                  <span>•</span>
                  <span className="font-bold text-[#635BFF]">{selectedGroup?.total_points || 0} pts</span>
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {groupDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E7E9EE] p-2 z-30 animate-slide-up">
                <div className="px-3 py-2 text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider">
                  Your Groups ({groups.length})
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        selectGroup(g);
                        setGroupDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        selectedGroup?.id === g.id
                          ? 'bg-[#635BFF]/10 text-[#635BFF] font-bold'
                          : 'hover:bg-[#F8F9FC] text-[#171923]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-lg bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center font-bold text-xs shrink-0">
                          {g.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{g.name}</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#12B76A] shrink-0">
                        {g.total_points} pts
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#E7E9EE] mt-1">
                  <button
                    onClick={() => {
                      setGroupDropdownOpen(false);
                      setCreateModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-[#635BFF] hover:bg-[#635BFF]/5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Group</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Nav Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => showToast('Group Rewards Notification', 'info')}
            className="w-9 h-9 rounded-xl border border-[#E7E9EE] hover:bg-[#F8F9FC] text-[#667085] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {selectedGroup && (
            <button
              onClick={() => setInviteModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#635BFF] hover:bg-[#4F46E5] text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite (+25 pts)</span>
            </button>
          )}

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-[#F8F9FC] border border-transparent hover:border-[#E7E9EE] transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#667085] transition-transform duration-200 hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E7E9EE] p-2 z-30 animate-slide-up">
                <div className="p-3 border-b border-[#E7E9EE]">
                  <p className="font-extrabold text-xs text-[#171923] truncate">{userName}</p>
                  <p className="text-[10px] text-[#667085] truncate mt-0.5">{user?.email}</p>
                  <div className="flex gap-1 mt-2">
                    <VerificationBadge type="pan" status={user?.pan_verified ? 'VERIFIED' : 'NOT_STARTED'} size="sm" />
                    <VerificationBadge type="aadhaar" status={user?.aadhaar_verified ? 'VERIFIED' : 'NOT_STARTED'} size="sm" />
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setProfileModalTab('overview');
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-[#171923] hover:bg-[#F8F9FC] transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#667085]" />
                    <span>My Profile & Points</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setCreditModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-[#171923] hover:bg-[#F8F9FC] transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#12B76A]" />
                    <span>Credit & Financial</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-[#F04438] hover:bg-[#FEF3F2] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6 flex-1 pb-24 lg:pb-8">
        {loadingGroups ? (
          <div className="space-y-6">
            <Skeleton className="h-44 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        ) : groups.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-[#E7E9EE] rounded-3xl p-12 text-center max-w-xl mx-auto space-y-5 my-12 shadow-sm animate-fade-in">
            <div className="w-16 h-16 bg-[#635BFF]/10 text-[#635BFF] rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#171923]">Welcome to Collaborative Group Rewards</h2>
              <p className="text-[#667085] text-xs max-w-md mx-auto leading-relaxed">
                Start your journey by creating a private group or joining one with an invite token.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCreateModalOpen(true)}
            >
              + Create your group (+100 pts)
            </Button>
          </div>
        ) : (
          /* Main Group Dashboard Content */
          <>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171923]">
                Hi, {userName.split(' ')[0]}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-[#667085] mt-1">Here's what's happening with your group.</p>
            </div>

            {/* Milestone Progress Hero Section */}
            <MilestoneProgressSection
              selectedGroup={selectedGroup}
              totalPoints={totalPoints}
              pointsToGo={pointsToGo}
              progressPercent={progressPercent}
              userPointsData={userPointsData}
            />

            {/* Identity & Verification Banner */}
            <IdentityVerificationBanner
              user={user}
              onOpenKycTab={() => {
                setProfileModalTab('kyc');
                setProfileModalOpen(true);
              }}
              onOpenCreditModal={() => setCreditModalOpen(true)}
            />

            {/* 3-Column Grid: Members, Activity, Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: Members */}
              <div className="bg-white border border-[#E7E9EE] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-base text-[#171923]">
                    Members ({selectedGroup?.members?.length || 0})
                  </h2>
                  <button
                    onClick={() => setMembersModalOpen(true)}
                    className="text-xs font-semibold text-[#635BFF] hover:text-[#4F46E5] transition-colors cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {loadingDetails ? (
                  <Skeleton className="h-40 rounded-2xl" />
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1.5 border-t border-b border-[#F8F9FC] py-1">
                    {selectedGroup?.members?.map((m) => {
                      const isUserOwner = m.role === 'owner';
                      const isSelf = m.user.email === user?.email;
                      const memberName = m.user.name || m.user.email || 'Group Member';
                      const initial = memberName.charAt(0).toUpperCase();
                      const userColor = getUserColor(memberName);

                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F8F9FC] transition-colors border border-transparent hover:border-[#E7E9EE]"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="relative shrink-0">
                              <div
                                className={`w-9 h-9 rounded-xl ${userColor.bg} text-white font-black text-xs flex items-center justify-center border border-white/20 shadow-xs`}
                              >
                                {initial}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border border-[#E7E9EE] flex items-center justify-center shadow-2xs">
                                {isUserOwner ? (
                                  <ShieldCheck className="w-2 h-2 text-[#B45309]" />
                                ) : (
                                  <User className="w-2 h-2 text-[#0070F3]" />
                                )}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-[#171923] truncate max-w-[120px]">
                                  {memberName}
                                </p>
                                {isSelf && (
                                  <span className="text-[9px] font-extrabold text-[#635BFF] bg-[#635BFF]/10 border border-[#635BFF]/20 px-1.5 py-0.5 rounded-md shrink-0">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#667085] truncate max-w-[130px]">{m.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {(() => {
                              const mPoints = userPointsData?.member_points?.find(
                                (mp) => mp.user_id === m.user.id || mp.member_id === m.id
                              );
                              const earned = mPoints ? mPoints.points_earned : 0;
                              return (
                                <span className="text-[10px] font-extrabold text-[#635BFF] bg-[#635BFF]/10 border border-[#635BFF]/20 px-1.5 py-0.5 rounded-md">
                                  +{earned} pts
                                </span>
                              );
                            })()}
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                isUserOwner
                                  ? 'bg-[#FEF0C7] text-[#B45309] border border-[#F5B942]/30'
                                  : 'bg-[#F2F4F7] text-[#667085]'
                              }`}
                            >
                              {isUserOwner ? 'Owner' : 'Member'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Column 2: Recent Activity */}
              <div className="bg-white border border-[#E7E9EE] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-base text-[#171923]">Recent activity</h2>
                  <button
                    onClick={() => setActivityModalOpen(true)}
                    className="text-xs font-semibold text-[#635BFF] hover:text-[#4F46E5] transition-colors cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {loadingDetails ? (
                  <Skeleton className="h-40 rounded-2xl" />
                ) : activities.length === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <Zap className="w-6 h-6 text-[#98A2B3] mx-auto" />
                    <p className="text-xs text-[#98A2B3]">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1.5 border-t border-b border-[#F8F9FC] py-1">
                    {activities.map((act) => {
                      const actorName = String(act.member_name || act.metadata?.member_name || act.metadata?.user_name || 'Member');
                      const initial = actorName.charAt(0).toUpperCase();

                      let actionJSX: React.ReactNode;
                      let pointsText = '+100 pts';

                      if (act.event_type === 'group_created') {
                        actionJSX = (
                          <span>
                            <strong className="font-extrabold text-[#171923]">{actorName}</strong> created group{' '}
                            <span className="font-semibold text-[#635BFF]">"{String(act.metadata?.group_name || selectedGroup?.name || '')}"</span>
                          </span>
                        );
                        pointsText = '+100 pts';
                      } else if (act.event_type === 'invite_created') {
                        actionJSX = (
                          <span>
                            <strong className="font-extrabold text-[#171923]">{actorName}</strong> created an invite link
                          </span>
                        );
                        pointsText = '+25 pts';
                      } else if (act.event_type === 'member_joined') {
                        actionJSX = (
                          <span>
                            <strong className="font-extrabold text-[#171923]">{actorName}</strong> joined the group
                          </span>
                        );
                        pointsText = '+100 pts';
                      } else if (act.event_type === 'task_completed') {
                        actionJSX = (
                          <span>
                            <strong className="font-extrabold text-[#171923]">{actorName}</strong> completed task{' '}
                            <span className="font-semibold text-[#635BFF]">"{String(act.metadata?.task_name || 'Task')}"</span>
                          </span>
                        );
                        pointsText = `+${String(act.metadata?.points || 150)} pts`;
                      } else if (act.event_type === 'profile_completed') {
                        actionJSX = (
                          <span>
                            <strong className="font-extrabold text-[#171923]">{actorName}</strong> completed profile details
                          </span>
                        );
                        pointsText = `+${String(act.metadata?.points || 50)} pts`;
                      } else if (act.event_type === 'benefit_claimed') {
                        actionJSX = (
                          <span>
                            <strong className="font-extrabold text-[#171923]">{actorName}</strong> claimed benefit{' '}
                            <span className="font-semibold text-[#12B76A]">"{String(act.metadata?.benefit_name || 'Reward')}"</span>
                          </span>
                        );
                        pointsText = 'Reward';
                      } else {
                        actionJSX = (
                          <span>
                            <strong className="font-extrabold text-[#171923]">{actorName}</strong> triggered {act.event_type}
                          </span>
                        );
                      }

                      const timeFormatted = act.created_at
                        ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Recently';

                      return (
                        <div
                          key={act.id}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F8F9FC] transition-colors text-xs border border-transparent hover:border-[#E7E9EE]"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-full bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center font-extrabold text-xs shrink-0 border border-[#635BFF]/20">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[#171923] text-xs truncate leading-snug">{actionJSX}</p>
                              <p className="text-[10px] text-[#98A2B3] mt-0.5">{timeFormatted}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#12B76A] bg-[#ECFDF3] border border-[#12B76A]/20 px-2 py-0.5 rounded-full shrink-0">
                            {pointsText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Column 3: Benefits */}
              <div className="bg-white border border-[#E7E9EE] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-base text-[#171923]">Benefits</h2>
                  <button
                    onClick={() => setBenefitsModalOpen(true)}
                    className="text-xs font-semibold text-[#635BFF] hover:text-[#4F46E5] transition-colors cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {loadingDetails ? (
                  <Skeleton className="h-40 rounded-2xl" />
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1.5 border-t border-b border-[#F8F9FC] py-1">
                    {benefits.map((bState) => {
                      const { benefit, state } = bState;
                      const isClaimed = state === 'claimed';
                      const isAvailable = state === 'available';

                      return (
                        <div
                          key={benefit.id}
                          className="flex items-center justify-between p-3 rounded-2xl border border-[#E7E9EE] bg-white hover:border-[#635BFF]/30 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                              isClaimed
                                ? 'bg-gradient-to-br from-[#12B76A] to-[#059669] text-white'
                                : isAvailable
                                  ? 'bg-gradient-to-br from-[#635BFF] to-[#4F46E5] text-white'
                                  : 'bg-[#F2F4F7] text-[#98A2B3]'
                            }`}>
                              {isClaimed ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                              ) : isAvailable ? (
                                <Gift className="w-4 h-4" />
                              ) : (
                                <Lock className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-xs text-[#171923] truncate">{benefit.name}</h3>
                              <p className="text-[10px] font-semibold text-[#635BFF]">{benefit.required_points} points</p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isClaimed ? (
                              <span className="text-[10px] font-extrabold text-[#12B76A] bg-[#ECFDF3] border border-[#12B76A]/30 px-2.5 py-1 rounded-full">
                                Claimed ✓
                              </span>
                            ) : isAvailable ? (
                              <button
                                onClick={() => setUnlockedBenefit(bState)}
                                className="text-[10px] font-extrabold text-[#635BFF] bg-[#635BFF]/10 border border-[#635BFF]/30 hover:bg-[#635BFF] hover:text-white px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-2xs"
                              >
                                Claim
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-[#98A2B3] bg-[#F2F4F7] border border-[#E7E9EE] px-2.5 py-1 rounded-full">
                                Locked
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Group Tasks Section */}
            <GroupTasksSection
              tasks={tasks}
              completedTaskIds={completedTaskIds}
              completingTaskId={completingTaskId}
              onCompleteTask={handleCompleteTask}
            />
          </>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        onNavigateHome={() => navigate('/groups')}
        onOpenActivity={() => showToast('Activity feed', 'info')}
        onOpenInvite={() => setInviteModalOpen(true)}
        onOpenRewards={() => showToast('Group Rewards', 'info')}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Modals */}
      <CreateGroupModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(newGroup) => {
          fetchGroups();
          navigate(`/groups/${newGroup.id}`);
        }}
      />

      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        groupId={selectedGroup?.id}
        userPointsData={userPointsData}
        activities={activities}
        initialTab={profileModalTab}
        onSuccess={() => {
          if (selectedGroup) fetchGroupDetails(selectedGroup.id);
        }}
      />

      <CreditDashboardModal
        open={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        onOpenPanVerification={() => {
          setProfileModalTab('kyc');
          setProfileModalOpen(true);
        }}
      />

      {selectedGroup && (
        <>
          <InviteModal
            open={inviteModalOpen}
            onClose={() => setInviteModalOpen(false)}
            groupId={selectedGroup.id}
            groupName={selectedGroup.name}
            onInviteCreated={() => {
              fetchGroupDetails(selectedGroup.id);
            }}
          />

          <MembersModal
            open={membersModalOpen}
            onClose={() => setMembersModalOpen(false)}
            members={selectedGroup.members || []}
            groupName={selectedGroup.name}
            onOpenInvite={() => setInviteModalOpen(true)}
            memberPoints={userPointsData?.member_points}
          />

          <ActivityModal
            open={activityModalOpen}
            onClose={() => setActivityModalOpen(false)}
            activities={activities}
            groupName={selectedGroup.name}
          />

          <BenefitsModal
            open={benefitsModalOpen}
            onClose={() => setBenefitsModalOpen(false)}
            benefits={benefits}
            totalPoints={totalPoints}
            onUnlockBenefit={(bState) => setUnlockedBenefit(bState)}
          />
        </>
      )}

      {/* Benefit Unlock Celebration Modal */}
      {unlockedBenefit && (
        <Modal
          open={Boolean(unlockedBenefit)}
          onClose={() => setUnlockedBenefit(null)}
          title="Reward Available!"
        >
          <div className="space-y-5 text-center py-2">
            <div className="w-16 h-16 rounded-2xl bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center mx-auto">
              <Gift className="w-9 h-9 text-[#635BFF]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-[#171923]">New reward unlocked! 🎉</h3>
              <p className="text-xs text-[#667085] max-w-xs mx-auto">
                Your group reached <strong className="text-[#171923]">{unlockedBenefit.benefit.required_points} points</strong>. {unlockedBenefit.benefit.name} is now available.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleClaimBenefit(unlockedBenefit)}
                className="w-full"
              >
                Claim reward
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Claim Reward Confirmation Modal */}
      {claimedBenefit && (
        <Modal
          open={Boolean(claimedBenefit)}
          onClose={() => setClaimedBenefit(null)}
          title="Reward Claimed"
        >
          <div className="space-y-5 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-[#12B76A] text-white flex items-center justify-center mx-auto shadow-md">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-[#171923]">Reward claimed!</h3>
              <p className="text-xs text-[#667085] max-w-xs mx-auto">
                Enjoy your reward ({claimedBenefit.benefit.name}). Keep going for the next one.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setClaimedBenefit(null)}
                className="w-full"
              >
                Awesome!
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

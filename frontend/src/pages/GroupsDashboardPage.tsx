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
  LayoutDashboard,
  LogOut,
  Sparkle,
  ShieldCheck,
  Lock
} from 'lucide-react';

import MembersModal from '../components/MembersModal';
import ActivityModal from '../components/ActivityModal';
import BenefitsModal from '../components/BenefitsModal';
import ProfileModal from '../components/ProfileModal';
import { calculateSegmentedProgress } from '../lib/progress';

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
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#171923] hidden xs:inline">Collaborative Group Rewards</span>
          </div>

          {/* Divider */}
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
              <ChevronDown className="w-4 h-4 text-[#667085] sm:hidden" />
            </button>

            {/* Dropdown Menu */}
            {groupDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-[#E7E9EE] rounded-2xl shadow-2xl py-2 z-30 space-y-1">
                <div className="px-4 py-2 border-b border-[#E7E9EE] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider">Your Groups ({groups.length})</span>
                  <span className="text-[10px] font-bold text-[#635BFF] bg-[#635BFF]/10 px-2 py-0.5 rounded-full">Select active</span>
                </div>
                <div className="max-h-64 overflow-y-auto py-1 px-2 space-y-1">
                  {groups.map((g) => {
                    const isSelected = selectedGroup?.id === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => {
                          selectGroup(g);
                          setGroupDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#635BFF]/10 text-[#635BFF] border border-[#635BFF]/20'
                            : 'text-[#171923] hover:bg-[#F8F9FC] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                            isSelected ? 'bg-[#635BFF] text-white' : 'bg-[#F2F4F7] text-[#667085]'
                          }`}>
                            {g.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <p className="font-bold truncate text-xs">{g.name}</p>
                            <p className="text-[10px] text-[#667085] capitalize">{g.group_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold text-[#635BFF] bg-[#635BFF]/5 px-2 py-0.5 rounded-md">
                            {g.total_points} pts
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#635BFF]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-[#E7E9EE] px-2">
                  <button
                    onClick={() => {
                      setGroupDropdownOpen(false);
                      setCreateModalOpen(true);
                    }}
                    className="w-full bg-[#635BFF] hover:bg-[#4F46E5] text-white text-xs font-bold py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Create new group
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Header Actions (Bell & User Profile) */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative w-9 h-9 rounded-xl bg-[#F8F9FC] border border-[#E7E9EE] flex items-center justify-center text-[#667085] hover:text-[#171923] transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#F04438] rounded-full border-2 border-white" />
          </button>

          {/* User Profile Pill */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-xl hover:bg-[#F8F9FC] transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#635BFF] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-xs text-[#171923] hidden sm:inline">{userName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#667085] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E7E9EE] rounded-2xl shadow-xl py-2 z-30 space-y-1">
                <div className="px-4 py-2 border-b border-[#E7E9EE]">
                  <p className="text-xs font-bold text-[#171923]">{userName}</p>
                  <p className="text-[11px] text-[#667085] truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setProfileModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#171923] hover:bg-[#F8F9FC] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#635BFF]" /> My Profile (+50 pts)
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#F04438] hover:bg-[#F04438]/5 flex items-center gap-2 transition-colors cursor-pointer border-t border-[#E7E9EE]"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6 w-full flex-1 pb-24 lg:pb-12">


          {loadingGroups ? (
            <div className="space-y-4">
              <Skeleton className="h-44 w-full rounded-3xl" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>
          ) : groups.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-[#E7E9EE] rounded-3xl p-12 text-center max-w-xl mx-auto space-y-5 my-12 shadow-sm">
              <div className="w-16 h-16 bg-[#635BFF]/10 text-[#635BFF] rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#171923]">Welcome to Collaborative Group Rewards</h2>
                <p className="text-[#667085] text-xs max-w-md mx-auto leading-relaxed">
                  Start your journey by creating a private group or joining one with an invite token.
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="bg-[#635BFF] hover:bg-[#4F46E5] text-white font-semibold px-6 py-3 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                + Create your group (+100 pts)
              </button>
            </div>
          ) : (
            /* Dashboard Content matching Screen 06 */
            <>
              {/* Banner Greeting & Purple Points Card */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171923]">
                    Hi, {userName.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-[#667085] mt-1">Here's what's happening with your group.</p>
                </div>

                {/* Main Vibrant Purple Hero Banner Card */}
                <div className="bg-gradient-to-r from-[#5C4EFE] to-[#635BFF] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Left Points Metric */}
                    <div className="md:col-span-5 space-y-2">
                      <span className="text-xs font-semibold text-white/80 uppercase tracking-wider block">Group Total Points</span>
                      <div className="text-4xl sm:text-5xl font-black tracking-tight font-sans flex items-center gap-2">
                        {totalPoints} <Sparkle className="w-7 h-7 text-[#F5B942] fill-[#F5B942] animate-pulse-subtle" />
                      </div>
                      
                      {/* User Specified Points Badge */}
                      <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur-xs px-3 py-1.5 rounded-xl text-xs text-white font-bold mt-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#F5B942]" />
                        <span>Your Points: <strong>{userPointsData?.user_points || 0} pts</strong></span>
                        <span className="text-white/70 text-[10px]">({userPointsData?.user_contribution_pct || 0}% share)</span>
                      </div>

                      <p className="text-xs text-white/80 font-medium pt-1">
                        Earned by {selectedGroup?.member_count || 1} {selectedGroup?.member_count === 1 ? 'member' : 'members'}
                      </p>
                    </div>

                    {/* Right Progress Nodes & Microcopy */}
                    <div className="md:col-span-7 space-y-4 md:border-l md:border-white/15 md:pl-8">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white text-sm">
                          {pointsToGo > 0 ? `${pointsToGo} points to next reward` : 'Milestone achieved! 🎉'}
                        </span>
                        <span className="text-white/80 font-semibold">Keep going!</span>
                      </div>

                      {/* Progress Line with Node Markers */}
                      <div className="relative pt-4 pb-2">
                        <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {/* Node markers */}
                        <div className="flex justify-between items-center text-[10px] font-bold text-white/90 pt-3 relative">
                          <div className="flex flex-col items-center">
                            <span className="w-3.5 h-3.5 rounded-full bg-white text-[#635BFF] flex items-center justify-center text-[9px] mb-1">✓</span>
                            <span>0</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] mb-1 ${totalPoints >= 200 ? 'bg-white text-[#635BFF]' : 'bg-white/30 text-white'}`}>
                              {totalPoints >= 200 ? '✓' : '•'}
                            </span>
                            <span>200</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] mb-1 ${totalPoints >= 500 ? 'bg-white text-[#635BFF]' : 'bg-white/30 text-white'}`}>
                              {totalPoints >= 500 ? '✓' : '•'}
                            </span>
                            <span>500</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] mb-1 ${totalPoints >= 1000 ? 'bg-white text-[#635BFF]' : 'bg-white/30 text-white'}`}>
                              {totalPoints >= 1000 ? '✓' : '•'}
                            </span>
                            <span>1,000</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3-Column Grid Matching Screen 06 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Members (4) */}
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
                        const userName = m.user.name || m.user.email || 'Group Member';
                        const initial = userName.charAt(0).toUpperCase();
                        const userColor = getUserColor(userName);

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
                                    {userName}
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
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${isUserOwner
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

                {/* Column 2: Recent activity */}
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
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${isClaimed
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

                            {/* Status Pills */}
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

              {/* Dynamic Group Tasks Bar */}
              <div className="bg-white border border-[#E7E9EE] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-extrabold text-base text-[#171923] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#F5B942]" /> Group Actions & Tasks
                    </h2>
                    <p className="text-xs text-[#667085]">Complete actions together to increase group points</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tasks.map((t) => {
                    const isCompleted = completedTaskIds.has(t.id);
                    return (
                      <div
                        key={t.id}
                        className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xs text-[#171923]">{t.name}</h3>
                            <span className="text-[10px] font-bold text-[#635BFF] bg-[#635BFF]/10 px-2 py-0.5 rounded-full">
                              +{t.points} pts
                            </span>
                          </div>
                          <p className="text-[11px] text-[#667085] mt-0.5">{t.description}</p>
                        </div>
                        <button
                          onClick={() => handleCompleteTask(t)}
                          disabled={isCompleted || completingTaskId === t.id}
                          className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${isCompleted
                              ? 'bg-[#ECFDF3] text-[#12B76A] border border-[#12B76A]/30 cursor-default'
                              : 'bg-[#635BFF] hover:bg-[#4F46E5] text-white shadow-xs'
                            }`}
                        >
                          {completingTaskId === t.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : isCompleted ? (
                            'Completed ✓'
                          ) : (
                            'Complete'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </main>

      {/* Mobile Fixed Bottom Navigation Bar (Screen 09 Layout) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7E9EE] px-4 py-2.5 flex items-center justify-around z-30 shadow-lg">
        <button
          onClick={() => navigate('/groups')}
          className="flex flex-col items-center gap-1 text-[#635BFF] text-[10px] font-bold cursor-pointer"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => showToast('Activity feed', 'info')}
          className="flex flex-col items-center gap-1 text-[#667085] text-[10px] font-semibold cursor-pointer"
        >
          <Zap className="w-5 h-5" />
          <span>Activity</span>
        </button>

        {/* Floating (+) Invite Center Button */}
        <button
          onClick={() => setInviteModalOpen(true)}
          className="w-12 h-12 rounded-full bg-[#635BFF] text-white flex items-center justify-center shadow-lg -mt-6 border-4 border-white cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={() => showToast('Group Rewards', 'info')}
          className="flex flex-col items-center gap-1 text-[#667085] text-[10px] font-semibold cursor-pointer"
        >
          <Gift className="w-5 h-5" />
          <span>Rewards</span>
        </button>
        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[#667085] text-[10px] font-semibold cursor-pointer"
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </div>

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
        onSuccess={() => {
          if (selectedGroup) fetchGroupDetails(selectedGroup.id);
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

      {/* Benefit Unlock Celebration Modal (Screen 10 in Visual Spec) */}
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
              <button
                onClick={() => handleClaimBenefit(unlockedBenefit)}
                className="w-full bg-[#635BFF] hover:bg-[#4F46E5] text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                Claim reward
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Claim Reward Confirmation Modal (Screen 11 in Visual Spec) */}
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
              <button
                onClick={() => setClaimedBenefit(null)}
                className="w-full bg-[#635BFF] hover:bg-[#4F46E5] text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Awesome!
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

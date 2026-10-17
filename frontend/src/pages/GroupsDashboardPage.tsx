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
  User,
  Check,
  Bell,
  ChevronDown,
  Plus,
  LogOut,
  ShieldCheck,
  Lock,
  Coins,
  CheckCircle2,
  TrendingUp,
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
  const userPts = userPointsData?.user_points ?? 0;
  const claimedBenefitsSum = benefits
    .filter((b) => b.state === 'claimed')
    .reduce((sum, b) => sum + (b.benefit.required_points || 0), 0);
  const benefitPts = Math.max(userPointsData?.benefit_points ?? 0, claimedBenefitsSum);
  const ownTotalPts = userPointsData?.user_total_points && userPointsData.user_total_points >= (userPts + benefitPts)
    ? userPointsData.user_total_points
    : (userPts + benefitPts);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0c0a09] flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#e7e5e4] px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* App Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/groups')}>
            <div className="w-8 h-8 rounded-xl bg-[#0c0a09] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 fill-white/20 text-[#ffdcc3]" />
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#0c0a09] hidden xs:inline">
              Collaborative Group Rewards
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5 pl-2">
            <button
              onClick={() => navigate('/groups')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0c0a09] text-white transition-all cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/credit')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#78716c] hover:text-[#0c0a09] hover:bg-[#f5f5f4] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>CIBIL Credit</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#78716c] hover:text-[#0c0a09] hover:bg-[#f5f5f4] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Profile & KYC</span>
            </button>
          </nav>

          <div className="h-6 w-px bg-[#e7e5e4] hidden sm:block" />

          {/* Active Group Selector Dropdown */}
          <div className="relative" ref={groupDropdownRef}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGroupDropdownOpen(!groupDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-full bg-[#f5f5f4] border border-[#e7e5e4] hover:border-[#d6d3d1] hover:shadow-xs transition-all cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-full bg-[#0c0a09] text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {selectedGroup?.name ? selectedGroup.name.charAt(0).toUpperCase() : <UsersRound className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#0c0a09] max-w-[140px] truncate">
                      {selectedGroup?.name || 'Select Group'}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-[#78716c] transition-transform duration-200 ${groupDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#78716c]">
                    <span className="capitalize">{selectedGroup?.group_type || 'Group'}</span>
                    <span>•</span>
                    <span className="font-bold text-[#0c0a09]">{selectedGroup?.total_points || 0} pts</span>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setGroupDropdownOpen(!groupDropdownOpen)}
                className="hidden lg:inline-flex text-xs font-semibold text-[#78716c] hover:text-[#0c0a09] px-2.5 py-1.5 hover:bg-[#f5f5f4] rounded-lg transition-colors cursor-pointer"
              >
                Switch Group
              </button>
            </div>

            {/* Dropdown Menu */}
            {groupDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e7e5e4] p-2 z-30 animate-slide-up">
                <div className="px-3 py-2 text-[10px] font-bold text-[#78716c] uppercase tracking-wider flex items-center justify-between">
                  <span>Your Groups</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#f5f5f4] text-[#78716c]">
                    {groups.length}
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {groups.map((g) => {
                    const isSelected = selectedGroup?.id === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => {
                          selectGroup(g);
                          setGroupDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${isSelected
                            ? 'bg-[#f5f5f4] border border-[#e7e5e4] text-[#0c0a09] font-bold shadow-2xs'
                            : 'hover:bg-[#fafaf9] border border-transparent text-[#44403c]'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${isSelected
                                ? 'bg-[#0c0a09] text-white shadow-2xs'
                                : 'bg-[#e7e5e4]/60 text-[#78716c]'
                              }`}
                          >
                            {g.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate">{g.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isSelected
                                ? 'bg-[#fff1eb] text-[#b4552d] border border-[#fed7aa]'
                                : 'bg-[#f5f5f4] text-[#78716c]'
                              }`}
                          >
                            {g.total_points} pts
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-[#e7e5e4] mt-1">
                  <button
                    onClick={() => {
                      setGroupDropdownOpen(false);
                      setCreateModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-[#0c0a09] hover:bg-[#f5f5f4] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#78716c]" />
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
            className="w-8 h-8 rounded-full border border-[#e7e5e4] hover:bg-[#f5f5f4] text-[#78716c] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {selectedGroup && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setInviteModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex"
            >
              Invite (+25 pts)
            </Button>
          )}

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#f5f5f4] border border-transparent hover:border-[#e7e5e4] transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#0c0a09] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#78716c] transition-transform duration-200 hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#e7e5e4] p-2 z-30 animate-slide-up">
                <div className="p-3 border-b border-[#e7e5e4]">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0c0a09] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-xs text-[#0c0a09] truncate">{userName}</p>
                      <p className="text-[10px] text-[#78716c] truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <VerificationBadge type="pan" status={user?.pan_verified ? 'VERIFIED' : 'NOT_STARTED'} size="sm" />
                    <VerificationBadge type="aadhaar" status={user?.aadhaar_verified ? 'VERIFIED' : 'NOT_STARTED'} size="sm" />
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-[#0c0a09] hover:bg-[#f5f5f4] transition-colors cursor-pointer text-left"
                  >
                    <User className="w-4 h-4 text-[#78716c]" />
                    <span>Profile & KYC Verification</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/credit');
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-[#0c0a09] hover:bg-[#f5f5f4] transition-colors cursor-pointer text-left"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#059669]" />
                    <span>CIBIL Credit Intelligence</span>
                  </button>
                  <div className="my-1 border-t border-[#e7e5e4]" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-[#dc2626] hover:bg-[#fef2f2] transition-colors cursor-pointer text-left"
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
          <div className="bg-white border border-[#e7e5e4] rounded-3xl p-12 text-center max-w-xl mx-auto space-y-5 my-12 shadow-sm animate-fade-in">
            <div className="w-16 h-16 bg-[#fafafa] border border-[#e7e5e4] text-[#0c0a09] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-8 h-8 text-[#b4552d]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#0c0a09]">Welcome to Collaborative Group Rewards</h2>
              <p className="text-[#78716c] text-xs max-w-md mx-auto leading-relaxed">
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
            {/* Milestone Progress Hero Section */}
            <MilestoneProgressSection
              selectedGroup={selectedGroup}
              totalPoints={totalPoints}
              pointsToGo={pointsToGo}
              progressPercent={progressPercent}
              userPointsData={userPointsData}
              userName={userName}
              user={user}
              onRedeemPerks={() => setBenefitsModalOpen(true)}
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

            {/* Two-Column Main Section (7 cols left, 5 cols right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: 7 cols */}
              <div className="lg:col-span-7 space-y-6">
                {/* Tiered Group Benefits Grid */}
                <section className="bg-white rounded-2xl border border-[#e7e5e4] p-6 custom-card-shadow space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0efed]">
                    <div>
                      <h2 className="text-base font-extrabold text-[#0c0a09]">Tiered Group Benefits</h2>
                      <p className="text-xs text-[#78716c] mt-0.5">
                        Unlocked automatically for all members once points threshold is attained.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#b4552d] bg-[#fff7ed] border border-[#fed7aa] px-2.5 py-1 rounded-full shrink-0">
                      {benefits.filter(b => b.state === 'claimed' || (totalPoints >= b.benefit.required_points)).length} of {Math.max(4, benefits.length)} Unlocked
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {(benefits.length > 0 ? benefits : [
                      {
                        benefit: { id: 'b1', name: 'Amazon & Swiggy ₹500 Vouchers', description: 'Instant digital gift card codes issued to each member\'s registered email.', required_points: 200, display_order: 1 },
                        state: totalPoints >= 200 ? 'available' : 'locked',
                        claim: null,
                      },
                      {
                        benefit: { id: 'b2', name: 'Co-working Day Pass & Lounge Access', description: 'One complimentary day pass per member at WeWork and partner hubs across India.', required_points: 500, display_order: 2 },
                        state: totalPoints >= 500 ? 'available' : 'locked',
                        claim: null,
                      },
                      {
                        benefit: { id: 'b3', name: '10% Cashback on Subscriptions', description: 'Applied automatically to GitHub, AWS, Notion, and joint group billing.', required_points: 1000, display_order: 3 },
                        state: totalPoints >= 1000 ? 'available' : 'locked',
                        claim: null,
                      },
                      {
                        benefit: { id: 'b4', name: 'Annual Team Retreat Subsidy', description: '₹25,000 company trip grant credited directly to group escrow account.', required_points: 2000, display_order: 4 },
                        state: totalPoints >= 2000 ? 'available' : 'locked',
                        claim: null,
                      },
                    ] as typeof benefits).map((bState) => {
                      const { benefit, state } = bState;
                      const isClaimed = state === 'claimed';
                      const isUnlocked = isClaimed || state === 'available' || totalPoints >= benefit.required_points;
                      const isAvailable = isUnlocked && !isClaimed;
                      const remainingPts = Math.max(0, benefit.required_points - totalPoints);
                      const progressPct = Math.min(100, Math.round((totalPoints / benefit.required_points) * 100));

                      return (
                        <div
                          key={benefit.id}
                          className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 shadow-2xs transition-all ${
                            isClaimed
                              ? 'border-emerald-200 bg-emerald-50/40'
                              : isAvailable
                              ? 'border-[#b4552d]/40 bg-[#fff7ed]/30 relative'
                              : 'border-dashed border-[#e7e5e4] bg-[#f8fafc] opacity-90'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                isAvailable ? 'text-[#b4552d] bg-[#fff7ed] border border-[#fed7aa]' : 'text-[#78716c] bg-[#f5f5f4]'
                              }`}>
                                {benefit.required_points.toLocaleString()} PTS TARGET
                              </span>
                              {isClaimed ? (
                                <span className="text-[#059669] font-bold text-xs flex items-center gap-0.5">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Claimed
                                </span>
                              ) : isAvailable ? (
                                <span className="text-[#b4552d] font-bold text-xs flex items-center gap-0.5">
                                  <Sparkles className="w-3.5 h-3.5" /> Unlocked
                                </span>
                              ) : (
                                <span className="text-[#78716c] font-medium text-xs flex items-center gap-0.5">
                                  <Lock className="w-3.5 h-3.5" /> Locked
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-[#0c0a09]">{benefit.name}</h4>
                            <p className="text-xs text-[#78716c] mt-1 leading-relaxed">
                              {benefit.description}
                            </p>

                            {!isUnlocked && (
                              <div className="mt-3">
                                <div className="flex justify-between text-[11px] text-[#78716c] mb-1">
                                  <span>Progress to unlock</span>
                                  <span className="font-bold text-[#b4552d]">
                                    {remainingPts.toLocaleString()} pts remaining
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-[#e7e5e4] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#fd8d60] rounded-full transition-all duration-300"
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {isClaimed ? (
                            <button
                              type="button"
                              disabled
                              className="w-full py-2 px-3 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1 cursor-default"
                            >
                              <Check className="w-3.5 h-3.5" /> Claimed by Group
                            </button>
                          ) : isAvailable ? (
                            <button
                              type="button"
                              onClick={() => handleClaimBenefit(bState)}
                              className="w-full py-2 px-3 rounded-full bg-[#b4552d] hover:bg-[#9a4420] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-98 shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Claim Reward</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="w-full py-2 px-3 rounded-full bg-[#f5f5f4] text-[#a8a29e] cursor-not-allowed text-xs font-bold text-center"
                            >
                              Locked (Reach {benefit.required_points.toLocaleString()} pts)
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Collaborative Tasks & Bounties */}
                <GroupTasksSection
                  tasks={tasks}
                  completedTaskIds={completedTaskIds}
                  completingTaskId={completingTaskId}
                  onCompleteTask={handleCompleteTask}
                />
              </div>

              {/* RIGHT COLUMN: 5 cols */}
              <div className="lg:col-span-5 space-y-6">
                {/* Own Points Balance (Personal Total with all points) */}
                <section className="bg-white rounded-2xl border border-[#e7e5e4] p-6 custom-card-shadow space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0efed]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#fff7ed] border border-[#fed7aa] text-[#b4552d] flex items-center justify-center shrink-0 shadow-2xs">
                        <Coins className="w-4 h-4 text-[#b4552d]" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-[#0c0a09]">Own Points Balance</h2>
                        <p className="text-xs text-[#78716c]">All personal points & earnings</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      All Points
                    </span>
                  </div>

                  {/* Summary Metric Block */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#fffaf5] via-white to-[#fffaf5] border border-[#fed7aa]/70 flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[11px] font-bold text-[#78716c] uppercase tracking-wider block">
                        Total Reward Balance
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-3xl font-extrabold tracking-tight text-[#0c0a09] font-mono">
                          {ownTotalPts.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-[#b4552d] uppercase tracking-wider">PTS</span>
                      </div>
                      <span className="text-[11px] text-[#78716c] block mt-0.5">
                        Lifetime tasks + invites + benefits
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-[#0c0a09] text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-5 h-5 text-[#fed7aa]" />
                      </div>
                    </div>
                  </div>

                  {/* Breakdown items styled similarly to Team Roster items */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl border border-[#f0efed] bg-white hover:bg-[#f8fafc] flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D9488] to-[#059669] text-white flex items-center justify-center border border-white/20 shadow-xs shrink-0">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0c0a09] text-xs">Tasks & Activities</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#ecfdf5] text-[#059669]">
                              Earned
                            </span>
                          </div>
                          <div className="text-[11px] text-[#78716c] mt-0.5">
                            {userPointsData?.user_tasks_completed || 0} tasks completed & contributions
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm text-[#0c0a09] font-mono">
                          {userPts.toLocaleString()} pts
                        </div>
                        <div className="text-[10px] text-[#059669] font-medium">Contributed</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-[#fed7aa]/60 bg-[#fffaf5] hover:bg-[#fff7ed]/50 flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D97706] to-[#B45309] text-white flex items-center justify-center border border-white/20 shadow-xs shrink-0">
                          <Gift className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#0c0a09] text-xs">Claimed Benefits</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#fff7ed] text-[#b4552d]">
                              Perks
                            </span>
                          </div>
                          <div className="text-[11px] text-[#78716c] mt-0.5">
                            Unlocked milestone rewards
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-sm text-[#b4552d] font-mono">
                          +{benefitPts.toLocaleString()} pts
                        </div>
                        <div className="text-[10px] text-[#b4552d] font-medium">Claimed</div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Team Roster */}
                <section className="bg-white rounded-2xl border border-[#e7e5e4] p-6 custom-card-shadow space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0efed]">
                    <div>
                      <h2 className="text-base font-extrabold text-[#0c0a09]">Team Roster</h2>
                      <p className="text-xs text-[#78716c]">
                        {selectedGroup?.members?.length ?? selectedGroup?.member_count ?? 3} Active Members
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMembersModalOpen(true)}
                      className="text-xs font-bold text-[#b4552d] hover:underline cursor-pointer"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[208px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {selectedGroup?.members && selectedGroup.members.length > 0 ? (
                      selectedGroup.members.map((m) => {
                        const isUserOwner = m.role === 'owner';
                        const isSelf = m.user.email === user?.email;
                        const memberName = m.user.name || m.user.email || 'Member';
                        const initial = memberName.charAt(0).toUpperCase();
                        const userColor = getUserColor(memberName);
                        const mPoints = userPointsData?.member_points?.find(
                          (mp) => mp.user_id === m.user.id || mp.member_id === m.id
                        );
                        const earned = mPoints ? mPoints.points_earned : 0;
                        const sharePct = totalPoints > 0 ? Math.round((earned / totalPoints) * 100) : 0;

                        return (
                          <div
                            key={m.id}
                            className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                              isSelf ? 'bg-[#f8fafc] border-[#e7e5e4]' : 'bg-white border-[#f0efed] hover:bg-[#f8fafc]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              <div className="relative shrink-0">
                                <div className={`w-10 h-10 rounded-full ${userColor.bg} text-white font-bold text-xs flex items-center justify-center border border-white/20 shadow-xs`}>
                                  {initial}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10b981] border-2 border-white rounded-full"></span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[#0c0a09] text-xs truncate max-w-[130px]">
                                    {memberName} {isSelf && '(You)'}
                                  </span>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                    isUserOwner ? 'bg-[#0c0a09] text-white' : 'bg-[#f5f5f4] text-[#78716c]'
                                  }`}>
                                    {isUserOwner ? 'Owner' : 'Member'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#78716c] mt-0.5">{sharePct}% share of pool</div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-bold text-sm text-[#0c0a09]">{earned} pts</div>
                              <div className="text-[10px] text-[#78716c] font-medium">{sharePct}% pool</div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 rounded-xl bg-[#fafafa] border border-dashed border-[#e7e5e4] text-center space-y-2">
                        <p className="text-xs font-semibold text-[#0c0a09]">No other members yet</p>
                        <p className="text-[11px] text-[#78716c]">Invite your peers to collaborate and earn rewards together.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMembersModalOpen(true)}
                      className="flex-1 py-2 rounded-xl bg-[#f5f5f4] hover:bg-[#e7e5e4] text-[#0c0a09] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Manage Permissions
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteModalOpen(true)}
                      className="flex-1 py-2 rounded-xl border border-[#e7e5e4] text-[#0c0a09] hover:bg-[#f5f5f4] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Invite New Member
                    </button>
                  </div>
                </section>

                {/* Recent Group Activity Stream */}
                <section className="bg-white rounded-2xl border border-[#e7e5e4] p-6 custom-card-shadow space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0efed]">
                    <h2 className="text-base font-extrabold text-[#0c0a09]">Recent Activity</h2>
                    <button
                      type="button"
                      onClick={() => setActivityModalOpen(true)}
                      className="text-xs font-bold text-[#b4552d] hover:underline cursor-pointer"
                    >
                      View all
                    </button>
                  </div>

                  <div className="max-h-[290px] overflow-y-auto pr-1.5 custom-scrollbar">
                    {activities.length > 0 ? (
                      <div className="relative space-y-4 py-1">
                        {/* Vertical timeline line centered with dots */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#f0efed]" />
                        {activities.map((act) => {
                          const actorName = String(act.member_name || act.metadata?.member_name || act.metadata?.user_name || 'Member');
                          const timeFormatted = act.created_at
                            ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Recently';

                          let pts = 0;
                          if (act.metadata?.points) pts = Number(act.metadata.points);
                          else if (act.event_type === 'group_created' || act.event_type === 'member_joined') pts = 100;
                          else if (act.event_type === 'invite_created') pts = 25;

                          return (
                            <div key={act.id} className="relative flex items-start gap-3">
                              <div className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] ring-4 ring-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs text-[#0c0a09] leading-snug">
                                  <span className="font-bold">{actorName}</span> triggered {act.event_type.replace(/_/g, ' ')}.
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#78716c]">
                                  <span>{timeFormatted}</span>
                                  {pts > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-[#059669] font-bold">+{pts} pts</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-[#fafafa] rounded-xl border border-dashed border-[#e7e5e4] space-y-1">
                        <p className="text-xs font-semibold text-[#0c0a09]">No recent activity yet</p>
                        <p className="text-[11px] text-[#78716c]">Group actions and milestone rewards will be logged here.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
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
          <div className="space-y-5 text-center py-2 text-[#0c0a09]">
            <div className="w-16 h-16 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center mx-auto shadow-xs">
              <Gift className="w-9 h-9 text-[#b4552d]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#0c0a09]">New reward unlocked! 🎉</h3>
              <p className="text-xs text-[#78716c] max-w-xs mx-auto">
                Your group reached <strong className="text-[#0c0a09]">{unlockedBenefit.benefit.required_points} points</strong>. {unlockedBenefit.benefit.name} is now available.
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

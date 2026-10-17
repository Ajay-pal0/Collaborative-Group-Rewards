import React from 'react';
import {
  Users,
  Award,
  ShieldCheck,
  Timer,
  Check,
  PartyPopper,
  Lock,
  Gift,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import type { Group, UserPointsData, User } from '../../../types';
import { calculateHighwayProgress } from '../../../lib/progress';

interface MilestoneProgressSectionProps {
  selectedGroup: Group | null;
  totalPoints: number;
  pointsToGo: number;
  progressPercent: number;
  userPointsData?: UserPointsData | null;
  userName?: string;
  user?: User | null;
  onRedeemPerks?: () => void;
}

export const MilestoneProgressSection: React.FC<MilestoneProgressSectionProps> = ({
  selectedGroup,
  totalPoints,
  userPointsData,
  userName = 'Member',
  user,
  onRedeemPerks,
}) => {
  // Milestone targets
  const milestones = [
    { name: 'Base', points: 0, key: 'base' },
    { name: 'Starter', points: 200, key: 'starter' },
    { name: 'Team', points: 500, key: 'team' },
    { name: 'Premium', points: 1000, key: 'premium' },
    { name: 'Champion', points: 2000, key: 'champion' },
  ];

  // Calculate segmented percentage across milestone highway (0 -> 200 -> 500 -> 1000 -> 2000)
  const highwayPercent = Math.min(100, Math.round(calculateHighwayProgress(totalPoints)));
  const remainingToChampion = Math.max(0, 2000 - totalPoints);

  // Active tier name
  let currentTier = 'Base';
  if (totalPoints >= 2000) currentTier = 'Champion Tier';
  else if (totalPoints >= 1000) currentTier = 'Premium Tier';
  else if (totalPoints >= 500) currentTier = 'Team Tier';
  else if (totalPoints >= 200) currentTier = 'Starter Tier';

  const memberCount = selectedGroup?.members?.length || selectedGroup?.member_count || 1;
  const userPts = userPointsData?.user_points ?? 0;
  const userPct = userPointsData?.user_contribution_pct ?? (totalPoints > 0 ? Math.round((userPts / totalPoints) * 100) : 0);
  const isFullKyc = Boolean(user?.pan_verified && user?.aadhaar_verified);
  const isPartialKyc = Boolean(user?.pan_verified || user?.aadhaar_verified);
  const kycStatusLabel = isFullKyc ? '100% Verified' : isPartialKyc ? '50% Verified' : 'Action Required';

  return (
    <div className="space-y-6">
      {/* 1. Hero Group Overview Card */}
      <section className="bg-white rounded-2xl border border-[#e7e5e4] p-6 sm:p-8 custom-card-shadow relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fff7ed] border border-[#fed7aa] text-[#b4552d] text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>Collaborative Pool Sprint</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0c0a09] tracking-tight">
              Hi, {userName.split(' ')[0]}! 👋{' '}
              <span className="text-[#78716c] font-normal">Here's what's happening with your group.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#78716c] max-w-2xl">
              Your collective milestones unlock higher reward tiers and verified financial perks for every squad member.
            </p>
          </div>

          {/* Points Counter & Direct Redeem CTA Card */}
          <div className="flex flex-col justify-between bg-gradient-to-br from-[#fffaf5] via-white to-[#fffaf5] text-[#0c0a09] p-5 sm:p-6 rounded-2xl border border-[#fed7aa]/80 shadow-[0_2px_12px_rgba(180,85,45,0.06)] w-full lg:w-[410px] shrink-0 gap-4">
            {/* Header: Title & Tier Badge */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#f5ede6]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#fff7ed] border border-[#fed7aa] text-[#b4552d] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#44403c] tracking-wide uppercase whitespace-nowrap">
                  Group Pool Balance
                </span>
              </div>
              <span className="inline-flex items-center text-[11px] font-bold text-[#b4552d] bg-[#fff7ed] border border-[#fed7aa] px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
                {currentTier} Tier
              </span>
            </div>

            {/* Middle: Big Points & Redeem Perks Button */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0c0a09] font-mono">
                    {totalPoints.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-[#78716c] uppercase tracking-wider">PTS</span>
                </div>
                <span className="text-[11px] text-[#78716c] block mt-0.5">Collective reward balance</span>
              </div>

              <button
                type="button"
                onClick={onRedeemPerks}
                className="px-4 py-2.5 rounded-xl bg-[#0c0a09] hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
              >
                <Gift className="w-3.5 h-3.5 text-[#fed7aa]" />
                <span>Redeem Perks</span>
              </button>
            </div>

            {/* Bottom: Personal Contribution Progress Bar */}
            <div className="pt-2 space-y-1.5 border-t border-[#f5ede6]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#78716c] font-medium">Your Contribution</span>
                <span className="font-bold text-[#0c0a09]">
                  {userPts.toLocaleString()} pts <span className="text-[#b4552d] font-semibold">({userPct}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#f5f5f4] border border-[#e7e5e4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#b4552d] to-[#d97706] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, userPct))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="mt-6 pt-5 border-t border-[#f0efed] grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#fafaf9] border border-[#f0efed]/80">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#e7e5e4] flex items-center justify-center text-[#0c0a09] shadow-2xs shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-[#0c0a09] leading-tight truncate">{memberCount} Active</div>
              <div className="text-[11px] text-[#78716c] truncate">Tribe Members</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#fafaf9] border border-[#f0efed]/80">
            <div className="w-9 h-9 rounded-xl bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center text-[#b4552d] shadow-2xs shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-[#0c0a09] leading-tight truncate">{currentTier}</div>
              <div className="text-[11px] text-[#78716c] truncate">Current Status</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#fafaf9] border border-[#f0efed]/80">
            <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] border border-emerald-200 flex items-center justify-center text-[#059669] shadow-2xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-[#0c0a09] leading-tight truncate">{kycStatusLabel}</div>
              <div className="text-[11px] text-[#78716c] truncate">KYC Compliance</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#fafaf9] border border-[#f0efed]/80">
            <div className="w-9 h-9 rounded-xl bg-[#fffbeb] border border-[#fde68a] flex items-center justify-center text-[#d97706] shadow-2xs shrink-0">
              <Timer className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-[#0c0a09] leading-tight truncate">
                {remainingToChampion > 0 ? `${remainingToChampion.toLocaleString()} PTS` : 'Max Reached'}
              </div>
              <div className="text-[11px] text-[#78716c] truncate">To Champion Tier</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stepped Milestone Progress Tracker */}
      <section className="bg-white rounded-2xl border border-[#e7e5e4] p-6 custom-card-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-2 border-b border-[#f0efed]">
          <div>
            <h2 className="text-base font-extrabold text-[#0c0a09] flex items-center gap-2">
              <span>Milestone Highway</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                {highwayPercent}% of Tier Target
              </span>
            </h2>
            <p className="text-xs text-[#78716c] mt-0.5">
              {totalPoints.toLocaleString()} / 2,000 PTS collected.{' '}
              {remainingToChampion > 0 ? `${remainingToChampion} points remaining to unlock Champion Tier!` : 'Champion Tier unlocked! 🎉'}
            </p>
          </div>
          <span className="text-xs text-[#b4552d] font-bold flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> Next Target: 2,000 PTS
          </span>
        </div>

        {/* Stepped Horizontal Tracker Canvas */}
        <div className="pt-6 pb-2 px-2">
          <div className="relative">
            {/* Background Track running from center of first node to center of last node */}
            <div className="absolute top-3 left-4 right-4 h-2 bg-[#e7e5e4] rounded-full overflow-hidden">
              {/* Active Fill */}
              <div
                className="h-full bg-gradient-to-r from-[#fd8d60] via-[#f59e0b] to-[#d97706] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, highwayPercent))}%` }}
              />
            </div>

            {/* Milestones Points Nodes */}
            <div className="relative flex justify-between w-full z-10">
              {milestones.map((m, idx) => {
                const isReached = totalPoints >= m.points;
                const nextThreshold = milestones[idx + 1]?.points ?? Infinity;
                const isCurrent = isReached && (
                  m.key === 'champion'
                    ? totalPoints >= 2000
                    : totalPoints < nextThreshold
                );

                return (
                  <div key={m.key} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xs transition-transform ${
                        isCurrent
                          ? 'bg-[#d97706] text-white ring-4 ring-[#fef3c7] animate-pulse'
                          : isReached
                          ? 'bg-[#0c0a09] text-white'
                          : 'bg-[#e7e5e4] text-[#78716c]'
                      }`}
                    >
                      {isCurrent ? (
                        <PartyPopper className="w-4 h-4" />
                      ) : isReached ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className={`text-xs font-bold mt-2 ${isCurrent ? 'text-[#b45309]' : isReached ? 'text-[#0c0a09]' : 'text-[#78716c]'}`}>
                      {m.name}
                    </span>
                    <span className="text-[11px] text-[#78716c]">
                      {m.points.toLocaleString()} pts {isReached ? '• Unlocked' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MilestoneProgressSection;

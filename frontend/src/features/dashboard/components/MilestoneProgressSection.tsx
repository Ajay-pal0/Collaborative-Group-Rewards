import React from 'react';
import {
  Users,
  Award,
  ShieldCheck,
  Timer,
  Check,
  PartyPopper,
  Lock,
  ArrowUp,
  Gift,
  TrendingUp,
} from 'lucide-react';
import type { Group, UserPointsData } from '../../../types';

interface MilestoneProgressSectionProps {
  selectedGroup: Group | null;
  totalPoints: number;
  pointsToGo: number;
  progressPercent: number;
  userPointsData?: UserPointsData | null;
  userName?: string;
  onRedeemPerks?: () => void;
}

export const MilestoneProgressSection: React.FC<MilestoneProgressSectionProps> = ({
  selectedGroup,
  totalPoints,
  userPointsData,
  userName = 'Member',
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

  // Calculate percentage of 2,000 pts target
  const maxTarget = 2000;
  const highwayPercent = Math.min(100, Math.round((totalPoints / maxTarget) * 100));
  const remainingToChampion = Math.max(0, 2000 - totalPoints);

  // Active tier name
  let currentTier = 'Base';
  if (totalPoints >= 2000) currentTier = 'Champion Tier';
  else if (totalPoints >= 1000) currentTier = 'Premium Tier';
  else if (totalPoints >= 500) currentTier = 'Team Tier';
  else if (totalPoints >= 200) currentTier = 'Starter Tier';

  const memberCount = selectedGroup?.members?.length || selectedGroup?.member_count || 4;
  const userPts = userPointsData?.user_points || Math.round(totalPoints * 0.36);
  const userPct = userPointsData?.user_contribution_pct || (totalPoints > 0 ? Math.round((userPts / totalPoints) * 100) : 36);

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

          {/* Points Counter & Direct Redeem CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#f8fafc] p-4 rounded-xl border border-[#e7e5e4]">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#78716c]">
                Group Pool Balance
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-[#0c0a09] tracking-tight">
                  {totalPoints.toLocaleString()} PTS
                </span>
                <span className="inline-flex items-center text-xs font-bold text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                  <ArrowUp className="w-3.5 h-3.5" /> +18.4% this week
                </span>
              </div>
              <div className="text-xs text-[#78716c] mt-1 font-medium">
                Your Points: <span className="font-bold text-[#0c0a09]">{userPts} pts ({userPct}% share)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onRedeemPerks}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#b4552d] hover:bg-[#9a4420] text-white text-xs font-bold transition-all shadow-xs self-stretch sm:self-center flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>Redeem Perks</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="mt-6 pt-6 border-t border-[#f0efed] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f5f5f4] flex items-center justify-center text-[#0c0a09]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#0c0a09] leading-tight">{memberCount} Active</div>
              <div className="text-[11px] text-[#78716c]">Tribe Members</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fff7ed] flex items-center justify-center text-[#b4552d]">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#0c0a09] leading-tight">{currentTier}</div>
              <div className="text-[11px] text-[#78716c]">Current Status</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#059669]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#0c0a09] leading-tight">100% Verified</div>
              <div className="text-[11px] text-[#78716c]">KYC Compliance</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f5f5f4] flex items-center justify-center text-[#d97706]">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#0c0a09] leading-tight">14 Days</div>
              <div className="text-[11px] text-[#78716c]">Until Next Epoch</div>
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
            {/* Background Track */}
            <div className="h-2 w-full bg-[#e7e5e4] rounded-full overflow-hidden">
              {/* Active Fill */}
              <div
                className="h-full bg-gradient-to-r from-[#fd8d60] via-[#f59e0b] to-[#d97706] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(4, highwayPercent))}%` }}
              />
            </div>

            {/* Milestones Points Nodes */}
            <div className="relative -top-4 flex justify-between w-full">
              {milestones.map((m) => {
                const isReached = totalPoints >= m.points;
                const isCurrent = (m.points === 1000 && totalPoints >= 1000 && totalPoints < 2000) || (m.points === 2000 && totalPoints >= 2000);

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

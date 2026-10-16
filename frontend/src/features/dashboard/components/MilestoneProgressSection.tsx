import React from 'react';
import { Sparkles, Sparkle } from 'lucide-react';
import type { Group, UserPointsData } from '../../../types';

interface MilestoneProgressSectionProps {
  selectedGroup: Group | null;
  totalPoints: number;
  pointsToGo: number;
  progressPercent: number;
  userPointsData?: UserPointsData | null;
}

export const MilestoneProgressSection: React.FC<MilestoneProgressSectionProps> = ({
  selectedGroup,
  totalPoints,
  pointsToGo,
  progressPercent,
  userPointsData,
}) => {
  return (
    <div className="bg-gradient-to-r from-[#5C4EFE] to-[#635BFF] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Points Metric */}
        <div className="md:col-span-5 space-y-2">
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider block">
            Group Total Points
          </span>
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
  );
};

export default MilestoneProgressSection;

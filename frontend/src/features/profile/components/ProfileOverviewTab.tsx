import React from 'react';
import { Zap, Gift, Sparkles, Clock, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import type { UserPointsData, Activity } from '../../../types';
import { Button } from '../../../components/ui';

interface ProfileOverviewTabProps {
  userPointsData?: UserPointsData | null;
  userActivities: Activity[];
  onClose: () => void;
}

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

export const ProfileOverviewTab: React.FC<ProfileOverviewTabProps> = ({
  userPointsData,
  userActivities,
  onClose,
}) => {
  return (
    <div className="space-y-5 text-[#0c0a09]">
      {/* Stats Metrics Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#fafafa] border border-[#e7e5e4] rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-[#0c0a09]/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#78716c] uppercase tracking-wider block">
              Earned Points
            </span>
            <Sparkles className="w-4 h-4 text-[#d97706]" />
          </div>
          <span className="text-2xl font-bold font-mono tracking-tight text-[#0c0a09] mt-2 block">
            {userPointsData?.user_points || 0}
          </span>
        </div>

        <div className="bg-[#fafafa] border border-[#e7e5e4] rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-[#0c0a09]/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#78716c] uppercase tracking-wider block">
              Group Share
            </span>
            <TrendingUp className="w-4 h-4 text-[#10b981]" />
          </div>
          <span className="text-2xl font-bold font-mono tracking-tight text-[#10b981] mt-2 block">
            {userPointsData?.user_contribution_pct || 0}%
          </span>
        </div>

        <div className="bg-[#fafafa] border border-[#e7e5e4] rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-[#0c0a09]/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#78716c] uppercase tracking-wider block">
              Tasks Done
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#b4552d]" />
          </div>
          <span className="text-2xl font-bold font-mono tracking-tight text-[#b4552d] mt-2 block">
            {userPointsData?.user_tasks_completed || 0}
          </span>
        </div>
      </div>

      {/* Activity History */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-[#0c0a09] uppercase tracking-wider">
            My Activity History
          </h4>
          <span className="text-[#78716c] text-[11px] font-medium">
            {userActivities.length} {userActivities.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="space-y-2.5">
          {userActivities.length === 0 ? (
            <div className="text-center py-8 bg-[#fafafa] rounded-2xl border border-dashed border-[#e7e5e4] space-y-2">
              <Zap className="w-6 h-6 text-[#a8a29e] mx-auto" />
              <p className="text-xs text-[#78716c]">You haven't completed any group actions yet.</p>
            </div>
          ) : (
            userActivities.map((act) => {
              const timeFormatted = formatRelativeTime(act.created_at);
              let points = 0;
              let actionLabel = 'Group Activity Action';
              let IconComp = Zap;
              let iconColor = 'text-[#d97706]';

              const ev = (act.event_type || '').toUpperCase();
              if (ev === 'TASK_COMPLETED') {
                points = Number(act.metadata?.points) || 150;
                actionLabel = `Completed task "${act.metadata?.task_name || 'Group Task'}"`;
                IconComp = CheckCircle2;
                iconColor = 'text-emerald-600';
              } else if (ev === 'GROUP_CREATED') {
                points = 100;
                actionLabel = 'Created group squad';
                IconComp = Users;
                iconColor = 'text-[#0c0a09]';
              } else if (ev === 'INVITE_CREATED') {
                points = 25;
                actionLabel = 'Shared invitation token with member';
                IconComp = Sparkles;
                iconColor = 'text-[#b4552d]';
              } else if (ev === 'PARTICIPANT_JOINED' || ev === 'MEMBER_JOINED') {
                points = 100;
                actionLabel = 'Joined group squad';
                IconComp = Users;
                iconColor = 'text-[#0c0a09]';
              } else if (ev === 'PROFILE_COMPLETED') {
                points = 50;
                actionLabel = 'Completed profile verification';
                IconComp = CheckCircle2;
                iconColor = 'text-emerald-600';
              } else if (ev === 'BENEFIT_CLAIMED') {
                actionLabel = `Claimed reward milestone "${act.metadata?.benefit_name || 'Reward'}"`;
                IconComp = Gift;
                iconColor = 'text-[#10b981]';
              }

              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#e7e5e4] hover:border-[#0c0a09]/20 transition-all text-xs shadow-2xs group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-3">
                    <div className="w-9 h-9 rounded-xl bg-[#fafafa] border border-[#e7e5e4] flex items-center justify-center shrink-0">
                      <IconComp className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0c0a09] truncate text-xs">{actionLabel}</p>
                      <p className="text-[11px] text-[#78716c] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#a8a29e]" /> {timeFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {points > 0 ? (
                      <span className="text-[10px] font-bold text-[#370e00] bg-[#ffdbce] border border-[#ffb599] px-2.5 py-1 rounded-full shadow-2xs">
                        +{points} pts
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#78716c] bg-[#f5f5f5] px-2.5 py-1 rounded-full border border-[#e7e5e4]">
                        Recorded
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-[#e7e5e4] flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={onClose}
          className="text-xs bg-[#0c0a09] hover:bg-neutral-800 text-white font-bold px-6 py-2 rounded-xl"
        >
          Done
        </Button>
      </div>
    </div>
  );
};

export default ProfileOverviewTab;

import React from 'react';
import { Zap, Gift, Sparkles, Clock } from 'lucide-react';
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

      {/* Activity Stream */}
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

      {/* Footer */}
      <div className="pt-3 border-t border-[#E7E9EE] flex justify-end">
        <Button variant="primary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default ProfileOverviewTab;

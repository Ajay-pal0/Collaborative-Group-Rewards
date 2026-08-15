import { useState } from 'react';
import Modal from './Modal';
import type { Activity } from '../types';
import {
  Zap,
  Search,
  Clock,
  Gift,
  UserPlus,
  Sparkles,
  CheckCircle2,
  Filter,
  UsersRound,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';

interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  activities: Activity[];
  groupName: string;
}

type FilterCategory = 'all' | 'tasks' | 'members' | 'rewards';

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
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Generate consistent avatar color based on user name
function getUserColor(name: string) {
  const colors = [
    { bg: 'bg-gradient-to-br from-[#635BFF] to-[#4F46E5]' },
    { bg: 'bg-gradient-to-br from-[#0D9488] to-[#059669]' },
    { bg: 'bg-gradient-to-br from-[#D97706] to-[#B45309]' },
    { bg: 'bg-gradient-to-br from-[#EC4899] to-[#DB2777]' },
    { bg: 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export default function ActivityModal({
  open,
  onClose,
  activities,
  groupName,
}: ActivityModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

  // Filter activities by search and category tab
  const filteredActivities = activities.filter((act) => {
    const actorName = act.member_name || act.metadata?.member_name || act.metadata?.user_name || 'Member';
    const matchesSearch = (
      actorName +
      ' ' +
      act.event_type +
      ' ' +
      JSON.stringify(act.metadata || {})
    )
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeCategory === 'tasks') {
      return act.event_type === 'task_completed';
    }
    if (activeCategory === 'members') {
      return (
        act.event_type === 'member_joined' ||
        act.event_type === 'group_created' ||
        act.event_type === 'invite_created' ||
        act.event_type === 'profile_completed'
      );
    }
    if (activeCategory === 'rewards') {
      return act.event_type === 'benefit_claimed';
    }
    return true;
  });

  // Calculate summary metrics
  const totalPointsEarned = activities.reduce((sum, act) => {
    if (act.metadata?.points) return sum + Number(act.metadata.points);
    if (act.event_type === 'group_created' || act.event_type === 'member_joined') return sum + 100;
    if (act.event_type === 'invite_created') return sum + 25;
    return sum;
  }, 0);

  const uniqueContributors = new Set(
    activities.map(
      (a) => a.member_name || a.metadata?.member_name || a.metadata?.user_name || 'Member'
    )
  ).size;

  return (
    <Modal open={open} onClose={onClose} title="Group Activity Stream">
      <div className="space-y-4 text-[#171923]">
        {/* Banner Summary Header */}
        <div className="bg-gradient-to-r from-[#635BFF]/10 via-[#635BFF]/5 to-transparent border border-[#635BFF]/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] text-white flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#171923]">
                {groupName} Activity Feed
              </h3>
              <p className="text-[11px] text-[#667085]">
                {activities.length} total events logged across {uniqueContributors} active {uniqueContributors === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white border border-[#E7E9EE] px-3 py-1 rounded-xl shadow-2xs text-center">
              <span className="text-[9px] uppercase font-bold text-[#667085] block">Group Points</span>
              <span className="text-xs font-black text-[#635BFF]">+{totalPointsEarned} pts</span>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F2F4F7] p-1.5 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-1 min-w-[90px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-white text-[#635BFF] shadow-xs'
                : 'text-[#667085] hover:text-[#171923]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> All ({activities.length})
          </button>
          <button
            onClick={() => setActiveCategory('tasks')}
            className={`flex-1 min-w-[90px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'tasks'
                ? 'bg-white text-[#635BFF] shadow-xs'
                : 'text-[#667085] hover:text-[#171923]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#F5B942]" /> Tasks
          </button>
          <button
            onClick={() => setActiveCategory('members')}
            className={`flex-1 min-w-[90px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'members'
                ? 'bg-white text-[#635BFF] shadow-xs'
                : 'text-[#667085] hover:text-[#171923]'
            }`}
          >
            <UsersRound className="w-3.5 h-3.5 text-[#0070F3]" /> Members
          </button>
          <button
            onClick={() => setActiveCategory('rewards')}
            className={`flex-1 min-w-[90px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'rewards'
                ? 'bg-white text-[#635BFF] shadow-xs'
                : 'text-[#667085] hover:text-[#171923]'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-[#12B76A]" /> Rewards
          </button>
        </div>

        {/* Prominent Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter stream by member name, task, or activity..."
            className="w-full bg-[#F8F9FC] border border-[#E7E9EE] rounded-xl pl-10 pr-8 py-2 text-xs text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:bg-white placeholder-[#98A2B3] shadow-2xs transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-[#98A2B3] hover:text-[#171923] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Activity Stream Container */}
        <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-10 bg-[#F8F9FC] rounded-2xl border border-dashed border-[#E7E9EE] space-y-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs text-[#98A2B3]">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#171923]">No activities match your filters</p>
                <p className="text-[11px] text-[#667085]">Try clearing your search query or selecting "All".</p>
              </div>
              {(searchTerm || activeCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                  className="text-xs font-bold text-[#635BFF] hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            filteredActivities.map((act) => {
              const actorName = String(act.member_name || act.metadata?.member_name || act.metadata?.user_name || 'Member');
              const initial = actorName.charAt(0).toUpperCase();
              const userColor = getUserColor(actorName);

              let IconComponent = Zap;
              let iconColor = 'text-[#F5B942]';
              let badgeBg = 'bg-[#FEF0C7] text-[#B45309] border-[#F5B942]/30';
              let actionJSX: React.ReactNode;
              let pointsText = '+100 pts';

              if (act.event_type === 'group_created') {
                IconComponent = ShieldCheck;
                iconColor = 'text-[#635BFF]';
                badgeBg = 'bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20';
                actionJSX = (
                  <span>
                    <strong className="font-extrabold text-[#171923]">{actorName}</strong> created group{' '}
                    <span className="font-semibold text-[#635BFF]">"{String(act.metadata?.group_name || groupName)}"</span>
                  </span>
                );
                pointsText = '+100 pts';
              } else if (act.event_type === 'invite_created') {
                IconComponent = Sparkles;
                iconColor = 'text-[#635BFF]';
                badgeBg = 'bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20';
                actionJSX = (
                  <span>
                    <strong className="font-extrabold text-[#171923]">{actorName}</strong> created an invite link
                  </span>
                );
                pointsText = '+25 pts';
              } else if (act.event_type === 'member_joined') {
                IconComponent = UserPlus;
                iconColor = 'text-[#0070F3]';
                badgeBg = 'bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3]/20';
                actionJSX = (
                  <span>
                    <strong className="font-extrabold text-[#171923]">{actorName}</strong> joined the group
                  </span>
                );
                pointsText = '+100 pts';
              } else if (act.event_type === 'task_completed') {
                IconComponent = Zap;
                iconColor = 'text-[#F5B942]';
                badgeBg = 'bg-[#ECFDF3] text-[#12B76A] border-[#12B76A]/20';
                actionJSX = (
                  <span>
                    <strong className="font-extrabold text-[#171923]">{actorName}</strong> completed task{' '}
                    <span className="font-semibold text-[#635BFF]">"{String(act.metadata?.task_name || 'Task')}"</span>
                  </span>
                );
                pointsText = `+${String(act.metadata?.points || 150)} pts`;
              } else if (act.event_type === 'profile_completed') {
                IconComponent = CheckCircle2;
                iconColor = 'text-[#0D9488]';
                badgeBg = 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20';
                actionJSX = (
                  <span>
                    <strong className="font-extrabold text-[#171923]">{actorName}</strong> completed profile details
                  </span>
                );
                pointsText = `+${String(act.metadata?.points || 50)} pts`;
              } else if (act.event_type === 'benefit_claimed') {
                IconComponent = Gift;
                iconColor = 'text-[#12B76A]';
                badgeBg = 'bg-[#ECFDF3] text-[#12B76A] border-[#12B76A]/30';
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

              const relativeTime = formatRelativeTime(act.created_at);

              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E7E9EE] hover:border-[#635BFF]/30 hover:shadow-xs transition-all text-xs group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    {/* User Avatar with Action Overlay Icon */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl ${userColor.bg} text-white flex items-center justify-center font-black text-sm shadow-xs border border-white/20`}
                      >
                        {initial}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-[#E7E9EE] flex items-center justify-center shadow-2xs">
                        <IconComponent className={`w-2.5 h-2.5 ${iconColor}`} />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[#171923] text-xs leading-snug">{actionJSX}</p>
                      <p className="text-[10px] font-medium text-[#98A2B3] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#98A2B3]" /> {relativeTime}
                      </p>
                    </div>
                  </div>

                  {/* Points Badge */}
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${badgeBg}`}
                  >
                    {pointsText}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E7E9EE] flex items-center justify-between">
          <span className="text-[11px] text-[#667085]">
            Showing <strong className="text-[#171923]">{filteredActivities.length}</strong> of {activities.length} activities
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-[#635BFF] hover:bg-[#4F46E5] text-white rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

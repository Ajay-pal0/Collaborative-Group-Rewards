import React from 'react';
import { Share2, Target, Image as ImageIcon, CheckCircle, PlusCircle } from 'lucide-react';
import type { Task } from '../../../types';

interface GroupTasksSectionProps {
  tasks: Task[];
  completedTaskIds: Set<string>;
  completingTaskId: string | null;
  onCompleteTask: (task: Task) => void;
}

export const GroupTasksSection: React.FC<GroupTasksSectionProps> = ({
  tasks,
  completedTaskIds,
  completingTaskId,
  onCompleteTask,
}) => {
  // Fallback default tasks if none returned from API yet
  const displayTasks = tasks.length > 0 ? tasks : [
    {
      id: 'default-1',
      name: 'Share with a Friend',
      description: 'Send a direct referral link to an eligible peer to earn points when they join.',
      points: 150,
      task_type: 'referral',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'default-2',
      name: 'Write a Group Goal',
      description: 'Set a shared Q3 spending & milestone savings objective for all team members.',
      points: 150,
      task_type: 'goal',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'default-3',
      name: 'Upload Group Photo',
      description: 'Verify active team culture by submitting a picture from your latest meetup or sprint.',
      points: 150,
      task_type: 'photo',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  const getTaskIcon = (taskName: string, idx: number) => {
    const lower = taskName.toLowerCase();
    if (lower.includes('share') || lower.includes('friend') || lower.includes('invite')) {
      return <Share2 className="w-4 h-4 text-[#b4552d]" />;
    }
    if (lower.includes('goal') || lower.includes('target') || lower.includes('write')) {
      return <Target className="w-4 h-4 text-[#0c0a09]" />;
    }
    if (lower.includes('photo') || lower.includes('image') || lower.includes('upload')) {
      return <ImageIcon className="w-4 h-4 text-[#0c0a09]" />;
    }
    return idx % 2 === 0 ? <Share2 className="w-4 h-4 text-[#b4552d]" /> : <Target className="w-4 h-4 text-[#0c0a09]" />;
  };

  return (
    <section className="bg-white rounded-2xl border border-[#e7e5e4] p-6 custom-card-shadow space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#f0efed]">
        <div>
          <h2 className="text-base font-extrabold text-[#0c0a09]">Collaborative Tasks & Bounties</h2>
          <p className="text-xs text-[#78716c] mt-0.5">
            Complete joint actions to rapidly accelerate the pool balance towards Champion Tier.
          </p>
        </div>
        <span className="text-xs font-bold text-[#b4552d] flex items-center gap-1 shrink-0">
          <PlusCircle className="w-4 h-4" /> +450 pts available
        </span>
      </div>

      <div className="divide-y divide-[#f0efed]">
        {displayTasks.map((t, idx) => {
          const isCompleted = completedTaskIds.has(t.id);
          const isCompleting = completingTaskId === t.id;

          return (
            <div key={t.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#f5f5f4] flex items-center justify-center shrink-0 mt-0.5">
                  {getTaskIcon(t.name, idx)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0c0a09]">{t.name}</h4>
                  <p className="text-xs text-[#78716c] mt-0.5 leading-relaxed">{t.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-extrabold text-[#b4552d]">+{t.points} pts</span>
                <button
                  type="button"
                  disabled={isCompleted || isCompleting}
                  onClick={() => onCompleteTask(t)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] cursor-default'
                      : 'bg-[#0c0a09] hover:bg-[#292524] text-white active:scale-95 shadow-2xs'
                  }`}
                >
                  {isCompleting ? (
                    'Saving...'
                  ) : isCompleted ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : (
                    'Complete'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default GroupTasksSection;

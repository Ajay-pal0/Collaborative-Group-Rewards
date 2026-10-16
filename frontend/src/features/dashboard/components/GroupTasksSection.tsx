import React from 'react';
import { Zap } from 'lucide-react';
import type { Task } from '../../../types';
import { Button } from '../../../components/ui';

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
  return (
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
          const isCompleting = completingTaskId === t.id;

          return (
            <div
              key={t.id}
              className="bg-[#F8F9FC] border border-[#E7E9EE] hover:border-[#635BFF]/30 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
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

              <Button
                size="sm"
                variant={isCompleted ? 'success' : 'primary'}
                disabled={isCompleted || isCompleting}
                loading={isCompleting}
                onClick={() => onCompleteTask(t)}
                className="shrink-0"
              >
                {isCompleted ? 'Completed ✓' : 'Complete'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupTasksSection;

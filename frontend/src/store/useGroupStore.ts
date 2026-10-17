import { create } from 'zustand';
import type { Group, BenefitState, Task, Activity, UserPointsData } from '../types';

interface GroupStoreState {
  groups: Group[];
  selectedGroup: Group | null;
  benefits: BenefitState[];
  tasks: Task[];
  activities: Activity[];
  userPointsData: UserPointsData | null;
  completedTaskIds: Set<string>;
  loadingGroups: boolean;
  loadingDetails: boolean;
  detailsError: string | null;

  // Setters
  setGroups: (groups: Group[]) => void;
  setSelectedGroup: (group: Group | null) => void;
  setBenefits: (benefits: BenefitState[]) => void;
  setTasks: (tasks: Task[]) => void;
  setActivities: (activities: Activity[]) => void;
  setUserPointsData: (data: UserPointsData | null) => void;
  setCompletedTaskIds: (ids: Set<string>) => void;
  setLoadingGroups: (loading: boolean) => void;
  setLoadingDetails: (loading: boolean) => void;
  setDetailsError: (err: string | null) => void;

  // Single-dispatch update when completing a task (0 re-fetch HTTP calls)
  applyTaskCompleted: (params: {
    taskId: string;
    taskName: string;
    points: number;
    updatedGroup?: Group;
    userPoints?: UserPointsData;
    currentUserId?: string;
    currentUserEmail?: string;
  }) => void;

  // Single-dispatch update when claiming a benefit
  applyBenefitClaimed: (params: {
    benefitId: string;
    points: number;
    userPoints?: UserPointsData;
  }) => void;

  // WebSocket push handler (0 re-fetch HTTP calls)
  applyWebSocketEvent: (params: {
    event: string;
    data?: Record<string, unknown>;
    currentUserId?: string;
    currentUserEmail?: string;
  }) => void;
}

export const useGroupStore = create<GroupStoreState>((set) => ({
  groups: [],
  selectedGroup: null,
  benefits: [],
  tasks: [],
  activities: [],
  userPointsData: null,
  completedTaskIds: new Set<string>(),
  loadingGroups: false,
  loadingDetails: false,
  detailsError: null,

  setGroups: (groups) => set({ groups }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
  setBenefits: (benefits) => set({ benefits }),
  setTasks: (tasks) => set({ tasks }),
  setActivities: (activities) => set({ activities }),
  setUserPointsData: (userPointsData) => set({ userPointsData }),
  setCompletedTaskIds: (completedTaskIds) => set({ completedTaskIds }),
  setLoadingGroups: (loadingGroups) => set({ loadingGroups }),
  setLoadingDetails: (loadingDetails) => set({ loadingDetails }),
  setDetailsError: (detailsError) => set({ detailsError }),

  applyTaskCompleted: ({
    taskId,
    taskName,
    points,
    updatedGroup,
    userPoints,
    currentUserId,
    currentUserEmail,
  }) => {
    set((state) => {
      const nextCompleted = new Set(state.completedTaskIds);
      nextCompleted.add(taskId);

      const currentTotal = state.selectedGroup?.total_points || 0;
      const serverTotal = typeof updatedGroup?.total_points === 'number'
        ? updatedGroup.total_points
        : typeof userPoints?.group_total_points === 'number'
        ? userPoints.group_total_points
        : null;

      const isAlreadyCompleted = taskId ? state.completedTaskIds.has(taskId) : false;

      // Authoritative ground truth from server response; only add points if no server total and not already completed
      const newTotal = serverTotal !== null
        ? serverTotal
        : (isAlreadyCompleted ? currentTotal : currentTotal + points);

      const nextSelected = state.selectedGroup
        ? {
            ...state.selectedGroup,
            ...(updatedGroup || {}),
            total_points: newTotal,
          }
        : null;

      const nextGroups = state.groups.map((g) =>
        g.id === state.selectedGroup?.id ? { ...g, total_points: newTotal } : g
      );

      let nextUserPoints: UserPointsData | null = userPoints ?? null;
      if (!nextUserPoints && state.userPointsData) {
        const pointsToAdd = isAlreadyCompleted ? 0 : points;
        const nextUserPts = state.userPointsData.user_points + pointsToAdd;
        const nextUserTotalPts = (state.userPointsData.user_total_points ?? state.userPointsData.user_points) + pointsToAdd;
        const nextTaskPts = (state.userPointsData.task_points ?? 0) + pointsToAdd;
        const nextTasksCount = (state.userPointsData.user_tasks_completed || 0) + (isAlreadyCompleted ? 0 : 1);
        const nextPct = newTotal > 0 ? Math.min(100, Math.round((nextUserPts / newTotal) * 100)) : 0;

        const nextMemberPoints = (state.userPointsData.member_points || []).map((mp) => {
          const isMatch = Boolean(
            (currentUserId && mp.user_id === currentUserId) ||
            (currentUserEmail && mp.user_email === currentUserEmail) ||
            mp.is_current_user
          );
          if (isMatch) {
            return {
              ...mp,
              points_earned: mp.points_earned + pointsToAdd,
              tasks_count: mp.tasks_count + (isAlreadyCompleted ? 0 : 1),
            };
          }
          return mp;
        });

        nextUserPoints = {
          ...state.userPointsData,
          group_total_points: newTotal,
          user_points: nextUserPts,
          user_total_points: nextUserTotalPts,
          task_points: nextTaskPts,
          benefit_points: state.userPointsData.benefit_points ?? 0,
          user_tasks_completed: nextTasksCount,
          user_contribution_pct: nextPct,
          member_points: nextMemberPoints,
        };
      } else if (!nextUserPoints && state.selectedGroup) {
        nextUserPoints = {
          group_id: state.selectedGroup.id,
          group_total_points: newTotal,
          user_points: points,
          user_total_points: points,
          task_points: points,
          benefit_points: 0,
          user_contribution_pct: 100,
          user_tasks_completed: 1,
          member_points: [],
        };
      }

      const newActivity: Activity = {
        id: `client-${Date.now()}`,
        event_type: 'task_completed',
        member_name: 'You',
        metadata: {
          task_id: taskId,
          task_name: taskName,
          points,
          user_id: currentUserId,
          user_email: currentUserEmail,
        },
        created_at: new Date().toISOString(),
      };

      const nextBenefits = state.benefits.map((b) => {
        if (b.state === 'locked' && newTotal >= b.benefit.required_points) {
          return { ...b, state: 'available' as const };
        }
        return b;
      });

      return {
        completedTaskIds: nextCompleted,
        selectedGroup: nextSelected,
        groups: nextGroups,
        userPointsData: nextUserPoints,
        activities: [newActivity, ...state.activities.filter((a) => a.metadata?.task_id !== taskId && a.id !== newActivity.id)],
        benefits: nextBenefits,
      };
    });
  },

  applyBenefitClaimed: ({ benefitId, points, userPoints }) => {
    set((state) => {
      const nextBenefits = state.benefits.map((b) =>
        b.benefit.id === benefitId ? { ...b, state: 'claimed' as const } : b
      );

      let nextUserPoints: UserPointsData | null = userPoints ?? null;
      if (!nextUserPoints && state.userPointsData) {
        const nextBenefitPts = (state.userPointsData.benefit_points ?? 0) + points;
        const nextTotalPts = (state.userPointsData.user_total_points ?? state.userPointsData.user_points) + points;
        nextUserPoints = {
          ...state.userPointsData,
          benefit_points: nextBenefitPts,
          user_total_points: nextTotalPts,
        };
      }

      return {
        benefits: nextBenefits,
        userPointsData: nextUserPoints || state.userPointsData,
      };
    });
  },

  applyWebSocketEvent: ({ event, data, currentUserId, currentUserEmail }) => {
    set((state) => {
      if (!data) return state;

      const pointsNumber = typeof data.total_points === 'number' ? data.total_points : null;
      const metadata = (data.metadata as Record<string, unknown>) || {};
      const metaPoints = typeof metadata.points === 'number' ? metadata.points : 0;
      const taskId = typeof metadata.task_id === 'string' ? metadata.task_id : null;
      const dataUserId = typeof data.user_id === 'string' ? data.user_id : null;
      const dataUserEmail = typeof data.user_email === 'string' ? data.user_email : null;
      const isCurrentUser = Boolean(
        (dataUserId && currentUserId && dataUserId === currentUserId) ||
        (dataUserEmail && currentUserEmail && dataUserEmail === currentUserEmail) ||
        (metadata.user_id && currentUserId && metadata.user_id === currentUserId) ||
        (metadata.user_email && currentUserEmail && metadata.user_email === currentUserEmail)
      );

      const isAlreadyCompletedLocally = taskId ? state.completedTaskIds.has(taskId) : false;

      // Authoritative ground truth from server broadcast
      const currentTotal = state.selectedGroup?.total_points || 0;
      const newTotal = pointsNumber !== null ? pointsNumber : currentTotal;

      let nextSelected = state.selectedGroup;
      if (state.selectedGroup && newTotal !== currentTotal) {
        nextSelected = { ...state.selectedGroup, total_points: newTotal };
      }

      let nextGroups = state.groups;
      if (state.selectedGroup && newTotal !== currentTotal) {
        nextGroups = state.groups.map((g) =>
          g.id === state.selectedGroup?.id ? { ...g, total_points: newTotal } : g
        );
      }

      const nextCompleted = new Set(state.completedTaskIds);
      if (isCurrentUser && taskId) {
        nextCompleted.add(taskId);
      }

      const isPointsEarningEvent = event !== 'benefit_claimed';

      let nextUserPoints = state.userPointsData;
      // Only increment personal user points if not already completed locally by this client and is a points earning event
      if (isCurrentUser && state.userPointsData) {
        const pointsToAdd = (!isAlreadyCompletedLocally && isPointsEarningEvent && metaPoints > 0) ? metaPoints : 0;
        const benefitPointsToAdd = (!isAlreadyCompletedLocally && !isPointsEarningEvent && metaPoints > 0) ? metaPoints : 0;
        const totalPointsToAdd = pointsToAdd + benefitPointsToAdd;

        const newUp = state.userPointsData.user_points + pointsToAdd;
        const newTotalUp = (state.userPointsData.user_total_points ?? state.userPointsData.user_points) + totalPointsToAdd;
        const newBenefitPts = (state.userPointsData.benefit_points ?? 0) + benefitPointsToAdd;
        const newTaskPts = (state.userPointsData.task_points ?? 0) + pointsToAdd;

        const newPct = newTotal > 0 ? Math.min(100, Math.round((newUp / newTotal) * 100)) : 0;
        const nextMemberPoints = (state.userPointsData.member_points || []).map((mp) => {
          const isMatch = Boolean(
            (currentUserId && mp.user_id === currentUserId) ||
            (currentUserEmail && mp.user_email === currentUserEmail) ||
            mp.is_current_user
          );
          if (isMatch) {
            return {
              ...mp,
              points_earned: mp.points_earned + pointsToAdd,
              tasks_count: mp.tasks_count + (!isAlreadyCompletedLocally && isPointsEarningEvent && taskId ? 1 : 0),
            };
          }
          return mp;
        });

        nextUserPoints = {
          ...state.userPointsData,
          group_total_points: newTotal,
          user_points: newUp,
          user_total_points: newTotalUp,
          benefit_points: newBenefitPts,
          task_points: newTaskPts,
          user_tasks_completed: state.userPointsData.user_tasks_completed + (!isAlreadyCompletedLocally && isPointsEarningEvent && taskId ? 1 : 0),
          user_contribution_pct: newPct,
          member_points: nextMemberPoints,
        };
      } else if (!isCurrentUser && metaPoints > 0 && isPointsEarningEvent && state.userPointsData) {
        // Another member completed a task - update their member_points entry and recalculate our contribution %!
        const nextMemberPoints = (state.userPointsData.member_points || []).map((mp) => {
          const isMatch = Boolean(
            (dataUserId && mp.user_id === dataUserId) ||
            (dataUserEmail && mp.user_email === dataUserEmail)
          );
          if (isMatch) {
            return {
              ...mp,
              points_earned: mp.points_earned + metaPoints,
              tasks_count: mp.tasks_count + (taskId ? 1 : 0),
            };
          }
          return mp;
        });
        const currentUp = state.userPointsData.user_points;
        const newPct = newTotal > 0 ? Math.min(100, Math.round((currentUp / newTotal) * 100)) : 0;

        nextUserPoints = {
          ...state.userPointsData,
          group_total_points: newTotal,
          user_contribution_pct: newPct,
          member_points: nextMemberPoints,
        };
      } else if (state.userPointsData) {
        // Benefit claimed or group update: keep user_points intact but recompute contribution pct against new total
        const currentUp = state.userPointsData.user_points;
        const newPct = newTotal > 0 ? Math.min(100, Math.round((currentUp / newTotal) * 100)) : 0;
        nextUserPoints = {
          ...state.userPointsData,
          group_total_points: newTotal,
          user_contribution_pct: newPct,
        };
      }

      // Prepend activity if id not already present
      const activityId = String(data.id || `ws-${Date.now()}`);
      const alreadyHas = state.activities.some((a) => a.id === activityId || (taskId && a.metadata?.task_id === taskId));
      let nextActivities = state.activities;
      if (!alreadyHas) {
        const newAct: Activity = {
          id: activityId,
          event_type: event,
          member_name: String(data.member_name || (isCurrentUser ? 'You' : 'Member')),
          metadata: metadata as Record<string, string | number | boolean | null | undefined>,
          created_at: String(data.created_at || new Date().toISOString()),
        };
        nextActivities = [newAct, ...state.activities];
      }

      // Update benefit states if points updated
      const activeTotal = newTotal;
      const nextBenefits = state.benefits.map((b) => {
        if (
          event === 'benefit_claimed' &&
          (b.benefit.id === metadata.benefit_id || b.benefit.name === metadata.benefit_name)
        ) {
          return { ...b, state: 'claimed' as const };
        }
        if (b.state === 'locked' && activeTotal >= b.benefit.required_points) {
          return { ...b, state: 'available' as const };
        }
        return b;
      });

      return {
        selectedGroup: nextSelected,
        groups: nextGroups,
        completedTaskIds: nextCompleted,
        userPointsData: nextUserPoints,
        activities: nextActivities,
        benefits: nextBenefits,
      };
    });
  },
}));

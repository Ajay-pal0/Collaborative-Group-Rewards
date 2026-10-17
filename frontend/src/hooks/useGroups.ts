import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsApi, rewardsApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useGroupWebSocket } from './useGroupWebSocket';
import { useGroupStore } from '../store/useGroupStore';
import type { Group, BenefitState, Task } from '../types';

export function useGroups(groupId?: string) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  // Zustand state store
  const groups = useGroupStore((state) => state.groups);
  const selectedGroup = useGroupStore((state) => state.selectedGroup);
  const benefits = useGroupStore((state) => state.benefits);
  const tasks = useGroupStore((state) => state.tasks);
  const activities = useGroupStore((state) => state.activities);
  const completedTaskIds = useGroupStore((state) => state.completedTaskIds);
  const userPointsData = useGroupStore((state) => state.userPointsData);
  const loadingGroups = useGroupStore((state) => state.loadingGroups);
  const loadingDetails = useGroupStore((state) => state.loadingDetails);

  const setGroups = useGroupStore((state) => state.setGroups);
  const setSelectedGroup = useGroupStore((state) => state.setSelectedGroup);
  const setBenefits = useGroupStore((state) => state.setBenefits);
  const setTasks = useGroupStore((state) => state.setTasks);
  const setActivities = useGroupStore((state) => state.setActivities);
  const setUserPointsData = useGroupStore((state) => state.setUserPointsData);
  const setCompletedTaskIds = useGroupStore((state) => state.setCompletedTaskIds);
  const setLoadingGroups = useGroupStore((state) => state.setLoadingGroups);
  const setLoadingDetails = useGroupStore((state) => state.setLoadingDetails);
  const applyTaskCompleted = useGroupStore((state) => state.applyTaskCompleted);
  const applyBenefitClaimed = useGroupStore((state) => state.applyBenefitClaimed);
  const applyWebSocketEvent = useGroupStore((state) => state.applyWebSocketEvent);

  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [claimingBenefitId, setClaimingBenefitId] = useState<string | null>(null);

  // Modals state for benefit unlock / claim celebrations
  const [unlockedBenefit, setUnlockedBenefit] = useState<BenefitState | null>(null);
  const [claimedBenefit, setClaimedBenefit] = useState<BenefitState | null>(null);

  // 1. Fetch user's groups
  const fetchGroups = useCallback(async () => {
    try {
      const res = await groupsApi.getGroups();
      setGroups(res.data);
      return res.data;
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
      return [];
    } finally {
      setLoadingGroups(false);
    }
  }, [setGroups, setLoadingGroups, showToast]);

  // Initial group load & selection logic
  useEffect(() => {
    let active = true;
    groupsApi.getGroups().then((res) => {
      if (!active) return;
      setGroups(res.data);
      setLoadingGroups(false);
      const fetchedGroups = res.data;
      if (fetchedGroups.length > 0) {
        if (groupId) {
          const match = fetchedGroups.find((g) => g.id === groupId);
          if (match) setSelectedGroup(match);
          else navigate(`/groups/${fetchedGroups[0].id}`, { replace: true });
        } else {
          navigate(`/groups/${fetchedGroups[0].id}`, { replace: true });
        }
      }
    }).catch((err) => {
      if (active) {
        showToast(extractErrorMessage(err), 'error');
        setLoadingGroups(false);
      }
    });

    return () => { active = false; };
  }, [groupId, navigate, setGroups, setLoadingGroups, setSelectedGroup, showToast]);

  // 2. Load Dashboard details for selected group
  const fetchGroupDetails = useCallback(async (gId: string) => {
    setLoadingDetails(true);
    try {
      const [groupRes, benefitsRes, tasksRes, activitiesRes, pointsRes, userPointsRes] = await Promise.all([
        groupsApi.getGroupDetails(gId),
        rewardsApi.getBenefits(gId),
        rewardsApi.getTasks(),
        groupsApi.getActivities(gId),
        rewardsApi.getPoints(gId),
        rewardsApi.getUserPoints(gId),
      ]);

      setSelectedGroup(groupRes.data);
      setBenefits(benefitsRes.data);
      setTasks(tasksRes.data);
      setActivities(activitiesRes.data);
      setUserPointsData(userPointsRes.data);

      const completedSet = new Set<string>();
      pointsRes.data.transactions.forEach((tx) => {
        if (tx.action_type === 'TASK_COMPLETED' && tx.reference_id) {
          const parts = tx.reference_id.split(':');
          if (parts.length >= 4 && parts[2] === 'TASK') {
            const txUserId = parts[1];
            const taskId = parts[3];
            if (user && txUserId === user.id) {
              completedSet.add(taskId);
            }
          } else {
            const partsTask = tx.reference_id.split(':TASK:');
            if (partsTask.length === 2 && user) {
              const prefixParts = partsTask[0].split(':');
              if (prefixParts.length >= 2 && prefixParts[1] === user.id) {
                completedSet.add(partsTask[1]);
              }
            }
          }
        }
      });
      setCompletedTaskIds(completedSet);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setLoadingDetails(false);
    }
  }, [
    setLoadingDetails,
    setSelectedGroup,
    setBenefits,
    setTasks,
    setActivities,
    setUserPointsData,
    setCompletedTaskIds,
    showToast,
    user,
  ]);

  const selectedGroupId = selectedGroup?.id;

  useEffect(() => {
    if (!selectedGroupId) return;

    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        fetchGroupDetails(selectedGroupId);
      }
    });

    return () => {
      active = false;
    };
  }, [selectedGroupId, fetchGroupDetails]);

  // Live WebSocket updates: updates Zustand store in real time with 0 extra API calls!
  const handleWebSocketUpdate = useCallback((event: string, data?: Record<string, unknown>) => {
    if (event === 'refresh') {
      if (selectedGroupId) {
        fetchGroupDetails(selectedGroupId);
      }
      return;
    }

    applyWebSocketEvent({
      event,
      data,
      currentUserId: user?.id,
      currentUserEmail: user?.email,
    });
  }, [applyWebSocketEvent, fetchGroupDetails, selectedGroupId, user?.email, user?.id]);

  useGroupWebSocket({
    groupId: selectedGroupId,
    onUpdate: handleWebSocketUpdate,
    enabled: Boolean(selectedGroupId),
  });

  // 3. Complete Task Handler: Updates Zustand store directly from response without firing 14 extra API calls
  const handleCompleteTask = async (task: Task) => {
    if (!selectedGroup) return;
    setCompletingTaskId(task.id);
    try {
      const res = await rewardsApi.completeTask(selectedGroup.id, task.id);
      showToast(`Task "${task.name}" completed! +${task.points} points awarded! 🎉`, 'success');

      // Update Zustand store locally without redundant API polling
      applyTaskCompleted({
        taskId: task.id,
        taskName: task.name,
        points: task.points,
        updatedGroup: res.data?.group,
        userPoints: res.data?.user_points,
        currentUserId: user?.id,
        currentUserEmail: user?.email,
      });
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setCompletingTaskId(null);
    }
  };

  // 4. Claim Benefit Handler
  const handleClaimBenefit = async (bState: BenefitState) => {
    if (!selectedGroup) return;
    const bId = bState.benefit.id;
    const bPts = bState.benefit.required_points;
    setClaimingBenefitId(bId);
    try {
      applyBenefitClaimed({ benefitId: bId, points: bPts });
      const res = await rewardsApi.claimBenefit(selectedGroup.id, bId);
      showToast(`Benefit "${bState.benefit.name}" claimed! 🎁`, 'success');
      setUnlockedBenefit(null);
      setClaimedBenefit({ ...bState, state: 'claimed' });
      if (res.data?.user_points) {
        setUserPointsData(res.data.user_points);
      }
      await fetchGroupDetails(selectedGroup.id);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setClaimingBenefitId(null);
    }
  };

  const selectGroup = (g: Group) => {
    setSelectedGroup(g);
    navigate(`/groups/${g.id}`);
  };

  return {
    groups,
    selectedGroup,
    setSelectedGroup,
    benefits,
    tasks,
    activities,
    completedTaskIds,
    loadingGroups,
    loadingDetails,
    completingTaskId,
    claimingBenefitId,
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
  };
}

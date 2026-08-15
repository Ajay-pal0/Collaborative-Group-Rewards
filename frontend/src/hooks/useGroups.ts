import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsApi, rewardsApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import type { Group, BenefitState, Task, Activity, UserPointsData } from '../types';

export function useGroups(groupId?: string) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [benefits, setBenefits] = useState<BenefitState[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  const [userPointsData, setUserPointsData] = useState<UserPointsData | null>(null);

  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
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
  }, [showToast]);

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
  }, [groupId, navigate, showToast]);

  // 2. Load Dashboard details for selected group
  const fetchGroupDetails = useCallback(async (gId: string) => {
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
  }, [showToast, user]);

  useEffect(() => {
    const gId = selectedGroup?.id;
    if (!gId) return;

    let active = true;
    Promise.all([
      groupsApi.getGroupDetails(gId),
      rewardsApi.getBenefits(gId),
      rewardsApi.getTasks(),
      groupsApi.getActivities(gId),
      rewardsApi.getPoints(gId),
      rewardsApi.getUserPoints(gId),
    ]).then(([groupRes, benefitsRes, tasksRes, activitiesRes, pointsRes, userPointsRes]) => {
      if (!active) return;
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
    }).catch((err) => {
      if (active) showToast(extractErrorMessage(err), 'error');
    }).finally(() => {
      if (active) setLoadingDetails(false);
    });

    return () => { active = false; };
  }, [selectedGroup?.id, user, showToast]);

  // 3. Complete Task Handler
  const handleCompleteTask = async (task: Task) => {
    if (!selectedGroup) return;
    setCompletingTaskId(task.id);
    try {
      await rewardsApi.completeTask(selectedGroup.id, task.id);
      showToast(`Task "${task.name}" completed! +${task.points} points awarded! 🎉`, 'success');
      await fetchGroupDetails(selectedGroup.id);
      await fetchGroups();
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
    setClaimingBenefitId(bId);
    try {
      await rewardsApi.claimBenefit(selectedGroup.id, bId);
      showToast(`Benefit "${bState.benefit.name}" claimed! 🎁`, 'success');
      setUnlockedBenefit(null);
      setClaimedBenefit(bState);
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

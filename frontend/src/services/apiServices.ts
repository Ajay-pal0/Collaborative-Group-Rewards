import api from '../lib/api';
import type {
  Group,
  BenefitState,
  Task,
  Activity,
  PointsData,
  UserPointsData,
  Invitation,
  User,
} from '../types';

// Centralized Auth API Service
export const authApi = {
  getCurrentUser: () => api.get<User>('/auth/me/'),
  login: (data: { email: string; password: string }) =>
    api.post<{ access: string; refresh: string }>('/auth/login/', data),
  register: (data: { email: string; password: string; name?: string }) =>
    api.post<{ access: string; refresh: string }>('/auth/register/', data),
};

// Centralized Groups API Service
export const groupsApi = {
  getGroups: () => api.get<Group[]>('/groups/'),
  getGroupDetails: (groupId: string) => api.get<Group>(`/groups/${groupId}/`),
  createGroup: (data: { name: string; category?: string }) =>
    api.post<Group>('/groups/', data),
  createInvite: (groupId: string) =>
    api.post<Invitation>(`/groups/${groupId}/invites/`),
  getInviteDetails: (token: string) =>
    api.get<Invitation>(`/invites/${token}/`),
  joinGroup: (token: string) =>
    api.post<Group>(`/invites/${token}/join/`),
  completeProfile: (groupId: string, data: { name: string; phone?: string }) =>
    api.post<{ transaction: unknown; group: unknown; user: User }>(
      `/groups/${groupId}/profile/complete/`,
      data
    ),
  getActivities: (groupId: string) =>
    api.get<Activity[]>(`/groups/${groupId}/activities/`),
};

// Centralized Rewards API Service
export const rewardsApi = {
  getBenefits: (groupId: string) =>
    api.get<BenefitState[]>(`/groups/${groupId}/benefits/`),
  getTasks: () => api.get<Task[]>('/tasks/'),
  getPoints: (groupId: string) =>
    api.get<PointsData>(`/groups/${groupId}/points/`),
  getUserPoints: (groupId: string) =>
    api.get<UserPointsData>(`/groups/${groupId}/user-points/`),
  completeTask: (groupId: string, taskId: string) =>
    api.post(`/groups/${groupId}/tasks/${taskId}/complete/`),
  claimBenefit: (groupId: string, benefitId: string) =>
    api.post(`/groups/${groupId}/benefits/${benefitId}/claim/`),
};

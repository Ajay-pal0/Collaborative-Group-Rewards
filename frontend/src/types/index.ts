export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at?: string;
}

export interface Group {
  id: string;
  name: string;
  group_type: string;
  status: string;
  created_at: string;
  member_count: number;
  total_points: number;
  members: GroupMember[];
  current_user_role: 'owner' | 'member' | null;
}

export interface GroupMember {
  id: string;
  user: User;
  role: 'owner' | 'member';
  status: string;
  joined_at: string;
}

export interface Invitation {
  id: string;
  token: string;
  group_name: string;
  group_type: string;
  member_count: number;
  expires_at: string;
  status: string;
  invite_url: string;
  created_at: string;
}

export interface Activity {
  id: string;
  event_type: string;
  member_name: string | null;
  metadata: Record<string, string | number | boolean | null | undefined>;
  created_at: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  points: number;
}

export interface Benefit {
  id: string;
  name: string;
  description: string;
  required_points: number;
  display_order: number;
}

export interface BenefitClaim {
  id: string;
  claimed_by_name: string;
  claimed_at: string;
}

export interface BenefitState {
  benefit: Benefit;
  state: 'locked' | 'available' | 'claimed';
  claim: BenefitClaim | null;
}

export interface PointsData {
  total: number;
  user_points?: number;
  user_contribution_pct?: number;
  member_points?: MemberPoints[];
  transactions: PointTransaction[];
}

export interface MemberPoints {
  member_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  points_earned: number;
  tasks_count: number;
  is_current_user: boolean;
}

export interface UserPointsData {
  group_id: string;
  group_total_points: number;
  user_points: number;
  user_contribution_pct: number;
  user_tasks_completed: number;
  member_points: MemberPoints[];
}

export interface PointTransaction {
  id: string;
  action_type: string;
  points: number;
  reference_id: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  pan_verified?: boolean;
  pan_masked?: string;
  pan_registered_name?: string;
  pan_verified_at?: string;
  aadhaar_verified?: boolean;
  aadhaar_masked?: string;
  aadhaar_registered_name?: string;
  aadhaar_verified_at?: string;
  created_at?: string;
}

export type VerificationStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'FAILED' | 'EXPIRED';

export interface BadgeInfo {
  label: string;
  awarded: boolean;
  status: string;
}

export interface VerificationDetail {
  status: VerificationStatus;
  is_verified: boolean;
  masked_id: string;
  registered_name: string;
  verified_at: string | null;
  badge: BadgeInfo;
  financial_profile?: PanFinancialProfile | null;
}

export interface PanFinancialProfile {
  is_pan_verified: boolean;
  pan_masked: string;
  registered_name: string;
  category?: string | null;
  pan_status?: string | null;
  aadhaar_linked?: boolean;
  aadhaar_seeding_status?: string | null;
  kyc_tier?: string;
  tax_compliance?: string;
  verification_source?: string | null;
  confidence_score?: number | null;
  credit_readiness_score?: number;
  credit_readiness_band?: string;
}

export interface KycStatusResponse {
  success: boolean;
  verifications: {
    pan: VerificationDetail;
    aadhaar: VerificationDetail;
  };
}

export interface PanVerifyRequest {
  pan_number?: string;
  pan?: string;
  consent: boolean;
}

export interface PanVerifyResponse {
  success: boolean;
  verification_type: string;
  status: string;
  badge: BadgeInfo;
  data?: {
    masked_id: string;
    registered_name: string;
    verified_at: string;
  };
  already_verified?: boolean;
  error?: string;
  message?: string;
}

export interface AadhaarInitiateRequest {
  consent: boolean;
  redirect_url?: string;
}

export interface AadhaarInitiateResponse {
  success: boolean;
  verification_type: string;
  status: string;
  authorization_url: string;
  client_id: string;
  token?: string;
  expiry_seconds?: number;
  badge: BadgeInfo;
  message?: string;
  error?: string;
}

export interface AadhaarVerifyRequest {
  client_id?: string;
}

export interface AadhaarVerifyResponse {
  success: boolean;
  verification_type: string;
  status: string;
  badge: BadgeInfo;
  data?: {
    masked_id: string;
    registered_name: string;
    verified_at: string;
  };
  already_verified?: boolean;
  error?: string;
  message?: string;
}

export interface AccountSummaryData {
  total_accounts: number;
  current_balance: number;
  high_credit_amount: number;
  overdue_account_count: number;
  overdue_balance: number;
  zero_balance_account_count: number;
  oldest_account_date?: string;
  recent_account_date?: string;
}

export interface InquirySummaryData {
  total_enquiries: number;
  past_30_days?: number;
  past_12_months?: number;
  past_24_months?: number;
  recent_inquiry_date?: string;
}

export interface MonthlyPayStatus {
  month: string;
  status: string;
}

export interface CreditAccountItem {
  account_type: string;
  masked_account_number: string;
  lender_name: string;
  current_balance: number;
  overdue_amount: number;
  high_credit_amount: number;
  opened_date?: string;
  reported_date?: string;
  emi_amount?: number;
  repayment_tenure?: number;
  payment_history?: MonthlyPayStatus[];
}

export interface CreditEnquiryItem {
  institution: string;
  purpose: string;
  amount?: number;
  date?: string;
}

export interface DetailedCreditReport {
  success: boolean;
  credit_score: number | null;
  score_band: string | null;
  account_summary: AccountSummaryData;
  inquiry_summary: InquirySummaryData;
  accounts: CreditAccountItem[];
  enquiries: CreditEnquiryItem[];
  fetched_at?: string;
  provider_reference?: string;
  error?: string;
  message?: string;
}

export interface CreditProfile {
  success: boolean;
  status: string;
  has_report: boolean;
  has_full_report?: boolean;
  credit_score: number | null;
  score_band: string | null;
  total_outstanding: number | null;
  active_accounts_count: number;
  overdue_amount: number | null;
  high_credit_amount?: number | null;
  overdue_accounts_count?: number;
  zero_balance_accounts_count?: number;
  oldest_account_date?: string;
  recent_account_date?: string;
  total_enquiries_count?: number;
  recent_enquiry_date?: string;
  accounts_summary?: AccountSummaryData;
  inquiry_summary?: InquirySummaryData;
  last_report_date: string | null;
  status_message: string;
  can_retry: boolean;
  message?: string;
  pan_financial_info?: PanFinancialProfile;
}

export interface CreditReportRequest {
  consent: boolean;
  purpose?: string;
  report_type?: 'score' | 'full_report';
  pan?: string;
  mobile?: string;
  name?: string;
}

export interface PanVerificationData {
  pan_verified: boolean;
  pan_masked: string;
  name: string;
  verified_at: string | null;
  already_verified?: boolean;
  masked_id?: string;
  registered_name?: string;
}

export interface PanVerificationResponse {
  success: boolean;
  message: string;
  data: PanVerificationData;
  error?: string;
}

export interface PanStatusResponse {
  pan_verified: boolean;
  pan_masked: string;
  name: string;
  verified_at: string | null;
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
  created_by_name?: string;
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

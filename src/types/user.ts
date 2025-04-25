export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  verification_status: string;
  avatar_url: string;
  userType: string;
  identity_verified: boolean;
  blocked_access: boolean;
  onboarding_stage: string;
  last_login_at: string;
  rating?: number | null;
  total_reviews?: number | null;
  about_me?: string | null;
  company_name?: string | null;
  country?: string | null;
  position?: string | null;
  website_url?: string | null;
  company_address?: string | null;
  deals_completed?: number | null;
  telegram?: string | null;
  trading_since?: string | null;
  created_by_agent_id?: string | null;
  address?: string | null;
}

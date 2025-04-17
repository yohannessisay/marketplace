export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  userType: string;
  identity_verified: boolean;
  blocked_access: boolean;
  onboarding_stage: string;
  last_login_at: string;
  verifican_status: string;
}

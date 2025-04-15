export interface ApiResponse<T> {
  Status: "success" | "error";
  Messages: string[];
  Data: T;
}
export interface ApiError {
  message: string;
  status: number;
  data: any;
}

export type APISuccessResponse = {
  success: boolean;
  message: string;
  data: any;
};

export type APIErrorResponse = {
  success: boolean;
  error: {
    message: string;
    details: string;
    code: number;
    hint: string;
  };
};

export type LoginResponseData = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    userType: string;
    identity_verified: boolean;
    onboarding_stage: string;
    last_login_at: string;
    verifican_status: string;
  };
};

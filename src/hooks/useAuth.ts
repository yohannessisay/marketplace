import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { apiService } from "@/services/apiService";
import { APIErrorResponse } from "@/types/api";
import { UserProfile } from "@/types/user";

export const USER_PROFILE_LOCAL_STORAGE_KEY = "userProfile";
export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });
  const location = useLocation();

  useEffect(() => {
    const authenticate = async () => {
      setAuthState((prev) => ({ ...prev, loading: true }));

      const accessToken = Cookies.get(ACCESS_TOKEN_KEY);
      const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
      const storedProfile = localStorage.getItem(
        USER_PROFILE_LOCAL_STORAGE_KEY,
      );
      let userProfile: UserProfile | null = null;

      if (storedProfile) {
        try {
          userProfile = JSON.parse(storedProfile);
          if (
            userProfile &&
            userProfile.id &&
            userProfile.email &&
            userProfile.userType
          ) {
            if (accessToken) {
              setAuthState({
                isAuthenticated: true,
                user: userProfile,
                loading: false,
              });
              return;
            }
          } else {
            console.warn("Invalid userProfile in localStorage, clearing...");
            localStorage.removeItem(USER_PROFILE_LOCAL_STORAGE_KEY);
          }
        } catch (error) {
          console.error(
            "Failed to parse userProfile from localStorage:",
            error,
          );
          localStorage.removeItem(USER_PROFILE_LOCAL_STORAGE_KEY);
        }
      }

      if (accessToken) {
        try {
          const response: any = await apiService().get("/auth/user");

          if (response.success) {
            localStorage.setItem(
              USER_PROFILE_LOCAL_STORAGE_KEY,
              JSON.stringify(response.data.user),
            );
            setAuthState({
              isAuthenticated: true,
              user: response.data.user,
              loading: false,
            });
            return;
          } else {
            console.error("Failed to fetch user profile:", response.error);
          }
        } catch (error) {
          const errorResponse = error as APIErrorResponse;
          console.error(
            "Error fetching user profile:",
            errorResponse.error?.message || error,
          );

          if (errorResponse.error?.code === 401 && refreshToken) {
            try {
              const refreshResponse: any = await apiService().post(
                "/auth/refresh",
                { refresh_token: refreshToken },
              );

              if (refreshResponse.success) {
                const { access_token, refresh_token, expires_in, user } =
                  refreshResponse.data;

                Cookies.set(ACCESS_TOKEN_KEY, access_token, {
                  expires: expires_in / (24 * 60 * 60),
                  secure: true,
                  sameSite: "strict",
                });

                Cookies.set(REFRESH_TOKEN_KEY, refresh_token, {
                  expires: 30,
                  secure: true,
                  sameSite: "strict",
                });

                localStorage.setItem(
                  USER_PROFILE_LOCAL_STORAGE_KEY,
                  JSON.stringify(user),
                );
                setAuthState({
                  isAuthenticated: true,
                  user,
                  loading: false,
                });
                return;
              } else {
                console.error(
                  "Refresh token response not successful:",
                  refreshResponse,
                );
              }
            } catch (refreshError) {
              console.error(
                "Failed to refresh token:",
                (refreshError as APIErrorResponse).error?.message ||
                  refreshError,
              );
            }
          }
        }
      }

      localStorage.removeItem(USER_PROFILE_LOCAL_STORAGE_KEY);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
    };

    authenticate();
  }, [location]);

  return authState;
};

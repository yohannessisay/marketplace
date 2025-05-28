import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "../../types/validation/auth";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import Cookies from "js-cookie";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { APIErrorResponse } from "@/types/api";
import { saveToLocalStorage } from "@/lib/utils";
import { UserProfile } from "@/types/user";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_PROFILE_KEY,
} from "@/types/constants";

type LoginFormInputs = z.infer<typeof loginSchema>;
const AgentLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { successMessage, errorMessage } = useNotification();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response: any = await apiService().postWithoutAuth(
        "/agent/auth/login",
        {
          ...data,
        },
      );
      localStorage.clear();
      successMessage("Login successful!");
      const { access_token, refresh_token, agent, expires_in } = response.data;

      const accessTokenExpires = new Date(Date.now() + expires_in * 1000);
      const refreshTokenExpires = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      );

      Cookies.set(ACCESS_TOKEN_KEY, access_token, {
        expires: accessTokenExpires,
      });
      Cookies.set(REFRESH_TOKEN_KEY, refresh_token, {
        expires: refreshTokenExpires,
      });

      const userProfile: UserProfile = {
        id: agent.id,
        first_name: agent.first_name ?? "",
        last_name: agent.last_name ?? "",
        phone: agent.phone ?? "",
        email: agent.email ?? "",
        avatar_url: agent.image ?? "",
        userType: "agent",
        verification_status: agent.verification_status ?? "",
        identity_verified: agent.identity_verified ?? false,
        blocked_access: agent.blocked_access ?? false,
        onboarding_stage: agent.onboarding_stage ?? "",
        last_login_at: new Date().toISOString(),
      };

      saveToLocalStorage(USER_PROFILE_KEY, userProfile);
      navigate("/agent/farmer-management");
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    }
  };

  return (
    <div className="flex min-h-screen   ">
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center  rounded-r-2xl shadow-lg"
        style={{ backgroundImage: "url('/images/agent.webp')" }}
      ></div>

      <div className="w-full md:w-1/2 px-3 flex flex-col justify-center items-center ">
        <div className="w-full max-w-md shadow-lg rounded-lg p-6 bg-white border border-green-200 ">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            <span className="text-green-600">Afro</span>valley
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm text-gray-600 mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="text"
                {...register("email")}
                placeholder="agent@afrovalley.io"
                className={`w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <Label htmlFor="password" className="text-sm text-gray-600 mb-2">
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="******"
                className={`w-full p-3 pr-10 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                className="absolute top-10 right-3 text-gray-500 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full my-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;

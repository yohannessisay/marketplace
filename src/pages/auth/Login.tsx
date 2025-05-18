import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "../../types/validation/auth";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import Cookies from "js-cookie";
import { useState } from "react";
import { Eye, EyeOff, MoveLeft } from "lucide-react";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from "@/lib/utils";
import { APIErrorResponse } from "@/types/api";
import {
  OTP_TIMER_KEY,
  OTP_TIMER_RESETED_KEY,
  SIGNUP_PROFILE_KEY,
  USER_PROFILE_KEY,
} from "@/types/constants";

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { successMessage, errorMessage } = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const otp_timer: any = getFromLocalStorage(OTP_TIMER_KEY, {});

  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get("redirectTo");

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response: any = await apiService().postWithoutAuth("/auth/login", {
        ...data,
      });
      localStorage.clear();
      successMessage("Login successful!");

      const { access_token, refresh_token, user } = response.data;
      Cookies.set("accessToken", access_token, { expires: 1 / 48 });
      Cookies.set("refreshToken", refresh_token, { expires: 1 });

      let defaultRedirect = "/home";
      if (user?.userType === "seller") {
        switch (user?.onboarding_stage) {
          case "crops_to_sell":
            defaultRedirect = "/onboarding/step-two";
            break;
          case "bank_information":
            defaultRedirect = "/onboarding/step-three";
            break;
          case "avatar_image":
            defaultRedirect = "/onboarding/step-four";
            break;
          case "completed":
            defaultRedirect = "/seller-dashboard";
            break;
          case "farm_profile":
            saveToLocalStorage("current-step", "farm_profile");
            break;
          default:
            break;
        }
      } else if (user?.userType === "agent") {
        defaultRedirect = "/agent/farmer-management";
      } else if (user?.userType === "buyer") {
        switch (user?.onboarding_stage) {
          case "company_verification":
            defaultRedirect = "/company-verification";
            saveToLocalStorage("current-step", "company_verification");
            break;
          case "completed":
            defaultRedirect = "/market-place";
            break;
          default:
            break;
        }
      }

      let finalRedirect = defaultRedirect;
      if (
        user?.userType !== "seller" &&
        redirectTo &&
        isValidRedirect(redirectTo)
      ) {
        finalRedirect = redirectTo;
      }

      navigate(finalRedirect);

      saveToLocalStorage("current-step", user.onboarding_stage);
      saveToLocalStorage(USER_PROFILE_KEY, user);
    } catch (error: unknown) {
      const errorResponse = error as APIErrorResponse;
      if (
        errorResponse.error.details ===
        "Email verification is required for this account"
      ) {
        saveToLocalStorage(SIGNUP_PROFILE_KEY, data.email);
        if (otp_timer) {
          removeFromLocalStorage(OTP_TIMER_KEY);
          saveToLocalStorage(OTP_TIMER_RESETED_KEY, "true");
        }
        navigate("/otp");
        successMessage("Verify your email to continue");
      } else {
        errorMessage(errorResponse);
      }
    }
  };

  const isValidRedirect = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      return decodedUrl.startsWith("/") && !decodedUrl.includes("://");
    } catch {
      return false;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Image Section - Hidden on mobile & tablet, visible on desktop (lg+) */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center rounded-r-2xl shadow-lg"
        style={{ backgroundImage: "url('/images/login.png')" }}
      ></div>

      {/* Right Form Section - Full width on mobile, half width on tablet+ */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md shadow-lg rounded-lg p-6 bg-white border border-green-200">
          <div className="flex justify-end">
            <Link to={"/"}>
              <MoveLeft
                className="hover:bg-primary hover:text-white text-primary cursor-pointer border rounded-full p-1 shadow-md"
                size={36}
              />
            </Link>
          </div>
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
                placeholder="someone@company.com"
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
                className="absolute top-10 right-3 text-gray-500"
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
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>

            <p className="mt-4 text-center text-gray-600">
              {"Don't "}have an account?{" "}
              <Link to="/registration" className="font-semibold text-green-500">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

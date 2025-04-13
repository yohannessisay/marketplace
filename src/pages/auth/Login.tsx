import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "../../types/validation/auth";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import Cookies from "js-cookie";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { saveToLocalStorage } from "@/lib/utils";

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
  const { successMessage, errorMessage } = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const onSubmit = async (data: LoginFormInputs) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiService().postWithoutAuth("/auth/login", {
        ...data,
      });

      if (response.success) {
        successMessage("Login successful!");

        Cookies.set("accessToken", response.data.access_token, {
          expires: 1 / 48,
        });
        Cookies.set("refreshToken", response.data.refresh_token, {
          expires: 1,
        });

        const user = response.data.user;
        const userProfile = {
          email: user.email,
          firstName: user.first_name,
          gender: user.gender,
          id: user.id,
          image: user.image,
          phone: user.phone,
          userType: user.userType,
          verificationStatus: user.verification_status,
          onboardingStage: user.onboarding_stage,
          lastName: user.last_name,
          username: user.username,
        };
        let redirectTo = "/home";
        if (userProfile?.userType === "seller") {
          switch (userProfile?.onboardingStage) {
            case "crops_to_sell":
              redirectTo = "/onboarding/step-two";
              break;
            case "bank_information":
              redirectTo = "/onboarding/step-three";
              break;
            case "avatar_image":
              redirectTo = "/onboarding/step-four";
              break;
            case "completed":
              redirectTo = "/seller-dashboard";
              break;
            case "farm_profile":
              saveToLocalStorage("current-step", "farm_profile");
              break;
            default:
              break;
          }
        } else if (userProfile?.userType === "agent") {
          redirectTo = "/agent/farmer-management";
        } else if (userProfile?.userType === "buyer") {
          switch (userProfile?.onboardingStage) {
            case "onboarding":
              redirectTo = "/home";
              saveToLocalStorage("current-step", "onboarding");
              break;
            case "completed":
              redirectTo = "/market-place";
              break;
            default:
              break;
          } 
        }

        navigate(redirectTo);
        saveToLocalStorage("userProfile", userProfile);
      } else {
        errorMessage("Credential error");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (
        error.data.error.details ==
        "Email verification is required for this account"
      ) {
        navigate("/otp");
        successMessage("Verify your email to continue");
        return;
      }
      errorMessage("Credential Error");
    }
  };

  return (
    <div className="flex min-h-screen   ">
      {/* Left Image Section */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center  rounded-r-2xl shadow-lg"
        style={{ backgroundImage: "url('/images/login.png')" }}
      ></div>

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center ">
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
                placeholder="someone@test.com"
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
              <Link
                to="/registration"
                className="font-semibold text-green-500 "
              >
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

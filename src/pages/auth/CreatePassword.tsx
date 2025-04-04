import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; // Import Shadcn UI components
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { Label } from "@/components/ui/label";
import {
  passwordSchema,
  PasswordValidationType,
} from "@/types/validation/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";
const CreatePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PasswordValidationType>({
    resolver: zodResolver(passwordSchema),
  });
  const { successMessage, errorMessage } = useNotification();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State to toggle confirm password visibility

  const onSubmit = (data: PasswordValidationType) => {
    if (data.password !== data.confirmPassword) {
      errorMessage("Passwords do not match");
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords don't match",
      });
      return;
    }
    successMessage("Password created successfully!");
    localStorage.setItem("first_time_user", JSON.stringify(false));
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Image Section */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/path-to-your-image.jpg')" }}
      ></div>

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Afrovalley</h1>
          <p className="text-gray-600 mb-4">Create your password</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm text-gray-600">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"} // Toggle password visibility
                  {...register("password")}
                  placeholder="Enter your password"
                  className={`w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} // Toggle visibility on click
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-600" />
                  ) : (
                    <Eye size={20} className="text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="text-sm text-gray-600"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Confirm your password"
                  className={`w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} className="text-gray-600" />
                  ) : (
                    <Eye size={20} className="text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;

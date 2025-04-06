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
  const onSubmit = async (data: LoginFormInputs) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiService().postWithoutAuth("/auth/login", {
        ...data,
      });
      successMessage("Login successful!");

      // Set these properties on prod
      // secure:true
      // httpOnly: true,
      // sameSite: "strict",
      Cookies.set("accessToken", response.accessToken, {
        expires: 1 / 48,
      });
      Cookies.set("refreshToken", response.refreshToken, {
        expires: 1,
      });
      const userProfile = {
        email: response.email,
        firstName: response.firstName,
        gender: response.gender,
        id: response.id,
        image: response.image,
        lastName: response.lastName,
        username: response.username,
      };

      localStorage.setItem("userProfile", JSON.stringify(userProfile));
      const firstTimeUser = localStorage.getItem("first_time_user");
      if (firstTimeUser === "false") {
        navigate("/home");
      } else {
        navigate("/first-time-user");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      errorMessage(error);
    }
  };

  return (
    <div className="flex min-h-screen   ">
      {/* Left Image Section */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center  rounded-r-2xl shadow-lg"
        style={{ backgroundImage: "url('/login.png')" }}
      ></div>

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center ">
        <div className="w-full max-w-md shadow-lg rounded-lg p-6 bg-white border border-green-500 ">
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

            <div>
              <Label htmlFor="password" className="text-sm text-gray-600 mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="******"
                className={`w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
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

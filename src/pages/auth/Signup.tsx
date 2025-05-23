import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { buyerSchema, sellerSchema } from "@/types/validation/auth";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { LucideHome, InfoIcon } from "lucide-react";
import { APIErrorResponse } from "@/types/api";
import { SIGNUP_PROFILE_KEY } from "@/types/constants";
import { saveToLocalStorage } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const enhancedBuyerSchema = buyerSchema.refine(
  (data) => data.password === data.confirm_password,
  {
    message: "Passwords do not match",
    path: ["confirm_password"],
  },
);

const enhancedSellerSchema = sellerSchema.refine(
  (data) => data.password === data.confirm_password,
  {
    message: "Passwords do not match",
    path: ["confirm_password"],
  },
);

type BuyerFormValues = z.infer<typeof enhancedBuyerSchema>;
type SellerFormValues = z.infer<typeof enhancedSellerSchema>;

export default function SignupPage() {
  const [role, setRole] = useState<"buyer" | "seller">("seller");
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { successMessage, errorMessage } = useNotification();

  const [buyerPasswordVisible, setBuyerPasswordVisible] = useState(false);
  const [buyerConfirmPasswordVisible, setBuyerConfirmPasswordVisible] =
    useState(false);
  const [sellerPasswordVisible, setSellerPasswordVisible] = useState(false);
  const [sellerConfirmPasswordVisible, setSellerConfirmPasswordVisible] =
    useState(false);

  const buyerForm = useForm<BuyerFormValues>({
    resolver: zodResolver(enhancedBuyerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
      confirm_password: "",
      preferredCurrency: "",
      companyName: "",
    },
    mode: "onChange",
  });

  const sellerForm = useForm<SellerFormValues>({
    resolver: zodResolver(enhancedSellerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    mode: "onChange",
  });

  const onBuyerSubmit = async (data: BuyerFormValues) => {
    try {
      setIsSubmitting(true);
      await apiService().postWithoutAuth("/auth/signup", {
        ...data,
        userType: "buyer",
      });

      successMessage(
        "Buyer Registration successful! Please verify your email.",
      );
      saveToLocalStorage(SIGNUP_PROFILE_KEY, data.email);
      navigate("/verification");
    } catch (error: unknown) {
      setIsSubmitting(false);
      const errorResponse = error as APIErrorResponse;
      console.log(errorResponse);

      if (errorResponse.error.details.includes("buyer_phone_key")) {
        errorResponse.error.message = "Phone number already exists";
        errorMessage(errorResponse);
      } else {
        errorMessage(errorResponse);
      }
    }
  };

  const onSellerSubmit = async (data: SellerFormValues) => {
    try {
      setIsSubmitting(true);
      await apiService().postWithoutAuth("/auth/signup", {
        ...data,
        userType: "seller",
      });

      successMessage(
        "Seller registration successful! Please verify your email.",
      );
      saveToLocalStorage(SIGNUP_PROFILE_KEY, data.email);
      navigate("/verification");
    } catch (error: unknown) {
      setIsSubmitting(false);
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);
    }
  };

  const handleRoleChange = (newRole: "buyer" | "seller") => {
    if (newRole === "buyer" && role === "seller") {
      const {
        first_name,
        last_name,
        phone,
        email,
        password,
        confirm_password,
      } = sellerForm.getValues();
      buyerForm.setValue("first_name", first_name);
      buyerForm.setValue("last_name", last_name);
      buyerForm.setValue("phone", phone);
      buyerForm.setValue("email", email);
      buyerForm.setValue("password", password);
      buyerForm.setValue("confirm_password", confirm_password);
    } else if (newRole === "seller" && role === "buyer") {
      const {
        first_name,
        last_name,
        phone,
        email,
        password,
        confirm_password,
      } = buyerForm.getValues();
      sellerForm.setValue("first_name", first_name);
      sellerForm.setValue("last_name", last_name);
      sellerForm.setValue("phone", phone);
      sellerForm.setValue("email", email);
      sellerForm.setValue("password", password);
      sellerForm.setValue("confirm_password", confirm_password);
    }

    setRole(newRole);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="hidden lg:flex w-full lg:w-1/2 bg-cover bg-center rounded-r-2xl shadow-lg"
        style={{ backgroundImage: "url('/images/registration.png')" }}
      ></div>

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md sm:max-w-lg border border-green-200 shadow-md rounded-lg p-4 sm:p-6 lg:p-8">
          <div className="flex justify-end mb-4">
            <Link to={"/"}>
              <LucideHome
                className="hover:bg-primary hover:text-white text-primary cursor-pointer border rounded-full p-1 shadow-md"
                size={32}
              />
            </Link>
          </div>
          <div className="mb-4 sm:mb-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              <span className="text-green-600">Afro</span>valley
            </h2>
          </div>

          <div className="flex mb-4 space-x-2 sm:space-x-3">
            <Button
              type="button"
              variant={role === "buyer" ? "default" : "outline"}
              className={`flex-1 text-sm sm:text-base py-2 sm:py-2.5 ${role === "buyer" ? "bg-gray-900" : ""}`}
              onClick={() => handleRoleChange("buyer")}
            >
              Sign up as Buyer
            </Button>
            <Button
              type="button"
              variant={role === "seller" ? "default" : "outline"}
              className={`flex-1 text-sm sm:text-base py-2 sm:py-2.5 ${role === "seller" ? "bg-gray-900" : ""}`}
              onClick={() => handleRoleChange("seller")}
            >
              Sign up as Seller
            </Button>
          </div>

          {role === "buyer" && (
            <Form {...buyerForm}>
              <form
                onSubmit={buyerForm.handleSubmit(onBuyerSubmit)}
                className="space-y-3 sm:space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={buyerForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem id="first_name">
                        <FormControl>
                          <Input
                            placeholder="First name*"
                            className="text-sm sm:text-base py-2 sm:py-2.5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={buyerForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem id="last_name">
                        <FormControl>
                          <Input
                            placeholder="Last name*"
                            className="text-sm sm:text-base py-2 sm:py-2.5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={buyerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem id="phone">
                      <FormControl>
                        <Input
                          placeholder="Phone*"
                          type="tel"
                          className="text-sm sm:text-base py-2 sm:py-2.5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem id="email">
                      <FormControl>
                        <Input
                          placeholder="Email*"
                          type="email"
                          className="text-sm sm:text-base py-2 sm:py-2.5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem id="password">
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Password*"
                            type={buyerPasswordVisible ? "text" : "password"}
                            className="text-sm sm:text-base py-2 sm:py-2.5"
                            {...field}
                            value={field.value ?? ""}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setBuyerPasswordVisible((v) => !v)}
                            tabIndex={-1}
                          >
                            {buyerPasswordVisible ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem id="confirm_password">
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Confirm Password*"
                            type={
                              buyerConfirmPasswordVisible ? "text" : "password"
                            }
                            className="text-sm sm:text-base py-2 sm:py-2.5"
                            {...field}
                            value={field.value ?? ""}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() =>
                              setBuyerConfirmPasswordVisible((v) => !v)
                            }
                            tabIndex={-1}
                          >
                            {buyerConfirmPasswordVisible ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem id="companyName">
                      <FormControl>
                        <Input
                          placeholder="Company name"
                          className="text-sm sm:text-base py-2 sm:py-2.5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="preferredCurrency"
                  render={({ field }) => (
                    <FormItem id="preferredCurrency">
                      <FormLabel className="text-sm sm:text-base">
                        Preferred Currency
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full text-sm sm:text-base py-2 sm:py-2.5">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="ETB">
                            ETB (Ethiopian Birr)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full my-3 sm:my-4 text-sm sm:text-base py-2 sm:py-2.5"
                >
                  {isSubmitting ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </Form>
          )}

          {role === "seller" && (
            <Form {...sellerForm}>
              <form
                onSubmit={sellerForm.handleSubmit(onSellerSubmit)}
                className="space-y-3 sm:space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={sellerForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem id="first_name">
                        <FormControl>
                          <Input
                            placeholder="First name*"
                            className="text-sm sm:text-base py-2 sm:py-2.5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={sellerForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem id="last_name">
                        <FormControl>
                          <Input
                            placeholder="Last name*"
                            className="text-sm sm:text-base py-2 sm:py-2.5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={sellerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem id="phone">
                      <FormControl>
                        <Input
                          placeholder="Phone*"
                          type="tel"
                          className="text-sm sm:text-base py-2 sm:py-2.5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem id="email">
                      <FormControl>
                        <Input
                          placeholder="Email*"
                          type="email"
                          className="text-sm sm:text-base py-2 sm:py-2.5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem id="password">
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Password*"
                            type={sellerPasswordVisible ? "text" : "password"}
                            className="text-sm sm:text-base py-2 sm:py-2.5"
                            {...field}
                            value={field.value ?? ""}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setSellerPasswordVisible((v) => !v)}
                            tabIndex={-1}
                          >
                            {sellerPasswordVisible ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem id="confirm_password">
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Confirm Password*"
                            type={
                              sellerConfirmPasswordVisible ? "text" : "password"
                            }
                            className="text-sm sm:text-base py-2 sm:py-2.5"
                            {...field}
                            value={field.value ?? ""}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() =>
                              setSellerConfirmPasswordVisible((v) => !v)
                            }
                            tabIndex={-1}
                          >
                            {sellerConfirmPasswordVisible ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full my-3 sm:my-4 text-sm sm:text-base py-2 sm:py-2.5"
                >
                  {isSubmitting ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </Form>
          )}

          <h3 className="my-4 sm:my-6 flex justify-center items-center text-sm sm:text-base">
            <InfoIcon className="mr-2 text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
            You are currently filling the form as
            <span className="text-gray-500 font-semibold ml-2 border rounded-md px-2 py-1 text-xs sm:text-sm shadow-md">
              {role.toUpperCase()}
            </span>
          </h3>

          <p className="mt-3 sm:mt-4 text-center text-gray-600 text-sm sm:text-base">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-green-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

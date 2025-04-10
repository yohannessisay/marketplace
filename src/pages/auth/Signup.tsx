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

// Buyer schema

// Define types based on the schemas
type BuyerFormValues = z.infer<typeof buyerSchema>;
type SellerFormValues = z.infer<typeof sellerSchema>;

export default function SignupPage() {
  const [role, setRole] = useState<"buyer" | "seller">("seller");
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { successMessage, errorMessage } = useNotification();
  const buyerForm = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
      preferredCurrency: "",
    },
    mode: "onChange",
  });

  const sellerForm = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
      companyName: "",
      productCategory: "",
    },
    mode: "onChange",
  });

  const onBuyerSubmit = async (data: BuyerFormValues) => {
    setIsSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await apiService().postWithoutAuth("/auth/signup", {
      ...data,
      userType: "buyer",
    });

    if (response.success) {
      successMessage("Registration successful! Please verify your email.");
      localStorage.setItem("userProfile", JSON.stringify(data));
      navigate("/verification");
    } else {
      errorMessage("Something went wrong");
      setIsSubmitting(false);
    }
  };

  const onSellerSubmit = async (data: SellerFormValues) => {
    try {
      setIsSubmitting(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiService().postWithoutAuth("/auth/signup", {
        ...data,
        userType: "seller",
      });
      if (response.success) {
        successMessage("Registration successful! Please verify your email.");
        localStorage.setItem("userProfile", JSON.stringify(data));
        navigate("/verification");
      } else {
        setIsSubmitting(false);
        errorMessage("Something went wrong");
      }
    } catch {
      setIsSubmitting(false);
      errorMessage("Something went wrong");
    }
  };

  const handleRoleChange = (newRole: "buyer" | "seller") => {
    if (newRole === "buyer" && role === "seller") {
      const { first_name, last_name, phone, email, password } =
        sellerForm.getValues();
      buyerForm.setValue("first_name", first_name);
      buyerForm.setValue("last_name", last_name);
      buyerForm.setValue("phone", phone);
      buyerForm.setValue("email", email);
      buyerForm.setValue("password", password);
    } else if (newRole === "seller" && role === "buyer") {
      const { first_name, last_name, phone, email, password } =
        buyerForm.getValues();
      sellerForm.setValue("first_name", first_name);
      sellerForm.setValue("last_name", last_name);
      sellerForm.setValue("phone", phone);
      sellerForm.setValue("email", email);
      sellerForm.setValue("password", password);
    }

    setRole(newRole);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Side - Image */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center  rounded-r-2xl shadow-lg"
        style={{ backgroundImage: "url('/images/registration.png')" }}
      ></div>

      {/* Right Side - Form */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white p-8">
        <div className="max-w-md w-full border border-green-200 shadow-md rounded-md p-4">
          {/* Logo */}
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              <span className="text-green-600">Afro</span>valley
            </h2>
          </div>

          {/* Role Selection */}
          <div className="flex mb-4 space-x-2">
            <Button
              type="button"
              variant={role === "buyer" ? "default" : "outline"}
              className={`flex-1 ${role === "buyer" ? "bg-gray-900" : ""}`}
              onClick={() => handleRoleChange("buyer")}
            >
              Sign up as Buyer
            </Button>
            <Button
              type="button"
              variant={role === "seller" ? "default" : "outline"}
              className={`flex-1 ${role === "seller" ? "bg-gray-900" : ""}`}
              onClick={() => handleRoleChange("seller")}
            >
              Sign up as Seller
            </Button>
          </div>

          {/* Buyer Form */}
          {role === "buyer" && (
            <Form {...buyerForm}>
              <form
                onSubmit={buyerForm.handleSubmit(onBuyerSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={buyerForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem id="first_name">
                        <FormControl>
                          <Input placeholder="First name*" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={buyerForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem id="last_name">
                        <FormControl>
                          <Input placeholder="Last name*" {...field} />
                        </FormControl>
                        <FormMessage />
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
                        <Input placeholder="Phone*" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem id="email">
                      <FormControl>
                        <Input placeholder="Email*" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem id="">
                      <FormControl>
                        <Input
                          placeholder="Password*"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={buyerForm.control}
                  name="preferredCurrency"
                  render={({ field }) => (
                    <FormItem id="preferredCurrency">
                      <FormLabel>Preferred Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full my-4"
                >
                  {isSubmitting ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </Form>
          )}

          {/* Seller Form */}
          {role === "seller" && (
            <Form {...sellerForm}>
              <form
                onSubmit={sellerForm.handleSubmit(onSellerSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={sellerForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem id="first_name">
                        <FormControl>
                          <Input placeholder="First name*" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={sellerForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem id="last_name">
                        <FormControl>
                          <Input placeholder="Last name*" {...field} />
                        </FormControl>
                        <FormMessage />
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
                        <Input placeholder="Phone*" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem id="email">
                      <FormControl>
                        <Input placeholder="Email*" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem id="password">
                      <FormControl>
                        <Input
                          placeholder="Password*"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem id="companyName">
                      <FormControl>
                        <Input placeholder="Company name*" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={sellerForm.control}
                  name="productCategory"
                  render={({ field }) => (
                    <FormItem id="productCategory">
                      <FormLabel>Product Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="coffee">Coffee</SelectItem>
                          <SelectItem value="spices">Spices</SelectItem>
                          <SelectItem value="textiles">Textiles</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full my-4"
                >
                  {isSubmitting ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </Form>
          )}

          {/* Sign-in Option */}
          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-green-500 ">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

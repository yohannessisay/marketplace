import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { sellerSchemaForAgent } from "@/types/validation/auth";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { getFromLocalStorage, saveToLocalStorage } from "@/lib/utils";
import { APIErrorResponse } from "@/types/api";

// Define types based on the schemas
type SellerFormValues = z.infer<typeof sellerSchemaForAgent>;

export default function FarmerSignupViaAgentPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { successMessage, errorMessage } = useNotification();

  const sellerForm = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchemaForAgent),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
    },
    mode: "onChange",
  });

  const onSellerSubmit = async (data: SellerFormValues) => {
    try {
      const agent: any = getFromLocalStorage("userProfile", {});
      setIsSubmitting(true);
      const response: any = await apiService().postWithoutAuth(
        `/auth/signup?agentID=${agent.id}`,
        {
          ...data,
          userType: "seller",
        },
      );
      successMessage("Farmer Registered successfully");
      saveToLocalStorage("current-step", "farm_profile");
      saveToLocalStorage("farmer-profile", {
        id: response.data.userId,
        email: response.data.email,
      });
      navigate("/home");
    } catch (error: unknown) {
      setIsSubmitting(false);
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);
    }
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
        </div>
      </div>
    </div>
  );
}

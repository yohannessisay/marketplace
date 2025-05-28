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
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import { Loader2, ArrowLeftCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type SellerFormValues = z.infer<typeof sellerSchemaForAgent>;

export default function FarmerSignupViaAgentPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { successMessage, errorMessage } = useNotification();
  const { user } = useAuth();
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
    if (!user) return;

    try {
      setIsSubmitting(true);
      await apiService().postWithoutAuth(`/auth/signup?agentID=${user?.id}`, {
        ...data,
        userType: "seller",
      });
      successMessage("Farmer Registered successfully");
      navigate("/agent/farmer-management");
    } catch (error: unknown) {
      setIsSubmitting(false);
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center  rounded-r-2xl shadow-lg"
        style={{ backgroundImage: "url('/images/registration.png')" }}
      ></div>

      <div className="flex w-full md:w-1/2 items-center justify-center bg-white p-8">
        <div className="max-w-md w-full border border-green-200 shadow-md rounded-md p-4">
          <div className="flex items-center justify-between mb-6">
            <Link to="/agent/farmer-management">
              <Button variant="ghost" size="icon">
                <ArrowLeftCircle className="h-5 w-5" />
              </Button>
            </Link>
            <h2 className="text-3xl font-bold text-gray-800">
              <span className="text-green-600">Afro</span>valley
            </h2>
            <div className="w-10"></div>
          </div>

          <Form {...sellerForm}>
            <form
              onSubmit={sellerForm.handleSubmit(onSellerSubmit)}
              className="space-y-4"
            >
              <div className="flex flex-col md:grid md:grid-cols-2 md:gap-4 space-y-4 md:space-y-0">
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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full my-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Signing...</span>
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

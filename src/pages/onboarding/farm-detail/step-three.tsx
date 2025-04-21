"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Stepper from "@/components/ui/stepper";
import {
  bankInfoSchema,
  type BankInfoFormData,
} from "@/types/validation/seller-onboarding";
import { saveToLocalStorage, getFromLocalStorage } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/header";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";
import { useAuth } from "@/hooks/useAuth";
import { APIErrorResponse } from "@/types/api";

interface BankAccount {
  id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  swift_code?: string; // optional field
  branch_name?: string; // optional field
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export default function StepThree() {
  const navigation = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [bankAccount, setBankAccount] = useState<BankAccount>();
  const { successMessage, errorMessage } = useNotification();
  const { user, setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BankInfoFormData>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues: {
      account_holder_name: "",
      bank_name: "",
      account_number: "",
      branch_name: "",
      is_primary: "yes",
      swift_code: "",
    },
  });

  const fetchBankAccount = async () => {
    try {
      const response: any = await apiService().get(
        "/onboarding/seller/get-bank-information",
        user?.userType === "agent" ? user?.id : "",
      );
      setBankAccount(response.data.bank_account);
    } catch (error: any) {
      console.error(error.error.message);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (user && user.onboarding_stage !== "completed") {
      fetchBankAccount();
    }
  }, [user]);

  const onSubmit = async (data: BankInfoFormData) => {
    try {
      setIsSubmitting(true);
      const isAgent: any = getFromLocalStorage("userProfile", {});
      const farmer: any = getFromLocalStorage("farmer-profile", {});
      const currentStep: any = getFromLocalStorage("current-step", "");

      if (user?.userType !== "agent" && currentStep === "bank_information") {
        await apiService().post(
          "/onboarding/seller/bank-information",
          data,
          isAgent.userType === "agent" && farmer ? farmer.id : "",
        );

        setUser({
          ...user!,
          onboarding_stage: "avatar_image",
        });

        successMessage("Bank details saved successfully!");
        saveToLocalStorage("step-three", data);
        saveToLocalStorage("current-step", "avatar_image");
        navigation("/onboarding/step-four");
        setIsSubmitting(false);
      } else {
        await apiService().patch(
          "/sellers/banks/update-bank-information",
          { ...data, id: bankAccount?.id },
          isAgent.userType === "agent" && farmer ? farmer.id : "",
        );
        navigation("/onboarding/step-four");
        successMessage("Bank account data updated successfully");
      }
    } catch (error: any) {
      setIsSubmitting(false);
      errorMessage(error as APIErrorResponse);
    }
  };

  const goBack = () => {
    localStorage.setItem("back-button-clicked", "true");
    navigation("/onboarding/step-two");
  };

  if (!isClient || !user) {
    return null; // Prevent hydration errors and handle unauthenticated state
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto p-6">
        <Stepper currentStep={3} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 shadow-lg px-8 rounded-md py-4"
          >
            <div className="mb-10">
              <div className="mb-6">
                <h2 className="text-green-600 font-medium">Step 3</h2>
                <h3 className="text-xl text-gray-900 font-semibold">
                  Provide your bank information
                </h3>
                <p className="text-sm text-gray-600">
                  Add your banking details for receiving payments from crop
                  sales
                </p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="account_holder_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bank_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name="account_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="branch_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name="swift_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Swift Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_primary"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Is Primary?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-4 space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="yes" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Yes
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="no" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  No
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between mb-8">
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting} className="my-4">
                {isSubmitting ? "Saving..." : "Save and continue"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

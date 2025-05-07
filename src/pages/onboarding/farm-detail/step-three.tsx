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
  swift_code?: string;
  branch_name?: string;
  is_primary: string;
  created_at: string;
  updated_at: string;
}

export default function StepThree() {
  const navigation = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
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
      const bankAccountData = response.data.bank_account;
      if (bankAccountData) {
        setBankAccount(bankAccountData);
      }
    } catch (error: any) {
      console.error(
        (error as APIErrorResponse).error || "Failed to fetch bank account",
      );
    }
  };

  const loadSavedData = () => {
    const savedData = getFromLocalStorage("step-three", {});
    if (Object.keys(savedData).length > 0) {
      const loadedData: BankInfoFormData = {
        account_holder_name: (savedData as any).account_holder_name || "",
        bank_name: (savedData as any).bank_name || "",
        account_number: (savedData as any).account_number || "",
        branch_name: (savedData as any).branch_name || "",
        is_primary: (savedData as any).is_primary === "no" ? "no" : "yes",
        swift_code: (savedData as any).swift_code || "",
      };
      form.setValue("account_holder_name", loadedData.account_holder_name);
      form.setValue("bank_name", loadedData.bank_name);
      form.setValue("account_number", loadedData.account_number);
      form.setValue("branch_name", loadedData.branch_name);
      form.setValue("is_primary", loadedData.is_primary);
      form.setValue("swift_code", loadedData.swift_code);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (user && user.onboarding_stage !== "completed") {
      fetchBankAccount();
      loadSavedData();
    }
  }, [user]);

  useEffect(() => {
    if (isClient && user && user.onboarding_stage !== "completed") {
      loadSavedData();
    }
  }, [isClient, user]);

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
      } else {
        if (!bankAccount?.id) {
          throw new Error("Bank account ID is missing");
        }
        await apiService().patch(
          "/sellers/banks/update-bank-information",
          { ...data, id: bankAccount.id },
          isAgent.userType === "agent" && farmer ? farmer.id : "",
        );
        saveToLocalStorage("step-three", data);
        successMessage("Bank account data updated successfully");
        navigation("/onboarding/step-four");
      }
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    saveToLocalStorage("back-button-clicked", "true");
    navigation("/onboarding/step-two");
  };

  if (!isClient || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary/5 pt-26">
      <Header />
      <main className="container mx-auto p-4 max-w-5xl">
        <Stepper currentStep={3} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 shadow-lg p-8 rounded-md py-4 bg-white pt-10"
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
                              onValueChange={(value: "yes" | "no") =>
                                field.onChange(value)
                              }
                              value={field.value}
                              className="flex flex-row gap-4 space-y-1"
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

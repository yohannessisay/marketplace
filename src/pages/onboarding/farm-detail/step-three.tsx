"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import {
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
} from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/header";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";
import { useAuth } from "@/hooks/useAuth";
import { APIErrorResponse } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BACK_BUTTON_CLICKED_KEY,
  FARMER_PROFILE_KEY,
  HAS_COMPLETED_STEP_THREE_KEY,
  HAS_COMPLETED_STEP_TWO_KEY,
  STEP_THREE_KEY,
} from "@/types/constants";
import { Loader2 } from "lucide-react";

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
  const navigate = useNavigate();
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const { successMessage, errorMessage } = useNotification();
  const { user, loading, setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBankData, setIsLoadingBankData] = useState(false);

  const isBackButtonClicked = useMemo(
    () => getFromLocalStorage(BACK_BUTTON_CLICKED_KEY, {}) === "true",
    [],
  );
  const hasCompletedStepThree = useMemo(
    () => getFromLocalStorage(HAS_COMPLETED_STEP_THREE_KEY, {}) === "true",
    [],
  );
  const farmerProfile: any = useMemo(
    () => getFromLocalStorage(FARMER_PROFILE_KEY, {}),
    [],
  );

  const effectiveOnboardingStage =
    user?.userType === "agent"
      ? farmerProfile.onboarding_stage
      : user?.onboarding_stage;

  const xfmrId = farmerProfile.id ?? "";

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

  const fetchBankAccount = useCallback(async () => {
    setIsLoadingBankData(true);
    try {
      const response: any = await apiService().get(
        "/onboarding/seller/get-bank-information",
        xfmrId,
      );
      const bankAccountData = response.data.bank_account;
      if (bankAccountData) {
        setBankAccount(bankAccountData);
        form.setValue(
          "account_holder_name",
          bankAccountData.account_holder_name || "",
        );
        form.setValue("bank_name", bankAccountData.bank_name || "");
        form.setValue("account_number", bankAccountData.account_number || "");
        form.setValue("branch_name", bankAccountData.branch_name || "");
        form.setValue(
          "is_primary",
          bankAccountData.is_primary === "no" ? "no" : "yes",
        );
        form.setValue("swift_code", bankAccountData.swift_code || "");
      }
    } catch (error: any) {
      console.error(
        (error as APIErrorResponse).error || "Failed to fetch bank account",
      );
    } finally {
      setIsLoadingBankData(false);
    }
  }, [xfmrId, form]);

  const loadSavedData = useCallback(() => {
    const savedData: any = getFromLocalStorage(STEP_THREE_KEY, {});
    if (Object.keys(savedData).length > 0) {
      const loadedData: BankInfoFormData = {
        account_holder_name: savedData.account_holder_name || "",
        bank_name: savedData.bank_name || "",
        account_number: savedData.account_number || "",
        branch_name: savedData.branch_name || "",
        is_primary: savedData.is_primary === "no" ? "no" : "yes",
        swift_code: savedData.swift_code || "",
      };
      form.setValue("account_holder_name", loadedData.account_holder_name);
      form.setValue("bank_name", loadedData.bank_name);
      form.setValue("account_number", loadedData.account_number);
      form.setValue("branch_name", loadedData.branch_name);
      form.setValue("is_primary", loadedData.is_primary);
      form.setValue("swift_code", loadedData.swift_code);
    }
  }, [form]);

  useEffect(() => {
    if (
      !loading &&
      ((effectiveOnboardingStage === "bank_information" &&
        isBackButtonClicked) ||
        hasCompletedStepThree)
    ) {
      fetchBankAccount();
    }
    loadSavedData();
  }, [
    loading,
    user?.onboarding_stage,
    user?.userType,
    farmerProfile?.onboarding_stage,
    isBackButtonClicked,
    hasCompletedStepThree,
    fetchBankAccount,
    loadSavedData,
  ]);

  const onSubmit = async (data: BankInfoFormData) => {
    try {
      setIsSubmitting(true);

      if (
        effectiveOnboardingStage === "bank_information" &&
        !isBackButtonClicked
      ) {
        await apiService().post(
          "/onboarding/seller/bank-information",
          data,
          xfmrId,
        );

        setUser({
          ...user!,
          onboarding_stage: "avatar_image",
        });

        if (farmerProfile) {
          saveToLocalStorage(FARMER_PROFILE_KEY, {
            ...farmerProfile,
            onboarding_stage: "avatar_image",
          });
        }

        saveToLocalStorage(STEP_THREE_KEY, data);
        saveToLocalStorage(HAS_COMPLETED_STEP_THREE_KEY, "true");
        removeFromLocalStorage(BACK_BUTTON_CLICKED_KEY);
        successMessage("Bank details saved successfully!");
        navigate("/onboarding/step-four");
      } else {
        if (!bankAccount?.id) {
          errorMessage({
            success: false,
            error: {
              message: "Something went wrong",
              details: "Something went wrong",
              code: 400,
              hint: "",
            },
          } as APIErrorResponse);
          return;
        }
        await apiService().patch(
          "/sellers/banks/update-bank-information",
          { ...data, id: bankAccount.id },
          xfmrId,
        );

        saveToLocalStorage(STEP_THREE_KEY, data);
        saveToLocalStorage(HAS_COMPLETED_STEP_THREE_KEY, "true");
        removeFromLocalStorage(BACK_BUTTON_CLICKED_KEY);
        saveToLocalStorage(BACK_BUTTON_CLICKED_KEY, "false");
        successMessage("Bank account data updated successfully");
        navigate("/onboarding/step-four");
      }
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    saveToLocalStorage(BACK_BUTTON_CLICKED_KEY, "true");
    saveToLocalStorage(HAS_COMPLETED_STEP_TWO_KEY, "true");
    navigate("/onboarding/step-two");
  };

  const renderSkeletonField = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-8 shadow-lg p-8 rounded-md py-4 bg-white pt-10">
      <div className="mb-10">
        <div className="mb-6">
          <h2 className="text-green-600 font-medium">Step 3</h2>
          <h3 className="text-xl text-gray-900 font-semibold">
            Provide your bank information
          </h3>
          <p className="text-sm text-gray-600">
            Add your banking details for receiving payments from crop sales
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderSkeletonField()}
              {renderSkeletonField()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {renderSkeletonField()}
              {renderSkeletonField()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {renderSkeletonField()}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex flex-row gap-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center gap-4 mb-8 w-full">
        <Button
          type="button"
          variant="outline"
          disabled
          className="flex-1 sm:flex-none"
        >
          <span className="truncate">loading...</span>
        </Button>
        <Button
          type="submit"
          disabled
          className="flex-1 sm:flex-none my-4 sm:my-0"
        >
          <span className="truncate">loading...</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary/5 pt-26">
      <Header />
      <main className="container mx-auto p-2 max-w-5xl">
        <Stepper currentStep={3} />

        <Form {...form}>
          {isLoadingBankData ? (
            renderSkeleton()
          ) : (
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

              <div className="flex justify-between items-center gap-4 mb-8 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none"
                >
                  <span className="truncate">Back</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none my-4 sm:my-0"
                >
                  <span className="inline-flex items-center justify-center w-full">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      "Save and continue"
                    )}
                  </span>
                </Button>
              </div>
            </form>
          )}
        </Form>
      </main>
    </div>
  );
}

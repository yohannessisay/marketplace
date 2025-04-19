/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
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
import {
  bankInfoSchema,
  type BankInfoFormData,
} from "@/types/validation/seller-onboarding";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/layout/header";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";
import { Skeleton } from "@/components/ui/skeleton";
import { APIErrorResponse } from "@/types/api";

const SkeletonBankForm = () => (
  <div className="space-y-8 shadow-lg px-8 rounded-md py-4">
    <div className="mb-10">
      <div className="mb-6">
        <Skeleton className="h-7 w-56" />
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-5 w-28 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-5 w-16 mb-2" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    <div className="flex justify-between mb-8">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

export default function EditBank() {
  const navigation = useNavigate();
  const { id } = useParams();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState<BankInfoFormData | null>(null);
  const { successMessage, errorMessage } = useNotification();
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

  const checkForChanges = useCallback(
    (formValues: BankInfoFormData) => {
      if (!initialData) return;

      const formChanged =
        (formValues.account_holder_name?.trim() || "") !==
          (initialData.account_holder_name || "") ||
        (formValues.bank_name?.trim() || "") !==
          (initialData.bank_name || "") ||
        (formValues.account_number?.trim() || "") !==
          (initialData.account_number || "") ||
        (formValues.branch_name?.trim() || "") !==
          (initialData.branch_name || "") ||
        (formValues.swift_code?.trim() || "") !==
          (initialData.swift_code || "") ||
        formValues.is_primary !== initialData.is_primary;

      setHasChanges(formChanged);
    },
    [initialData],
  );

  const watchedFields = form.watch([
    "account_holder_name",
    "bank_name",
    "account_number",
    "branch_name",
    "swift_code",
    "is_primary",
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      checkForChanges(form.getValues());
    }, 300);
    return () => clearTimeout(timeout);
  }, [watchedFields, checkForChanges, form]);

  useEffect(() => {
    setIsClient(true);
    const fetchBankData = async () => {
      try {
        setIsLoading(true);
        const response: any = await apiService().get(
          `/sellers/banks/get-bank-information?bankId=${id}`,
        );
        const bankData: BankInfoFormData = {
          account_holder_name:
            response.data.bank_account.account_holder_name || "",
          bank_name: response.data.bank_account.bank_name || "",
          account_number: response.data.bank_account.account_number || "",
          branch_name: response.data.bank_account.branch_name || "",
          swift_code: response.data.bank_account.swift_code || "",
          is_primary: response.data.bank_account.is_primary ? "yes" : "no",
        };
        form.reset(bankData);
        setInitialData(bankData);
      } catch (error: any) {
        errorMessage(error as APIErrorResponse);
      } finally {
        setIsLoading(false);
      }
    };

    if (id && !initialData) {
      fetchBankData();
    }
  }, [id, form, errorMessage, initialData]);

  const onSubmit = async (data: BankInfoFormData) => {
    try {
      setIsSubmitting(true);
      await apiService().patch("/sellers/banks/update-bank-information", {
        ...data,
        id: id,
        is_primary: data.is_primary === "yes",
      });
      const updatedData: BankInfoFormData = {
        account_holder_name: data.account_holder_name || "",
        bank_name: data.bank_name || "",
        account_number: data.account_number || "",
        branch_name: data.branch_name || "",
        swift_code: data.swift_code || "",
        is_primary: data.is_primary,
      };
      setInitialData(updatedData);
      form.reset(updatedData);
      setHasChanges(false);
      checkForChanges(updatedData);
      successMessage("Bank details updated successfully!");
      navigation("/seller-dashboard");
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigation("/onboarding/step-two");
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Main Content */}
      <main className="container mx-auto p-6 pt-30">
        {isLoading ? (
          <SkeletonBankForm />
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 shadow-lg px-8 rounded-md py-4"
            >
              <div className="mb-10">
                <div className="mb-6">
                  <h3 className="text-xl text-gray-900 font-semibold">
                    Edit your bank information
                  </h3>
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
                                onValueChange={(value) =>
                                  field.onChange(String(value))
                                }
                                value={field.value}
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

              {/* Navigation Buttons */}
              <div className="flex justify-between mb-8">
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !hasChanges}
                  className="my-4"
                >
                  {isSubmitting ? "Updating..." : "Update bank information"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </main>
    </div>
  );
}

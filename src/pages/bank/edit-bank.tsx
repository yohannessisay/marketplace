/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  bankInfoSchema,
  type BankInfoFormData,
} from "@/types/validation/seller-onboarding";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/layout/header";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";

export default function EditBank() {
  const navigation = useNavigate();
  const { id } = useParams(); // Get bank ID from route params
  const [isClient, setIsClient] = useState(false);
  const { successMessage, errorMessage } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
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

  // Load bank data for editing
  useEffect(() => {
    setIsClient(true);
    const fetchBankData = async () => {
      try {
        const response: any = await apiService().get(
          `/sellers/banks/get-bank-information?bankId=${id}`
        );
        if (response && response.success) {
          form.reset(response.data.bank_account);
        } else {
          errorMessage("Failed to load bank details");
        }
      } catch {
        errorMessage("Error fetching bank details");
      }
    };

    if (id) {
      fetchBankData();
    }
  }, [id]);

  // Handle form submission
  const onSubmit = async (data: BankInfoFormData) => {
    try {
      setIsSubmitting(true);
      const response: any = await apiService().patch(
        "/sellers/banks/update-bank-information",
        { ...data, id: id }
      );
      if (response && response.success) {
        successMessage("Bank details updated successfully!");
        navigation("/seller-dashboard");
      } else {
        errorMessage("Failed to update bank details");
      }
    } catch {
      errorMessage("Something went wrong, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    navigation("/onboarding/step-two");
  };

  if (!isClient) {
    return null; // Prevent hydration errors
  }

  return (
    <div className="min-h-screen bg-white">
      <Header></Header>
      {/* Main Content */}
      <main className="container mx-auto p-6"> 
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 shadow-lg px-8  rounded-md py-4"
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
                              onValueChange={(value) => field.onChange(String(value))} 
                              value={field.value}
                              className="flex gap-4 space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="yes" />
                                </FormControl>
                                <FormLabel className="font-normal">Yes</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="no" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
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
              <Button type="submit" disabled={isSubmitting} className=" my-4">
                {isSubmitting ? "Saving..." : "Save and continue"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

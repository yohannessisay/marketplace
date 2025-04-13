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

export default function StepThree() {
  const navigation = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userProfile: any = getFromLocalStorage("userProfile", {});
  const [isClient, setIsClient] = useState(false);
  const { successMessage, errorMessage } = useNotification();
  // Initialize form with default values or values from local storage
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Load saved data from local storage on component mount
  useEffect(() => {
    setIsClient(true);
    const savedData = getFromLocalStorage<BankInfoFormData>(
      "step-three",
      {} as BankInfoFormData
    );
    if (savedData && Object.keys(savedData).length > 0) {
      form.reset(savedData);
    }
  }, [form]);

  // Handle form submission
  const onSubmit = async (data: BankInfoFormData) => {
    try { 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentStep:any=getFromLocalStorage("current-step", ""); 
      
      if (
        (userProfile.onboardingStage === "bank_information" ||
          userProfile.userType === "agent") &&
          currentStep === "bank_information"
      ) {
        setIsSubmitting(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isAgent: any = getFromLocalStorage("userProfile", {});
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const farmer: any = getFromLocalStorage("farmer-profile", {});
        const response: { success: boolean } = await apiService().post(
          "/onboarding/seller/bank-information",
          data,
          isAgent.userType === "agent" && farmer ? farmer.id : ""
        );
        if (response && response.success) {
          userProfile.onboardingStage = "avatar_image";
          saveToLocalStorage("userProfile", userProfile);
          successMessage("Bank details saved successfully!");
          saveToLocalStorage("step-three", data); 
          saveToLocalStorage("current-step","avatar_image")
          navigation("/onboarding/step-four");
        } else {
          errorMessage("Failed to save farm details");
        }
        setIsSubmitting(false);
      } else {
        navigation("/onboarding/step-four");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch {
      setIsSubmitting(false);
      errorMessage("Failed to save farm details");
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
        <Stepper currentStep={3} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 shadow-lg px-8  rounded-md py-4"
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

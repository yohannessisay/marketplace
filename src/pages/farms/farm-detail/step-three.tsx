"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import Stepper from "@/components/ui/stepper";
import {
  bankInfoSchema,
  type BankInfoFormData,
} from "@/types/validation/seller-onboarding";
import { saveToLocalStorage, getFromLocalStorage } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

export default function StepThree() {
  const navigation = useNavigate();
  const [isClient, setIsClient] = useState(false);

  // Initialize form with default values or values from local storage
  const form = useForm<BankInfoFormData>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues: {
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      branchName: "",
      swiftCode: "",
      routingNumber: "",
      currency: "",
    },
  });

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
  const onSubmit = (data: BankInfoFormData) => {
    saveToLocalStorage("step-three", data);
    navigation("/onboarding/step-four");
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
    {/* Header */}
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-green-800 text-xl font-bold">Afrovalley</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-sm text-green-600 flex items-center">
            <span className="mr-1">🏠</span> My dashboard
          </Link>
          <Link to="/marketplace" className="text-sm text-gray-600 flex items-center">
            <span className="mr-1">🛒</span> Marketplace
          </Link>
          <Link to="/chats" className="text-sm text-gray-600 flex items-center">
            <span className="mr-1">💬</span> Chats
          </Link>
          <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">
            <span>👤</span>
          </div>
        </div>
      </div>
    </header>
    {/* Main Content */}
    <main className="container mx-auto p-6">
      <Stepper currentStep={3} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  <FormField
                    control={form.control}
                    name="accountHolderName"
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
                    name="bankName"
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
                    name="accountNumber"
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
                    name="branchName"
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
                    name="swiftCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SWIFT Code (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="routingNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Routing Number (optional)</FormLabel>
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
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">US Dollar (USD)</SelectItem>
                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                            <SelectItem value="ETB">
                              Ethiopian Birr (ETB)
                            </SelectItem>
                            <SelectItem value="KES">
                              Kenyan Shilling (KES)
                            </SelectItem>
                            <SelectItem value="GBP">
                              British Pound (GBP)
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
            <Button type="submit" >
              Save and continue
            </Button>
          </div>
        </form>
      </Form>
    </main>
    </div>
  );
}

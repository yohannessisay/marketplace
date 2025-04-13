import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";
import Header from "@/components/layout/header";
import { FileUpload } from "@/components/common/file-upload";
import { buyerOnboardingSchema } from "@/types/validation/buyer";
import { Textarea } from "@/components/ui/textarea";
import { getFromLocalStorage, saveToLocalStorage } from "@/lib/utils";

type CompanyDetails = z.infer<typeof buyerOnboardingSchema>;

export default function CompanyVerification() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { successMessage, errorMessage } = useNotification();
  const [files, setFiles] = useState<File[]>([]);
  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userProfile: any = getFromLocalStorage("userProfile",{});
  const navigate = useNavigate();
  // Initialize form with default values
  const form = useForm<CompanyDetails>({
    resolver: zodResolver(buyerOnboardingSchema),
    defaultValues: {
      company_name: "",
      country: "",
      position: "",
      website_url: "",
      company_address: "",
      telegram: "",
      about_me: "",
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CompanyDetails) => {
    setIsSubmitting(true);

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    files.forEach((file) => {
      formData.append(`files`, file);
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await apiService().postFormData(
        "/onboarding/buyer/complete-onboarding",
        formData,
        true
      );

      if (response && response.success) {
        navigate("/home");
        saveToLocalStorage("userProfile", {
          ...userProfile,
          onboardingStage: "complete",
        });
        successMessage(
          "Your company verification has been submitted successfully."
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      errorMessage(
        "There was an error submitting your verification. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary/5 p-8">
      {/* Header */}
      <Header></Header>
      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <div className="text-sm font-medium text-gray-500">Step 1</div>
                <CardTitle>Company registration document</CardTitle>
                <CardDescription>
                  Upload a clear farm registration land rights document. Make
                  sure text is readable and high-quality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* File upload area */}
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  maxFiles={5}
                  maxSizeMB={5}
                />

                {/* File preview */}
                {files.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Selected files:
                    </h3>
                    <ul className="space-y-2">
                      {files.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                        >
                          <span className="text-sm truncate max-w-[80%]">
                            {file.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <div className="text-sm font-medium text-gray-500">Step 2</div>
                <CardTitle>Company details</CardTitle>
                <CardDescription>
                  Check and fill in details about your company, position and
                  website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Company name<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Company" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Country<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Your position in company
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website or social media link</FormLabel>
                        <FormControl>
                          <Input placeholder="company@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>
                          Company address<span className="text-red-500">*</span>
                        </FormLabel>

                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telegram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telegram</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="about_me"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About Me</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Send"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";
import { APIErrorResponse } from "@/types/api";
import { saveToLocalStorage, getFromLocalStorage } from "@/lib/utils";
import { buyerOnboardingSchema } from "@/types/validation/buyer";
import { z } from "zod";
import { FileUpload } from "@/components/common/file-upload";
import Header from "@/components/layout/header";

type CompanyDetails = z.infer<typeof buyerOnboardingSchema>;

export default function CompanyVerification() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { successMessage, errorMessage } = useNotification();
  const [files, setFiles] = useState<File[]>([]);
 
  const navigate = useNavigate();
  const userProfile: any = getFromLocalStorage("userProfile", {});
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
      await apiService().postFormData(
        "/onboarding/buyer/complete-onboarding",
        formData,
        true,
      );
      saveToLocalStorage("current-step", "completed");
      saveToLocalStorage("userProfile", {
        ...userProfile,
        onboarding_stage: "completed",
      });
      successMessage(
        "Your company verification has been submitted successfully.",
      );
      navigate("/market-place");
    } catch (error) {
      console.error("Error submitting form:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary/5 p-8">
      {/* Header */}
      <Header />
      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8 mt-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1 */}
            <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Upload grading report</CardTitle>
                    <CardDescription>
                      Upload an image. Drag and drop or
                      click to select a file.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFilesSelected={(files) => {
                        setFiles(files);
                      }}
                      maxFiles={5}
                      maxSizeMB={5}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      {files.length > 0
                        ? files.length + " files selected"
                        : "No file selected"}
                    </div>
                  </CardFooter>
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

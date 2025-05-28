import { useState, useCallback } from "react";
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
import { buyerOnboardingSchema } from "@/types/validation/buyer";
import { z } from "zod";
import { FileUpload } from "@/components/common/file-upload";
import Header from "@/components/layout/header";
import { useAuth } from "@/hooks/useAuth";
import ConfirmationModal from "@/components/modals/ConfrmationModal";
import { Loader2 } from "lucide-react";

type CompanyDetails = z.infer<typeof buyerOnboardingSchema>;

export default function CompanyVerification() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { successMessage, errorMessage } = useNotification();
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  const { setUser } = useAuth();

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

  const onSubmit = useCallback(
    async (data: CompanyDetails) => {
      setIsSubmitting(true);

      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      files.forEach((file) => {
        formData.append("company_registration", file);
      });

      try {
        const response: any = await apiService().postFormData(
          "/onboarding/buyer/complete-onboarding",
          formData,
          true,
        );

        setUser({ ...response.data.buyer });

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
    },
    [files, setUser, successMessage, errorMessage, navigate],
  );

  const handleFormSubmit = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleModalConfirm = useCallback(() => {
    form.handleSubmit(onSubmit)();
    setIsModalOpen(false);
  }, [form, onSubmit]);

  const handleModalCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-primary/5 px-4 sm:px-6 lg:px-8 py-6">
      <Header />
      <main className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-10 mt-12 sm:mt-8 lg:mt-10">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6 sm:space-y-8"
          >
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">
                  Upload Company KYC Documents
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Upload an image. Drag and drop or click to select a file.
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
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {files.length > 0
                    ? `${files.length} files selected`
                    : "No file selected"}
                </div>
              </CardFooter>
            </Card>

            {/* Step 2 - Company Details */}
            <Card className="w-full">
              <CardHeader>
                <div className="text-xs sm:text-sm font-medium text-gray-500">
                  Step 2
                </div>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">
                  Company Details
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Check and fill in details about your company, position, and
                  website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">
                          Company name<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Company"
                            {...field}
                            className="text-sm sm:text-base"
                          />
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
                        <FormLabel className="text-sm sm:text-base">
                          Country<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="text-sm sm:text-base" />
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
                        <FormLabel className="text-sm sm:text-base">
                          Your position in company
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="text-sm sm:text-base" />
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
                        <FormLabel className="text-sm sm:text-base">
                          Website or social media link
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://company.com"
                            {...field}
                            className="text-sm sm:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-sm sm:text-base">
                          Company address<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="text-sm sm:text-base" />
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
                        <FormLabel className="text-sm sm:text-base">
                          Telegram
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="text-sm sm:text-base" />
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
                        <FormLabel className="text-sm sm:text-base">
                          About Me
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="text-sm sm:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={handleModalCancel}
          title="Confirm Company Verification"
          message="Once submitted, you cannot edit the data you have entered until you submit an edit request. Please ensure all information is correct before proceeding."
          confirmText="Proceed"
          cancelText="Cancel"
          onConfirm={handleModalConfirm}
          isDestructive={false}
        />
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";
import { FileUpload } from "@/components/common/file-upload";
import { buyerOnboardingSchema } from "@/types/validation/buyer";
import { getFromLocalStorage, saveToLocalStorage } from "@/lib/utils";
import { APIErrorResponse } from "```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Upload, User, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { useAuth } from "@/hooks/useAuth";
import { APIErrorResponse } from "@/types/api";
import { saveToLocalStorage, getFromLocalStorage } from "@/lib/utils";
import { USER_PROFILE_KEY } from "@/types/constants";
import Header from "@/components/layout/header";
import { buyerOnboardingSchema as baseBuyerOnboardingSchema } from "@/types/validation/buyer";
import { z } from "zod";

// Extend buyerOnboardingSchema to include avatar_url
const buyerOnboardingSchema = baseBuyerOnboardingSchema.extend({
  avatar_url: z.string().url().optional().or(z.literal("")),
});

type ProfileInfoFormData = z.infer<typeof buyerOnboardingSchema>;

export default function SettingsPage() {
  const navigate = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState<ProfileInfoFormData | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const { successMessage, errorMessage } = useNotification();
  const { user: userProfile } = useAuth();

  const form = useForm<ProfileInfoFormData>({
    resolver: zodResolver(buyerOnboardingSchema),
    defaultValues: {
      company_name: userProfile?.company_name || "",
      country: userProfile?.country || "",
      position: userProfile?.position || "",
      website_url: userProfile?.website_url || "",
      company_address: userProfile?.company_address || "",
      telegram: userProfile?.telegram || "",
      about_me: userProfile?.about_me || "",
      avatar_url: userProfile?.avatar_url || "",
    },
  });

  const fetchProfileData = useCallback(async () => {
    try {
      const response: any = await apiService().get("/onboarding/buyer/get-profile");
      if (response.success && response.data) {
        const { user } = response.data;
        const profileData: ProfileInfoFormData = {
          company_name: user.company_name || "",
          country: user.country || "",
          position: user.position || "",
          website_url: user.website_url || "",
          company_address: user.company_address || "",
          telegram: user.telegram || "",
          about_me: user.about_me || "",
          avatar_url: user.avatar_url || "",
        };
        if (!initialData) {
          form.reset(profileData);
          setInitialData(profileData);
          setProfileImage(user.avatar_url || null);
        }
      }
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    }
  }, [form, errorMessage, initialData]);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    const file = selectedFiles[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      errorMessage({ error: { message: "Invalid file type. Please upload JPEG, PNG, or GIF." } });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      errorMessage({ error: { message: "File size exceeds 5MB limit." } });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiService().post("/onboarding/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const avatarUrl = response.data.avatar_url;
      form.setValue("avatar_url", avatarUrl);
      setProfileImage(avatarUrl);
      saveToLocalStorage("profile-image", avatarUrl);
      setFiles([file]);
      checkForChanges(form.getValues(), true);
      successMessage("Profile picture uploaded successfully.");
    } catch (error) {
      console.error("Error uploading image:", error);
      errorMessage(error as APIErrorResponse);
    }
  };

  const checkForChanges = useCallback(
    (formValues: ProfileInfoFormData, imageChanged: boolean = false) => {
      if (!initialData) return;

      const formChanged =
        (formValues.company_name?.trim() || "") !== (initialData.company_name || "") ||
        (formValues.country?.trim() || "") !== (initialData.country || "") ||
        (formValues.position?.trim() || "") !== (initialData.position || "") ||
        (formValues.website_url?.trim() || "") !== (initialData.website_url || "") ||
        (formValues.company_address?.trim() || "") !== (initialData.company_address || "") ||
        (formValues.telegram?.trim() || "") !== (initialData.telegram || "") ||
        (formValues.about_me?.trim() || "") !== (initialData.about_me || "");

      const hasImageChange = imageChanged || files.length > 0;

      setHasChanges(formChanged || hasImageChange);
    },
    [initialData, files],
  );

  const watchedFields = form.watch([
    "company_name",
    "country",
    "position",
    "website_url",
    "company_address",
    "telegram",
    "about_me",
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      checkForChanges(form.getValues());
    }, 300);
    return () => clearTimeout(timeout);
  }, [watchedFields, checkForChanges, form]);

  useEffect(() => {
    setIsClient(true);
    const storedImage = getFromLocalStorage("profile-image", null);
    if (storedImage) {
      setProfileImage(storedImage);
    }
    if (!initialData) {
      fetchProfileData();
    }
  }, [fetchProfileData, initialData]);

  const onSubmit = async (data: ProfileInfoFormData) => {
    if (!initialData) {
      errorMessage({
        success: false,
        error: {
          message: "Profile data not loaded",
          details: "Please wait for profile data to load",
          code: 400,
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const fieldsToSend: Partial<ProfileInfoFormData> = {
        company_name: data.company_name?.trim() || initialData.company_name || "",
        country: data.country?.trim() || initialData.country || "",
        position: data.position?.trim() || initialData.position || "",
        website_url: data.website_url?.trim() || initialData.website_url || "",
        company_address: data.company_address?.trim() || initialData.company_address || "",
        telegram: data.telegram?.trim() || initialData.telegram || "",
        about_me: data.about_me?.trim() || initialData.about_me || "",
        avatar_url: data.avatar_url || initialData.avatar_url || "",
      };

      for (const key in fieldsToSend) {
        if (Object.prototype.hasOwnProperty.call(fieldsToSend, key)) {
          const value = fieldsToSend[key as keyof ProfileInfoFormData]!;
          formData.append(key, value);
        }
      }

      if (files.length > 0) {
        formData.append("avatar", files[0]);
      }

      if (!hasChanges) {
        console.log("No changes detected, aborting submission");
        return;
      }

      await apiService().patchFormData("/onboarding/buyer/update-profile", formData);

      saveToLocalStorage(USER_PROFILE_KEY, {
        ...userProfile,
        ...fieldsToSend,
        onboarding_stage: "completed",
      });

      successMessage("Profile updated successfully!");
      setHasChanges(false);
      navigate("/buyer-dashboard");
    } catch (error: any) {
      console.error("Submission error:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sidebarItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary/5">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 pt-30">
        {/* Sidebar */}
        <Card className="md:w-1/4 shadow-lg border border-green-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800">
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center cursor-pointer gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-green-100 text-green-800 border-l-4 border-green-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:w-3/4">
          {activeTab === "profile" && (
            <Card className="shadow-lg border border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Edit Profile
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Update your company and personal details below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="md:col-span-1">
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                          <div className="mb-4 text-center">
                            <h4 className="font-medium mb-2">Profile Photo</h4>
                            <p className="text-sm text-gray-500">
                              Upload a clear photo or logo
                            </p>
                          </div>
                          <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden border-2 border-green-200">
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-20 h-20 text-gray-400" />
                            )}
                          </div>
                          <label
                            htmlFor="profile-image"
                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Upload className="h-5 w-5" />
                            Upload Photo
                          </label>
                          <Input
                            id="profile-image"
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/gif"
                            onChange={(e) => {
                              const selectedFiles = Array.from(
                                e.target.files || [],
                              );
                              handleFilesSelected(selectedFiles);
                            }}
                          />
                        </CardContent>
                      </Card>
                      <Card className="md:col-span-2">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="company_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Company Name
                                    <span className="text-red-500">*</span>
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
                                    Country
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="USA" {...field} />
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
                                    Your Position
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="CEO" {...field} />
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
                                  <FormLabel>Website or Social Media</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://example.com"
                                      {...field}
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
                                <FormItem className="md:col-span-2">
                                  <FormLabel>
                                    Company Address
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="123, Address, Country"
                                      {...field}
                                    />
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
                                    <Input placeholder="@buyer" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="mt-6">
                            <FormField
                              control={form.control}
                              name="about_me"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>About Me</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Tell us about yourself..."
                                      className="min-h-[120px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form.reset(initialData || {});
                          setProfileImage(initialData?.avatar_url || null);
                          setFiles([]);
                          setHasChanges(false);
                        }}
                        disabled={isSubmitting || !hasChanges}
                      >
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !hasChanges || !initialData}
                      >
                        {isSubmitting ? "Updating..." : "Update Profile"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {activeTab === "account" && (
            <Card className="shadow-lg border border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Account
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your account settings (coming soon).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  This section will allow you to manage your account details,
                  such as email, password, and security settings. Stay tuned for
                  updates!
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="shadow-lg border border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Notifications
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Configure your notification preferences (coming soon).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  This section will allow you to set preferences for email, SMS,
                  and in-app notifications. Stay tuned for updates!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}";
import { USER_PROFILE_KEY } from "@/types/constants";
import { CheckCircle } from "lucide-react";

type CompanyDetails = z.infer<typeof buyerOnboardingSchema>;

export default function CompanyVerification() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { successMessage, errorMessage } = useNotification();
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  const userProfile: any = getFromLocalStorage(USER_PROFILE_KEY, {});

  useEffect(() => {
    if (userProfile?.onboarding_stage === "completed") {
      setShowConfirmation(true);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/market-place");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [userProfile, navigate]);

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

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

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
      await apiService().postFormData(
        "/onboarding/buyer/complete-onboarding",
        formData,
        true,
      );
      saveToLocalStorage("current-step", "completed");
      saveToLocalStorage(USER_PROFILE_KEY, {
        ...userProfile,
        onboarding_stage: "completed",
      });
      successMessage(
        "Your company verification has been submitted successfully.",
      );
      setShowConfirmation(true);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/market-place");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } catch (error) {
      console.error("Error submitting form:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border border-green-200">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Onboarding Completed!
            </h2>
            <p className="text-gray-600 mb-4">
              Congratulations! You've successfully completed the onboarding
              process. You'll be redirected to the marketplace in{" "}
              <span className="font-semibold text-green-600">{countdown}</span>{" "}
              seconds.
            </p>
            <Button onClick={() => navigate("/market-place")}>
              Go to Marketplace Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary/5">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <div className="text-sm font-medium text-gray-500">Step 1</div>
                <CardTitle>Company registration document</CardTitle>
                <CardDescription>
                  Upload a clear company registration document. Make sure text
                  is readable and high-quality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFilesSelected={(selectedFiles: File[]) => {
                    handleFilesSelected(selectedFiles);
                    if (selectedFiles.length > 0) {
                      form.setValue("files", selectedFiles[0]);
                      form.clearErrors("files");
                    }
                  }}
                  maxFiles={5}
                  maxSizeMB={5}
                />

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
                            onClick={() => {
                              removeFile(index);
                              if (index === 0) {
                                form.setValue(
                                  "files",
                                  undefined as unknown as File,
                                );
                                form.setError("files", {
                                  message: "File is required",
                                });
                              }
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="files"
                  render={({ fieldState }) => (
                    <FormItem>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-sm font-medium text-gray-500">Step 2</div>
                <CardTitle className="mt-1">Company details</CardTitle>
                <CardDescription className="mt-2">
                  Check and fill in details about your company, position, and
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
                          <Input placeholder="USA" {...field} />
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
                          <Input placeholder="CEO" {...field} />
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
                          <Input placeholder="https://buyer.com" {...field} />
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
                          <Input
                            placeholder="123, Address, Country"
                            {...field}
                          />
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
                          <Input {...field} placeholder="@buyer" />
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
                          <Textarea
                            placeholder="Tell us more about yourself"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Complete Registration"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

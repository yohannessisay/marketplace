"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Upload, User, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import Stepper from "@/components/ui/stepper";
import {
  profileInfoSchema,
  type ProfileInfoFormData,
} from "@/types/validation/seller-onboarding";
import { getFromLocalStorage, saveToLocalStorage } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/header";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";
import { useAuth } from "@/hooks/useAuth";
import { APIErrorResponse } from "@/types/api";
import ConfirmationModal from "@/components/modals/ConfrmationModal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BACK_BUTTON_CLICKED_KEY,
  FARMER_PROFILE_KEY,
  HAS_COMPLETED_STEP_THREE_KEY,
  STEP_FOUR_KEY,
  USER_PROFILE_KEY,
} from "@/types/constants";

interface ProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  telegram?: string;
  about_me?: string;
  address?: string;
}

export default function StepFour() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [hasSelectedFile, setHasSelectedFile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { successMessage, errorMessage } = useNotification();
  const { user, setUser, loading } = useAuth();

  const farmerProfile: any = useMemo(
    () => getFromLocalStorage(FARMER_PROFILE_KEY, {}),
    [],
  );

  const profileSource = useMemo(
    () =>
      (user && user.userType === "agent"
        ? farmerProfile
        : user || {}) as ProfileData,
    [user, farmerProfile],
  );

  const xfmrId = farmerProfile.id ?? "";

  const isBackButtonClicked = useMemo(
    () => getFromLocalStorage(BACK_BUTTON_CLICKED_KEY, {}) === "true",
    [],
  );

  const form = useForm<ProfileInfoFormData>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      first_name: profileSource.first_name || "",
      last_name: profileSource.last_name || "",
      email: profileSource.email || "",
      phone: profileSource.phone || "",
      telegram: "",
      about_me: "",
      address: "",
    },
  });

  useEffect(() => {
    const savedData: any = getFromLocalStorage(STEP_FOUR_KEY, null);
    if (savedData && !loading && !form.formState.isDirty) {
      form.reset({
        first_name: profileSource.first_name || "",
        last_name: profileSource.last_name || "",
        email: profileSource.email || "",
        phone: profileSource.phone || "",
        telegram: savedData.telegram || "",
        about_me: savedData.about_me || "",
        address: savedData.address || "",
      });
      if (savedData.profileImage) {
        setProfileImage(savedData.profileImage);
        setHasSelectedFile(savedData.hasSelectedFile || false);
      }
    } else if (profileSource && !loading && !form.formState.isDirty) {
      form.reset({
        first_name: profileSource.first_name || "",
        last_name: profileSource.last_name || "",
        email: profileSource.email || "",
        phone: profileSource.phone || "",
        telegram: profileSource.telegram || "",
        about_me: profileSource.about_me || "",
        address: profileSource.address || "",
      });
    }
  }, [profileSource, form, loading]);

  const handleFilesSelected = useCallback(
    (selectedFiles: File[]) => {
      const file = selectedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          setProfileImage(imageUrl);
          setHasSelectedFile(true);
          saveToLocalStorage(STEP_FOUR_KEY, {
            ...form.getValues(),
            profileImage: imageUrl,
            hasSelectedFile: true,
          });
        };
        reader.readAsDataURL(file);
        setFiles([file]);
      }
    },
    [form],
  );

  const clearLocalStorageExcept = useCallback((keysToKeep: string[]) => {
    const keptData: { [key: string]: any } = {};
    keysToKeep.forEach((key) => {
      const data = localStorage.getItem(key);
      if (data) {
        keptData[key] = data;
      }
    });
    localStorage.clear();
    Object.keys(keptData).forEach((key) => {
      localStorage.setItem(key, keptData[key]);
    });
  }, []);

  const onSubmit = useCallback(
    async (data: ProfileInfoFormData) => {
      if (files.length === 0 && !hasSelectedFile) {
        errorMessage({
          success: false,
          error: {
            message: "Profile photo is required",
            details: "Please upload a profile photo to complete registration.",
            code: 400,
          },
        });
        setIsSubmitting(false);
        return;
      }

      try {
        setIsSubmitting(true);
        const formData = new FormData();
        const editableFields: (keyof ProfileInfoFormData)[] = [
          "first_name",
          "last_name",
          "telegram",
          "address",
          "about_me",
        ];
        for (const key of editableFields) {
          formData.append(key, String(data[key]));
        }
        files.forEach((file) => {
          formData.append("avatar_image", file);
        });

        const response: any = await apiService().postFormData(
          "/onboarding/seller/profile",
          formData,
          true,
          xfmrId,
        );

        if (user && user.userType === "agent" && farmerProfile) {
          saveToLocalStorage(FARMER_PROFILE_KEY, {
            ...farmerProfile,
            onboarding_stage: "completed",
            avatar_url: response.data.profile.avatar_image.url,
            telegram: response.data.profile.telegram,
            address: response.data.profile.address,
            about_me: response.data.profile.about_me,
          });
        } else {
          setUser({
            ...user!,
            onboarding_stage: "completed",
            avatar_url: response.data.profile.avatar_image.url,
            telegram: response.data.profile.telegram,
            address: response.data.profile.address,
            about_me: response.data.profile.about_me,
          });
        }

        successMessage("Registration completed successfully!");
        clearLocalStorageExcept([FARMER_PROFILE_KEY, USER_PROFILE_KEY]);
        navigate("/seller-dashboard");
      } catch (error: any) {
        console.error("Submission error:", error);
        errorMessage(error as APIErrorResponse);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      files,
      hasSelectedFile,
      user,
      farmerProfile,
      xfmrId,
      setUser,
      successMessage,
      errorMessage,
      clearLocalStorageExcept,
      navigate,
    ],
  );

  const handleFormSubmit = useCallback(() => {
    const formData = form.getValues();
    saveToLocalStorage(STEP_FOUR_KEY, {
      first_name: formData.first_name,
      last_name: formData.last_name,
      telegram: formData.telegram,
      address: formData.address,
      about_me: formData.about_me,
      profileImage: profileImage,
      hasSelectedFile,
    });
    setIsModalOpen(true);
  }, [form, profileImage, hasSelectedFile]);

  const handleModalConfirm = useCallback(() => {
    form.handleSubmit(onSubmit)();
  }, [form, onSubmit]);

  const handleModalCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const goBack = useCallback(() => {
    const formData = form.getValues();
    saveToLocalStorage(STEP_FOUR_KEY, {
      first_name: formData.first_name,
      last_name: formData.last_name,
      telegram: formData.telegram,
      address: formData.address,
      about_me: formData.about_me,
      profileImage: profileImage,
      hasSelectedFile,
    });
    saveToLocalStorage(HAS_COMPLETED_STEP_THREE_KEY, "true");
    saveToLocalStorage(BACK_BUTTON_CLICKED_KEY, "true");
    navigate("/onboarding/step-three");
  }, [form, profileImage, hasSelectedFile, navigate]);

  const renderSkeletonField = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-8 shadow-lg px-8 rounded-md py-4">
      <div className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderSkeletonField()}
                {renderSkeletonField()}
                {renderSkeletonField()}
                {renderSkeletonField()}
                {renderSkeletonField()}
                {renderSkeletonField()}
              </div>
              <div className="mt-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
      <main className="container mx-auto p-3 max-w-5xl">
        <Stepper currentStep={4} />

        <Form {...form}>
          {isBackButtonClicked ? (
            renderSkeleton()
          ) : (
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-8 shadow-lg px-8 rounded-md py-4"
            >
              <div className="mb-10">
                <div className="mb-6">
                  <h2 className="text-green-600 font-medium">Step 4</h2>
                  <h3 className="text-xl text-gray-900 font-semibold">
                    Complete your profile
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add your personal information and profile photo
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-1">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 text-center">
                          <h4 className="font-medium mb-2">Profile Photo</h4>
                          <p className="text-sm text-gray-500">
                            Upload a clear photo of yourself
                          </p>
                        </div>

                        <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden">
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
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Upload className="w-4 h-4" />
                            <span>Upload photo</span>
                          </div>
                          <Input
                            id="profile-image"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const selectedFiles = Array.from(
                                e.target.files || [],
                              );
                              handleFilesSelected(selectedFiles);
                            }}
                          />
                        </label>

                        {profileImage &&
                          files.length === 0 &&
                          hasSelectedFile && (
                            <Alert
                              variant="destructive"
                              className="mt-4 bg-red-50 border-red-200 rounded-lg"
                            >
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-red-700 text-xs">
                                Please re-upload your profile photo to complete
                                registration.
                              </AlertDescription>
                            </Alert>
                          )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" disabled />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} type="tel" disabled />
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
                              <FormLabel>Telegram Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Tell us about yourself and your farm..."
                                  className="min-h-[120px]"
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
                        <span>Completing Registration...</span>
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </span>
                </Button>
              </div>
            </form>
          )}
        </Form>

        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={handleModalCancel}
          title="Confirm Registration"
          message="Once submitted, you cannot edit the data you have entered so far until you submit an edit request. Please ensure all information across all steps is correct before proceeding."
          confirmText="Proceed"
          cancelText="Cancel"
          onConfirm={handleModalConfirm}
          isDestructive={false}
        />
      </main>
    </div>
  );
}

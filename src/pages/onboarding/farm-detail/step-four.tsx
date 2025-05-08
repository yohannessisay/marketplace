"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Upload, User } from "lucide-react";

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
import Stepper from "@/components/ui/stepper";
import {
  profileInfoSchema,
  type ProfileInfoFormData,
} from "@/types/validation/seller-onboarding";
import { getFromLocalStorage, removeFromLocalStorage } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/header";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";
import { useAuth } from "@/hooks/useAuth";
import { APIErrorResponse } from "@/types/api";

interface ProfileInfo {
  id: string;
  telegram: string;
  about_me: string;
  address: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export default function StepFour() {
  const navigation = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | undefined>();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const { user, setUser, isAuthenticated } = useAuth();
  const { successMessage, errorMessage } = useNotification();
  const farmerProfile: any = getFromLocalStorage("farmerProfile", {});

  console.log("Auth State:", { user, isAuthenticated, farmerProfile });

  const form = useForm<ProfileInfoFormData>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      telegram: "",
      about_me: "",
      address: "",
    },
  });

  const fetchProfileInfo = async () => {
    try {
      console.log("Fetching profile info for:", { user, farmerProfile });
      const response: any = await apiService().get(
        "/onboarding/seller/get-profile",
        user?.userType === "agent" ? farmerProfile?.id : "",
      );
      setProfileInfo(response.data.profile);
      form.reset({
        telegram: response.data.profile.telegram || "",
        about_me: response.data.profile.about_me || "",
        address: response.data.profile.address || "",
      });
      if (response.data.profile.avatar_url) {
        setProfileImage(response.data.profile.avatar_url);
        localStorage.setItem("profile-image", response.data.profile.avatar_url);
      }
    } catch (error: any) {
      console.error("Failed to fetch profile info:", error);
      errorMessage(error as APIErrorResponse);
    }
  };

  const loadSavedData = () => {
    const savedData = getFromLocalStorage("step-four", {});
    if (Object.keys(savedData).length > 0) {
      const loadedData: ProfileInfoFormData = {
        telegram: (savedData as any).telegram || "",
        about_me: (savedData as any).about_me || "",
        address: (savedData as any).address || "",
      };
      form.setValue("telegram", loadedData.telegram);
      form.setValue("about_me", loadedData.about_me);
      form.setValue("address", loadedData.address);
      const savedImage = localStorage.getItem("profile-image");
      if (savedImage) {
        setProfileImage(savedImage);
      }
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (user) {
      const isBackButtonClicked =
        getFromLocalStorage("back-button-clicked", {}) === "true";
      const effectiveOnboardingStage =
        user.userType === "agent" && farmerProfile?.id
          ? farmerProfile.onboarding_stage
          : user.onboarding_stage;

      if (effectiveOnboardingStage === "completed" && isBackButtonClicked) {
        fetchProfileInfo();
      }
      loadSavedData();
    } else {
      console.warn("No user found in auth context");
    }
  }, [user, form]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    const file = selectedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setProfileImage(imageUrl);
        localStorage.setItem("profile-image", imageUrl);
      };
      reader.readAsDataURL(file);
    }
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const onSubmit = async (data: ProfileInfoFormData) => {
    try {
      setIsSubmitting(true);

      if (
        user?.onboarding_stage === "avatar_image" ||
        user?.userType === "agent"
      ) {
        const formData = new FormData();
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            formData.append(
              key,
              String(data[key as keyof ProfileInfoFormData]),
            );
          }
        }
        files.forEach((file) => {
          formData.append("files", file);
        });

        await apiService().postFormData(
          "/onboarding/seller/profile",
          formData,
          true,
          user?.userType === "agent" && farmerProfile ? farmerProfile.id : "",
        );

        removeFromLocalStorage("step-one");
        removeFromLocalStorage("step-two");
        removeFromLocalStorage("step-three");
        removeFromLocalStorage("step-four");
        removeFromLocalStorage("bank-id");
        removeFromLocalStorage("farm-id");
        removeFromLocalStorage("crop-id");
        removeFromLocalStorage("back-button-clicked");
        removeFromLocalStorage("current-step");
        removeFromLocalStorage("profile-image");
        removeFromLocalStorage("userProfile");
        setUser({
          ...user!,
          onboarding_stage: "completed",
        });
        successMessage("Registration completed successfully!");
        navigation("/seller-dashboard");
      } else {
        const formData = new FormData();
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            formData.append(
              key,
              String(data[key as keyof ProfileInfoFormData]),
            );
          }
        }
        files.forEach((file) => {
          formData.append("files", file);
        });
        formData.append("id", profileInfo?.id || "");

        await apiService().patchFormData(
          "/sellers/profile/update-profile",
          formData,
          true,
          user?.userType === "agent" && farmerProfile ? farmerProfile.id : "",
        );

        successMessage("Profile data updated successfully");
        navigation("/seller-dashboard");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    localStorage.setItem("back-button-clicked", "true");
    navigation("/onboarding/step-three");
  };

  if (!isClient) {
    return null; // Prevent hydration errors
  }

  return (
    <div className="min-h-screen bg-primary/5 pt-26">
      <Header />
      <main className="container mx-auto p-4 max-w-5xl">
        <Stepper currentStep={4} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
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
                            src={profileImage || "/placeholder.svg"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-20 h-20 text-gray-400" />
                        )}
                      </div>

                      <label htmlFor="profile-image" className="cursor-pointer">
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
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

            <div className="flex justify-between mb-8">
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting} className="my-4">
                {isSubmitting ? "Registering..." : "Complete Registration"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

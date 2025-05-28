"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import {
  profileInfoSchema,
  type ProfileInfoFormData,
} from "@/types/validation/seller-onboarding";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";
import { useAuth } from "@/hooks/useAuth";
import { APIErrorResponse } from "@/types/api";
import { getFromLocalStorage } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { FARMER_PROFILE_KEY } from "@/types/constants";

const SkeletonProfileForm = () => (
  <div className="space-y-6 px-4 sm:px-8 py-4 rounded-md shadow-lg">
    <div className="mb-6 sm:mb-10">
      <Skeleton className="h-6 sm:h-7 w-40 sm:w-48" />
    </div>
    <div className="space-y-6 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-6">
      <Card className="md:col-span-1">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 text-center">
              <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 mb-2" />
              <Skeleton className="h-4 w-32 sm:w-40" />
            </div>
            <Skeleton className="w-24 sm:w-40 h-24 sm:h-40 rounded-full mb-4" />
            <Skeleton className="h-5 w-24 sm:w-28" />
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-6">
            <div>
              <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="mt-4 sm:mt-6">
            <Skeleton className="h-4 sm:h-5 w-12 mb-2" />
            <Skeleton className="h-20 sm:h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
    <div className="flex justify-end mt-6 sm:mb-8">
      <Skeleton className="h-10 w-28 sm:w-32" />
    </div>
  </div>
);

interface ProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  telegram?: string;
  about_me?: string;
  address?: string;
}

export default function EditProfile() {
  const navigation = useNavigate();
  const { successMessage, errorMessage } = useNotification();
  const [isClient, setIsClient] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<ProfileInfoFormData | null>(
    null,
  );
  const { user, setUser } = useAuth();

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

  const form = useForm<ProfileInfoFormData>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      telegram: "",
      about_me: "",
      address: "",
      avatar_url: "",
    },
  });

  const fetchProfileData = useCallback(async () => {
    try {
      if (!user) {
        return;
      }

      const farmerId =
        user.userType === "agent" ? farmerProfile?.id : undefined;

      const response: any = await apiService().get(
        "/onboarding/seller/get-profile",
        farmerId,
      );
      if (response.success && response.data) {
        const { profile } = response.data;
        const profileData: ProfileInfoFormData = {
          first_name: profileSource.first_name || "",
          last_name: profileSource.last_name || "",
          email: profileSource.email || "",
          phone: profileSource.phone || "",
          telegram: profile.telegram || "",
          about_me: profile.about_me || "",
          address: profile.address || "",
          avatar_url: profile.avatar_url || "",
        };
        if (!initialData) {
          form.reset(profileData);
          setInitialData(profileData);
          setProfileImage(profile.avatar_url || null);
        }
      }
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    }
  }, [form, errorMessage, initialData, user, farmerProfile]);

  const handleFileSelected = (selectedFiles: File[]) => {
    const selectedFile = selectedFiles[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setProfileImage(imageUrl);
        setFile(selectedFile);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (!initialData) {
      fetchProfileData();
    }
  }, [fetchProfileData, initialData]);

  const onSubmit = async (data: ProfileInfoFormData) => {
    try {
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
      const formData = new FormData();

      const fieldsToSend: Partial<ProfileInfoFormData> = {};
      if (
        data.first_name?.trim() &&
        data.first_name !== initialData.first_name
      ) {
        fieldsToSend.first_name = data.first_name.trim();
      }
      if (data.last_name?.trim() && data.last_name !== initialData.last_name) {
        fieldsToSend.last_name = data.last_name.trim();
      }
      if (data.email?.trim() && data.email !== initialData.email) {
        fieldsToSend.email = data.email.trim();
      }
      if (data.phone?.trim() && data.phone !== initialData.phone) {
        fieldsToSend.phone = data.phone.trim();
      }
      if (data.telegram?.trim() && data.telegram !== initialData.telegram) {
        fieldsToSend.telegram = data.telegram.trim();
      }
      if (data.about_me?.trim() && data.about_me !== initialData.about_me) {
        fieldsToSend.about_me = data.about_me.trim();
      }
      if (data.address?.trim() && data.address !== initialData.address) {
        fieldsToSend.address = data.address.trim();
      }

      for (const key in fieldsToSend) {
        if (Object.prototype.hasOwnProperty.call(fieldsToSend, key)) {
          const value = fieldsToSend[key as keyof ProfileInfoFormData]!;
          formData.append(key, value);
        }
      }

      if (file) {
        formData.append("avatar_image", file);
      }

      if (!user) {
        return;
      }

      const farmerId =
        user.userType === "agent" ? farmerProfile?.id : undefined;

      const response: any = await apiService().patchFormData(
        "/sellers/profile/update-profile",
        formData,
        true,
        farmerId,
      );

      if (response.success && response.data) {
        const updatedUser = {
          ...user,
          first_name: fieldsToSend.first_name || user.first_name || "",
          last_name: fieldsToSend.last_name || user.last_name || "",
          email: fieldsToSend.email || user.email || "",
          phone: fieldsToSend.phone || user.phone || "",
          telegram: fieldsToSend.telegram || user.telegram || "",
          about_me: fieldsToSend.about_me || user.about_me || "",
          address: fieldsToSend.address || user.address || "",
          avatar_url: file
            ? response.data.profile.avatar_url || profileImage
            : user.avatar_url || "",
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        if (file && response.data.profile.avatar_url) {
          localStorage.setItem(
            "profile-image",
            response.data.profile.avatar_url,
          );
          setProfileImage(response.data.profile.avatar_url);
        }
      }

      const updatedData: ProfileInfoFormData = {
        first_name: fieldsToSend.first_name || initialData.first_name || "",
        last_name: fieldsToSend.last_name || initialData.last_name || "",
        email: fieldsToSend.email || initialData.email || "",
        phone: fieldsToSend.phone || initialData.phone || "",
        telegram: fieldsToSend.telegram || initialData.telegram || "",
        about_me: fieldsToSend.about_me || initialData.about_me || "",
        address: fieldsToSend.address || initialData.address || "",
        avatar_url: file
          ? response.data.profile.avatar_url || initialData.avatar_url || ""
          : initialData.avatar_url || "",
      };
      setInitialData(updatedData);
      form.reset(updatedData);
      setFile(null);
      successMessage("Profile updated successfully!");
      navigation("/seller-dashboard");
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto p-1 sm:p-1">
        {initialData ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 sm:space-y-8 px-4 sm:px-8 py-4 rounded-md shadow-lg"
            >
              <div className="mb-6 sm:mb-10">
                <h3 className="text-lg sm:text-xl text-gray-900 font-semibold">
                  Edit your profile
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <Card className="md:col-span-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-4 text-center">
                        <h4 className="font-medium text-sm sm:text-base mb-2">
                          Profile Photo
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Upload a clear photo of yourself
                        </p>
                      </div>
                      <div className="w-24 sm:w-40 h-24 sm:h-40 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 sm:w-20 h-12 sm:h-20 text-gray-400" />
                        )}
                      </div>
                      <label htmlFor="profile-image" className="cursor-pointer">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
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
                            handleFileSelected(selectedFiles);
                          }}
                        />
                      </label>
                    </div>
                    <div className="pt-4 sm:pt-6">
                      <h3 className="text-xs sm:text-sm text-muted-foreground mb-2">
                        Your profile is on verification stage
                      </h3>
                      <Progress
                        value={
                          user?.verification_status === "pending" ? 50 : 100
                        }
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Usually it takes few hours. Please check your email for
                        updates
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs sm:text-base">
                              First Name
                            </FormLabel>
                            <FormControl>
                              <Input
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
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs sm:text-base">
                              Last Name
                            </FormLabel>
                            <FormControl>
                              <Input
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs sm:text-base">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                disabled
                                className="text-sm sm:text-base"
                              />
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
                            <FormLabel className="text-xs sm:text-base">
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                disabled
                                className="text-sm sm:text-base"
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
                            <FormLabel className="text-xs sm:text-base">
                              Telegram Address
                            </FormLabel>
                            <FormControl>
                              <Input
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
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs sm:text-base">
                              Address
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="text-sm sm:text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="mt-4 sm:mt-6">
                      <FormField
                        control={form.control}
                        name="about_me"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs sm:text-base">
                              Bio
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Tell us about yourself and your farm..."
                                className="min-h-[80px] sm:min-h-[120px] text-sm sm:text-base"
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
              <div className="flex justify-end mb-6 sm:mb-8">
                <Button
                  type="submit"
                  disabled={isSubmitting || !initialData}
                  className="w-full sm:w-auto my-4 text-sm sm:text-base"
                >
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <SkeletonProfileForm />
        )}
      </main>
    </div>
  );
}

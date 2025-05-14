import { useEffect, useState, useCallback } from "react";
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

const SkeletonProfileForm = () => (
  <div className="space-y-8 shadow-lg px-8 rounded-md py-4">
    <div className="mb-10">
      <div className="mb-6">
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 text-center">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="w-40 h-40 rounded-full mb-4" />
              <Skeleton className="h-5 w-28" />
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Skeleton className="h-5 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="mt-6">
              <Skeleton className="h-5 w-12 mb-2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <div className="flex justify-end mb-8">
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

export default function EditProfile() {
  const navigation = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<ProfileInfoFormData | null>(
    null,
  );
  const { user, setUser } = useAuth();
  const farmerProfile: any = getFromLocalStorage("farmerProfile", {});
  const { successMessage, errorMessage } = useNotification();

  const form = useForm<ProfileInfoFormData>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      telegram: "",
      about_me: "",
      address: "",
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
        localStorage.setItem("profile-image", imageUrl);
        setFile(selectedFile);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  useEffect(() => {
    setIsClient(true);
    const storedImage = localStorage.getItem("profile-image");
    if (storedImage) {
      setProfileImage(storedImage);
    }
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
      <main className="container mx-auto p-6">
        {initialData ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 shadow-lg px-8 rounded-md py-4"
            >
              <div className="mb-10">
                <div className="mb-6">
                  <h3 className="text-xl text-gray-900 font-semibold">
                    Edit your profile
                  </h3>
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
                              handleFileSelected(selectedFiles);
                            }}
                          />
                        </label>
                      </div>
                      <div className="pt-6">
                        <h3 className="text-sm text-muted-foreground mb-2">
                          Your profile is on verification stage
                        </h3>
                        <Progress
                          value={
                            user?.verification_status === "pending" ? 50 : 100
                          }
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Usually it takes few hours. Please check your email
                          for updates
                        </p>
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
              <div className="flex justify-end mb-8">
                <Button
                  type="submit"
                  disabled={isSubmitting || !initialData}
                  className="my-4"
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

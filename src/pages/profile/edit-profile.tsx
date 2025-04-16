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
import {
  profileInfoSchema,
  type ProfileInfoFormData,
} from "@/types/validation/seller-onboarding";
import {  getFromLocalStorage } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";

export default function EditProfile() {
  const navigation = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { successMessage, errorMessage } = useNotification();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const form = useForm<ProfileInfoFormData>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      telegram: "",
      about_me: "",
      address: "",
    },
  });

  const fetchProfileData = async () => {
    try {
      const response: any = await apiService().get(
        "/onboarding/seller/get-profile"
      );
      if (response.success && response.data) {
        const { profile } = response.data;
        form.reset({
          telegram: profile.telegram || "",
          about_me: profile.about_me || "",
          address: profile.address || "",
        });
        setProfileImage(profile.avatar_url || null);
      }
    } catch {
      errorMessage("Failed to fetch profile data");
    }
  };

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

  // Load saved data from local storage on component mount
  useEffect(() => {
    setIsClient(true);
    fetchProfileData();
  }, [form]);

  // Handle form submission
  const onSubmit = async (data: ProfileInfoFormData) => {
    try {
      setIsSubmitting(true);
      // Combine all data from all steps

      const formData = new FormData();

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          formData.append(key, String(data[key as keyof ProfileInfoFormData]));
        }
      }
      files.forEach((file) => {
        formData.append("files", file);
      });
      const isAgent: any = getFromLocalStorage("userProfile", {});
      const farmer: any = getFromLocalStorage("farmer-profile", {});

      const response: { success: boolean } = await apiService().patchFormData(
        "/sellers/profile/update-profile",
        formData,
        true,
        isAgent.userType === "agent" && farmer ? farmer.id : ""
      );
      if (response && response.success) {
        successMessage("Profile updated successfully!");
        navigation("/seller-dashboard");
      } else {
        errorMessage("Failed to save farm details");
      }
      setIsSubmitting(false);
    } catch {
      setIsSubmitting(false);
      errorMessage("Registration failed!");
    }
  };

 

  if (!isClient) {
    return null; // Prevent hydration errors
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 shadow-lg px-8  rounded-md py-4"
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
                              e.target.files || []
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

            {/* Navigation Buttons */}
            <div className="flex justify-end mb-8">
              <Button type="submit" disabled={isSubmitting} className=" my-4">
                {isSubmitting ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

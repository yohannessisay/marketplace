"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { APIErrorResponse } from "@/types/api";
import { User, Settings, Upload, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import { UserProfile } from "@/types/user";

export const profileSchema = z.object({
  company_name: z
    .string()
    .min(1, { message: "Company name is required" })
    .optional(),
  country: z.string().min(1, { message: "Country is required" }).optional(),
  position: z.string().min(1, { message: "Position is required" }).optional(),
  website_url: z.string().optional(),
  company_address: z
    .string()
    .min(1, { message: "Company address is required" })
    .optional(),
  telegram: z.string().optional(),
  about_me: z.string().optional(),
});

export const accountSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email")
    .min(1, "Email is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  files: z
    .instanceof(File, { message: "File is required" })
    .refine((file) => file.size > 0, { message: "File cannot be empty" })
    .optional(),
});

type ProfileDetails = z.infer<typeof profileSchema>;
type AccountDetails = z.infer<typeof accountSchema>;

export default function SettingsPage() {
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isAccountSubmitting, setIsAccountSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { successMessage, errorMessage } = useNotification();
  const { user, loading, setUser } = useAuth();

  const profileForm = useForm<ProfileDetails>({
    resolver: zodResolver(profileSchema),
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

  const accountForm = useForm<AccountDetails>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      files: undefined,
    },
  });

  useEffect(() => {
    if (user) {
      console.log("[SettingsPage] User updated:", {
        avatar_url: user.avatar_url,
      });
      profileForm.reset({
        company_name: user.company_name || "",
        country: user.country || "",
        position: user.position || "",
        website_url: user.website_url || "",
        company_address: user.company_address || "",
        telegram: user.telegram || "",
        about_me: user.about_me || "",
      });
      accountForm.reset({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        files: undefined,
      });
      // Clear previewImage to ensure user.avatar_url is used
      setPreviewImage(null);
    }
  }, [user, profileForm, accountForm]);

  const onProfileSubmit = async (data: ProfileDetails) => {
    setIsProfileSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      const response: any = await apiService().postFormData(
        "/buyers/profile/update-profile-details",
        formData,
        true,
      );
      if (response.success) {
        const updatedUser: UserProfile = {
          ...user!,
          company_name: data.company_name || "",
          country: data.country || "",
          position: data.position || "",
          website_url: data.website_url || "",
          company_address: data.company_address || "",
          telegram: data.telegram || "",
          about_me: data.about_me || "",
          onboarding_stage:
            data.company_name &&
            data.country &&
            data.position &&
            data.company_address
              ? "completed"
              : user?.onboarding_stage || "not_started",
          id: user!.id,
          email: user!.email,
          first_name: user!.first_name,
          last_name: user!.last_name,
          phone: user!.phone,
          verifican_status: user!.verifican_status,
          avatar_url: user!.avatar_url,
          userType: user!.userType,
          identity_verified: user!.identity_verified,
          blocked_access: user!.blocked_access,
          last_login_at: user!.last_login_at,
          rating: user!.rating,
          total_reviews: user!.total_reviews,
          deals_completed: user!.deals_completed,
          trading_since: user!.trading_since,
          created_by_agent_id: user!.created_by_agent_id,
          address: user!.address,
        };
        setUser(updatedUser);
        successMessage("Your profile has been updated successfully.");
        profileForm.reset(data);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("[SettingsPage] Error updating profile:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const onAccountSubmit = async (data: AccountDetails) => {
    setIsAccountSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "files" && value) {
          formData.append(key, value);
        } else if (value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      const response: any = await apiService().postFormData(
        "/buyers/profile/update-account-details",
        formData,
        true,
      );

      console.log("[SettingsPage] Account update response:", response);

      if (response.success) {
        const newAvatarUrl = response.data?.avatar_url || user!.avatar_url;
        console.log("[SettingsPage] New avatar_url:", newAvatarUrl);
        const updatedUser: UserProfile = {
          ...user!,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          avatar_url: newAvatarUrl,
          id: user!.id,
          company_name: user!.company_name,
          country: user!.country,
          position: user!.position,
          website_url: user!.website_url,
          company_address: user!.company_address,
          telegram: user!.telegram,
          about_me: user!.about_me,
          onboarding_stage: user!.onboarding_stage,
          verifican_status: user!.verifican_status,
          userType: user!.userType,
          identity_verified: user!.identity_verified,
          blocked_access: user!.blocked_access,
          last_login_at: user!.last_login_at,
          rating: user!.rating,
          total_reviews: user!.total_reviews,
          deals_completed: user!.deals_completed,
          trading_since: user!.trading_since,
          created_by_agent_id: user!.created_by_agent_id,
          address: user!.address,
        };

        setUser(updatedUser);
        successMessage("Your account has been updated successfully.");
        accountForm.reset({
          ...data,
          files: undefined,
        });
        // Set previewImage to new avatar_url to ensure immediate UI update
        setPreviewImage(newAvatarUrl);
      } else {
        throw new Error("Failed to update account");
      }
    } catch (error) {
      console.error("[SettingsPage] Error updating account:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsAccountSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    accountForm.setValue("files", undefined);
    setPreviewImage(null);
  };

  const sidebarItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Settings },
  ];

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

        <div className="md:w-3/4">
          {loading ? (
            <Card className="shadow-lg border border-green-200">
              <CardContent className="p-6 text-center text-gray-500">
                Loading settings...
              </CardContent>
            </Card>
          ) : !user ? (
            <Card className="shadow-lg border border-green-200">
              <CardContent className="p-6 text-center text-red-500">
                Please log in to view settings
              </CardContent>
            </Card>
          ) : (
            <>
              {activeTab === "profile" && (
                <Card className="shadow-lg border border-green-200">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                      Profile
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Update your company and personal details below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form
                        onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={profileForm.control}
                            name="company_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Company name
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
                            control={profileForm.control}
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
                            control={profileForm.control}
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
                            control={profileForm.control}
                            name="website_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Website or social media link
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://buyer.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="company_address"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>
                                  Company address
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
                            control={profileForm.control}
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
                          <FormField
                            control={profileForm.control}
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
                        <div className="flex justify-end space-x-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => profileForm.reset()}
                            disabled={
                              isProfileSubmitting ||
                              !profileForm.formState.isDirty
                            }
                          >
                            Reset
                          </Button>
                          <Button
                            type="submit"
                            disabled={
                              isProfileSubmitting ||
                              !profileForm.formState.isDirty
                            }
                          >
                            {isProfileSubmitting
                              ? "Updating..."
                              : "Update Profile"}
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
                      Manage your account details and security settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...accountForm}>
                      <form
                        onSubmit={accountForm.handleSubmit(onAccountSubmit)}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={accountForm.control}
                            name="first_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  First Name
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={accountForm.control}
                            name="last_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Last Name
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={accountForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Email
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} disabled />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={accountForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Phone Number
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input type="tel" {...field} disabled />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Card className="md:col-span-2">
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center justify-center">
                                <div className="mb-4 text-center">
                                  <h4 className="font-medium mb-2">
                                    Profile Photo
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    Upload a clear photo of yourself
                                  </p>
                                </div>
                                <div className="relative w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden">
                                  {previewImage || user.avatar_url ? (
                                    <>
                                      <img
                                        src={previewImage || user.avatar_url!}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                      />
                                      {previewImage && (
                                        <button
                                          type="button"
                                          onClick={handleRemoveImage}
                                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <User className="w-20 h-20 text-gray-400" />
                                  )}
                                </div>
                                <FormField
                                  control={accountForm.control}
                                  name="files"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel
                                        htmlFor="profile-image"
                                        className="cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                          <Upload className="w-4 h-4" />
                                          <span>Upload photo</span>
                                        </div>
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          id="profile-image"
                                          type="file"
                                          className="hidden"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files
                                              ? e.target.files[0]
                                              : undefined;
                                            field.onChange(file);
                                            if (file) {
                                              setPreviewImage(
                                                URL.createObjectURL(file),
                                              );
                                            } else {
                                              setPreviewImage(null);
                                            }
                                          }}
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
                              accountForm.reset();
                              setPreviewImage(null);
                            }}
                            disabled={
                              isAccountSubmitting ||
                              !accountForm.formState.isDirty
                            }
                          >
                            Reset
                          </Button>
                          <Button
                            type="submit"
                            disabled={
                              isAccountSubmitting ||
                              !accountForm.formState.isDirty
                            }
                          >
                            {isAccountSubmitting
                              ? "Updating..."
                              : "Update Account"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

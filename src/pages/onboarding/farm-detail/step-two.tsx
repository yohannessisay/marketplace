"use client";

import { useEffect, useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  coffeeCropsSchema,
  type CoffeeCropsFormData,
} from "@/types/validation/seller-onboarding";
import {
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
} from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload, FileWithPreview } from "@/components/common/file-upload";
import Header from "@/components/layout/header";
import { useNotification } from "@/hooks/useNotification";
import { apiService } from "@/services/apiService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { APIErrorResponse } from "@/types/api";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BACK_BUTTON_CLICKED_KEY,
  CROP_ID_KEY,
  CURRENT_STEP_KEY,
  FARM_ID_KEY,
  FARMER_PROFILE_KEY,
  STEP_TWO_KEY,
  HAS_COMPLETED_STEP_TWO_KEY,
} from "@/types/constants";

interface Farm {
  id: string;
  farm_name: string;
  region: string | null;
  country: string;
  verification_status: string;
}

export default function StepTwo() {
  const navigation = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradingReports, setGradingReports] = useState<FileWithPreview[]>([]);
  const [photos, setPhotos] = useState<FileWithPreview[]>([]);
  const [gradingReportError, setGradingReportError] = useState<string>("");
  const [photoError, setPhotoError] = useState<string>("");
  const [hasListing, setHasListing] = useState(false);
  const [farm, setFarm] = useState<Farm | undefined>();
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const { user, setUser } = useAuth();
  const { successMessage, errorMessage } = useNotification();
  const farmerProfile: any = useMemo(
    () => getFromLocalStorage(FARMER_PROFILE_KEY, {}),
    [],
  );
  const isBackButtonClicked =
    getFromLocalStorage(BACK_BUTTON_CLICKED_KEY, {}) === "true";
  const hasCompletedStepTwo =
    getFromLocalStorage(HAS_COMPLETED_STEP_TWO_KEY, {}) === "true";

  const existingListingId = getFromLocalStorage(CROP_ID_KEY, "");
  const existingFarmId = getFromLocalStorage(FARM_ID_KEY, "");
  const effectiveOnboardingStage =
    user?.userType === "agent"
      ? farmerProfile.onboarding_stage
      : user?.onboarding_stage;

  const xfmrId = farmerProfile.id ?? "";

  const form = useForm<CoffeeCropsFormData>({
    resolver: zodResolver(coffeeCropsSchema),
    defaultValues: {
      farmId: "",
      coffee_variety: "",
      grade: "",
      bean_type: "Green beans",
      crop_year: "",
      processing_method: "",
      moisture_percentage: 0,
      screen_size: "",
      drying_method: "",
      wet_mill: "",
      is_organic: "",
      cup_aroma: [],
      cup_taste: [],
      quantity_kg: 0,
      price_per_kg: 0,
      readiness_date: "",
      lot_length: "",
      delivery_type: "",
      shipping_port: "Djibouti" as string,
    },
    mode: "onChange",
  });

  const handleGradingReportsSelected = (selectedFiles: File[]) => {
    const newFiles: FileWithPreview[] = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type === "application/pdf" ? "pdf" : "image",
    }));
    setGradingReports(newFiles);
    setGradingReportError("");
  };

  const handlePhotosSelected = (selectedPhotos: File[]) => {
    const newPhotos: FileWithPreview[] = selectedPhotos.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type === "application/pdf" ? "pdf" : "image",
    }));
    setPhotos(newPhotos);
    setPhotoError("");
  };

  const fetchFirstFarm = async () => {
    try {
      if (!user) {
        return;
      }

      const response: any = await apiService().get(
        "/onboarding/seller/get-first-farm",
        xfmrId ? xfmrId : "",
      );

      const fetchedFarm = response.data.farm;
      setFarm(fetchedFarm);

      saveToLocalStorage(FARM_ID_KEY, fetchedFarm.id);

      form.setValue("farmId", fetchedFarm.id);
    } catch (error: any) {
      console.error("Error fetching farm:", error);
      errorMessage(error as APIErrorResponse);
    }
  };

  const checkHasListing = async () => {
    try {
      if (!user) {
        return;
      }

      const response: any = await apiService().get(
        "/onboarding/seller/check-listing",
        xfmrId ? xfmrId : "",
      );

      setHasListing(response.data.hasListing);
    } catch (error: any) {
      console.error("Error checking listing:", error);
    }
  };

  const fetchCoffeeProfile = async () => {
    setIsLoadingFiles(true);
    try {
      const response: any = await apiService().get(
        "/onboarding/seller/get-coffee-details",
        xfmrId ? xfmrId : "",
      );

      if (response.success) {
        const listing = response.data.coffee_listing;
        const documents = response.data.documents;
        const listingPhotos = response.data.photos;
        const farm = response.data.farm;

        form.reset({
          farmId: farm.id || "",
          coffee_variety: listing.coffee_variety || "",
          grade: listing.grade || "",
          bean_type: listing.bean_type || "",
          crop_year: listing.crop_year || "",
          processing_method: listing.processing_method || "",
          moisture_percentage: listing.moisture_percentage || 0,
          screen_size: listing.screen_size || "",
          drying_method: listing.drying_method || "",
          wet_mill: listing.wet_mill || "",
          is_organic: listing.is_organic ? "yes" : "no",
          cup_aroma: Array.isArray(listing.cup_aroma) ? listing.cup_aroma : [],
          cup_taste: Array.isArray(listing.cup_taste) ? listing.cup_taste : [],
          quantity_kg: listing.quantity_kg || 1,
          price_per_kg: listing.price_per_kg || 0,
          readiness_date: listing.readiness_date || "",
          lot_length: listing.lot_length || "",
          delivery_type: listing.delivery_type || "",
          shipping_port: listing.shipping_port || "",
        });

        saveToLocalStorage(STEP_TWO_KEY, listing);
        saveToLocalStorage(CROP_ID_KEY, listing.id);

        if (listingPhotos?.length > 0) {
          const photosTemp: (FileWithPreview | null)[] = await Promise.all(
            listingPhotos.map(
              async (
                photo: { url: string; is_primary: boolean },
                index: number,
              ) => {
                try {
                  const res = await fetch(photo.url);
                  if (!res.ok) throw new Error(`Failed to fetch ${photo.url}`);
                  const blob = await res.blob();
                  const fileName =
                    photo.url.split("/").pop() || `coffee_photo_${index}`;
                  const file = new File([blob], fileName, { type: blob.type });
                  const preview = URL.createObjectURL(file);
                  const type =
                    file.type === "application/pdf" ? "pdf" : "image";
                  return { file, preview, type } as FileWithPreview;
                } catch (err) {
                  console.error(
                    `Error fetching coffee photo ${photo.url}:`,
                    err,
                  );
                  return null;
                }
              },
            ),
          );
          const validPhotos = photosTemp.filter(
            (photo): photo is FileWithPreview => photo !== null,
          );
          setPhotos(validPhotos);
        }

        if (documents?.grading_report) {
          const gradingReportsTemp: (FileWithPreview | null)[] =
            await Promise.all(
              [documents.grading_report].map(
                async (
                  doc: { url: string; doc_type: string },
                  index: number,
                ) => {
                  try {
                    const res = await fetch(doc.url);
                    if (!res.ok) throw new Error(`Failed to fetch ${doc.url}`);
                    const blob = await res.blob();
                    const fileName =
                      doc.url.split("/").pop() || `grading_report_${index}`;
                    const file = new File([blob], fileName, {
                      type: blob.type,
                    });
                    const preview = URL.createObjectURL(file);
                    const type =
                      file.type === "application/pdf" ? "pdf" : "image";
                    return { file, preview, type } as FileWithPreview;
                  } catch (err) {
                    console.error(
                      `Error fetching grading report ${doc.url}:`,
                      err,
                    );
                    return null;
                  }
                },
              ),
            );
          const validGradingReports = gradingReportsTemp.filter(
            (report): report is FileWithPreview => report !== null,
          );
          setGradingReports(validGradingReports);
        }
      }
    } catch (error: any) {
      console.error("Error fetching coffee profile:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (user && !farm) {
      fetchFirstFarm();
      checkHasListing();
    }
  }, [user]);

  useEffect(() => {
    if (
      (effectiveOnboardingStage !== "crops_to_sell" && isBackButtonClicked) ||
      hasCompletedStepTwo
    ) {
      fetchCoffeeProfile();
    }
  }, [user, farmerProfile, isBackButtonClicked, hasCompletedStepTwo]);

  const handleBack = () => {
    const formData = form.getValues();
    saveToLocalStorage(STEP_TWO_KEY, formData);

    saveToLocalStorage(BACK_BUTTON_CLICKED_KEY, "true");
    saveToLocalStorage(CURRENT_STEP_KEY, "farm_profile");
    saveToLocalStorage(FARM_ID_KEY, farm?.id);

    navigation("/onboarding/step-one");
  };

  const onSubmit = async (data: CoffeeCropsFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (key === "cup_aroma" || key === "cup_taste") {
            formData.append(key, JSON.stringify(data[key]));
          } else {
            formData.append(
              key,
              String(data[key as keyof CoffeeCropsFormData]),
            );
          }
        }
      }

      gradingReports.forEach((file) => {
        formData.append("grading_reports", file.file);
      });

      photos.forEach((photo) => {
        formData.append("coffee_photos", photo.file);
      });

      if (farm) {
        formData.append("farm_id", farm.id);
      }

      if (
        effectiveOnboardingStage === "crops_to_sell" &&
        hasListing === false
      ) {
        const response: any = await apiService().postFormData(
          "/onboarding/seller/coffee-details",
          formData,
          true,
          xfmrId ? xfmrId : "",
        );

        if (user?.userType !== "agent") {
          setUser({
            ...user!,
            onboarding_stage: "bank_information",
          });
        }

        if (farmerProfile) {
          saveToLocalStorage(FARMER_PROFILE_KEY, {
            ...farmerProfile,
            onboarding_stage: "bank_information",
          });
        }

        saveToLocalStorage(CROP_ID_KEY, response.data?.coffee_listing?.id);
        saveToLocalStorage(STEP_TWO_KEY, data);
        saveToLocalStorage(CURRENT_STEP_KEY, "bank_information");
        saveToLocalStorage(HAS_COMPLETED_STEP_TWO_KEY, "true");
        removeFromLocalStorage(BACK_BUTTON_CLICKED_KEY);

        successMessage("Crop information saved successfully");
        navigation("/onboarding/step-three");
      } else {
        formData.append("listingId", existingListingId);
        formData.append("farmId", existingFarmId);

        await apiService().patchFormData(
          "/sellers/listings/update-listing",
          formData,
          true,
          xfmrId ? xfmrId : "",
        );

        removeFromLocalStorage(BACK_BUTTON_CLICKED_KEY);
        saveToLocalStorage(STEP_TWO_KEY, data);
        saveToLocalStorage(HAS_COMPLETED_STEP_TWO_KEY, "true");

        successMessage("Crop data updated successfully");
        navigation("/onboarding/step-three");
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isClient) {
    return null;
  }

  const screenSizeOptions = [
    "Screen 20 (>8.0mm)",
    "Screen 19 (7.5-8.0mm)",
    "Screen 18 (7.1-7.5mm)",
    "Screen 17 (6.7-7.1mm)",
    "Screen 16 (6.3-6.7mm)",
    "Screen 15 (6.0-6.3mm)",
    "Screen 14 (5.6-6.0mm)",
    "Screen 13 (5.0-5.6mm)",
    "Screen 12 (4.8-5.0mm)",
    "Screen 11 (4.4-4.8mm)",
    "Screen 10 (4.0-4.4mm)",
    "Screen 9 (3.6-4.0mm)",
    "Screen 8 (3.2-3.6mm)",
  ];

  const gradeOptions = [
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "UG",
  ];
  const processingMethodOptions = ["Washed", "Natural", "Honey Processed"];
  const cupAromaOptions = [
    "Flowery",
    "Nutty",
    "Smoky",
    "Herby",
    "Fruity",
    "Chocolatey",
    "Spicy",
    "Caramelly",
    "Carboney",
    "Berry-like",
    "Floral",
    "Winery",
    "Fragrant",
    "Citrus",
    "Alliaceous",
    "Leguminous",
    "Nut-like",
    "Malt-like",
    "Candy-like",
    "Syrup-like",
    "Chocolate-like",
    "Vanilla-like",
    "Turpeny",
    "Medicinal",
    "Warming",
    "Pungent",
    "Ashy",
  ];
  const cupTasteOptions = ["Bitter", "Sweet", "Salty", "Acidic", "Sour"];

  const aromaColumns: Array<Array<string>> = [];
  for (let i = 0; i < cupAromaOptions.length; i += 3) {
    aromaColumns.push(cupAromaOptions.slice(i, i + 3));
  }

  const tasteColumns: Array<Array<string>> = [];
  for (let i = 0; i < cupTasteOptions.length; i += 3) {
    tasteColumns.push(cupTasteOptions.slice(i, i + 3));
  }

  return (
    <div className="min-h-screen bg-primary/5 pt-26">
      <Header />
      <main className="container mx-auto p-4 max-w-5xl">
        <Stepper currentStep={2} />
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)();
            }}
            className="space-y-8 shadow-lg p-8 rounded-md py-4 bg-white pt-10"
          >
            <div className="flex justify-center items-center mb-6">
              <h2 className="text-2xl font-semibold">
                Add Coffee Crop Details
              </h2>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">Farm Information</h3>
              <p className="text-sm text-gray-600 mb-4">
                This crop is produced at the following farm:
              </p>

              <FormField
                control={form.control}
                name="farmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input
                          disabled
                          value={
                            farm
                              ? `${farm.farm_name} (${farm.region}, ${farm.country})`
                              : "No farm selected"
                          }
                          className="w-full bg-gray-100"
                        />
                        <input
                          type="hidden"
                          {...field}
                          value={farm?.id || field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-8">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Upload grading report</CardTitle>
                  <CardDescription>
                    Upload PDF documents or images (Max 5 files, 5MB each). Drag
                    and drop or click to select files.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFilesSelected={handleGradingReportsSelected}
                    maxFiles={5}
                    maxSizeMB={5}
                    initialFiles={gradingReports}
                    loading={isLoadingFiles}
                  />
                  {gradingReportError && (
                    <p className="text-red-500 text-sm mt-2">
                      {gradingReportError}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {gradingReports.length > 0
                      ? `${gradingReports.length} files selected`
                      : "No files selected"}
                  </div>
                </CardFooter>
              </Card>
              <p className="text-sm text-gray-600 mb-5 mt-4 text-center">
                Submit your Grading Report to provide a detailed quality
                assessment of your coffee, including bean size, moisture
                content, and cup profile.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">
                Check and edit coffee crop information
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Provide details on crop variety, quality, quantity, and base
                price to help buyers assess availability and cost
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <FormField
                  control={form.control}
                  name="coffee_variety"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coffee variety</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial grading</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gradeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bean_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bean type</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value="Green beans"
                          disabled
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="crop_year"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Crop Year</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {Array.from({ length: 2 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="processing_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processing Method</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select processing method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {processingMethodOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="text-lg font-medium mb-4">Crop specification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <FormField
                  control={form.control}
                  name="is_organic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Is Organic?</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select organic status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="moisture_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moisture Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={field.value}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            const clampedValue = Math.min(
                              100,
                              Math.max(0, isNaN(value) ? 0 : value),
                            );
                            field.onChange(clampedValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="screen_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Screen Size</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select screen size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {screenSizeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="drying_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drying Method</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wet_mill"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wet Mill</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="text-lg font-medium mb-4">Cup Aroma</h3>
              <div className="mb-8">
                <FormField
                  control={form.control}
                  name="cup_aroma"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 w-full">
                          {aromaColumns.map((column, colIndex) => (
                            <div
                              key={colIndex}
                              className="flex flex-col gap-1.5 sm:gap-2 w-full"
                            >
                              {column.map((aroma) => (
                                <div
                                  key={aroma}
                                  className="flex items-center space-x-1.5 sm:space-x-2"
                                >
                                  <Checkbox
                                    id={aroma}
                                    checked={
                                      field.value?.includes(aroma) || false
                                    }
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...(field.value || []), aroma]
                                        : (field.value || []).filter(
                                            (v) => v !== aroma,
                                          );
                                      field.onChange(newValue);
                                    }}
                                  />
                                  <label
                                    htmlFor={aroma}
                                    className="text-sm sm:text-base text-gray-700 truncate"
                                  >
                                    {aroma}
                                  </label>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="text-lg font-medium mb-4">Cup Taste</h3>
              <div className="mb-8">
                <FormField
                  control={form.control}
                  name="cup_taste"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-wrap gap-4">
                          {tasteColumns.map((column, colIndex) => (
                            <div
                              key={colIndex}
                              className="flex flex-col gap-2 min-w-[150px]"
                            >
                              {column.map((taste) => (
                                <div
                                  key={taste}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={taste}
                                    checked={
                                      field.value?.includes(taste) || false
                                    }
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...(field.value || []), taste]
                                        : (field.value || []).filter(
                                            (v) => v !== taste,
                                          );
                                      field.onChange(newValue);
                                    }}
                                  />
                                  <label htmlFor={taste}>{taste}</label>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="text-lg font-medium mb-4">Coffee crop photos</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload high-quality images of your coffee crop to create a clear
                representation (Max 6 files, 5MB each).
              </p>
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Coffee crop photos</CardTitle>
                  <CardDescription>
                    Upload images (Max 6 files, 5MB each). Drag and drop or
                    click to select files.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFilesSelected={handlePhotosSelected}
                    maxFiles={6}
                    maxSizeMB={5}
                    initialFiles={photos}
                    loading={isLoadingFiles}
                  />
                  {photoError && (
                    <p className="text-red-500 text-sm mt-2">{photoError}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {photos.length > 0
                      ? `${photos.length} photo(s) selected`
                      : "No photos selected"}
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">
                Set the price and discounts
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Provide details on crop quantity, and base price to help buyers
                assess availability and cost
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <FormField
                  control={form.control}
                  name="quantity_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Quantity (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_per_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community Base Price per kg (USD)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <Input
                            type="number"
                            value={field.value}
                            min={0}
                            className="pl-8"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shipping_port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Port</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value="Djibouti"
                          disabled
                          className="w-full"
                          onChange={() => {}}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">
                Readiness and Delivery Details
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Specify the harvest readiness date, bagging period, and delivery
                type to inform buyers
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="readiness_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Readiness date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full">
                              {field.value
                                ? new Date(field.value).toDateString()
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                const formatted = date
                                  .toISOString()
                                  .slice(0, 10);
                                field.onChange(formatted);
                              }
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lot_length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lot number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Optional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="delivery_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery type</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select delivery type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FOB (Free on Board) - Port of Djibouti">
                            FOB (Free on Board) - Port of Djibouti
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between mb-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting} className="my-4">
                {isSubmitting ? "Saving..." : "Save and continue"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

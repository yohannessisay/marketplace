"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";
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
import { saveToLocalStorage, getFromLocalStorage } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/common/file-upload";
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

interface Farm {
  id: string;
  farm_name: string;
  town_location: string;
  region: string;
  country: string;
  total_size_hectares: number;
  coffee_area_hectares: number;
  longitude: number;
  latitude: number;
  altitude_meters: number;
  crop_type: string;
  crop_source: string;
  origin: string;
  capacity_kg: number;
  tree_type: string;
  tree_variety: string;
  soil_type: string;
  avg_annual_temp: number;
  annual_rainfall_mm: number;
  verification_status: string;
  created_at: string;
  created_by_agent_id: string | null;
}

interface FileWithId extends File {
  id: string;
  url?: string;
}

export default function StepTwo() {
  const navigation = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [photos, setPhotos] = useState<FileWithId[]>([]);
  const [farm, setFarm] = useState<Farm>();

  const [discounts, setDiscounts] = useState<
    { minimum_quantity_kg: number; discount_percentage: number; id: string }[]
  >([]);
  const { user, setUser, loading } = useAuth();
  const userProfile: any = getFromLocalStorage("userProfile", {});
  const currentUserStage = userProfile?.onboarding_stage;
  const { successMessage, errorMessage } = useNotification();
  const farmerProfile: any = getFromLocalStorage("farmer-profile", {});
  const form = useForm<CoffeeCropsFormData>({
    resolver: zodResolver(coffeeCropsSchema),
    defaultValues: {
      farmId: "",
      coffee_variety: "",
      grade: "",
      bean_type: "",
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
      readiness_date: new Date().toISOString(),
      lot_length: "",
      delivery_type: "",
      shipping_port: "",
    },
    mode: "onChange",
  });

  const handlePhotosSelected = (selectedPhotos: File[]) => {
    const newPhotos: FileWithId[] = selectedPhotos.map((file) =>
      Object.assign(file, {
        id: Math.random().toString(36).substring(2),
      }),
    );
    setPhotos(newPhotos);
  };

  const handleAddDiscount = () => {
    if (discounts.length < 1) {
      setDiscounts((prev) => [
        ...prev,
        {
          minimum_quantity_kg: 1,
          discount_percentage: 1,
          id: Math.random().toString(36).substring(2),
        },
      ]);
    }
  };

  const handleRemoveDiscount = (id: string) => {
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDiscountChange = (
    id: string,
    field: "minimum_quantity_kg" | "discount_percentage",
    value: number,
  ) => {
    setDiscounts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    );
  };

  const fetchFirstFarm = async () => {
    try {
      if (!user) {
        return;
      }

      const farmerId =
        user.userType === "agent" ? farmerProfile?.id : undefined;

      const response: any = await apiService().get(
        "/onboarding/seller/get-first-farm",
        farmerId,
      );
      const fetchedFarm = response.data.farm;
      setFarm(fetchedFarm);
      saveToLocalStorage("farm-id", fetchedFarm.id);
      // Set farmId in the form
      form.setValue("farmId", fetchedFarm.id);
    } catch (error: any) {
      console.error("Error fetching farm:", error);
      errorMessage(error as APIErrorResponse);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (user) {
      fetchFirstFarm();
    }
  }, [user]);

  // Load form data and discounts from localStorage if user is returning from a later step
  useEffect(() => {
    const populateForm = async () => {
      try {
        // Check if user has progressed past crops_to_sell
        const laterStages = ["bank_information", "avatar_image", "completed"];
        if (
          !loading &&
          laterStages.includes(currentUserStage) &&
          currentUserStage !== "crops_to_sell"
        ) {
          // Load form data
          const savedData: any = getFromLocalStorage("step-two", {});
          if (savedData && Object.keys(savedData).length > 0) {
            // Ensure cup_aroma and cup_taste are arrays
            const normalizedData = {
              ...savedData,
              cup_aroma: Array.isArray(savedData.cup_aroma)
                ? savedData.cup_aroma
                : [],
              cup_taste: Array.isArray(savedData.cup_taste)
                ? savedData.cup_taste
                : [],
              // Convert readiness_date to ISO string if it's a date string
              readiness_date: savedData.readiness_date
                ? new Date(savedData.readiness_date).toISOString()
                : new Date().toISOString(),
              // Ensure farmId is set from saved data if available
              farmId: savedData.farmId || farm?.id || "",
            };
            form.reset(normalizedData);
          }

          // Load discounts
          const savedDiscounts: any = getFromLocalStorage(
            "step-two-discounts",
            [],
          );
          if (Array.isArray(savedDiscounts) && savedDiscounts.length > 0) {
            // Normalize discounts to ensure they have id, minimum_quantity_kg, and discount_percentage
            const normalizedDiscounts = savedDiscounts.map((discount) => ({
              id: discount.id || Math.random().toString(36).substring(2),
              minimum_quantity_kg: Number(discount.minimum_quantity_kg) || 1,
              discount_percentage: Number(discount.discount_percentage) || 1,
            }));
            setDiscounts(normalizedDiscounts);
          }
        }
      } catch (error: any) {
        console.error("Error loading data from localStorage:", error);
        errorMessage(error as APIErrorResponse);
      }
    };
    populateForm();
  }, [loading, currentUserStage, form, farm]);

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

      files.forEach((file) => {
        formData.append("files", file);
      });

      photos.forEach((photo) => {
        formData.append("files", photo);
      });

      if (farm) {
        formData.append("farm_id", farm.id);
      }

      if (discounts.length > 0) {
        const formattedDiscounts = discounts.map((discount) => ({
          minimum_quantity_kg: discount.minimum_quantity_kg,
          discount_percentage: discount.discount_percentage,
        }));
        formData.append("discounts", JSON.stringify(formattedDiscounts));
      }

      if (
        user?.onboarding_stage === "crops_to_sell" ||
        (user?.userType === "agent" &&
          farmerProfile?.onboarding_stage === "crops_to_sell")
      ) {
        const response: any = await apiService().postFormData(
          "/onboarding/seller/coffee-details",
          formData,
          true,
          user?.userType === "agent" ? user?.id : "",
        );

        saveToLocalStorage("crop-id", response.data?.coffee_listing?.id);
        setUser({
          ...user,
          onboarding_stage: "bank_information",
        });

        saveToLocalStorage("step-two", data);
        saveToLocalStorage("step-two-discounts", discounts);
        localStorage.setItem(
          "current-step",
          JSON.stringify("bank_information"),
        );
        successMessage("Crop information saved successfully");
        navigation("/onboarding/step-three");
      } else {
        const existingListingId = getFromLocalStorage("crop-id", "");
        formData.append("listingId", existingListingId);
        const existingFarmId = getFromLocalStorage("farm-id", "");
        formData.append("farmId", existingFarmId);
        await apiService().patchFormData(
          "/sellers/listings/update-listing",
          formData,
          true,
          user?.userType === "agent" ? user?.id : "",
        );

        saveToLocalStorage("step-two", data);
        saveToLocalStorage("step-two-discounts", discounts);
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

  const gradeOptions = ["1", "2", "3", "4", "5", "UG"];
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

  // Organize cup aroma options into columns of max 3 items
  const aromaColumns: Array<Array<string>> = [];
  for (let i = 0; i < cupAromaOptions.length; i += 3) {
    aromaColumns.push(cupAromaOptions.slice(i, i + 3));
  }

  // Organize cup taste options into columns of max 3 items
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
            <h2 className="text-center text-2xl">Add Coffee Crop Details</h2>
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
                    Upload a single PDF document or image. Drag and drop or
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
                              Grade {option}
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
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select bean type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Green beans">
                            Green beans
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full">
                              {field.value || "Select a year"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <div className="p-3">
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                              }}
                              value={field.value}
                            >
                              <SelectTrigger className="w-70">
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px] overflow-y-auto w-70">
                                {Array.from({ length: 20 }, (_, i) => {
                                  const year = new Date().getFullYear() - i;
                                  return (
                                    <SelectItem
                                      key={year}
                                      value={year.toString()}
                                    >
                                      {year}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </PopoverContent>
                      </Popover>
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
                        <div className="flex flex-wrap gap-4">
                          {aromaColumns.map((column, colIndex) => (
                            <div
                              key={colIndex}
                              className="flex flex-col gap-2 min-w-[150px]"
                            >
                              {column.map((aroma) => (
                                <div
                                  key={aroma}
                                  className="flex items-center space-x-2"
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
                                  <label htmlFor={aroma}>{aroma}</label>
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
                representation. Start with a primary photo that best showcases
                your crop, then add additional images if needed.
              </p>
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Coffee crop photos</CardTitle>
                  <CardDescription>
                    Upload images. Drag and drop or click to select files.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFilesSelected={handlePhotosSelected}
                    maxFiles={6}
                    maxSizeMB={5}
                  />
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
                Provide details on crop variety, quality, quantity, and base
                price to help buyers assess availability and cost
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-4">
                <h4 className="text-base font-medium mb-2">Discounts</h4>
                {discounts.length > 0 && (
                  <div className="space-y-2">
                    {discounts.map((discount) => (
                      <div
                        key={discount.id}
                        className="flex items-center gap-2"
                      >
                        <Input
                          type="number"
                          min={1}
                          className="w-40"
                          placeholder="Min. quantity (kg)"
                          value={discount.minimum_quantity_kg}
                          onChange={(e) =>
                            handleDiscountChange(
                              discount.id,
                              "minimum_quantity_kg",
                              Number(e.target.value) || 0,
                            )
                          }
                        />
                        <span className="mx-2">kg</span>
                        <Input
                          type="number"
                          min={1}
                          disabled={form.getValues().quantity_kg === 0}
                          className="w-32"
                          placeholder="Discount (%)"
                          value={discount.discount_percentage}
                          onChange={(e) => {
                            const inputValue = Number(e.target.value) || 0;
                            const max = form.getValues().quantity_kg;
                            handleDiscountChange(
                              discount.id,
                              "discount_percentage",
                              inputValue > max ? max : inputValue,
                            );
                          }}
                        />
                        <span className="mx-2">%</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDiscount(discount.id)}
                          className="text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {discounts.length < 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center text-sm text-green-600 gap-1 mt-2 p-0 h-auto"
                    onClick={handleAddDiscount}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add discount</span>
                  </Button>
                )}
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

            <div className="flex justify-end mb-8">
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

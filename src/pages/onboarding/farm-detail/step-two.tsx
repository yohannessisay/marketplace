"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, X, FileText } from "lucide-react";
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
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [photos, setPhotos] = useState<FileWithId[]>([]);
  const [farm, setFarm] = useState<Farm>();
  const [discounts, setDiscounts] = useState<
    { minimum_quantity_kg: number; discount_percentage: number; id: string }[]
  >([]);
  const { user, setUser } = useAuth();
  const { successMessage, errorMessage } = useNotification();

  const form = useForm<CoffeeCropsFormData>({
    resolver: zodResolver(coffeeCropsSchema),
    defaultValues: {
      farmId: "",
      coffee_variety: "",
      grade: "",
      bean_type: "",
      crop_year: "",
      processing_method: "",
      moisture_percentage: 1,
      screen_size: 10,
      drying_method: "",
      wet_mill: "",
      is_organic: "",
      cup_taste_acidity: "",
      cup_taste_body: "",
      cup_taste_sweetness: "",
      cup_taste_aftertaste: "",
      cup_taste_balance: "",
      quantity_kg: 1,
      price_per_kg: 5,
      readiness_date: new Date().toISOString(),
      lot_length: "",
      delivery_type: "",
      shipping_port: "",
    },
    mode: "onChange",
  });

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFiles([
        Object.assign(selectedFiles[0], {
          id: Math.random().toString(36).substring(2),
        }),
      ]);
    }
  };

  const handlePhotosSelected = (selectedPhotos: File[]) => {
    setPhotos((prev) => [
      ...prev,
      ...selectedPhotos.map((p) =>
        Object.assign(p, {
          id: Math.random().toString(36).substring(2),
        }),
      ),
    ]);
  };

  const handleRemoveFile = (id: string, type: "files" | "photos") => {
    if (type === "files") {
      setFiles((prev) => prev.filter((file) => file.id !== id));
    } else {
      setPhotos((prev) => prev.filter((photo) => photo.id !== id));
    }
  };

  const handleAddDiscount = () => {
    setDiscounts((prev) => [
      ...prev,
      {
        minimum_quantity_kg: 0,
        discount_percentage: 0,
        id: Math.random().toString(36).substring(2),
      },
    ]);
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
      const response: any = await apiService().get(
        "/onboarding/seller/get-first-farm",
        user?.userType === "agent" ? user?.id : "",
      );
      setFarm(response.data.farm);
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchFirstFarm();
  }, []);

  const onSubmit = async (data: CoffeeCropsFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          formData.append(key, String(data[key as keyof CoffeeCropsFormData]));
        }
      }

      files.forEach((file) => {
        formData.append("files", file);
      });

      photos.forEach((photo) => {
        formData.append("files", photo);
      });

      if (farm) {
        formData.append("farm_id", farm?.id);
      }

      // Append discounts as a JSON string
      if (discounts.length > 0) {
        const formattedDiscounts = discounts.map((discount) => ({
          minimum_quantity_kg: discount.minimum_quantity_kg,
          discount_percentage: discount.discount_percentage,
        }));
        formData.append("discounts", JSON.stringify(formattedDiscounts));
      }

      if (user?.onboarding_stage === "crops_to_sell") {
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
        localStorage.setItem(
          "current-step",
          JSON.stringify("bank_information"),
        );
        successMessage("Crop information saved successfully");
        navigation("/onboarding/step-three");
      } else {
        const existingFarmId = getFromLocalStorage("farm-id", "");
        formData.append("farmId", existingFarmId);

        await apiService().patchFormData(
          "/sellers/listings/update-listing",
          formData,
          true,
          user?.userType === "agent" ? user?.id : "",
        );

        successMessage("Crop data updated");
        navigation("/onboarding/step-three");
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigation("/onboarding/step-one");
    localStorage.setItem("back-button-clicked", "true");
  };

  if (!isClient) {
    return null; // Prevent hydration errors
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
                          value={farm?.id || ""}
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
                  {files.length > 0 ? (
                    <div className="mb-4">
                      <Card className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">
                              {files[0].name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Grading Report
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(files[0].id, "files")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </Card>
                    </div>
                  ) : (
                    <FileUpload
                      onFilesSelected={handleFilesSelected}
                      maxFiles={1}
                      maxSizeMB={5}
                    />
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {files.length > 0 ? "1 file selected" : "No file selected"}
                  </div>
                </CardFooter>
              </Card>
              <p className="text-sm text-gray-600 mb-5 mt-4 text-center">
                Submit your Grading Report to provide a detailed quality
                assessment of your coffee, including bean size, moisture
                content, and cup profile.
              </p>
            </div>

            {/* Step 2: Check and edit coffee crop information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">
                Check and edit coffee crop information
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Provide details on crop variety, quality, quantity, and base
                price to help buyers assess availability and cost
              </p>

              {/* Coffee basic info */}
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
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
              </div>

              {/* Crop specification */}
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
                  name="processing_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Processing Method</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue =
                              value === "" ? 0 : Number(value);
                            field.onChange(parsedValue);
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
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

              {/* Cup taste */}
              <h3 className="text-lg font-medium mb-4">Cup taste</h3>
              <div className="grid grid-cols-Environmentals grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <FormField
                  control={form.control}
                  name="cup_taste_acidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acidity</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select acidity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Delicate">Delicate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cup_taste_body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select body" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Heavy">Heavy</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cup_taste_sweetness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sweetness</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select sweetness" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Honey-like">Honey-like</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cup_taste_aftertaste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aftertaste</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select aftertaste" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Long-lasting">
                            Long-lasting
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cup_taste_balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balance</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select balance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Complex">Complex</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Coffee crop photos */}
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

            {/* Set the price and discounts */}
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
                      <FormLabel>Community Base Price per kg</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
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

              {/* Discounts section */}
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
                          min={0}
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
                          min={0}
                          max={100}
                          className="w-32"
                          placeholder="Discount (%)"
                          value={discount.discount_percentage}
                          onChange={(e) =>
                            handleDiscountChange(
                              discount.id,
                              "discount_percentage",
                              Number(e.target.value) || 0,
                            )
                          }
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
                <Button
                  type="button"
                  variant="ghost"
                  className="flex items-center text-sm text-green-600 gap-1 mt-2 p-0 h-auto"
                  onClick={handleAddDiscount}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add discount</span>
                </Button>
              </div>
            </div>

            {/* Readiness and Delivery Details */}
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

            {/* Navigation Buttons */}
            <div className="flex justify-between mb-8">
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="my-4"
              >
                {isSubmitting ? "Saving..." : "Save and continue"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

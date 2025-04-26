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
import {
  coffeeCropsSchema,
  type CoffeeCropsFormData,
} from "@/types/validation/seller-onboarding";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { APIErrorResponse } from "@/types/api";
import { AddCropSkeletonForm } from "./SkeletonForm";
import { useAuth } from "@/hooks/useAuth";
import { getFromLocalStorage } from "@/lib/utils";

interface FileWithId extends File {
  id: string;
  url?: string;
}

interface Farm {
  id: string;
  farm_name: string;
  region: string | null;
  country: string;
  verification_status: string;
}

export default function AddCrop() {
  const navigation = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const farmIdFromQuery: string | null = queryParams.get("farmId");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFarms, setIsLoadingFarms] = useState(true);
  const [isLoadingListing, setIsLoadingListing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [photos, setPhotos] = useState<FileWithId[]>([]);
  const { successMessage, errorMessage } = useNotification();
  const [discounts, setDiscounts] = useState<
    { minimum_quantity_kg: number; discount_percentage: number; id: string }[]
  >([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmError, setFarmError] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const farmerProfile: any = getFromLocalStorage("farmer-profile", {});
  const isLoading = isLoadingFarms || isLoadingListing;

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
      screen_size: 0,
      drying_method: "",
      wet_mill: "",
      is_organic: "",
      cup_taste_acidity: "",
      cup_taste_body: "",
      cup_taste_sweetness: "",
      cup_taste_aftertaste: "",
      cup_taste_balance: "",
      quantity_kg: 0,
      price_per_kg: 0,
      readiness_date: "",
      lot_length: "",
      delivery_type: "",
      shipping_port: "",
    },
  });

  useEffect(() => {
    const fetchFarms = async () => {
      setIsLoadingFarms(true);
      try {
        if (loading) {
          return;
        }
        const farmerId =
          user?.userType === "agent" ? farmerProfile?.id : undefined;

        const response: any = await apiService().get(
          "/sellers/farms/get-farms",
          farmerId
        );
        if (response.success) {
          const fetchedFarms: Farm[] = response.data.farms || [];
          setFarms(() => {
            return fetchedFarms.filter(
              (farm) => farm?.verification_status !== "completed"
            );
          });
          if (fetchedFarms.length === 0) {
            setFarmError(
              "No farms found. Please add a farm first to create a crop listing."
            );
          } else if (farmIdFromQuery && !id) {
            const selectedFarm = fetchedFarms.find(
              (farm: Farm) => farm.id === farmIdFromQuery
            );
            if (selectedFarm) {
              form.setValue("farmId", farmIdFromQuery, {
                shouldValidate: true,
              });
              form.reset({ ...form.getValues(), farmId: farmIdFromQuery });
            } else {
              console.error("[AddCrop] No farm found for ID:", farmIdFromQuery);
              setFarmError(
                "The farm ID provided in the URL is invalid. Please select a valid farm."
              );
            }
          }
        } else {
          throw new Error(response.message || "Failed to fetch farms");
        }
      } catch (error) {
        console.error("[AddCrop] Error fetching farms:", error);
        setFarmError("Failed to load farms. Please try again later.");
      } finally {
        setIsLoadingFarms(false);
      }
    };

    fetchFarms();
  }, [loading]);

  const populateForm = async (listingId: string) => {
    setIsLoadingListing(true);
    try {
      if (!user) {
        return;
      }

      const farmerId =
        user.userType === "agent" ? farmerProfile?.id : undefined;

      const response: any = await apiService().get(
        `/sellers/listings/get-listing?listingId=${listingId}`,
        farmerId
      );

      if (response.success) {
        const listing = response.data.listing;

        form.reset({
          farmId: listing.farm?.farm_id || "",
          coffee_variety: listing.coffee_variety || "",
          grade: listing.grade || "",
          bean_type: listing.bean_type || "",
          crop_year: listing.crop_year || "",
          processing_method: listing.processing_method || "",
          moisture_percentage: listing.moisture_percentage || 1,
          screen_size: Number(listing.screen_size) || 1,
          drying_method: listing.drying_method || "",
          wet_mill: listing.wet_mill || "",
          is_organic: listing.is_organic ? "true" : "false",
          cup_taste_acidity: listing.cup_taste_acidity || "",
          cup_taste_body: listing.cup_taste_body || "",
          cup_taste_sweetness: listing.cup_taste_sweetness || "",
          cup_taste_aftertaste: listing.cup_taste_aftertaste || "",
          cup_taste_balance: listing.cup_taste_balance || "",
          quantity_kg: listing.quantity_kg || 1,
          price_per_kg: listing.price_per_kg || 1,
          readiness_date: listing.readiness_date || "",
          lot_length: listing.lot_length || "",
          delivery_type: listing.delivery_type || "",
          shipping_port: listing.shipping_port || "",
        });

        if (response.data.listing.photos?.length > 0) {
          const photosTemp: FileWithId[] = await Promise.all(
            response.data.listing.photos.map(async (photo: any) => {
              try {
                const res = await fetch(photo.photo_url);
                if (!res.ok)
                  throw new Error(`Failed to fetch ${photo.photo_url}`);
                const blob = await res.blob();
                const fileName =
                  photo.photo_url.split("/").pop() || `photo_${photo.id}`;
                return Object.assign(
                  new File([blob], fileName, { type: blob.type }),
                  { id: photo.id, url: photo.photo_url }
                );
              } catch (err) {
                console.error(`Error fetching photo ${photo.photo_url}:`, err);
                return null;
              }
            })
          );
          setPhotos(photosTemp.filter((p): p is FileWithId => p !== null));
        }

        if (Array.isArray(listing.discounts)) {
          setDiscounts(
            listing.discounts.map((d: any) => ({
              minimum_quantity_kg: Number(d.minimum_quantity_kg) || 1,
              discount_percentage: Number(d.discount_percentage) || 1,
              id: d.id || Math.random().toString(36).substring(2),
            }))
          );
        }
      } else {
        throw new Error(response.message || "Failed to fetch listing");
      }
    } catch (error) {
      console.error("[AddCrop] Error fetching listing data:", error);
      errorMessage({ message: "Failed to fetch listing data." });
    } finally {
      setIsLoadingListing(false);
    }
  };

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      populateForm(id);
    }
  }, [id]);

  const handlePhotosSelected = (selectedPhotos: File[]) => {
    setPhotos((prev) => [
      ...prev,
      ...selectedPhotos.map((p) =>
        Object.assign(p, {
          id: Math.random().toString(36).substring(2),
        })
      ),
    ]);
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
    value: number
  ) => {
    setDiscounts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

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

      formData.append(
        "discounts",
        JSON.stringify(discounts.map(({ ...rest }) => rest))
      );

      formData.append("farm_id", data.farmId!);

      if (isEditMode && id) {
        formData.append("listingId", id);
        await apiService().patchFormData(
          "/sellers/listings/update-listing",
          formData,
          true
        );
        successMessage("Listing updated successfully!");
        navigation(`/manage-listing/${id}`);
      } else {
        const response: any = await apiService().postFormData(
          "/sellers/listings/create-listing",
          formData,
          true
        );
        successMessage("Listing created successfully!");
        navigation(`/manage-listing/${response?.data.coffee_listing.id}`);
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary/5 pt-20">
      <Header />
      <main className="container mx-auto p-4 max-w-5xl">
        {isLoading ? (
          <AddCropSkeletonForm />
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 shadow-lg p-8 rounded-md py-4 bg-white"
            >
              <h2 className="text-center text-2xl">
                {isEditMode
                  ? "Edit Your Crop Details"
                  : "Add Crop To Your Existing Farm"}
              </h2>

              {/* Farm Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">Select Farm</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose the farm where this crop is produced.
                </p>
                <FormField
                  control={form.control}
                  name="farmId"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Farm</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          value={field.value || ""}
                          disabled={isLoadingFarms || farms.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  isLoadingFarms
                                    ? "Loading farms..."
                                    : farms.length === 0
                                    ? "No farms available"
                                    : "Select a farm"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {farms.map((farm) => (
                              <SelectItem key={farm.id} value={farm.id}>
                                {farm.farm_name} ({farm.region || "N/A"},{" "}
                                {farm.country})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {farmError && (
                          <p className="text-sm text-red-600">
                            {farmError}{" "}
                            {farmError.includes("No farms found") && (
                              <a
                                href="/add-farm"
                                className="text-blue-600 underline"
                              >
                                Add a farm
                              </a>
                            )}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              {/* Step 1: Upload Grading Report */}
              {farms && farms.length > 0 ? (
                <>
                  <div className="mb-8">
                    <Card className="max-w-2xl mx-auto">
                      <CardHeader>
                        <CardTitle>Upload grading report</CardTitle>
                        <CardDescription>
                          Upload a single PDF document or image. Drag and drop
                          or click to select a file.
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
                      Provide details on crop variety, quality, quantity, and
                      base price to help buyers assess availability and cost
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
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Bean type</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
                                value={field.value || ""}
                                disabled={isLoadingFarms}
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
                          );
                        }}
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
                                        const year =
                                          new Date().getFullYear() - i;
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
                    <h3 className="text-lg font-medium mb-4">
                      Crop specification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <FormField
                        control={form.control}
                        name="is_organic"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Is Organic?</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
                                value={field.value || ""}
                                disabled={isLoadingFarms}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select organic status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="true">Yes</SelectItem>
                                  <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="processing_method"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Processing Method</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="moisture_percentage"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Moisture Percentage</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value) || 1)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="screen_size"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Screen Size</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const parsedValue =
                                      value === "" ? 1 : Number(value);
                                    field.onChange(parsedValue);
                                  }}
                                  onBlur={field.onBlur}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="drying_method"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Drying Method</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="wet_mill"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Wet Mill</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>

                    {/* Cup taste */}
                    <h3 className="text-lg font-medium mb-4">Cup taste</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <FormField
                        control={form.control}
                        name="cup_taste_acidity"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Acidity</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select acidity" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Delicate">
                                    Delicate
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="cup_taste_body"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Body</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
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
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="cup_taste_sweetness"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Sweetness</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select sweetness" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Honey-like">
                                    Honey-like
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="cup_taste_aftertaste"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Aftertaste</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
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
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="cup_taste_balance"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Balance</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
                                value={field.value || ""}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select balance" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Complex">
                                    Complex
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>

                    {/* Coffee crop photos */}
                    <h3 className="text-lg font-medium mb-4">
                      Coffee crop photos
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload high-quality images of your coffee crop to create a
                      clear representation. Start with a primary photo that best
                      showcases your crop, then add additional images if needed.
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
                      Provide details on crop variety, quality, quantity, and
                      base price to help buyers assess availability and cost
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
                                {...field}
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value) || 1)
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
                                {...field}
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value) || 1)
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
                                min={1}
                                className="w-40"
                                placeholder="Min. quantity (kg)"
                                value={discount.minimum_quantity_kg}
                                onChange={(e) =>
                                  handleDiscountChange(
                                    discount.id,
                                    "minimum_quantity_kg",
                                    Number(e.target.value) || 1
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
                                  const inputValue =
                                    Number(e.target.value) || 1;
                                  const max = form.getValues().quantity_kg;
                                  handleDiscountChange(
                                    discount.id,
                                    "discount_percentage",
                                    inputValue > max ? max : inputValue
                                  );
                                }}
                              />
                              <span className="mx-2">%</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleRemoveDiscount(discount.id)
                                }
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
                      Specify the harvest readiness date, bagging period, and
                      delivery type to inform buyers
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
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
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
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Delivery type</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
                                value={field.value || ""}
                                disabled={isLoadingFarms}
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
                          );
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
              {/* Navigation Buttons */}
              <div className="flex justify-end mb-8">
                <Button type="submit" disabled={isSubmitting||(farms&&farms.length<1)} className="my-4">
                  {isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Adding..."
                    : isEditMode
                    ? "Update Listing"
                    : "Add Crop Listing"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </main>
    </div>
  );
}

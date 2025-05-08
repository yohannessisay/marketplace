"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";
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
import { APIErrorResponse } from "@/types/api";
import { AddCropSkeletonForm } from "./SkeletonForm";
import { useAuth } from "@/hooks/useAuth";
import { getFromLocalStorage } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

interface Farm {
  id: string;
  farm_name: string;
  region: string | null;
  country: string;
  verification_status: string;
}

export default function AddCrop() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const farmIdFromQuery: string | null = queryParams.get("farmId");
  const [isEditMode, _setIsEditMode] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFarms, setIsLoadingFarms] = useState(true);
  const [isLoadingListing, setIsLoadingListing] = useState(!!id);
  const [gradingReports, setGradingReports] = useState<FileWithPreview[]>([]);
  const [photos, setPhotos] = useState<FileWithPreview[]>([]);
  const [gradingReportError, setGradingReportError] = useState<string>("");
  const [photoError, setPhotoError] = useState<string>("");
  const { successMessage, errorMessage } = useNotification();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmError, setFarmError] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const farmerProfile: any = getFromLocalStorage("farmerProfile", {});
  const isLoading = isLoadingFarms || isLoadingListing;
  const [hasFetched, setHasFetched] = useState(false);

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
      readiness_date: "",
      lot_length: "",
      delivery_type: "",
      shipping_port: "",
    },
    mode: "onChange",
  });

  const { trigger } = form;

  useEffect(() => {
    const fetchInitialData = async () => {
      if (loading || hasFetched) return;
      setIsLoadingFarms(true);
      if (id) setIsLoadingListing(true);

      try {
        const farmerId =
          user?.userType === "agent" ? farmerProfile?.id : undefined;

        // Fetch farms
        const farmsResponse: any = await apiService().get(
          "/sellers/farms/get-farms",
          farmerId,
        );
        if (farmsResponse.success) {
          const fetchedFarms: Farm[] = farmsResponse.data.farms || [];
          setFarms(fetchedFarms);
          if (fetchedFarms.length === 0) {
            setFarmError(
              "No farms found. Please add a farm first to create a crop listing.",
            );
          } else if (farmIdFromQuery && !id) {
            const selectedFarm = fetchedFarms.find(
              (farm: Farm) => farm.id === farmIdFromQuery,
            );
            if (selectedFarm) {
              form.setValue("farmId", farmIdFromQuery, {
                shouldValidate: true,
              });
              form.reset({ ...form.getValues(), farmId: farmIdFromQuery });
            } else {
              setFarmError(
                "The farm ID provided in the URL is invalid. Please select a valid farm.",
              );
            }
          }
        } else {
          throw new Error(farmsResponse.message || "Failed to fetch farms");
        }

        // Fetch listing data if in edit mode
        if (id) {
          const listingResponse: any = await apiService().get(
            `/sellers/listings/get-listing?listingId=${id}`,
            farmerId,
          );
          if (listingResponse.success) {
            const listing = listingResponse.data.listing;
            form.reset({
              farmId: listing.farm.farm_id || "",
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
              cup_aroma: Array.isArray(listing.cup_aroma)
                ? listing.cup_aroma
                : [],
              cup_taste: Array.isArray(listing.cup_taste)
                ? listing.cup_taste
                : [],
              quantity_kg: listing.quantity_kg || 1,
              price_per_kg: listing.price_per_kg || 0,
              readiness_date: listing.readiness_date || "",
              lot_length: listing.lot_length || "",
              delivery_type: listing.delivery_type || "",
              shipping_port: listing.shipping_port || "",
            });

            // Fetch photos
            if (listing.photos?.length > 0) {
              const photosTemp: FileWithPreview[] = await Promise.all(
                listing.photos.map(async (photo: any) => {
                  try {
                    const res = await fetch(photo.photo_url);
                    if (!res.ok)
                      throw new Error(`Failed to fetch ${photo.photo_url}`);
                    const blob = await res.blob();
                    const fileName =
                      photo.photo_url.split("/").pop() || `photo_${photo.id}`;
                    const file = new File([blob], fileName, {
                      type: blob.type,
                    });
                    const preview = URL.createObjectURL(file);
                    const type =
                      file.type === "application/pdf" ? "pdf" : "image";
                    return { file, preview, type };
                  } catch (err) {
                    console.error(
                      `Error fetching photo ${photo.photo_url}:`,
                      err,
                    );
                    return null;
                  }
                }),
              );
              setPhotos(
                photosTemp.filter(
                  (photo): photo is FileWithPreview => photo !== null,
                ),
              );
            }

            // Fetch grading reports
            if (listing.documents?.length > 0) {
              const gradingReportsTemp: FileWithPreview[] = await Promise.all(
                listing.documents
                  .filter((doc: any) => doc.doc_type === "grading_report")
                  .map(async (doc: any) => {
                    try {
                      const res = await fetch(doc.doc_url);
                      if (!res.ok)
                        throw new Error(`Failed to fetch ${doc.doc_url}`);
                      const blob = await res.blob();
                      const fileName =
                        doc.doc_url.split("/").pop() ||
                        `grading_report_${doc.id}`;
                      const file = new File([blob], fileName, {
                        type: blob.type,
                      });
                      const preview = URL.createObjectURL(file);
                      const type =
                        file.type === "application/pdf" ? "pdf" : "image";
                      return { file, preview, type };
                    } catch (err) {
                      console.error(
                        `Error fetching grading report ${doc.doc_url}:`,
                        err,
                      );
                      return null;
                    }
                  }),
              );
              setGradingReports(
                gradingReportsTemp.filter(
                  (report): report is FileWithPreview => report !== null,
                ),
              );
            }
          } else {
            throw new Error(
              listingResponse.message || "Failed to fetch listing",
            );
          }
        }
      } catch (error) {
        console.error("[AddCrop] Error fetching initial data:", error);
        setFarmError("Failed to load data. Please try again later.");
        if (id) {
          errorMessage({ message: "Failed to fetch listing data." });
        }
      } finally {
        setIsLoadingFarms(false);
        if (id) setIsLoadingListing(false);
        setHasFetched(true);
      }
    };

    fetchInitialData();
  }, [
    loading,
    id,
    farmIdFromQuery,
    user,
    farmerProfile,
    form,
    navigate,
    errorMessage,
    hasFetched,
  ]);

  const validateFiles = (): { isValid: boolean; error?: APIErrorResponse } => {
    setGradingReportError("");
    setPhotoError("");

    if (gradingReports.length === 0) {
      const error: APIErrorResponse = {
        success: false,
        error: {
          message: "Grading report is required",
          details: "Please upload at least one grading report",
          code: 400,
          hint: "The file must be in PDF, JPG, or PNG format",
        },
      };
      setGradingReportError(error.error.message);
      errorMessage(error);
      return { isValid: false, error };
    }

    if (photos.length === 0) {
      const error: APIErrorResponse = {
        success: false,
        error: {
          message: "Crop photos are required",
          details: "Please upload at least one photo",
          code: 400,
          hint: "The file must be in JPG or PNG format",
        },
      };
      setPhotoError(error.error.message);
      errorMessage(error);
      return { isValid: false, error };
    }

    const oversizedGradingReports = gradingReports.some(
      (file) => file.file.size > 5 * 1024 * 1024,
    );
    if (oversizedGradingReports) {
      const error: APIErrorResponse = {
        success: false,
        error: {
          message: "Grading report exceeds 5MB",
          details: "Each file size must be less than 5MB",
          code: 413,
          hint: "Compress the file or upload a smaller version",
        },
      };
      setGradingReportError(error.error.message);
      errorMessage(error);
      return { isValid: false, error };
    }

    const oversizedPhotos = photos.some(
      (file) => file.file.size > 5 * 1024 * 1024,
    );
    if (oversizedPhotos) {
      const error: APIErrorResponse = {
        success: false,
        error: {
          message: "Photo exceeds 5MB",
          details: "Each file size must be less than 5MB",
          code: 413,
          hint: "Compress the file or upload a smaller version",
        },
      };
      setPhotoError(error.error.message);
      errorMessage(error);
      return { isValid: false, error };
    }

    return { isValid: true };
  };

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

  const onSubmit = async (data: CoffeeCropsFormData) => {
    setIsSubmitting(true);
    try {
      const isValid = await trigger();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      const fileValidation = validateFiles();
      if (!fileValidation.isValid) {
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      const transformedData = {
        ...data,
        cup_aroma: data.cup_aroma || [],
        cup_taste: data.cup_taste || [],
      };

      for (const key in transformedData) {
        if (key === "cup_aroma" || key === "cup_taste") {
          formData.append(key, JSON.stringify(transformedData[key]));
        } else if (Object.prototype.hasOwnProperty.call(transformedData, key)) {
          formData.append(
            key,
            String(transformedData[key as keyof CoffeeCropsFormData]),
          );
        }
      }

      gradingReports.forEach((file) => formData.append("files", file.file));
      photos.forEach((photo) => formData.append("files", photo.file));
      formData.append("farm_id", data.farmId!);

      if (isEditMode && id) {
        formData.append("listingId", id);
        await apiService().patchFormData(
          "/sellers/listings/update-listing",
          formData,
          true,
        );
        successMessage("Listing updated successfully!");
        navigate(`/manage-listing/${id}`);
      } else {
        const response: any = await apiService().postFormData(
          "/sellers/listings/create-listing",
          formData,
          true,
        );
        successMessage("Listing created successfully!");
        navigate(`/manage-listing/${response?.data.coffee_listing.id}`);
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  const gradeOptions = ["1", "2", "3", "4", "5", "UG"];
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

              <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">Select Farm</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose the farm where this crop is produced.
                </p>
                <FormField
                  control={form.control}
                  name="farmId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isLoadingFarms || farms.length === 0}
                        >
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
                          <SelectContent>
                            {farms.map((farm) => (
                              <SelectItem key={farm.id} value={farm.id}>
                                {farm.farm_name} ({farm.region || "N/A"},{" "}
                                {farm.country})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {farmError && (
                        <Alert
                          variant="destructive"
                          className="bg-red-50 border-red-200 rounded-lg mt-2"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle className="text-red-800 font-semibold">
                            Farm Error
                          </AlertTitle>
                          <AlertDescription className="text-red-700">
                            {farmError}{" "}
                            {farmError.includes("No farms found") && (
                              <a
                                href="/add-farm"
                                className="text-blue-600 underline"
                              >
                                Add a farm
                              </a>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {farms.length > 0 && (
                <>
                  <div className="mb-8">
                    <Card className="max-w-2xl mx-auto">
                      <CardHeader>
                        <CardTitle>Upload Grading Report</CardTitle>
                        <CardDescription>
                          Upload PDF documents or images (Max 5 files, 5MB each)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FileUpload
                          onFilesSelected={handleGradingReportsSelected}
                          maxFiles={5}
                          maxSizeMB={5}
                          initialFiles={gradingReports}
                        />
                        {gradingReportError && (
                          <p className="text-red-500 text-sm mt-2">
                            {gradingReportError}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <div className="text-sm text-muted-foreground">
                          {gradingReports.length > 0
                            ? `${gradingReports.length} files selected`
                            : "No files selected"}
                        </div>
                      </CardFooter>
                    </Card>
                    <p className="text-sm text-gray-600 mb-5 mt-4 text-center">
                      Submit your Grading Report to provide a detailed quality
                      assessment of your coffee.
                    </p>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">
                      Check and edit coffee crop information
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Provide details on crop variety, quality, quantity, and
                      base price.
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
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                                <SelectContent>
                                  {gradeOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      Grade {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select bean type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Green beans">
                                    Green beans
                                  </SelectItem>
                                </SelectContent>
                              </Select>
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
                                    onValueChange={field.onChange}
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
                      <FormField
                        control={form.control}
                        name="processing_method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Processing Method</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select processing method" />
                                </SelectTrigger>
                                <SelectContent>
                                  {processingMethodOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <h3 className="text-lg font-medium mb-4">
                      Crop specification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <FormField
                        control={form.control}
                        name="is_organic"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Is Organic?</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select organic status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">Yes</SelectItem>
                                  <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                              </Select>
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
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select screen size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {screenSizeOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                                            field.value?.includes(aroma) ||
                                            false
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
                                            field.value?.includes(taste) ||
                                            false
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

                    <h3 className="text-lg font-medium mb-4">
                      Coffee crop photos
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload high-quality images of your coffee crop (Max 6
                      files, 5MB each).
                    </p>
                    <Card className="max-w-2xl mx-auto">
                      <CardHeader>
                        <CardTitle>Coffee crop photos</CardTitle>
                        <CardDescription>
                          Upload images (Max 6 files, 5MB each)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FileUpload
                          onFilesSelected={handlePhotosSelected}
                          maxFiles={6}
                          maxSizeMB={5}
                          initialFiles={photos}
                        />
                        {photoError && (
                          <p className="text-red-500 text-sm mt-2">
                            {photoError}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <div className="text-sm text-muted-foreground">
                          {photos.length > 0
                            ? `${photos.length} files selected`
                            : "No files selected"}
                        </div>
                      </CardFooter>
                    </Card>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-2">Set the price</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Provide details on crop quantity and base price.
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
                            <FormLabel>
                              Community Base Price per kg (USD)
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  min={0}
                                  className="pl-8"
                                  value={field.value}
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
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-2">
                      Readiness and Delivery Details
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Specify the harvest readiness date, bagging period, and
                      delivery type.
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
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery type</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select delivery type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="FOB (Free on Board) - Port of Djibouti">
                                    FOB (Free on Board) - Port of Djibouti
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end mb-8">
                <Button
                  type="submit"
                  disabled={isSubmitting || farms.length < 1}
                  className="my-4"
                >
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

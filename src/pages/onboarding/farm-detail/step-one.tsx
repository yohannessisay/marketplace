"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  farmDetailsSchema,
  type FarmDetailsFormData,
} from "@/types/validation/seller-onboarding";
import { saveToLocalStorage, getFromLocalStorage } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "@/components/common/file-upload";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import CropFieldManager from "@/components/CropFieldManager";
import { useAuth } from "@/hooks/useAuth";

export default function StepOne() {
  const navigate = useNavigate();
  const { successMessage, errorMessage } = useNotification();
  const [isClient, setIsClient] = useState(false);
  const [govFiles, setGovFiles] = useState<File[]>([]);
  const [landFiles, setLandFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [govFileError, setGovFileError] = useState<string>("");
  const [landFileError, setLandFileError] = useState<string>("");
  const userProfile: any = getFromLocalStorage("userProfile", {});
  const currentUserStage = userProfile?.onboarding_stage;
  const { user, loading } = useAuth();
  const form = useForm<FarmDetailsFormData>({
    resolver: zodResolver(farmDetailsSchema),
    defaultValues: {
      region: "",
      longitude: 0,
      latitude: 0,
      crop_type: "",
      crop_source: "",
      origin: "",
      tree_type: "",
      tree_variety: "",
      soil_type: "",
      farm_name: "",
      town_location: "",
      country: "Ethiopia",
      total_size_hectares: 0,
      coffee_area_hectares: 0,
      altitude_meters: 0,
      capacity_kg: 0,
      avg_annual_temp: 0,
      annual_rainfall_mm: 0,
      polygon_coords: [],
    },
  });

  const { reset, watch } = form;

  useEffect(() => {
    setIsClient(true);
    const savedData = getFromLocalStorage<FarmDetailsFormData>(
      "step-one",
      {} as FarmDetailsFormData
    );
    if (savedData && Object.keys(savedData).length > 0) {
      const polygonCoords = Array.isArray(savedData.polygon_coords)
        ? savedData.polygon_coords
        : [];
      reset({ ...savedData, polygon_coords: polygonCoords });
    }

    // Load saved file paths from localStorage
    const savedGovFiles = getFromLocalStorage<string[]>("gov-files", []);
    const savedLandFiles = getFromLocalStorage<string[]>("land-files", []);

    // Reconstruct File objects from paths (if possible)
    const reconstructFiles = async (filePaths: string[]): Promise<File[]> => {
      const files: File[] = [];
      for (const path of filePaths) {
        try {
          const response = await fetch(path);
          if (!response.ok) throw new Error(`Failed to fetch ${path}`);
          const blob = await response.blob();
          const fileName = path.split("/").pop() || `file_${Date.now()}`;
          files.push(new File([blob], fileName, { type: blob.type }));
        } catch (err) {
          console.error(`Error reconstructing file from ${path}:`, err);
        }
      }
      return files;
    };

    Promise.all([
      reconstructFiles(savedGovFiles).then((files) => setGovFiles(files)),
      reconstructFiles(savedLandFiles).then((files) => setLandFiles(files)),
    ]).catch((err) => console.error("Error loading saved files:", err));
  }, [reset]);

  const validateFiles = (): { isValid: boolean; error?: APIErrorResponse } => {
    setGovFileError("");
    setLandFileError("");

    // Check if polygon_coords is empty
    const polygonCoords = form.getValues("polygon_coords");
    if (!polygonCoords || polygonCoords.length === 0) {
      const error: APIErrorResponse = {
        success: false,
        error: {
          message: "Farm boundary map is required",
          details: "Please draw the farm boundary on the map",
          code: 400,
          hint: "Use the map interface to outline your farm's boundaries",
        },
      };
      errorMessage(error);
      return { isValid: false, error };
    }

    if (
      govFiles.length === 0 &&
      userProfile.onboarding_stage === "farm_profile"
    ) {
      const error: APIErrorResponse = {
        success: false,
        error: {
          message: "Government registration document is required",
          details: "Please upload the government registration document",
          code: 400,
          hint: "The file must be in PDF, JPG, or PNG format",
        },
      };
      setGovFileError(error.error.message);
      errorMessage(error);
      return { isValid: false, error };
    }

    if (
      landFiles.length === 0 &&
      userProfile.onboarding_stage === "farm_profile"
    ) {
      const error: APIErrorResponse = {
        success: false,
        error: {
          message: "Land rights document is required",
          details: "Please upload the land rights document",
          code: 400,
          hint: "The file must be in PDF, JPG, or PNG format",
        },
      };
      setLandFileError(error.error.message);
      errorMessage(error);
      return { isValid: false, error };
    }

    const oversizedGovFiles = govFiles.some(
      (file) => file.size > 5 * 1024 * 1024
    );
    if (oversizedGovFiles) {
      const error: APIErrorResponse = {
        success: false,
        error: {
          message: "Government document exceeds 5MB",
          details: "File size must be less than 5MB",
          code: 413,
          hint: "Compress the file or upload a smaller version",
        },
      };
      setGovFileError(error.error.message);
      errorMessage(error);
      return { isValid: false, error };
    }

    const oversizedLandFiles = landFiles.some(
      (file) => file.size > 5 * 1024 * 1024
    );
    if (oversizedLandFiles) {
      const error: APIErrorResponse = {
        success: false,
        error: {
          message: "Land rights document exceeds 5MB",
          details: "File size must be less than 5MB",
          code: 413,
          hint: "Compress the file or upload a smaller version",
        },
      };
      setLandFileError(error.error.message);
      errorMessage(error);
      return { isValid: false, error };
    }

    return { isValid: true };
  };

  const onSubmit = async (data: FarmDetailsFormData) => {
    setIsSubmitting(true);
    try {
      const validation = validateFiles();
      if (!validation.isValid) {
        setIsSubmitting(false);
        return;
      }

      const isAgent = userProfile.userType;
      const farmer: any = getFromLocalStorage("farmer-profile", {});
      const formData = new FormData();

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (key === "polygon_coords") {
            formData.append(key, JSON.stringify(data.polygon_coords));
          } else {
            formData.append(
              key,
              String(data[key as keyof FarmDetailsFormData])
            );
          }
        }
      }

      // Append government and land files with distinct field names
      govFiles.forEach((file) => {
        formData.append(`files`, file);
      });

      landFiles.forEach((file) => {
        formData.append(`files`, file);
      });

      const govFilePaths = govFiles.map((file) => URL.createObjectURL(file));
      const landFilePaths = landFiles.map((file) => URL.createObjectURL(file));
      saveToLocalStorage("gov-files", govFilePaths);
      saveToLocalStorage("land-files", landFilePaths);

      const isBackButtonClicked = getFromLocalStorage(
        "back-button-clicked",
        false
      );

      if (
        (currentUserStage === "farm_profile" || isAgent === "agent") &&
        (getFromLocalStorage("current-step", "") as string) ===
          "farm_profile" &&
        !isBackButtonClicked
      ) {
        const response: any = await apiService().postFormData(
          "/onboarding/seller/farm-details",
          formData,
          true,
          isAgent === "agent" && farmer ? farmer.id : ""
        );

        if (response?.success) {
          userProfile.onboarding_stage = "crops_to_sell";
          saveToLocalStorage("userProfile", userProfile);
          saveToLocalStorage("step-one", data);
          if (response.data?.farm?.id) {
            saveToLocalStorage("farm-id", response.data.farm.id);
          }
          navigate("/onboarding/step-two");
          successMessage("Farm details saved successfully!");
          saveToLocalStorage("is-back-button-clicked", "false");
          localStorage.setItem("current-step", JSON.stringify("crops_to_sell"));
        } else {
          errorMessage(response?.error as APIErrorResponse);
        }
      } else {
        const existingFarmId = getFromLocalStorage("farm-id", "");
        formData.append("farmId", existingFarmId);

        try {
          const response: any = await apiService().patchFormData(
            "/sellers/farms/update-farm",
            formData,
            true,
            isAgent === "agent" && farmer ? farmer.id : ""
          );

          if (response.success) {
            saveToLocalStorage("is-back-button-clicked", "false");
            navigate("/onboarding/step-two");
            successMessage("Farm data updated successfully!");
          } else {
            errorMessage(response.error as APIErrorResponse);
          }
        } catch (error: any) {
          errorMessage(error as APIErrorResponse);
        }
      }
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    } finally {
      saveToLocalStorage("step-one", data);
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
    const fetchFirstFarm = async () => {
      try {
        if (!loading) {
          return;
        }

        const farmerId =
          user?.userType === "agent" ? userProfile?.id : undefined;

        const response: any = await apiService().get(
          "/onboarding/seller/get-first-farm",
          farmerId
        );

        if (response.success) {
          form.reset({
            ...response.data.farm,
            polygon_coords: response.data.farm.polygon_coords || [],
          });
          saveToLocalStorage("farm-id", response.data.farm.id);
        } else {
          errorMessage(response.error as APIErrorResponse);
        }
      } catch (error: any) {
        errorMessage(error as APIErrorResponse);
      }
    };
    if (currentUserStage !== "farm_profile") {
      fetchFirstFarm();
    }
  }, []);


  // Watch latitude and longitude for map centering
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Stepper currentStep={1} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 shadow-lg px-8 rounded-md py-4 bg-white"
        >
          {/* Document Upload Section */}
          <div className="mb-10">
            <div className="mb-2">
              <h2 className="text-green-600 font-medium">Step 1</h2>
              <h3 className="text-xl text-gray-900 font-semibold">
                Upload your farm documents
              </h3>
              <p className="text-sm text-gray-600">
                Upload clear government registration and land rights documents.
                Make sure text is readable and high-quality
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Government registration documents</CardTitle>
                  <CardDescription>
                    Upload PDF documents or images (Max 5 files, 5MB each)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFilesSelected={(files) => {
                      setGovFiles(files);
                      setGovFileError("");
                      const filePaths = files.map((file) =>
                        URL.createObjectURL(file)
                      );
                      saveToLocalStorage("gov-files", filePaths);
                    }}
                    maxFiles={5}
                    maxSizeMB={5}
                  />
                  {govFileError && (
                    <p className="text-red-500 text-sm mt-2">{govFileError}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-muted-foreground">
                    {govFiles.length > 0
                      ? `${govFiles.length} files selected`
                      : "No files selected"}
                  </div>
                </CardFooter>
              </Card>

              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Land right documents</CardTitle>
                  <CardDescription>
                    Upload PDF documents or images (Max 5 files, 5MB each)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFilesSelected={(files) => {
                      setLandFiles(files);
                      setLandFileError("");
                      // Save file paths to localStorage
                      const filePaths = files.map((file) =>
                        URL.createObjectURL(file)
                      );
                      saveToLocalStorage("land-files", filePaths);
                    }}
                    maxFiles={5}
                    maxSizeMB={5}
                  />
                  {landFileError && (
                    <p className="text-red-500 text-sm mt-2">{landFileError}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-muted-foreground">
                    {landFiles.length > 0
                      ? `${landFiles.length} files selected`
                      : "No files selected"}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Farm Information Section */}
          <div className="mb-10">
            <h3 className="text-xl text-gray-900 font-semibold mb-2">
              Check the farm information
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Check and fill in details about your farm's location, size,
              climate, and crops
            </p>

            {/* Farm Location */}
            <div className="mb-6">
              <h4 className="font-medium mb-4 text-gray-700">Farm Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="farm_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="town_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Town or Farm Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="total_size_hectares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total farm size (hectare)</FormLabel>
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coffee_area_hectares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total coffee size (hectar)</FormLabel>
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue =
                              value === "" ? 0 : Number(value);
                            field.onChange(parsedValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue =
                              value === "" ? 0 : Number(value);
                            field.onChange(parsedValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="altitude_meters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altitude (meters)</FormLabel>
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="polygon_coords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Boundary Map</FormLabel>
                      <FormControl>
                        <CropFieldManager
                          onPolygonChange={field.onChange}
                          initialPolygons={field.value || []}
                          center={
                            latitude !== 0 && longitude !== 0
                              ? { lat: latitude, lng: longitude }
                              : undefined
                          }
                          farmName={form.getValues("farm_name") || "New Farm"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Crop Environment */}
            <div className="mb-6">
              <h4 className="font-medium mb-4 text-gray-700">
                Crop environment
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="crop_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="crop_source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Source</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="origin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Crop Capacity */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="capacity_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Capacity (kg)</FormLabel>
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avg_annual_temp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Annual Temp</FormLabel>
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annual_rainfall_mm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Rainfall (mm)</FormLabel>
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tree Information */}
            <div className="mb-6">
              <h4 className="font-medium mb-4 text-gray-700">
                Tree information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tree_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tree Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select tree type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="shade_grown">
                            Shade-grown
                          </SelectItem>
                          <SelectItem value="sun grown">Sun-grown</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tree_variety"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tree Variety</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select tree variety" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="heirloom">Heirloom</SelectItem>
                          <SelectItem value="typica">Typica</SelectItem>
                          <SelectItem value="bourbon">Bourbon</SelectItem>
                          <SelectItem value="geisha">Geisha</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Growing Conditions */}
            <div className="mb-6">
              <h4 className="font-medium mb-4 text-gray-700">
                Growing Conditions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="soil_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soil type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select soil type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dark_soil">
                            Forest (Dark) Soil
                          </SelectItem>
                          <SelectItem value="sand_soil ">Sand Soil </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end mb-8">
            <Button type="submit" disabled={isSubmitting} className="my-4">
              {isSubmitting ? "Saving..." : "Save and continue"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

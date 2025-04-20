import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { saveToLocalStorage, getFromLocalStorage } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "@/components/common/file-upload";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { FileText, X } from "lucide-react";
import { APIErrorResponse } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";

// Define the FarmDetailsFormData type based on the schema
export type FarmDetailsFormData = z.infer<typeof farmDetailsSchema>;

// Define the Zod schema for farm details
export const farmDetailsSchema = z
  .object({
    region: z.string().min(1, "Region is required"),
    longitude: z.coerce.number().min(1, "Longitude is required"),
    latitude: z.coerce.number().min(1, "Latitude is required"),
    crop_type: z.string().min(1, "Crop type is required"),
    crop_source: z.string().min(1, "Crop source is required"),
    origin: z.string().min(1, "Origin is required"),
    tree_type: z.string().min(1, "Tree type is required"),
    tree_variety: z.string().min(1, "Tree variety is required"),
    soil_type: z.string().min(1, "Soil type is required"),
    farm_name: z.string().min(1, "Farm name is required"),
    town_location: z.string().min(1, "Town location is required"),
    country: z.string().min(1, "Country is required"),
    total_size_hectares: z.coerce.number().min(1, "Total size is required"),
    coffee_area_hectares: z.coerce.number().min(1, "Coffee area is required"),
    altitude_meters: z.coerce.number().min(1, "Altitude is required"),
    capacity_kg: z.coerce.number().min(1, "Capacity is required"),
    avg_annual_temp: z.coerce
      .number()
      .min(1, "Average annual temperature is required"),
    annual_rainfall_mm: z.coerce.number().min(1, "Annual rainfall is required"),
  })
  .refine((data) => data.coffee_area_hectares <= data.total_size_hectares, {
    message: "Coffee area cannot be greater than total farm size",
    path: ["coffee_area_hectares"],
  });

export default function StepOne() {
  const navigate = useNavigate();
  const { successMessage, errorMessage } = useNotification();
  const [isClient, setIsClient] = useState(false);
  const [govFiles, setGovFiles] = useState<File[]>([]);
  const [landFiles, setLandFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userProfile = localStorage.getItem("userProfile");
  const parsed = userProfile ? JSON.parse(userProfile) : null;
  const currentUserStage = parsed?.onboarding_stage;

  const handleGovFilesSelected = (selectedFiles: File[]) => {
    setGovFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleLandFilesSelected = (selectedFiles: File[]) => {
    setLandFiles((prev) => [...prev, ...selectedFiles]);
  };

  // Initialize form with default values or values from local storage
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
      country: "",
      total_size_hectares: 1,
      coffee_area_hectares: 1,
      altitude_meters: 0,
      capacity_kg: 1,
      avg_annual_temp: 1,
      annual_rainfall_mm: 0,
    },
  });

  const { reset } = form;

  // Load saved data from local storage on component mount
  useEffect(() => {
    setIsClient(true);
    const savedData = getFromLocalStorage<FarmDetailsFormData>(
      "step-one",
      {} as FarmDetailsFormData,
    );
    if (savedData && Object.keys(savedData).length > 0) {
      // Ensure numeric fields are parsed as numbers
      const parsedData: FarmDetailsFormData = {
        ...savedData,
        longitude: Number(savedData.longitude),
        latitude: Number(savedData.latitude),
        total_size_hectares: Number(savedData.total_size_hectares),
        coffee_area_hectares: Number(savedData.coffee_area_hectares),
        altitude_meters: Number(savedData.altitude_meters),
        capacity_kg: Number(savedData.capacity_kg),
        avg_annual_temp: Number(savedData.avg_annual_temp),
        annual_rainfall_mm: Number(savedData.annual_rainfall_mm),
      };
      reset(parsedData);
    }
  }, [reset]);

  const onSubmit = async (data: FarmDetailsFormData) => {
    setIsSubmitting(true);
    try {
      const farmer: any = getFromLocalStorage("farmer-profile", {});
      const formData = new FormData();

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          formData.append(key, String(data[key as keyof FarmDetailsFormData]));
        }
      }

      landFiles.forEach((file) => {
        formData.append("files", file);
      });
      govFiles.forEach((file) => {
        formData.append("files", file);
      });

      const isBackButtonClicked = getFromLocalStorage(
        "back-button-clicked",
        false
      );
      if (
        (user?.onboarding_stage === "farm_profile" ||
          user?.userType === "agent") &&
        (getFromLocalStorage("current-step", "") as string) === "farm_profile"
      ) {
        const response: any = await apiService().postFormData(
          "/onboarding/seller/farm-details",
          formData,
          true,
          user?.userType === "agent" && farmer ? farmer.id : "",
        );
        if (response && response.success) {
          parsed.onboarding_stage = "crops_to_sell";
          saveToLocalStorage("userProfile", parsed);
          saveToLocalStorage("step-one", data);
          if (response.data?.farm?.id) {
            saveToLocalStorage("farm-id", response.data.farm.id);
          }
          navigate("/onboarding/step-two");
          successMessage("Farm details saved successfully!");
          saveToLocalStorage("is-back-button-clicked", "false");
          localStorage.setItem("current-step", JSON.stringify("crops_to_sell"));
        } else {
          errorMessage("Failed to save farm details");
        }
      } else {
        const existingFarmId: any = getFromLocalStorage("farm-id", "");
        formData.append("farmId", existingFarmId);
        try {
          const response: any = await apiService().patchFormData(
            "/sellers/farms/update-farm",
            formData,
            true,
            user?.userType === "agent" && farmer ? farmer.id : "",
          );
          navigate("/onboarding/step-two");
          successMessage("Farm data updated");
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

  if (!isClient) {
    return null; // Or a loading indicator
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
                Upload one clear government registration and one land rights
                document. Ensure text is readable and high-quality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Government Document Card */}
              <Card className="max-w-2xl mx-auto w-full">
                <CardHeader>
                  <CardTitle className="truncate max-w-[250px]">
                    Government Registration Document
                  </CardTitle>
                  <CardDescription className="truncate max-w-[250px]">
                    {files.government
                      ? "Document uploaded"
                      : "Upload PDF/image (Max 5MB)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFilesSelected={handleGovFilesSelected}
                    maxFiles={5}
                    maxSizeMB={5}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {govFiles.length > 0
                      ? `${govFiles.length} file(s) selected`
                      : "No files selected"}
                  </div>
                </CardFooter>
              </Card>

              {/* Land Rights Document Card */}
              <Card className="max-w-2xl mx-auto w-full">
                <CardHeader>
                  <CardTitle className="truncate max-w-[250px]">
                    Land Rights Document
                  </CardTitle>
                  <CardDescription className="truncate max-w-[250px]">
                    {files.landRights
                      ? "Document uploaded"
                      : "Upload PDF/image (Max 5MB)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFilesSelected={handleLandFilesSelected}
                    maxFiles={5}
                    maxSizeMB={5}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {landFiles.length > 0
                      ? `${landFiles.length} file(s) selected`
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
                        <Input {...field} />
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
                      <FormLabel>Total farm size (hectar)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue =
                              value === "" ? 1 : Number(value);
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
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue =
                              value === "" ? 1 : Number(value);
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

            {/* Coffee Land Details */}
            <div className="mb-6">
              <h4 className="font-medium mb-4 text-gray-700">
                Coffee Land Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue =
                              value === "" ? 1 : Number(value);
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
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue =
                              value === "" ? 1 : Number(value);
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
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue =
                              value === "" ? 1 : Number(value);
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
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue =
                              value === "" ? 1 : Number(value);
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
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue =
                              value === "" ? 1 : Number(value);
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
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parsedValue =
                              value === "" ? 1 : Number(value);
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select tree type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Shade-grown">
                            Shade-grown
                          </SelectItem>
                          <SelectItem value="Sun-grown">Sun-grown</SelectItem>
                          <SelectItem value="Mixed">Mixed</SelectItem>
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select tree variety" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Heirloom">Heirloom</SelectItem>
                          <SelectItem value="Typica">Typica</SelectItem>
                          <SelectItem value="Bourbon">Bourbon</SelectItem>
                          <SelectItem value="Geisha">Geisha</SelectItem>
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select soil type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Volcanic loam">
                            Volcanic loam
                          </SelectItem>
                          <SelectItem value="Clay">Clay</SelectItem>
                          <SelectItem value="Sandy">Sandy</SelectItem>
                          <SelectItem value="Silty">Silty</SelectItem>
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

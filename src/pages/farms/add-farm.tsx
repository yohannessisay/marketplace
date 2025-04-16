import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  farmDetailsSchema,
  type FarmDetailsFormData,
} from "@/types/validation/seller-onboarding";
import { FileUpload } from "@/components/common/file-upload";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import Header from "@/components/layout/header";
import { getFromLocalStorage } from "@/lib/utils";
import { APIErrorResponse } from "@/types/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddFarm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { successMessage, errorMessage } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [govRegFiles, setGovRegFiles] = useState<File[]>([]);
  const [landRightsFiles, setLandRightsFiles] = useState<File[]>([]);

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
      total_size_hectares: 0,
      coffee_area_hectares: 0,
      altitude_meters: 0,
      capacity_kg: 0,
      avg_annual_temp: 0,
      annual_rainfall_mm: 0,
    },
  });

  // Populate form data for editing
  const populateForm = async (farmId: string) => {
    try {
      const response: any = await apiService().get(
        `/sellers/farms/get-farm?farmId=${farmId}`
      );
      if (response.success) {
        const farm = response.data.farm;

        form.reset({
          farm_name: farm.farm_name ?? "",
          town_location: farm.town_location ?? "",
          country: farm.country ?? "",
          region: farm.region ?? "",
          total_size_hectares: farm.total_size_hectares ?? 0,
          coffee_area_hectares: farm.coffee_area_hectares ?? 0,
          longitude: farm.longitude ?? 0,
          latitude: farm.latitude ?? 0,
          altitude_meters: farm.altitude_meters ?? 0,
          crop_type: farm.crop_type ?? "",
          crop_source: farm.crop_source ?? "",
          origin: farm.origin ?? "",
          tree_type: farm.tree_type ?? "",
          tree_variety: farm.tree_variety ?? "",
          soil_type: farm.soil_type ?? "",
          capacity_kg: farm.capacity_kg ?? 0,
          avg_annual_temp: farm.avg_annual_temp ?? 0,
          annual_rainfall_mm: farm.annual_rainfall_mm ?? 0,
        });

        // Handle files (if any)
        if (farm.kyc_documents) {
          const govRegFilesTemp: File[] = [];
          const landRightsFilesTemp: File[] = [];

          await Promise.all(
            farm.kyc_documents.map(async (doc: any) => {
              const response = await fetch(doc.doc_url);
              const blob = await response.blob();
              const file = new File(
                [blob],
                doc.doc_url.split("/").pop() || "file",
                {
                  type: blob.type,
                }
              );

              if (doc.doc_type === "government_registration") {
                govRegFilesTemp.push(file);
              } else if (doc.doc_type === "land_rights") {
                landRightsFilesTemp.push(file);
              }
            })
          );

          setGovRegFiles(govRegFilesTemp);
          setLandRightsFiles(landRightsFilesTemp);
        }
      }
    } catch (error) {
      console.error("Error fetching farm data:", error);
      errorMessage("Failed to fetch farm data.");
    }
  };

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      populateForm(id);
    }
  }, [id]);

  const onSubmit = async (data: FarmDetailsFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          formData.append(key, String(data[key as keyof FarmDetailsFormData]));
        }
      }

      // Append government registration files
      govRegFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Append land rights files
      landRightsFiles.forEach((file) => {
        formData.append("files", file);
      });

      const userProfile: any = getFromLocalStorage("userProfile", {});
      let xfmrId = null;
      if (
        userProfile &&
        userProfile.userType === "seller" &&
        isEditMode &&
        id
      ) {
        formData.append("farmId", id);
      }

      if (userProfile && userProfile.userType === "agent") {
        const farmerProfile: any = getFromLocalStorage("farmer-profile", {});
        xfmrId = farmerProfile.id ?? "";
      }

      if (isEditMode) {
        // Update existing listing
        await apiService().patchFormData(
          `/sellers/farms/update-farm`,
          formData,
          true,
          xfmrId ? xfmrId : ""
        );
        successMessage("Farm updated successfully!");
      } else {
        // Create new listing
        await apiService().postFormData(
          `/sellers/farms/create-farm`,
          formData,
          true,
          xfmrId ? xfmrId : ""
        );
        successMessage("Farm added successfully!");
      }

      navigate("/seller-dashboard");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-primary/5 py-8 px-8">
      <Header></Header>

      <div className="bg-white mx-auto container ">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 shadow-lg px-8  rounded-md py-4 mt-8"
          >
            <div className="mb-10">
              <div className="mb-2">
                <h2 className="text-green-600 font-medium">
                  {isEditMode ? "Edit Farm" : "Add Farm"}
                </h2>
                <h3 className="text-xl text-gray-900 font-semibold">
                  {isEditMode
                    ? "Update your farm details"
                    : "Upload your farm documents"}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEditMode
                    ? "Edit the details of your farm and save changes."
                    : "Upload a clear government registration and land rights document. Make sure text is readable and high-quality."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Government registration document</CardTitle>
                    <CardDescription>
                      Upload PDF documents and images. Drag and drop or click to
                      select files.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFilesSelected={(selectedFiles: File[]) => {
                        setGovRegFiles((prev) => [...prev, ...selectedFiles]);
                      }}
                      maxFiles={5}
                      maxSizeMB={5}
                      className="w-full"
                    />
                    {govRegFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium">Uploaded Files:</h4>
                        <ul className="list-disc pl-5">
                          {govRegFiles.map((file, index) => (
                            <li key={index} className="text-sm">
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      {govRegFiles.length > 0
                        ? `${govRegFiles.length} file(s) selected`
                        : "No files selected"}
                    </div>
                  </CardFooter>
                </Card>
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Land right documents</CardTitle>
                    <CardDescription>
                      Upload PDF documents and images. Drag and drop or click to
                      select files.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFilesSelected={(selectedFiles: File[]) => {
                        setLandRightsFiles((prev) => [
                          ...prev,
                          ...selectedFiles,
                        ]);
                      }}
                      maxFiles={5}
                      maxSizeMB={5}
                      className="w-full"
                    />
                    {landRightsFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium">Uploaded Files:</h4>
                        <ul className="list-disc pl-5">
                          {landRightsFiles.map((file, index) => (
                            <li key={index} className="text-sm">
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      {landRightsFiles.length > 0
                        ? `${landRightsFiles.length} file(s) selected`
                        : "No files selected"}
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Farm Information Section */}
            <div className="mb-10">
              <h3 className="text-xl text-gray-900 font-semibold mb-2">
                Farm Information
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Fill in details about your farm's location, size, climate, and
                crops.
              </p>

              {/* Farm Location */}
              <div className="mb-6">
                <h4 className="font-medium mb-4 text-gray-700">
                  Farm Location
                </h4>
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            } // Convert to number
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
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            } // Convert to number
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
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            } // Convert to number
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
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            } // Convert to number
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
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            } // Convert to number
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
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            } // Convert to number
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
                          value={field.value || ""} // Ensure value is never null or undefined
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  field.value ? field.value : "Select tree type"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="shade_grown">
                              Shade-grown
                            </SelectItem>
                            <SelectItem value="sun_grown">Sun-grown</SelectItem>
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
                          value={field.value || ""} // Ensure value is never null or undefined
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  field.value
                                    ? field.value
                                    : "Select tree variety"
                                }
                              />
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
                          value={field.value || ""} // Ensure value is never null or undefined
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  field.value ? field.value : "Select soil type"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="volcanic loam">
                              Volcanic loam
                            </SelectItem>
                            <SelectItem value="clay">Clay</SelectItem>
                            <SelectItem value="sandy">Sandy</SelectItem>
                            <SelectItem value="silty">Silty</SelectItem>
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
              <Button type="submit" disabled={isSubmitting} className=" my-4">
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Adding..."
                  : isEditMode
                  ? "Update Farm"
                  : "Add Farm"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

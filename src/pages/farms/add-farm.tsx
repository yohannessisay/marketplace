"use client";

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
import { FileText, X } from "lucide-react";

interface FileWithId extends File {
  id: string;
}

export default function AddFarm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { successMessage, errorMessage } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [govRegFiles, setGovRegFiles] = useState<FileWithId[]>([]);
  const [landRightsFiles, setLandRightsFiles] = useState<FileWithId[]>([]);

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
        `/sellers/farms/get-farm?farmId=${farmId}`,
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

        if (farm.kyc_documents?.length > 0) {
          const govRegFilesTemp: FileWithId[] = [];
          const landRightsFilesTemp: FileWithId[] = [];

          await Promise.all(
            farm.kyc_documents.map(async (doc: any) => {
              try {
                const res = await fetch(doc.doc_url);
                if (!res.ok) throw new Error(`Failed to fetch ${doc.doc_url}`);
                const blob = await res.blob();
                const fileName =
                  doc.doc_url.split("/").pop() || `document_${doc.id}`;
                const file = Object.assign(
                  new File([blob], fileName, { type: blob.type }),
                  { id: doc.id || Math.random().toString(36).substring(2) },
                );

                if (doc.doc_type === "government_registration") {
                  govRegFilesTemp.push(file);
                } else if (doc.doc_type === "land_rights") {
                  landRightsFilesTemp.push(file);
                }
              } catch (err) {
                console.error(`Error fetching document ${doc.doc_url}:`, err);
              }
            }),
          );

          setGovRegFiles(govRegFilesTemp);
          setLandRightsFiles(landRightsFilesTemp);
        }
      } else {
        throw new Error(response.message || "Failed to fetch farm data");
      }
    } catch (error) {
      console.error("Error fetching farm data:", error);
      errorMessage({ message: "Failed to fetch farm data." });
    }
  };

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      populateForm(id);
    }
  }, [id]);

  const handleRemoveFile = (id: string, type: "govReg" | "landRights") => {
    if (type === "govReg") {
      setGovRegFiles((prev) => prev.filter((file) => file.id !== id));
    } else {
      setLandRightsFiles((prev) => prev.filter((file) => file.id !== id));
    }
  };

  const onSubmit = async (data: FarmDetailsFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          formData.append(key, String(data[key as keyof FarmDetailsFormData]));
        }
      }

      govRegFiles.forEach((file) => {
        formData.append("files", file);
      });

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
        await apiService().patchFormData(
          `/sellers/farms/update-farm`,
          formData,
          true,
          xfmrId ? xfmrId : "",
        );
        successMessage("Farm updated successfully!");
      } else {
        await apiService().postFormData(
          `/sellers/farms/create-farm`,
          formData,
          true,
          xfmrId ? xfmrId : "",
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
      <Header />
      <div className="bg-white mx-auto container pt-5  mt-20 rounded-lg">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 shadow-lg px-8 rounded-md py-4 mt-8"
          >
            <div className="mb-10">
              <div className="mb-2">
                <h2 className="text-green-600 font-medium">
                  {isEditMode ? "Edit Your Farm" : "Add New Farm"}
                </h2>
                <h3 className="text-xl text-gray-900 font-semibold mt-4">
                  {isEditMode
                    ? "Update your farm details"
                    : "Upload your farm documents"}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {isEditMode
                    ? "Edit the details of your farm and save changes."
                    : "Upload a clear government registration and land rights document. Make sure text is readable and high-quality."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                {/* Government Registration Document */}
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Government registration document</CardTitle>
                    <CardDescription>
                      Upload PDF documents and images. Drag and drop or click to
                      select files.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {govRegFiles.length > 0 && (
                      <div className="mb-4 space-y-4">
                        {govRegFiles.map((file) => (
                          <Card
                            key={file.id}
                            className="p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-4">
                              <FileText className="h-8 w-8 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Government Registration
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveFile(file.id, "govReg")
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </Card>
                        ))}
                      </div>
                    )}
                    {govRegFiles.length === 0 && (
                      <FileUpload
                        onFilesSelected={(selectedFiles: File[]) => {
                          setGovRegFiles((prev) => [
                            ...prev,
                            ...selectedFiles.map((f) =>
                              Object.assign(f, {
                                id: Math.random().toString(36).substring(2),
                              }),
                            ),
                          ]);
                        }}
                        maxFiles={5}
                        maxSizeMB={5}
                        className="w-full"
                      />
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

                {/* Land Rights Document */}
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Land rights document</CardTitle>
                    <CardDescription>
                      Upload PDF documents and images. Drag and drop or click to
                      select files.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {landRightsFiles.length > 0 && (
                      <div className="mb-4 space-y-4">
                        {landRightsFiles.map((file) => (
                          <Card
                            key={file.id}
                            className="p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-4">
                              <FileText className="h-8 w-8 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Land Rights
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveFile(file.id, "landRights")
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </Card>
                        ))}
                      </div>
                    )}
                    {landRightsFiles.length === 0 && (
                      <FileUpload
                        onFilesSelected={(selectedFiles: File[]) => {
                          setLandRightsFiles((prev) => [
                            ...prev,
                            ...selectedFiles.map((f) =>
                              Object.assign(f, {
                                id: Math.random().toString(36).substring(2),
                              }),
                            ),
                          ]);
                        }}
                        maxFiles={5}
                        maxSizeMB={5}
                        className="w-full"
                      />
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
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Region</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
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
                    name="total_size_hectares"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Total farm size (hectar)</FormLabel>
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
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="coffee_area_hectares"
                    render={({ field }) => {
                      return (
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
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
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
                            }
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
                            }
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
                            }
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
                            }
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
                            }
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
                            }
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
                          value={field.value || ""}
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
                          value={field.value || ""}
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
              <Button type="submit" disabled={isSubmitting} className="my-4">
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

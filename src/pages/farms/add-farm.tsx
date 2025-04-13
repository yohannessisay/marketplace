import { useState } from "react";
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
import {
  farmDetailsSchema,
  type FarmDetailsFormData,
} from "@/types/validation/seller-onboarding";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "@/components/common/file-upload";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import Header from "@/components/layout/header";
import { getFromLocalStorage } from "@/lib/utils";

export default function AddFarm() {
  const navigate = useNavigate();
  const { successMessage, errorMessage } = useNotification();
  const [files, setFiles] = useState<File[]>([]);
  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Initialize form with default values or values from local storage
  const form = useForm<FarmDetailsFormData>({
    resolver: zodResolver(farmDetailsSchema),
    defaultValues: {
      region: "",
      longitude: "",
      latitude: "",
      crop_type: "",
      crop_source: "",
      origin: "",
      tree_type: "",
      tree_variety: "",
      soil_type: "",
      farm_name: "",
      town_location: "",
      country: "",
      total_size_hectares: "",
      coffee_area_hectares: "",
      altitude_meters: "",
      capacity_kg: "",
      avg_annual_temp: "",
      annual_rainfall_mm: "",
    },
  });

  const onSubmit = async (data: FarmDetailsFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          formData.append(key, String(data[key as keyof FarmDetailsFormData]));
        }
      }

      files.forEach((file) => {
        formData.append("files", file);
      });
      let response: { success: boolean } = { success: false };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userProfile: any = getFromLocalStorage("userProfile", {});
      let xfmrId = null;
      if (userProfile && userProfile.userType == "seller") {
        formData.append("sellerId", userProfile.id);
      }

      if (userProfile && userProfile.userType == "agent") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const farmerProfile: any = getFromLocalStorage("farmer-profile", {});
        xfmrId = farmerProfile.id ?? "";
      }
      // response =
      response = await apiService().postFormData(
        "/sellers/farms/create-farm",
        formData,
        true,
        xfmrId ? xfmrId : ""
      );
      if (response && response.success) {
        successMessage("Farm details saved successfully!");
        navigate("/seller-dashboard");
      } else {
        errorMessage("Something went wrong!");
        setIsSubmitting(false);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      
      errorMessage(
        error?.message || "An error occurred while saving farm details"
      );
    } finally {
      saveToLocalStorage("step-one", data);
      setIsSubmitting(false);
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveToLocalStorage = (key: string, value: any) => {
    const existingData = JSON.parse(localStorage.getItem(key) || "[]");
    const updatedData = [...existingData, value];
    localStorage.setItem(key, JSON.stringify(updatedData));
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
            {/* Document Upload Section */}
            <div className="mb-10">
              <div className="mb-2">
                <h2 className="text-green-600 font-medium">Step 1</h2>
                <h3 className="text-xl text-gray-900 font-semibold">
                  Upload your farm documents
                </h3>
                <p className="text-sm text-gray-600">
                  Upload a clear government registration and land rights
                  document. Make sure text is readable and high-quality
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
                      onFilesSelected={handleFilesSelected}
                      maxFiles={5}
                      maxSizeMB={5}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      {files.length > 0
                        ? `${files.length} file(s) selected`
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
                      onFilesSelected={handleFilesSelected}
                      maxFiles={5}
                      maxSizeMB={5}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      {files.length > 0
                        ? `${files.length} file(s) selected`
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input {...field} />
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
              <Button type="submit" disabled={isSubmitting} className=" my-4">
                {isSubmitting ? "Adding..." : "Add a new farm"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

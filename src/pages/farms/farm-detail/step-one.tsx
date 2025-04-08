import type React from "react";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function StepOne() {
  const navigate = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setUploadSuccess(false)
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In a real application, you would upload the files to your server here
    console.log("Files to upload:", files)

    setIsUploading(false)
    setUploadSuccess(true)
  }
  // Initialize form with default values or values from local storage
  const form = useForm<FarmDetailsFormData>({
    resolver: zodResolver(farmDetailsSchema),
    defaultValues: {
      farmLocation: "",
      region: "",
      totalFarmSize: "",
      coffeeCoveredLand: "",
      longitude: "",
      latitude: "",
      cropType: "",
      cropSource: "",
      origin: "",
      cropCapacity: "",
      treeType: "",
      treeVariety: "",
      averageTemperature: "",
      soilType: "",
      altitude: "",
      annualRainfall: "",
      farmName: "",
    },
  });



  // Load saved data from local storage on component mount
  useEffect(() => {
    setIsClient(true);
    const savedData = getFromLocalStorage<FarmDetailsFormData>(
      "step-one",
      {} as FarmDetailsFormData
    );
    if (savedData && Object.keys(savedData).length > 0) {
      form.reset(savedData);
    }
  }, [form]);

  const onSubmit = (data: FarmDetailsFormData) => {
    saveToLocalStorage("step-one", data);
    navigate("/onboarding/step-two");
  };

  if (!isClient) {
    return null; // Prevent hydration errors
  }

  return (
    <>
      <Stepper currentStep={1} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Document Upload Section */}
          <div className="mb-10">
            <div className="mb-2">
              <h2 className="text-green-600 font-medium">Step 1</h2>
              <h3 className="text-xl text-gray-900 font-semibold">
                Upload your farm documents
              </h3>
              <p className="text-sm text-gray-600">
                Upload a clear government registration and land rights document.
                Make sure text is readable and high-quality
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
              <h4 className="font-medium mb-4 text-gray-700">Farm Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="farmLocation"
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
                  name="totalFarmSize"
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
                  name="coffeeCoveredLand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coffee Covered Land (hectar)</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                  name="cropType"
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
                  name="cropSource"
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
                  name="cropCapacity"
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
                  name="treeType"
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
                  name="treeVariety"
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
                  name="averageTemperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Annual Temperature</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="soilType"
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
                <FormField
                  control={form.control}
                  name="altitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altitude (m)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="annualRainfall"
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

            {/* Farm Name */}
            <div className="mb-6">
              <h4 className="font-medium mb-4 text-gray-700">Name your farm</h4>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="farmName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} placeholder="Enter farm name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end mb-8">
            <Button type="submit">Save and continue</Button>
          </div>
        </form>
      </Form>
    </>
  );
}

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";

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

export default function StepTwo() {
  const navigation = useNavigate();
  const [isClient, setIsClient] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const { successMessage, errorMessage } = useNotification();
  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values or values from local storage
  const form = useForm<CoffeeCropsFormData>({
    resolver: zodResolver(coffeeCropsSchema),
    defaultValues: {
      coffee_variety: "Ethiopian Heirloom",
      grade: "Grade 1",
      bean_type: "Green beans",
      crop_year: "2024",
      processing_method: "Washed (Wet Process)",
      moisture_percentage: "11.5%",
      screen_size: "14",
      drying_method: "Sun dried on raised beds",
      wet_mill: "Hand-pulped and fermented",
      is_organic: "yes",
      cup_taste_acidity: "Delicate",
      cup_taste_body: "Heavy",
      cup_taste_sweetness: "Honey-like",
      cup_taste_aftertaste: "Long-lasting",
      cup_taste_balance: "Complex",
      quantity_kg: "5,000",
      price_per_kg: "$4.50",
      readiness_date: "October 2024",
      lot_length: "",
      delivery_type: "FOB (Free on Board) - Port of Djibouti",
      shipping_port: "",
      listing_status: "",
    },
  });

  // Load saved data from local storage on component mount
  useEffect(() => {
    setIsClient(true);
    const savedData = getFromLocalStorage<CoffeeCropsFormData>(
      "step-two",
      {} as CoffeeCropsFormData
    );
    if (savedData && Object.keys(savedData).length > 0) {
      form.reset(savedData);
    }
  }, [form]);

  // Handle form submission
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
      const farmId = localStorage.getItem("farm-id");
      if (farmId) {
        formData.append("farm_id", farmId.replace(/"/g, ""));
      }
      const response: { success: boolean } = await apiService().postFormData(
        "/onboarding/seller/coffee-details",
        formData,
        true
      );
      if (response && response.success) {
        saveToLocalStorage("step-two", data);
        navigation("/onboarding/step-three");
        localStorage.setItem("current-step", "bank_information");
        successMessage("Crop information saved successfully");
      } else {
        errorMessage("Failed to save farm details");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      errorMessage(
        error?.message || "An error occurred while saving farm details"
      );
      setIsSubmitting(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    navigation("/onboarding/step-one");
    localStorage.setItem("back-button-clicked", "true");
  };

  if (!isClient) {
    return null; // Prevent hydration errors
  }

  return (
    <div className="min-h-screen bg-white">
      <Header></Header>
      <main className="container mx-auto p-4 max-w-5xl">
        <Stepper currentStep={2} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 shadow-lg px-4  rounded-md py-4"
          >
            {/* Step 1: Upload Grading Report */}
            <div className="mb-8">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Upload grading report</CardTitle>
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
              <p className="text-sm text-gray-600 mb-4">
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                    <FormItem>
                      <FormLabel>Crop year</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Crop specification */}
              <h3 className="text-lg font-medium mb-4">Crop specification</h3>
              <FormField
                control={form.control}
                name="is_organic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is Organic?</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Cup taste */}
              <h3 className="text-lg font-medium mb-4">Cup taste</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <FormField
                  control={form.control}
                  name="cup_taste_acidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acidity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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

              <div className="mb-8">
                <h4 className="text-base font-medium mb-2">
                  Coffee Crop photos
                </h4>
                <div className="flex flex-wrap gap-4">
                  <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                      <CardTitle>Coffee crop photos</CardTitle>
                      <CardDescription>
                        Upload PDF documents and images. Drag and drop or click
                        to select files.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FileUpload
                        onFilesSelected={handleFilesSelected}
                        maxFiles={6}
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
                          <Input {...field} />
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
                          <Input {...field} />
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
                  <FormField
                    control={form.control}
                    name="listing_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Status</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                          <Input {...field} />
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
                          <Input {...field} />
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

                <Button
                  type="button"
                  variant="ghost"
                  className="flex items-center text-sm text-green-600 gap-1 mt-2 p-0 h-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add discount</span>
                </Button>
              </div>

              {/* Readiness and Delivery Details */}
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
                      <FormItem>
                        <FormLabel>Readiness date</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mb-8">
              <Button type="button" variant="outline" onClick={goBack}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting} className=" my-4">
              {isSubmitting ? "Saving..." : "Save and continue"}
            </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

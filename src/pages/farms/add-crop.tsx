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
import {
  coffeeCropsSchema,
  type CoffeeCropsFormData,
} from "@/types/validation/seller-onboarding";
import { useNavigate, useParams } from "react-router-dom";
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

export default function AddCrop() {
  const navigation = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const { successMessage, errorMessage } = useNotification();

  const form = useForm<CoffeeCropsFormData>({
    resolver: zodResolver(coffeeCropsSchema),
    defaultValues: {
      coffee_variety: "",
      grade: "",
      bean_type: "",
      crop_year: "",
      processing_method: "",
      moisture_percentage: "",
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

  // Populate form data for editing
  const populateForm = async (listingId: string) => {
    try {
      const response: any = await apiService().get(
        `/sellers/listings/get-listing?listingId=${listingId}`
      );
      if (response.success) {
        const listing = response.data.listing;

        form.reset({
          coffee_variety: listing.coffee_variety ?? "",
          grade: listing.grade ?? "",
          bean_type: listing.bean_type ?? "",
          crop_year: listing.crop_year ?? "",
          processing_method: listing.processing_method ?? "",
          moisture_percentage: listing.moisture_percentage ?? 0,
          screen_size: listing.screen_size ?? 0,
          drying_method: listing.drying_method ?? "",
          wet_mill: listing.wet_mill ?? "",
          is_organic: listing.is_organic ? "true" : "false",
          cup_taste_acidity: listing.cup_taste_acidity ?? "",
          cup_taste_body: listing.cup_taste_body ?? "",
          cup_taste_sweetness: listing.cup_taste_sweetness ?? "",
          cup_taste_aftertaste: listing.cup_taste_aftertaste ?? "",
          cup_taste_balance: listing.cup_taste_balance ?? "",
          quantity_kg: listing.quantity_kg ?? 0,
          price_per_kg: listing.price_per_kg ?? 0,
          readiness_date: listing.readiness_date ?? "",
          lot_length: listing.lot_length ?? "",
          delivery_type: listing.delivery_type ?? "",
          shipping_port: listing.shipping_port ?? "",
        });

        // Handle files and photos
        if (listing.documents) {
          const filesTemp: File[] = [];
          await Promise.all(
            listing.documents.map(async (doc: any) => {
              const response = await fetch(doc.doc_url);
              const blob = await response.blob();
              const file = new File([blob], doc.doc_url.split("/").pop() || "file", {
                type: blob.type,
              });
              filesTemp.push(file);
            })
          );
          setFiles(filesTemp);
        }

        if (listing.photos) {
          const photosTemp: File[] = [];
          await Promise.all(
            listing.photos.map(async (photo: any) => {
              const response = await fetch(photo.photo_url);
              const blob = await response.blob();
              const file = new File([blob], photo.photo_url.split("/").pop() || "photo", {
                type: blob.type,
              });
              photosTemp.push(file);
            })
          );
          setPhotos(photosTemp);
        }
      }
    } catch (error) {
      console.error("Error fetching listing data:", error);
      errorMessage("Failed to fetch listing data.");
    }
  };

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      populateForm(id);
    }
  }, [id]);

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

      if (isEditMode && id) {
        formData.append("listingId", id);
        await apiService().patchFormData(
          `/sellers/listings/update-listing`,
          formData,
          true
        );
        successMessage("Listing updated successfully!");
      } else {
        await apiService().postFormData(
          `/sellers/listings/create-listing`,
          formData,
          true
        );
        successMessage("Listing created successfully!");
      }

      navigation("/seller-dashboard");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

 

  return (
    <div className="min-h-screen bg-primary/5">
      <Header></Header>
      <main className="container mx-auto p-4 max-w-5xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 shadow-lg p-8  rounded-md py-4  bg-white"
          >
            <h2 className="text-center text-2xl">
              {isEditMode ? "Edit Crop" : "Add Crop To Your Existing Farm"}
            </h2>
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
                    onFilesSelected={setFiles}
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
                        onFilesSelected={setPhotos}
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
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)} // Convert to number
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
                            value={field.value || ""}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)} // Convert to number
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
                            {...field}
                            value={field.value || ""}
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
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)} // Convert to number
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
            <div className="flex justify-end mb-8">
             
              <Button type="submit" disabled={isSubmitting} className="my-4">
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
      </main>
    </div>
  );
}

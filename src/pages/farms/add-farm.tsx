"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import { FileUpload, FileWithPreview } from "@/components/common/file-upload";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { getFromLocalStorage } from "@/lib/utils";
import { APIErrorResponse } from "@/types/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkeletonForm } from "./SkeletonForm";
import { useAuth } from "@/hooks/useAuth";
import CropFieldManager from "@/components/CropFieldManager";
import Header from "@/components/layout/header";
import ConfirmationModal from "@/components/modals/ConfrmationModal";
import { FARMER_PROFILE_KEY } from "@/types/constants";

export default function AddFarm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { successMessage, errorMessage } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [govRegFiles, setGovRegFiles] = useState<FileWithPreview[]>([]);
  const [landRightsFiles, setLandRightsFiles] = useState<FileWithPreview[]>([]);
  const [farmPhotos, setFarmPhotos] = useState<FileWithPreview[]>([]);
  const [govFileError, setGovFileError] = useState<string>("");
  const [landFileError, setLandFileError] = useState<string>("");
  const [farmPhotoError, setFarmPhotoError] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const farmerProfile: any = getFromLocalStorage(FARMER_PROFILE_KEY, {});

  const form = useForm<FarmDetailsFormData>({
    resolver: zodResolver(farmDetailsSchema),
    defaultValues: {
      region: undefined,
      longitude: undefined,
      latitude: undefined,
      crop_type: "",
      crop_source: undefined,
      origin: undefined,
      tree_type: "",
      tree_variety: "",
      soil_type: undefined,
      farm_name: "",
      town_location: "",
      country: "Ethiopia",
      total_size_hectares: 0,
      coffee_area_hectares: 0,
      altitude_meters: undefined,
      capacity_kg: 0,
      avg_annual_temp: 0,
      annual_rainfall_mm: 0,
      polygon_coords: [],
    },
  });

  const { trigger } = form;

  const farmName = useWatch({
    control: form.control,
    name: "farm_name",
    defaultValue: "",
  });

  useEffect(() => {
    if (user?.userType === "seller" && user.onboarding_stage !== "completed") {
      navigate("/home");
    }
  }, [navigate, user]);

  const normalizeSelectValue = (
    value: string | null | undefined,
    validValues: string[],
  ): string => {
    if (!value) return "";
    const normalized = value.toLowerCase().replace(/\s+/g, "_");
    return validValues.includes(normalized) ? normalized : "";
  };

  const populateForm = async (farmId: string) => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const farmerId =
        user.userType === "agent" ? farmerProfile?.id : undefined;

      const response: any = await apiService().get(
        `/sellers/farms/get-farm?farmId=${farmId}`,
        farmerId,
      );

      if (response.success) {
        const farm = response.data.farm;

        const validTreeTypes = ["shade_grown", "sun_grown", "mixed"];
        const validTreeVarieties = ["heirloom", "typica", "bourbon", "geisha"];
        const validSoilTypes = ["Forest (Dark) Soil", "Sand Soil"];
        const validRegions = ["Oromia", "SNNPR"];
        const validCropSources = [
          "Jimma, Oromia, Ethiopia",
          "Guji, Oromia, Ethiopia",
          "Harar, Oromia, Ethiopia",
          "Illubabor, Oromia, Ethiopia",
        ];
        const validOrigins = [
          "Gomma, Jimma",
          "Mana, Jimma",
          "Limu, Jimma",
          "Gera, Jimma",
          "Adola-reda, Guji",
          "Urga, Guji",
          "Shakiso, Guji",
          "Hambela, Guji",
          "West Hararghe, Harrar",
          "Sidama",
          "Yirgachefe",
        ];
        const validAltitudes = ["Above 2200", "Below 2200"];

        const polygonCoords = Array.isArray(farm.polygon_coords)
          ? farm.polygon_coords
          : [];

        form.reset({
          farm_name: farm.farm_name,
          town_location: farm.town_location,
          country: farm.country,
          region: validRegions.includes(farm.region) ? farm.region : "Oromia",
          total_size_hectares: farm.total_size_hectares ?? 0.1,
          coffee_area_hectares: farm.coffee_area_hectares ?? 0.1,
          longitude: farm.longitude ?? undefined,
          latitude: farm.latitude ?? undefined,
          altitude_meters: validAltitudes.includes(farm.altitude_meters)
            ? farm.altitude_meters
            : farm.altitude_meters >= 2200
              ? "Above 2200"
              : "Below 2200",
          crop_type: farm.crop_type ?? "Coffee",
          crop_source: validCropSources.includes(farm.crop_source)
            ? farm.crop_source
            : "Jimma, Oromia, Ethiopia",
          origin: validOrigins.includes(farm.origin)
            ? farm.origin
            : "Gomma, Jimma",
          tree_type: normalizeSelectValue(farm.tree_type, validTreeTypes),
          tree_variety: normalizeSelectValue(
            farm.tree_variety,
            validTreeVarieties,
          ),
          soil_type: validSoilTypes.includes(farm.soil_type)
            ? farm.soil_type
            : "Forest (Dark) Soil",
          capacity_kg: farm.capacity_kg ?? 1,
          avg_annual_temp: farm.avg_annual_temp ?? 15,
          annual_rainfall_mm: farm.annual_rainfall_mm ?? 600,
          polygon_coords: polygonCoords,
        });

        if (farm.kyc_documents?.length > 0) {
          const govRegFilesTemp: FileWithPreview[] = [];
          const landRightsFilesTemp: FileWithPreview[] = [];

          await Promise.all(
            farm.kyc_documents.map(async (doc: any) => {
              try {
                const res = await fetch(doc.doc_url);
                if (!res.ok) throw new Error(`Failed to fetch ${doc.doc_url}`);
                const blob = await res.blob();
                const fileName =
                  doc.doc_url.split("/").pop() || `document_${doc.id}`;
                const file = new File([blob], fileName, { type: blob.type });
                const preview = URL.createObjectURL(file);
                const type = file.type === "application/pdf" ? "pdf" : "image";

                const fileWithPreview: FileWithPreview = {
                  file,
                  preview,
                  type,
                };

                if (doc.doc_type === "government_registration") {
                  govRegFilesTemp.push(fileWithPreview);
                } else if (doc.doc_type === "land_rights") {
                  landRightsFilesTemp.push(fileWithPreview);
                }
              } catch (err) {
                console.error(
                  `[AddFarm] Error fetching document ${doc.doc_url}:`,
                  err,
                );
              }
            }),
          );

          setGovRegFiles(govRegFilesTemp);
          setLandRightsFiles(landRightsFilesTemp);
        }

        if (farm.photos?.length > 0) {
          const photosTemp: FileWithPreview[] = await Promise.all(
            farm.photos.map(async (photo: any) => {
              try {
                const res = await fetch(photo.photo_url);
                if (!res.ok)
                  throw new Error(`Failed to fetch ${photo.photo_url}`);
                const blob = await res.blob();
                const fileName =
                  photo.photo_url.split("/").pop() || `farm_photo_${photo.id}`;
                const file = new File([blob], fileName, { type: blob.type });
                const preview = URL.createObjectURL(file);
                const type = file.type === "application/pdf" ? "pdf" : "image";
                return { file, preview, type } as FileWithPreview;
              } catch (err) {
                console.error(
                  `[AddFarm] Error fetching farm photo ${photo.photo_url}:`,
                  err,
                );
                return null;
              }
            }),
          );
          const validPhotos = photosTemp.filter(
            (photo): photo is FileWithPreview => photo !== null,
          );
          setFarmPhotos(validPhotos);
        }
      } else {
        throw new Error(response.message || "Failed to fetch farm data");
      }
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      populateForm(id);
    }
  }, [id, user]);

  const validateFiles = (): { isValid: boolean; error?: APIErrorResponse } => {
    setGovFileError("");
    setLandFileError("");
    setFarmPhotoError("");

    if (govRegFiles.length === 0) {
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

    if (landRightsFiles.length === 0) {
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

    if (farmPhotos.length === 0) {
      const error: APIErrorResponse = {
        success: false,
        error: {
          message: "At least one farm photo is required",
          details: "Please upload at least one farm photo",
          code: 400,
          hint: "The file must be in JPG or PNG format, up to 5MB",
        },
      };
      setFarmPhotoError(error.error.message);
      errorMessage(error);
      return { isValid: false, error };
    }

    const oversizedGovFiles = govRegFiles.some(
      (file) => file.file.size > 5 * 1024 * 1024,
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

    const oversizedLandFiles = landRightsFiles.some(
      (file) => file.file.size > 5 * 1024 * 1024,
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

    const oversizedFarmPhotos = farmPhotos.some(
      (photo) => photo.file.size > 5 * 1024 * 1024,
    );
    if (oversizedFarmPhotos) {
      const error: APIErrorResponse = {
        success: false,
        error: {
          message: "Farm photo exceeds 5MB",
          details: "File size must be less than 5MB",
          code: 413,
          hint: "Compress the file or upload a smaller version",
        },
      };
      setFarmPhotoError(error.error.message);
      errorMessage(error);
      return { isValid: false, error };
    }

    return { isValid: true };
  };

  const handleFormSubmit = () => {
    setIsSubmitting(true);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FarmDetailsFormData) => {
    setIsSubmitting(true);
    try {
      const isValid = await trigger();
      if (!isValid) {
        const errors = form.formState.errors;
        if (errors.polygon_coords) {
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
        }
        setIsSubmitting(false);
        return;
      }

      const fileValidation = validateFiles();
      if (!fileValidation.isValid) {
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (key === "polygon_coords") {
            formData.append(key, JSON.stringify(data.polygon_coords));
          } else {
            formData.append(
              key,
              String(data[key as keyof FarmDetailsFormData]),
            );
          }
        }
      }

      govRegFiles.forEach((file) => {
        formData.append("government_registration", file.file);
      });

      landRightsFiles.forEach((file) => {
        formData.append("land_rights", file.file);
      });

      farmPhotos.forEach((photo) => {
        formData.append("farm_photos", photo.file);
      });

      let xfmrId: string | null = null;
      if (user && user.userType === "agent") {
        xfmrId = farmerProfile.id ?? "";
      }

      if (isEditMode && id) {
        formData.append("farmId", id);

        await apiService().patchFormData(
          `/sellers/farms/update-farm`,
          formData,
          true,
          xfmrId ? xfmrId : "",
        );

        successMessage("Farm updated successfully!");
        navigate("/seller-dashboard");
      } else {
        await apiService().postFormData(
          `/sellers/farms/create-farm`,
          formData,
          true,
          xfmrId ? xfmrId : "",
        );
        successMessage("Farm added successfully!");
        navigate("/seller-dashboard");
      }
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  const handleConfirmSubmit = () => {
    form.handleSubmit(onSubmit)();
    setIsModalOpen(false);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-primary/5 py-8 px-8">
      <Header />
      <div className="bg-white mx-auto container pt-5 mt-20 rounded-lg">
        {isEditMode && isLoading ? (
          <SkeletonForm />
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-8 shadow-lg px-8 rounded-md py-4 bg-white"
            >
              <div className="mb-10">
                <div className="mb-2">
                  <h2 className="text-green-600 font-medium">
                    {isEditMode ? "Edit Farm" : "Add Farm"}
                  </h2>
                  <h3 className="text-xl text-gray-900 font-semibold">
                    Upload your farm documents and photos
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload clear government registration, land rights documents,
                    and high-quality farm photos. Make sure text is readable and
                    images are clear.
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
                          setGovRegFiles(
                            files.map((file) => ({
                              file,
                              preview: URL.createObjectURL(file),
                              type:
                                file.type === "application/pdf"
                                  ? "pdf"
                                  : "image",
                            })),
                          );
                          setGovFileError("");
                        }}
                        maxFiles={5}
                        maxSizeMB={5}
                        initialFiles={govRegFiles}
                      />
                      {govFileError && (
                        <p className="text-red-500 text-sm mt-2">
                          {govFileError}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <div className="text-sm text-muted-foreground">
                        {govRegFiles.length > 0
                          ? `${govRegFiles.length} files selected`
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
                          setLandRightsFiles(
                            files.map((file) => ({
                              file,
                              preview: URL.createObjectURL(file),
                              type:
                                file.type === "application/pdf"
                                  ? "pdf"
                                  : "image",
                            })),
                          );
                          setLandFileError("");
                        }}
                        maxFiles={5}
                        maxSizeMB={5}
                        initialFiles={landRightsFiles}
                      />
                      {landFileError && (
                        <p className="text-red-500 text-sm mt-2">
                          {landFileError}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <div className="text-sm text-muted-foreground">
                        {landRightsFiles.length > 0
                          ? `${landRightsFiles.length} files selected`
                          : "No files selected"}
                      </div>
                    </CardFooter>
                  </Card>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Farm photos</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload high-quality images of your farm to showcase its
                    environment (Max 6 files, 5MB each).
                  </p>
                  <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                      <CardTitle>Farm photos</CardTitle>
                      <CardDescription>
                        Upload images (Max 6 files, 5MB each). Drag and drop or
                        click to select files.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FileUpload
                        onFilesSelected={(files) => {
                          setFarmPhotos(
                            files.map((file) => ({
                              file,
                              preview: URL.createObjectURL(file),
                              type:
                                file.type === "application/pdf"
                                  ? "pdf"
                                  : "image",
                            })),
                          );
                          setFarmPhotoError("");
                        }}
                        maxFiles={6}
                        maxSizeMB={5}
                        initialFiles={farmPhotos}
                      />
                      {farmPhotoError && (
                        <p className="text-red-500 text-sm mt-2">
                          {farmPhotoError}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <div className="text-sm text-muted-foreground">
                        {farmPhotos.length > 0
                          ? `${farmPhotos.length} photo(s) selected`
                          : "No photos selected"}
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-xl text-gray-900 font-semibold mb-2">
                  Check the farm information
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Check and fill in details about your farm's location, size,
                  climate, and crops
                </p>

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
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select region" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Oromia">Oromia</SelectItem>
                              <SelectItem value="SNNPR">SNNPR</SelectItem>
                            </SelectContent>
                          </Select>
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
                              value={field.value}
                              onChange={(e) => {
                                const value = e.target.value;
                                const parsedValue =
                                  value === "" ? 0.1 : Number(value);
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
                          <FormLabel>Total coffee size (hectare)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value}
                              onChange={(e) => {
                                const value = e.target.value;
                                const parsedValue =
                                  value === "" ? 0.1 : Number(value);
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
                          <FormLabel>Altitude</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select altitude" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Above 2200">
                                Above 2200 meters
                              </SelectItem>
                              <SelectItem value="Below 2200">
                                Below 2200 meters
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                              onPolygonChange={(polygons) => {
                                field.onChange(polygons);
                                if (
                                  polygons.length > 0 &&
                                  polygons[0].length > 0
                                ) {
                                  const calculateApproxArea = (
                                    coords: { lat: number; lng: number }[],
                                  ): number => {
                                    if (!coords || coords.length < 3) return 0;
                                    const R = 6371000;
                                    let area = 0;
                                    for (let i = 0; i < coords.length; i++) {
                                      const j = (i + 1) % coords.length;
                                      const lat1 =
                                        (coords[i].lat * Math.PI) / 180;
                                      const lng1 =
                                        (coords[i].lng * Math.PI) / 180;
                                      const lat2 =
                                        (coords[j].lat * Math.PI) / 180;
                                      const lng2 =
                                        (coords[j].lng * Math.PI) / 180;
                                      area +=
                                        (lng2 - lng1) *
                                        (2 + Math.sin(lat1) + Math.sin(lat2));
                                    }
                                    area = Math.abs((area * R * R) / 2);
                                    return area / 10000; // Convert to hectares
                                  };
                                  const area = calculateApproxArea(polygons[0]);
                                  form.setValue("total_size_hectares", area, {
                                    shouldValidate: true,
                                  });

                                  const calculateCenter = (
                                    polygons: { lat: number; lng: number }[][],
                                  ) => {
                                    if (
                                      !polygons.length ||
                                      !polygons[0].length
                                    ) {
                                      return { lat: 9.03, lng: 38.74 };
                                    }
                                    const coords = polygons[0];
                                    let latSum = 0;
                                    let lngSum = 0;
                                    for (const coord of coords) {
                                      latSum += coord.lat;
                                      lngSum += coord.lng;
                                    }
                                    return {
                                      lat: latSum / coords.length,
                                      lng: lngSum / coords.length,
                                    };
                                  };
                                  const center = calculateCenter(polygons);
                                  form.setValue("latitude", center.lat, {
                                    shouldValidate: true,
                                  });
                                  form.setValue("longitude", center.lng, {
                                    shouldValidate: true,
                                  });
                                } else {
                                  form.setValue("total_size_hectares", 0, {
                                    shouldValidate: true,
                                  });
                                  form.setValue("latitude", 7.67, {
                                    shouldValidate: true,
                                  });
                                  form.setValue("longitude", 36.83, {
                                    shouldValidate: true,
                                  });
                                }
                              }}
                              initialPolygons={field.value}
                              center={{ lat: 9.03, lng: 38.74 }}
                              farmName={farmName || "New Farm"}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              {...field}
                              disabled
                              value={field.value?.toFixed(6) ?? ""}
                              placeholder="Calculated from boundary"
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
                              {...field}
                              disabled
                              value={field.value?.toFixed(6) ?? ""}
                              placeholder="Calculated from boundary"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select crop source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Jimma, Oromia, Ethiopia">
                              Jimma, Oromia, Ethiopia
                            </SelectItem>
                            <SelectItem value="Guji, Oromia, Ethiopia">
                              Guji, Oromia, Ethiopia
                            </SelectItem>
                            <SelectItem value="Harar, Oromia, Ethiopia">
                              Harar, Oromia, Ethiopia
                            </SelectItem>
                            <SelectItem value="Illubabor, Oromia, Ethiopia">
                              Illubabor, Oromia, Ethiopia
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select origin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Gomma, Jimma">
                              Gomma, Jimma
                            </SelectItem>
                            <SelectItem value="Mana, Jimma">
                              Mana, Jimma
                            </SelectItem>
                            <SelectItem value="Limu, Jimma">
                              Limu, Jimma
                            </SelectItem>
                            <SelectItem value="Gera, Jimma">
                              Gera, Jimma
                            </SelectItem>
                            <SelectItem value="Adola-reda, Guji">
                              Adola-reda, Guji
                            </SelectItem>
                            <SelectItem value="Urga, Guji">
                              Urga, Guji
                            </SelectItem>
                            <SelectItem value="Shakiso, Guji">
                              Shakiso, Guji
                            </SelectItem>
                            <SelectItem value="Hambela, Guji">
                              Hambela, Guji
                            </SelectItem>
                            <SelectItem value="West Hararghe, Harrar">
                              West Hararghe, Harrar
                            </SelectItem>
                            <SelectItem value="Sidama">Sidama</SelectItem>
                            <SelectItem value="Yirgachefe">
                              Yirgachefe
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

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
                            value={field.value}
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
                            type="number"
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              const parsedValue =
                                value === "" ? 15 : Number(value);
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
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              const parsedValue =
                                value === "" ? 600 : Number(value);
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
                          value={field.value}
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
                          value={field.value}
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
                        <FormLabel>Soil Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select soil type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Forest (Dark) Soil">
                              Forest (Dark) Soil
                            </SelectItem>
                            <SelectItem value="Sand Soil">Sand Soil</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

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
        )}
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={handleModalCancel}
          title={isEditMode ? "Confirm Edit Farm" : "Confirm Add Farm"}
          message="Once submitted, you cannot edit the farm data until you submit an edit request. Please ensure all information, documents, and photos are correct before proceeding."
          confirmText="Proceed"
          cancelText="Cancel"
          onConfirm={handleConfirmSubmit}
          isDestructive={false}
        />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
} from "@/lib/utils";
import { FileUpload, FileWithPreview } from "@/components/common/file-upload";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import CropFieldManager from "@/components/CropFieldManager";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { PolygonCoord } from "@/components/GoogleMaps";
import {
  BACK_BUTTON_CLICKED_KEY,
  FARM_ID_KEY,
  FARMER_PROFILE_KEY,
  STEP_ONE_KEY,
} from "@/types/constants";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StepOne() {
  const navigate = useNavigate();
  const { successMessage, errorMessage } = useNotification();
  const [govRegFiles, setGovRegFiles] = useState<FileWithPreview[]>([]);
  const [landRightsFiles, setLandRightsFiles] = useState<FileWithPreview[]>([]);
  const [farmPhotos, setFarmPhotos] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [govFileError, setGovFileError] = useState<string>("");
  const [landFileError, setLandFileError] = useState<string>("");
  const [farmPhotoError, setFarmPhotoError] = useState<string>("");
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const { user, loading, setUser } = useAuth();
  const farmerProfile: any = getFromLocalStorage(FARMER_PROFILE_KEY, {});
  const effectiveOnboardingStage =
    user?.userType === "agent"
      ? farmerProfile.onboarding_stage
      : user?.onboarding_stage;

  const xfmrId = farmerProfile.id ?? "";

  const existingFarmId = getFromLocalStorage(FARM_ID_KEY, "");
  const isBackButtonClicked =
    getFromLocalStorage(BACK_BUTTON_CLICKED_KEY, {}) === "true";

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

  const calculateCenter = (polygons: PolygonCoord[][]) => {
    if (!polygons.length || !polygons[0].length)
      return { lat: 9.03, lng: 38.74 };

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

  const calculateApproxArea = (coords: PolygonCoord[]): number => {
    if (!coords || coords.length < 3) return 0;

    const R = 6371000;
    let area = 0;

    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      const lat1 = (coords[i].lat * Math.PI) / 180;
      const lng1 = (coords[i].lng * Math.PI) / 180;
      const lat2 = (coords[j].lat * Math.PI) / 180;
      const lng2 = (coords[j].lng * Math.PI) / 180;
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs((area * R * R) / 2);
    return area / 10000;
  };

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

  const fetchFirstFarm = async () => {
    setIsLoadingFiles(true);
    try {
      if (loading || !user) {
        return;
      }

      const response: any = await apiService().get(
        "/onboarding/seller/get-first-farm",
        xfmrId ? xfmrId : "",
      );

      if (response.success) {
        const farm = response.data.farm;

        const polygonCoords = Array.isArray(farm.polygon_coords)
          ? farm.polygon_coords
          : [];

        form.reset({
          farm_name: farm.farm_name,
          polygon_coords: polygonCoords,
          region: farm.region,
          crop_source: farm.crop_source,
          origin: farm.origin,
          soil_type: farm.soil_type,
          altitude_meters: farm.altitude_meters,
          crop_type: farm.crop_type,
          tree_type: farm.tree_type,
          tree_variety: farm.tree_variety,
          town_location: farm.town_location,
          country: farm.country,
          total_size_hectares: farm.total_size_hectares,
          coffee_area_hectares: farm.coffee_area_hectares,
          capacity_kg: farm.capacity_kg,
          avg_annual_temp: farm.avg_annual_temp,
          annual_rainfall_mm: farm.annual_rainfall_mm,
          latitude: farm.latitude,
          longitude: farm.longitude,
        });

        saveToLocalStorage(FARM_ID_KEY, farm.id);

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
          const photosTemp: (FileWithPreview | null)[] = await Promise.all(
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
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (
      effectiveOnboardingStage !== "farm_profile" &&
      existingFarmId &&
      isBackButtonClicked
    ) {
      fetchFirstFarm();
    }
  }, [effectiveOnboardingStage, isBackButtonClicked, existingFarmId]);

  const onSubmit = async (data: FarmDetailsFormData) => {
    setIsSubmitting(true);

    try {
      const isValid = await trigger();
      if (!isValid) {
        const errors = form.formState.errors;
        const fieldOrder: (keyof FarmDetailsFormData)[] = [
          "farm_name",
          "town_location",
          "country",
          "region",
          "altitude_meters",
          "polygon_coords",
          "latitude",
          "longitude",
          "total_size_hectares",
          "coffee_area_hectares",
          "crop_type",
          "crop_source",
          "origin",
          "capacity_kg",
          "avg_annual_temp",
          "annual_rainfall_mm",
          "tree_type",
          "tree_variety",
          "soil_type",
        ];

        const fieldLabels: Partial<Record<keyof FarmDetailsFormData, string>> =
          {
            farm_name: "Farm Name",
            town_location: "Town or Farm Location",
            country: "Country",
            region: "Region",
            altitude_meters: "Altitude",
            polygon_coords: "Farm Boundary Map",
            latitude: "Latitude",
            longitude: "Longitude",
            total_size_hectares: "Total Farm Size",
            coffee_area_hectares: "Total Coffee Size",
            crop_type: "Crop Type",
            crop_source: "Crop Source",
            origin: "Origin",
            capacity_kg: "Crop Capacity",
            avg_annual_temp: "Average Annual Temperature",
            annual_rainfall_mm: "Annual Rainfall",
            tree_type: "Tree Type",
            tree_variety: "Tree Variety",
            soil_type: "Soil Type",
          };
        const missingFields = fieldOrder
          .filter((field) => errors[field])
          .map((field) => fieldLabels[field] || field)
          .join(", ");

        if (missingFields) {
          const error: APIErrorResponse = {
            success: false,
            error: {
              message: `Fill the missing fields: ${missingFields}`,
              details: "Please complete all required fields before submitting",
              code: 400,
              hint: "Check the form for highlighted errors",
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

      if (
        effectiveOnboardingStage === "farm_profile" &&
        !existingFarmId &&
        !isBackButtonClicked
      ) {
        const response: any = await apiService().postFormData(
          "/onboarding/seller/farm-details",
          formData,
          true,
          xfmrId ? xfmrId : "",
        );

        setUser({
          ...user!,
          onboarding_stage: "crops_to_sell",
        });

        const farmerProfile1: any = getFromLocalStorage(FARMER_PROFILE_KEY, {});
        if (farmerProfile1) {
          saveToLocalStorage(FARMER_PROFILE_KEY, {
            ...farmerProfile1,
            onboarding_stage: "crops_to_sell",
          });
        }

        saveToLocalStorage(STEP_ONE_KEY, data);
        saveToLocalStorage(FARM_ID_KEY, response.data.farm.id);

        navigate("/onboarding/step-two");
        successMessage("Farm details saved successfully!");
      } else {
        formData.append("farmId", existingFarmId);

        await apiService().patchFormData(
          "/sellers/farms/update-farm",
          formData,
          true,
          xfmrId ? xfmrId : "",
        );

        navigate("/onboarding/step-two");
        removeFromLocalStorage(BACK_BUTTON_CLICKED_KEY);
        saveToLocalStorage(BACK_BUTTON_CLICKED_KEY, "false");

        successMessage("Farm data updated successfully!");
      }
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    } finally {
      saveToLocalStorage(STEP_ONE_KEY, data);
      setIsSubmitting(false);
    }
  };

  const renderSkeletonField = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-8 shadow-lg px-4 sm:px-6 lg:px-8 rounded-md py-4 bg-white max-w-full overflow-x-hidden">
      <div className="mb-10">
        <div className="mb-2">
          <h2 className="text-green-600 font-medium">Step 1</h2>
          <h3 className="text-xl text-gray-900 font-semibold">
            Upload your farm documents and photos
          </h3>
          <p className="text-sm text-gray-600">
            Upload clear government registration, land rights documents, and
            high-quality farm photos. Make sure text is readable and images are
            clear.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <Card className="w-full">
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
                      type: file.type === "application/pdf" ? "pdf" : "image",
                    })),
                  );
                  setGovFileError("");
                }}
                maxFiles={5}
                maxSizeMB={5}
                initialFiles={govRegFiles}
                loading={isLoadingFiles}
              />
              {govFileError && (
                <p className="text-red-500 text-sm mt-2">{govFileError}</p>
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

          <Card className="w-full">
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
                      type: file.type === "application/pdf" ? "pdf" : "image",
                    })),
                  );
                  setLandFileError("");
                }}
                maxFiles={5}
                maxSizeMB={5}
                initialFiles={landRightsFiles}
                loading={isLoadingFiles}
              />
              {landFileError && (
                <p className="text-red-500 text-sm mt-2">{landFileError}</p>
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
            Upload high-quality images of your farm to showcase its environment
            (Max 6 files, 5MB each).
          </p>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Farm photos</CardTitle>
              <CardDescription>
                Upload images (Max 6 files, 5MB each). Drag and drop or click to
                select files.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesSelected={(files) => {
                  setFarmPhotos(
                    files.map((file) => ({
                      file,
                      preview: URL.createObjectURL(file),
                      type: file.type === "application/pdf" ? "pdf" : "image",
                    })),
                  );
                  setFarmPhotoError("");
                }}
                maxFiles={6}
                maxSizeMB={5}
                initialFiles={farmPhotos}
                loading={isLoadingFiles}
              />
              {farmPhotoError && (
                <p className="text-red-500 text-sm mt-2">{farmPhotoError}</p>
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
          Check and fill in details about your farm's location, size, climate,
          and crops
        </p>

        <div className="mb-6">
          <h4 className="font-medium mb-4 text-gray-700">Farm Location</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderSkeletonField()}
            {renderSkeletonField()}
            {renderSkeletonField()}
            {renderSkeletonField()}
            {renderSkeletonField()}
          </div>

          <div className="mt-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSkeletonField()}
            {renderSkeletonField()}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-4 text-gray-700">Crop environment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderSkeletonField()}
          {renderSkeletonField()}
          {renderSkeletonField()}
          {renderSkeletonField()}
          {renderSkeletonField()}
        </div>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderSkeletonField()}
          {renderSkeletonField()}
          {renderSkeletonField()}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-4 text-gray-700">Tree information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSkeletonField()}
          {renderSkeletonField()}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-4 text-gray-700">Growing Conditions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {renderSkeletonField()}
        </div>
      </div>

      <div className="flex justify-end mb-8">
        <Button disabled={true} className="my-4 opacity-50 w-full md:w-48">
          <Loader2 className="mr-2 animate-spin" />
          Loading...
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Stepper currentStep={1} />
      <Form {...form}>
        {isBackButtonClicked && isLoadingFiles ? (
          renderSkeleton()
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 shadow-lg px-4 sm:px-6 lg:px-8 rounded-md py-4 bg-white max-w-full overflow-x-hidden"
          >
            <div className="mb-10">
              <div className="mb-2">
                <h2 className="text-green-600 font-medium">Step 1</h2>
                <h3 className="text-xl text-gray-900 font-semibold">
                  Upload your farm documents and photos
                </h3>
                <p className="text-sm text-gray-600">
                  Upload clear government registration, land rights documents,
                  and high-quality farm photos. Make sure text is readable and
                  images are clear.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <Card className="w-full">
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
                              file.type === "application/pdf" ? "pdf" : "image",
                          })),
                        );
                        setGovFileError("");
                      }}
                      maxFiles={5}
                      maxSizeMB={5}
                      initialFiles={govRegFiles}
                      loading={isLoadingFiles}
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

                <Card className="w-full">
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
                              file.type === "application/pdf" ? "pdf" : "image",
                          })),
                        );
                        setLandFileError("");
                      }}
                      maxFiles={5}
                      maxSizeMB={5}
                      initialFiles={landRightsFiles}
                      loading={isLoadingFiles}
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
                              file.type === "application/pdf" ? "pdf" : "image",
                          })),
                        );
                        setFarmPhotoError("");
                      }}
                      maxFiles={6}
                      maxSizeMB={5}
                      initialFiles={farmPhotos}
                      loading={isLoadingFiles}
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
                                const area = calculateApproxArea(polygons[0]);
                                form.setValue("total_size_hectares", area, {
                                  shouldValidate: true,
                                });

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
                            farmName={farmName || "New farm"}
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
                        <FormLabel>Latitude (°)</FormLabel>
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
                        <FormLabel>Longitude (°)</FormLabel>
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
                          <SelectItem value="Urga, Guji">Urga, Guji</SelectItem>
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
                          <SelectItem value="Yirgachefe">Yirgachefe</SelectItem>
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
                      <FormLabel>Average Annual Temp (°C)</FormLabel>
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
              <Button
                type="submit"
                disabled={isSubmitting || isLoadingFiles}
                className="my-4 w-full md:w-48 min-h-10"
              >
                <span className="inline-flex items-center justify-center w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Save and continue"
                  )}
                </span>
              </Button>
            </div>
          </form>
        )}
      </Form>
    </>
  );
}

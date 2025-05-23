"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  XCircle,
  CalendarX,
  PencilLine,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiService } from "@/services/apiService";
import Header from "@/components/layout/header";
import { APIErrorResponse } from "@/types/api";
import { getFromLocalStorage } from "@/lib/utils";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/hooks/useAuth";
import { SkeletonCardContent, SkeletonPhotoGallery } from "./skeletons";
import { RequestEditModal } from "@/components/modals/RequestEditModal";
import { Farm } from "@/types/farm";
import { FARMER_PROFILE_KEY } from "@/types/constants";

function PhotoGallery({
  farmId,
  photos: initialPhotos,
}: {
  photos: Farm["photos"] | null;
  farmId: string;
}) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [photos, setPhotos] = useState(initialPhotos);
  const [isDeleting, setIsDeleting] = useState(false);
  const { successMessage, errorMessage } = useNotification();

  useEffect(() => {
    if (initialPhotos !== photos) {
      setPhotos(initialPhotos);
    }
  }, [initialPhotos]);

  const handleDeletePhoto = async (photoId: string) => {
    if (photos && photos.length <= 1) {
      errorMessage({
        error: { message: "At least one photo is required for the farm." },
      });
      return;
    }
    try {
      setIsDeleting(true);
      await apiService().post(`/sellers/farms/delete-farm-image`, {
        farmId,
        photoId,
      });

      setPhotos(
        (prev) => prev?.filter((photo) => photo.id !== photoId) || null,
      );

      if (
        activePhotoIndex > 0 &&
        photos &&
        activePhotoIndex >= photos.length - 1
      ) {
        setActivePhotoIndex(activePhotoIndex - 1);
      }
      successMessage("Farm photo deleted successfully");
    } catch (error) {
      console.error("Failed to delete photo:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-4 sm:mb-6">
      <div className="flex flex-col gap-4 p-3 sm:p-4">
        {photos && photos.length > 0 ? (
          <div className="relative">
            <img
              src={photos[activePhotoIndex].photo_url || "/placeholder.svg"}
              alt={`Farm ${activePhotoIndex + 1}`}
              className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg"
            />
          </div>
        ) : (
          <img
            src="/placeholder.svg"
            alt="No photo"
            className="w-full h-48 sm:h-64 object-cover rounded-lg"
          />
        )}
      </div>
      <div className="flex p-2 space-x-2 overflow-x-auto ml-2 sm:ml-3">
        {photos &&
          photos.map((photo, index) => (
            <div key={photo.id} className="relative flex-shrink-0">
              <button
                className={`bg-card w-16 h-16 sm:w-20 sm:h-20 rounded border-2 ${
                  index === activePhotoIndex
                    ? "border-primary"
                    : "border-transparent"
                }`}
                onClick={() => setActivePhotoIndex(index)}
              >
                <img
                  src={photo.photo_url || "/placeholder.svg"}
                  alt=""
                  className="w-full h-full object-cover rounded cursor-pointer"
                />
              </button>
              <button
                className="absolute -top-1 -right-1 sm:top-0 sm:right-0 bg-red-500 text-white rounded-full p-1 cursor-pointer"
                onClick={() => handleDeletePhoto(photo.id)}
                disabled={isDeleting}
              >
                <X size={12} />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function FarmSellerView() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { errorMessage } = useNotification();
  const params = useParams();
  const farmId = params.id as string | undefined;
  const { user } = useAuth();
  const farmerProfile: any = useMemo(
    () => getFromLocalStorage(FARMER_PROFILE_KEY, {}),
    [],
  );

  let fmrId = null;
  if (user && user.userType === "agent") {
    fmrId = farmerProfile ? farmerProfile.id : undefined;
  }

  const fetchData = useCallback(async () => {
    if (!farmId || !user || hasFetched) return;
    if (user && user.userType === "agent" && fmrId === null) {
      errorMessage({
        error: { message: "Agent must specify a farmer profile" },
      });
      return;
    }
    try {
      setIsFetching(true);
      const response: any = await apiService().get(
        `/sellers/farms/get-farm?farmId=${farmId}`,
        fmrId,
      );
      setFarm(response.data.farm);
    } catch (error) {
      console.error("Failed to fetch farm:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsFetching(false);
      setHasFetched(true);
    }
  }, [farmId, fmrId, errorMessage, user, farmerProfile, hasFetched]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!farm && !isFetching) {
    return (
      <div className="text-center py-12 text-sm sm:text-base">
        Farm not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary/5 px-4 sm:px-6 lg:px-8 py-8">
      <Header />
      <main className="mx-auto max-w-7xl py-6 sm:py-8 pt-16 sm:pt-20">
        {isFetching ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card>
                <SkeletonPhotoGallery />
                <SkeletonCardContent />
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <Card>
                <SkeletonCardContent />
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card>
                <PhotoGallery farmId={farmId!} photos={farm!.photos} />
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {farm!.farm_name}
                    </h2>
                  </div>
                  <div className="space-y-4 mb-4 sm:mb-6">
                    <p className="text-gray-700 text-sm sm:text-base">
                      {farm!.farm_name} is located in{" "}
                      {farm!.town_location || "Unknown Location"},{" "}
                      {farm!.region || "Unknown Region"},{" "}
                      {farm!.country || "Unknown Country"}. This farm produces{" "}
                      {farm!.crop_type || "various crops"} with a capacity of{" "}
                      {farm!.capacity_kg
                        ? `${farm!.capacity_kg} kg`
                        : "unknown quantity"}
                      .
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Total Size
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.total_size_hectares
                            ? `${farm!.total_size_hectares} hectares`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Coffee Area
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.coffee_area_hectares
                            ? `${farm!.coffee_area_hectares} hectares`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Altitude
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.altitude_meters || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Crop Type
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.crop_type || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Tree Variety
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.tree_variety || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Soil Type
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.soil_type || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Annual Temperature
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.avg_annual_temp
                            ? `${farm!.avg_annual_temp}°C`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Annual Rainfall
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.annual_rainfall_mm
                            ? `${farm!.annual_rainfall_mm} mm`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Capacity
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.capacity_kg
                            ? `${farm!.capacity_kg} kg`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Origin
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.origin || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {farm!.kyc_documents.length > 0 && (
                    <>
                      <Separator className="my-3 sm:my-4" />
                      <div>
                        <h3 className="text-sm sm:text-md font-medium text-gray-900 mb-2">
                          KYC Documents
                        </h3>
                        <div className="space-y-2">
                          {farm!.kyc_documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-xs sm:text-sm"
                            >
                              <span className="text-gray-700">
                                {doc.doc_type}
                              </span>
                              <span className="font-medium text-gray-700">
                                {doc.verified ? "Verified" : "Not Verified"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Farm Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          KYC Verification Status
                        </h4>
                        <div className="mt-1">
                          {farm!.verification_status === "approved" && (
                            <Badge
                              variant="default"
                              className="gap-1 text-xs sm:text-sm"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approved
                            </Badge>
                          )}
                          {farm!.verification_status === "pending" && (
                            <Badge
                              variant="warning"
                              className="gap-1 text-xs sm:text-sm"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              Pending
                            </Badge>
                          )}
                          {farm!.verification_status === "rejected" && (
                            <Badge
                              variant="destructive"
                              className="gap-1 text-xs sm:text-sm"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Rejected
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Created On
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {new Date(farm!.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Country
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.country}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Edit Request
                        </h4>
                        <div className="mt-1">
                          {farm!.admin_edit_request_approval_status ===
                            "allowed" && (
                            <Badge className="gap-1 text-xs sm:text-sm">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Allowed
                            </Badge>
                          )}
                          {farm!.admin_edit_request_approval_status ===
                            "requested" && (
                            <Badge
                              variant="warning"
                              className="gap-1 text-xs sm:text-sm"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              Requested
                            </Badge>
                          )}
                          {farm!.admin_edit_request_approval_status ===
                            "rejected" && (
                            <Badge
                              variant="destructive"
                              className="gap-1 text-xs sm:text-sm"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Rejected
                            </Badge>
                          )}
                          {farm!.admin_edit_request_approval_status ===
                            "expired" && (
                            <Badge
                              variant="outline"
                              className="gap-1 text-xs sm:text-sm"
                            >
                              <CalendarX className="h-3.5 w-3.5" />
                              Expired
                            </Badge>
                          )}
                          {farm!.admin_edit_request_approval_status ===
                            "not_requested" && (
                            <Badge
                              variant="outline"
                              className="gap-1 text-xs sm:text-sm"
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                              Not Requested
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Region
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.region || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                          Town
                        </h4>
                        <p className="text-gray-900 text-sm sm:text-base">
                          {farm!.town_location || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6">
                    {farm!.admin_edit_request_approval_status === "allowed" ? (
                      <Link to={`/edit-farm/${farm!.id}`}>
                        <Button className="w-full text-sm sm:text-base">
                          Edit Farm
                        </Button>
                      </Link>
                    ) : farm!.admin_edit_request_approval_status ===
                        "requested" ||
                      farm!.admin_edit_request_approval_status === "expired" ? (
                      <Button className="w-full text-sm sm:text-base" disabled>
                        {farm!.admin_edit_request_approval_status ===
                        "requested"
                          ? "Edit Requested"
                          : farm!.admin_edit_request_approval_status ===
                              "expired"
                            ? "Request Expired"
                            : "Request Rejected"}
                      </Button>
                    ) : farm!.verification_status === "pending" ? (
                      <div className="space-y-3 sm:space-y-4 rounded-lg bg-amber-100 p-3 sm:p-4 mt-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-900 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-xs sm:text-sm font-medium text-amber-800">
                              KYC is Pending
                            </h4>
                            <p className="mt-1 text-xs sm:text-sm text-amber-800">
                              Request edit access to modify this farm.
                            </p>
                          </div>
                        </div>
                        <Button
                          className="w-full text-sm sm:text-base"
                          onClick={() => setIsModalOpen(true)}
                        >
                          Request Edit Access
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4 rounded-lg bg-green-100 p-3 sm:p-4 mt-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-xs sm:text-sm font-medium text-green-800">
                              KYC Verified
                            </h4>
                            <p className="mt-1 text-xs sm:text-sm text-green-700">
                              Request edit access to modify this verified farm.
                            </p>
                          </div>
                        </div>
                        <Button
                          className="w-full text-sm sm:text-base"
                          onClick={() => setIsModalOpen(true)}
                        >
                          Request Edit Access
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        <RequestEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          entityId={farmId!}
          entityType="farm"
          onSubmitSuccess={(status) =>
            setFarm((prev) =>
              prev
                ? { ...prev, admin_edit_request_approval_status: status }
                : null,
            )
          }
          xfmrId={fmrId}
        />
      </main>
    </div>
  );
}

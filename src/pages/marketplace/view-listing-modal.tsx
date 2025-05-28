"use client";

import * as React from "react";
import {
  Map,
  Coffee,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SampleRequestModal from "./sample-request-modal";
import { useNavigate } from "react-router-dom";
import { CoffeeListing, CoffeePhoto } from "@/types/coffee";
import { useSampleRequest } from "@/hooks/useSampleRequest";
import { CoffeeImage } from "./coffee-image";
import { useAuth } from "@/hooks/useAuth";
import { getFromLocalStorage } from "@/lib/utils";
import { FARMER_PROFILE_KEY } from "@/types/constants";

interface ListingDetailModalProps {
  listing: CoffeeListing;
  onClose: () => void;
  onRequireAuth: () => void;
  setAuthMessage: (message: string) => void;
}

export default function ListingDetailModal({
  listing,
  onClose,
  onRequireAuth,
  setAuthMessage,
}: ListingDetailModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);
  const [showSampleRequestModal, setShowSampleRequestModal] =
    React.useState(false);
  const [isviewLoading, setIsviewLoading] = React.useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const farmerProfile: any = React.useMemo(
    () => getFromLocalStorage(FARMER_PROFILE_KEY, {}),
    [],
  );

  const {
    hasSampleRequest,
    loading: sampleLoading,
    error: sampleError,
    checkSampleRequest,
  } = useSampleRequest();

  React.useEffect(() => {
    if (user && user.userType !== "seller") {
      checkSampleRequest(listing.id);
    }
  }, [listing.id, user, checkSampleRequest]);

  const getPhotos = (listing: CoffeeListing): CoffeePhoto[] => {
    return [...listing.coffee_photo].sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return 0;
    });
  };

  const nextPhoto = () => {
    const photos = getPhotos(listing);
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const prevPhoto = () => {
    const photos = getPhotos(listing);
    setCurrentPhotoIndex(
      (prevIndex) => (prevIndex - 1 + photos.length) % photos.length,
    );
  };

  const selectPhoto = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  const getCurrentPhotoUrl = (): string => {
    if (!listing || listing.coffee_photo.length === 0)
      return "/placeholder.svg";
    const photos = getPhotos(listing);
    return photos[currentPhotoIndex]?.photo_url || "/placeholder.svg";
  };

  const handleSampleRequestClick = () => {
    if (!user) {
      setAuthMessage(
        "To request a sample for this listing you have to login or signup for an AfroValley account",
      );
      onRequireAuth();
      return;
    }
    if (user.userType === "seller" || sampleLoading || hasSampleRequest) return;
    setShowSampleRequestModal(true);
  };

  const handleViewListingClick = (path: string) => {
    if (!user) {
      setAuthMessage(
        "To view this listing you have to login or signup for an AfroValley account",
      );
      onRequireAuth();
      return;
    }
    setIsviewLoading(true);
    navigate(path);
  };

  return (
    <>
      <Dialog open={!!listing} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl p-0 overflow-y-auto max-h-[90vh] sm:max-h-[85vh] my-2 sm:my-4">
          <DialogHeader className="shadow-md px-4 sm:px-6 py-4">
            <DialogTitle className="flex justify-center items-center gap-2 text-lg sm:text-xl font-bold">
              <Coffee className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              View Detail
            </DialogTitle>
            <DialogDescription className="flex justify-center text-sm sm:text-base text-slate-600">
              Request a sample
            </DialogDescription>
          </DialogHeader>

          {/* Photo Carousel */}
          <div className="relative h-48 sm:h-64 md:h-80 bg-slate-200">
            <CoffeeImage
              src={getCurrentPhotoUrl()}
              alt={listing.coffee_variety}
              className="w-full h-full px-3 sm:px-5 object-cover"
            />
            {listing.is_organic && (
              <Badge className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-emerald-500 text-xs sm:text-sm px-2 sm:px-3 py-1">
                Organic
              </Badge>
            )}
            {listing.coffee_photo.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 sm:w-10 sm:h-10"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 sm:w-10 sm:h-10"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <div className="absolute bottom-1 sm:bottom-2 left-0 right-0 flex justify-center gap-1 sm:gap-1.5">
                  {getPhotos(listing).map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                        index === currentPhotoIndex ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => selectPhoto(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {sampleError && user && (
              <p className="text-xs sm:text-sm text-red-600 bg-red-100 p-2 rounded-md mb-3 sm:mb-4">
                Error: {sampleError}
              </p>
            )}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {listing.coffee_variety}
                </h2>
                <p className="text-slate-600 text-sm sm:text-base">
                  {listing.farm.farm_name}
                </p>
                <div className="flex items-center mt-1 sm:mt-2">
                  <Map className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 mr-1" />
                  <span className="text-slate-600 text-sm sm:text-base">
                    {listing.farm.region}, {listing.farm.country}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <div className="bg-amber-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center mb-1.5 sm:mb-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mr-1 sm:mr-2" />
                  <div>
                    <span className="text-base sm:text-lg font-semibold text-amber-700">
                      {listing.grade}
                    </span>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-700">
                  ${listing.price_per_kg.toFixed(2)}/kg
                </div>
                <div className="text-slate-600 text-xs sm:text-sm">
                  {listing.quantity_kg.toLocaleString()} kg available
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Card>
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Coffee Details
                  </h3>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Bean Type
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {listing.bean_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Processing
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {listing.processing_method}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Organic
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {listing.is_organic ? "Yes" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Region
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {listing.farm.region}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Crop Year
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {listing.crop_year}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Drying Method
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {listing.drying_method}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Moisture
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {listing.moisture_percentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Screen Size
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {listing.screen_size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Flavor Profile
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  <div>
                    <h4 className="text-sm sm:text-lg font-semibold">
                      Cup Aroma
                    </h4>
                    <ul className="list-disc list-inside text-sm sm:text-base">
                      {listing?.cup_aroma?.map((aroma, index) => (
                        <li key={index} className="text-slate-600">
                          {aroma}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-lg font-semibold">
                      Cup Taste
                    </h4>
                    <ul className="list-disc list-inside text-sm sm:text-base">
                      {listing?.cup_taste?.map((taste, index) => (
                        <li key={index} className="text-slate-600">
                          {taste}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-4 sm:mb-6">
              <CardHeader className="pb-2 px-4 sm:px-6">
                <h3 className="text-base sm:text-lg font-semibold">
                  Farm Information
                </h3>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-slate-700 mb-3 sm:mb-4 text-sm sm:text-base">
                  {listing.farm.farm_name} is located in the{" "}
                  {listing.farm.region} region of {listing.farm.country}
                  at {listing.farm.altitude_meters} meters above sea level,
                  creating ideal growing conditions for specialty coffee. The
                  farm covers {listing.farm.total_size_hectares} hectares with{" "}
                  {listing.farm.coffee_area_hectares} hectares dedicated to
                  coffee production.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Altitude
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      {listing.farm.altitude_meters}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Soil Type
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      {listing.farm.soil_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Tree Type
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      {listing.farm.tree_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Tree Variety
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      {listing.farm.tree_variety}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Average Temperature
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      {listing.farm.avg_annual_temp}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Annual Rainfall
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      {listing.farm.annual_rainfall_mm} mm
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4 sm:mb-6">
              <CardHeader className="pb-2 px-4 sm:px-6">
                <h3 className="text-base sm:text-lg font-semibold">
                  Shipping & Delivery
                </h3>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Delivery Type
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      {listing.delivery_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Shipping Port
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      {listing.shipping_port}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Readiness Date
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      {new Date(listing.readiness_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Lot Size
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      {listing.lot_length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
              {user?.userType !== "seller" && user?.userType !== "agent" && (
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base"
                  onClick={handleSampleRequestClick}
                  disabled={
                    user! &&
                    (user?.onboarding_stage !== "completed" ||
                      sampleLoading ||
                      hasSampleRequest!)
                  }
                >
                  {user && sampleLoading
                    ? "Checking..."
                    : user && hasSampleRequest
                      ? "Sample Requested"
                      : "Request Sample"}
                </Button>
              )}
              {(user?.userType !== "agent" ||
                (user?.userType === "agent" && farmerProfile)) && (
                <Button
                  onClick={() =>
                    handleViewListingClick(`/listing/${listing.id}`)
                  }
                  disabled={
                    (user?.userType === "agent" &&
                      farmerProfile?.onboarding_stage !== "completed") ||
                    (user &&
                      user?.userType !== "agent" &&
                      user.onboarding_stage !== "completed") ||
                    isviewLoading
                  }
                  className="w-full sm:flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base"
                >
                  {user && isviewLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    "View Listing Details"
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SampleRequestModal
        open={showSampleRequestModal}
        onClose={() => setShowSampleRequestModal(false)}
        listingId={listing.id}
        coffeeName={listing.coffee_variety}
        farmName={listing.farm.farm_name}
      />
    </>
  );
}

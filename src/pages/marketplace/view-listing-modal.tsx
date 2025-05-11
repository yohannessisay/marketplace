"use client";

import * as React from "react";
import { Map, Coffee, Star, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import SampleRequestModal from "./sample-request-modal";
import { useNavigate } from "react-router-dom";
import { CoffeeListing, CoffeePhoto } from "@/types/coffee";
import { useSampleRequest } from "@/hooks/useSampleRequest";
import { CoffeeImage } from "./coffee-image";
import { useAuth } from "@/hooks/useAuth";

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
      (prevIndex) => (prevIndex - 1 + photos.length) % photos.length
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

  const getCupTastePercentage = (value: string): number => {
    const map: Record<string, number> = {
      Low: 30,
      Medium: 60,
      High: 90,
      Full: 90,
      Light: 30,
      Balanced: 75,
      Long: 85,
      Short: 40,
      Ful: 90, // Handling typo in the data
    };
    return map[value] || 50;
  };

  const handleSampleRequestClick = () => {
    if (!user) {
      setAuthMessage(
        "To request a sample for this listing you have to login or signup for an AfroValley account"
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
        "To view this listing you have to login or signup for an AfroValley account"
      );
      onRequireAuth();
      return;
    }
    navigate(path);
  };

  return (
    <>
      <Dialog open={!!listing} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="min-w-4xl p-0 overflow-scroll max-h-[90vh] my-4">
          <DialogHeader className="shadow-md">
            <DialogTitle className="flex justify-center mt-4 items-center gap-2">
              <Coffee className="h-5 w-5 text-emerald-600" />
              View Detail
            </DialogTitle>
            <DialogDescription className="flex justify-center">
              Request a sample
            </DialogDescription>
          </DialogHeader>
          <>
            {/* Photo Carousel */}
            <div className="relative h-64 md:h-80 bg-slate-200">
              <CoffeeImage
                src={getCurrentPhotoUrl()}
                alt={listing.coffee_variety}
                className="w-full h-full px-5 object-cover"
              />
              {listing.is_organic && (
                <Badge className="absolute top-4 left-4 bg-emerald-500 ml-4">
                  Organic
                </Badge>
              )}
              {listing.coffee_photo.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                    onClick={prevPhoto}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                    onClick={nextPhoto}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    {getPhotos(listing).map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentPhotoIndex
                            ? "bg-white"
                            : "bg-white/50"
                        }`}
                        onClick={() => selectPhoto(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-6">
              {sampleError && user && (
                <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md mb-4">
                  Error: {sampleError}
                </p>
              )}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {listing.coffee_variety}
                  </h2>
                  <p className="text-slate-600">{listing.farm.farm_name}</p>
                  <div className="flex items-center mt-2">
                    <Map className="h-5 w-5 text-slate-500 mr-1" />
                    <span className="text-slate-600">
                      {listing.farm.region}, {listing.farm.country}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <div className="bg-amber-50 px-3 py-2 rounded-lg flex items-center mb-2">
                    <Star className="h-5 w-5 text-amber-500 mr-2" />
                    <div>
                      <span className="text-lg font-semibold text-amber-700">
                        {listing.grade}
                      </span>
                      <span className="text-slate-500 text-sm ml-1">grade</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-700">
                    ${listing.price_per_kg.toFixed(2)}/kg
                  </div>
                  <div className="text-slate-600 text-sm">
                    {listing.quantity_kg.toLocaleString()} kg available
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold">Coffee Details</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Bean Type</p>
                        <p className="font-medium">{listing.bean_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Processing</p>
                        <p className="font-medium">
                          {listing.processing_method}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Organic</p>
                        <p className="font-medium">
                          {listing.is_organic ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Region</p>
                        <p className="font-medium">{listing.farm.region}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Crop Year</p>
                        <p className="font-medium">{listing.crop_year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Drying Method</p>
                        <p className="font-medium">{listing.drying_method}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Moisture</p>
                        <p className="font-medium">
                          {listing.moisture_percentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Screen Size</p>
                        <p className="font-medium">{listing.screen_size}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold">Flavor Profile</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold">Cup Aroma</h4>
                      <ul className="list-disc list-inside">
                        {listing?.cup_aroma.map((aroma, index) => (
                          <li key={index} className="text-slate-600">
                            {aroma}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cup Taste Section */}
                    <div>
                      <h4 className="text-lg font-semibold">Cup Taste</h4>
                      <ul className="list-disc list-inside">
                        {listing?.cup_taste.map((taste, index) => (
                          <li key={index} className="text-slate-600">
                            {taste}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-semibold">Farm Information</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 mb-4">
                    {listing.farm.farm_name} is located in the{" "}
                    {listing.farm.region} region of {listing.farm.country}
                    at {listing.farm.altitude_meters} meters above sea level,
                    creating ideal growing conditions for specialty coffee. The
                    farm covers {listing.farm.total_size_hectares} hectares with{" "}
                    {listing.farm.coffee_area_hectares} hectares dedicated to
                    coffee production.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Altitude</p>
                      <p className="font-medium">
                        {listing.farm.altitude_meters}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Soil Type</p>
                      <p className="font-medium">{listing.farm.soil_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Tree Type</p>
                      <p className="font-medium">{listing.farm.tree_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Tree Variety</p>
                      <p className="font-medium">{listing.farm.tree_variety}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">
                        Average Temperature
                      </p>
                      <p className="font-medium">
                        {listing.farm.avg_annual_temp}°C
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Annual Rainfall</p>
                      <p className="font-medium">
                        {listing.farm.annual_rainfall_mm} mm
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-semibold">Shipping & Delivery</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Delivery Type</p>
                      <p className="font-medium">{listing.delivery_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Shipping Port</p>
                      <p className="font-medium">{listing.shipping_port}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Readiness Date</p>
                      <p className="font-medium">
                        {new Date(listing.readiness_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Lot Size</p>
                      <p className="font-medium">{listing.lot_length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                {user?.userType !== "seller" && (
                  <Button
                    variant="outline"
                    className="w-full sm:flex-1 px-4 py-2"
                    onClick={handleSampleRequestClick}
                    disabled={
                      user! &&
                      (user.userType === "seller" ||
                        user.onboarding_stage !== "completed" ||
                        sampleLoading ||
                        hasSampleRequest!)
                    }
                  >
                    {user && sampleLoading
                      ? "Checking..."
                      : user && hasSampleRequest
                      ? "Sample Requested"
                      : "Request Samples"}
                  </Button>
                )}

                <Button
                  onClick={() => {
                    handleViewListingClick(`/listing/${listing.id}`);
                    setIsviewLoading(true);
                  }}
                  disabled={
                    (user! && user.onboarding_stage !== "completed") ||
                    isviewLoading
                  }
                  className="w-full sm:flex-1 px-4 py-2"
                >
                  {user && isviewLoading
                    ? "Loading..."
                    : "View Listing Details"}
                </Button>
              </div>
            </div>
          </>
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

"use client";

import * as React from "react";
import { Map, Coffee, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "@/services/apiService";
import SampleRequestModal from "./sample-request-modal";
import { Link } from "react-router-dom";
import { ApiResponse, CoffeeListing, CoffeePhoto } from "@/types/coffee";
import { getUserProfile } from "@/lib/utils";

function CoffeeImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}
      {hasError ? (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-100">
          <Coffee className="h-12 w-12 text-slate-400" />
        </div>
      ) : (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className={`w-full h-full object-cover ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}

interface ListingDetailModalProps {
  listingId: string;
  onClose: () => void;
}

export default function ListingDetailModal({
  listingId,
  onClose,
}: ListingDetailModalProps) {
  const [listing, setListing] = React.useState<CoffeeListing | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);
  const [showSampleRequestModal, setShowSampleRequestModal] =
    React.useState(false);
  const user = getUserProfile();

  React.useEffect(() => {
    const fetchListingDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService().get<ApiResponse>(
          `/marketplace/listings/get-listing?listingId=${listingId}`,
        );

        if (
          response.success &&
          response.data.listings &&
          response.data.listings.length > 0
        ) {
          setListing(response.data.listings[0]);
          // Reset photo index when loading a new listing
          setCurrentPhotoIndex(0);
        } else {
          setError("Failed to fetch listing details");
        }
      } catch (err) {
        setError("An error occurred while fetching the listing");
        console.error("Error fetching listing details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      fetchListingDetails();
    }
  }, [listingId]);

  // Get all photos for the listing
  const getPhotos = (listing: CoffeeListing): CoffeePhoto[] => {
    // Sort photos to ensure primary photo is first
    return [...listing.coffee_photo].sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return 0;
    });
  };

  // Navigate to next photo
  const nextPhoto = () => {
    if (listing) {
      const photos = getPhotos(listing);
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }
  };

  // Navigate to previous photo
  const prevPhoto = () => {
    if (listing) {
      const photos = getPhotos(listing);
      setCurrentPhotoIndex(
        (prevIndex) => (prevIndex - 1 + photos.length) % photos.length,
      );
    }
  };

  // Get current photo URL
  const getCurrentPhotoUrl = (): string => {
    if (!listing || listing.coffee_photo.length === 0)
      return "/placeholder.svg";
    const photos = getPhotos(listing);
    return photos[currentPhotoIndex]?.photo_url || "/placeholder.svg";
  };

  // Map cup taste values to percentages for progress bars
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

  return (
    <>
      <Dialog open={!!listingId} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="min-w-4xl p-0 overflow-scroll max-h-[90vh] my-4">
          <DialogHeader className="shadow-md">
            <DialogTitle className="flex justify-center  mt-4 items-center gap-2">
              <Coffee className="h-5 w-5 text-emerald-600" />
              View Detail
            </DialogTitle>
            <DialogDescription className="flex justify-center ">
              Request a sample
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-500">{error}</p>
              <Button onClick={onClose} className="mt-4">
                Close
              </Button>
            </div>
          ) : listing ? (
            <>
              {/* Photo Carousel */}
              <div className="relative h-64 md:h-80 bg-slate-200">
                <CoffeeImage
                  src={getCurrentPhotoUrl()}
                  alt={listing.coffee_variety}
                  className="w-full h-full px-5"
                />

                {listing.is_organic && (
                  <Badge className="absolute top-4 left-4 bg-emerald-500 ml-4">
                    Organic
                  </Badge>
                )}

                {/* Carousel Navigation */}
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

                    {/* Photo Indicators */}
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                      {getPhotos(listing).map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentPhotoIndex
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                          onClick={() => setCurrentPhotoIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="p-6">
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
                        <span className="text-slate-500 text-sm ml-1">
                          grade
                        </span>
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
                          <p className="text-sm text-slate-500">
                            Drying Method
                          </p>
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
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-500">
                            Acidity
                          </span>
                          <span className="text-sm font-medium">
                            {listing.cup_taste_acidity}
                          </span>
                        </div>
                        <Progress
                          value={getCupTastePercentage(
                            listing.cup_taste_acidity,
                          )}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-500">Body</span>
                          <span className="text-sm font-medium">
                            {listing.cup_taste_body}
                          </span>
                        </div>
                        <Progress
                          value={getCupTastePercentage(listing.cup_taste_body)}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-500">
                            Sweetness
                          </span>
                          <span className="text-sm font-medium">
                            {listing.cup_taste_sweetness}
                          </span>
                        </div>
                        <Progress
                          value={getCupTastePercentage(
                            listing.cup_taste_sweetness,
                          )}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-500">
                            Aftertaste
                          </span>
                          <span className="text-sm font-medium">
                            {listing.cup_taste_aftertaste}
                          </span>
                        </div>
                        <Progress
                          value={getCupTastePercentage(
                            listing.cup_taste_aftertaste,
                          )}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-500">
                            Balance
                          </span>
                          <span className="text-sm font-medium">
                            {listing.cup_taste_balance}
                          </span>
                        </div>
                        <Progress
                          value={getCupTastePercentage(
                            listing.cup_taste_balance,
                          )}
                          className="h-2"
                        />
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
                      creating ideal growing conditions for specialty coffee.
                      The farm covers {listing.farm.total_size_hectares}{" "}
                      hectares with {listing.farm.coffee_area_hectares} hectares
                      dedicated to coffee production.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Altitude</p>
                        <p className="font-medium">
                          {listing.farm.altitude_meters} masl
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
                        <p className="font-medium">
                          {listing.farm.tree_variety}
                        </p>
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
                        <p className="text-sm text-slate-500">
                          Annual Rainfall
                        </p>
                        <p className="font-medium">
                          {listing.farm.annual_rainfall_mm} mm
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold">
                      Shipping & Delivery
                    </h3>
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
                          {new Date(
                            listing.readiness_date,
                          ).toLocaleDateString()}
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
                  <Button
                    variant="outline"
                    className="w-full sm:flex-1 px-4 py-2"
                    onClick={() => setShowSampleRequestModal(true)}
                    disabled={user?.onboarding_stage !== "completed"}
                  >
                    Request Samples
                  </Button>
                  <Link
                    to={`/listing/${listingId}`}
                    className="w-full sm:flex-1"
                  >
                    <Button
                      disabled={user?.onboarding_stage !== "completed"}
                      className="w-full sm:flex-1 px-4 py-2"
                    >
                      Place Order Now
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p>No listing found</p>
              <Button onClick={onClose} className="mt-4">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sample Request Modal */}
      {listing && (
        <SampleRequestModal
          open={showSampleRequestModal}
          onClose={() => setShowSampleRequestModal(false)}
          listingId={listing.id}
          coffeeName={listing.coffee_variety}
          farmName={listing.farm.farm_name}
        />
      )}
    </>
  );
}

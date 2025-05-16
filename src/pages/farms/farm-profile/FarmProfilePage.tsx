"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import { SignUpPromptModal } from "@/components/modals/SignUpPromptModal";
import { FarmDetails } from "./FarmDetails";
import { FarmSidebar } from "./FarmSidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface FarmPhoto {
  id: string;
  photo_url: string;
  is_primary: boolean;
  created_at: string;
}

interface CoffeePhoto {
  id: string;
  photo_url: string;
  is_primary: boolean;
  created_at: string;
}

interface Seller {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url_csv: string | null;
  rating: number;
  total_reviews: number;
}

interface CoffeeListing {
  id: string;
  seller_id: string;
  farm_id: string;
  coffee_variety: string;
  bean_type: string | null;
  crop_year: string | null;
  is_organic: boolean;
  processing_method: string | null;
  moisture_percentage: number | null;
  screen_size: string | null;
  drying_method: string | null;
  wet_mill: string | null;
  cup_taste_acidity: string | null;
  cup_taste_body: string | null;
  cup_taste_sweetness: string | null;
  cup_taste_aftertaste: string | null;
  cup_taste_balance: string | null;
  grade: string | null;
  quantity_kg: number;
  price_per_kg: number;
  readiness_date: string | null;
  lot_length: string | null;
  delivery_type: string | null;
  shipping_port: string | null;
  listing_status: string;
  created_at: string;
  updated_at: string | null;
  expires_at: string | null;
  created_by_agent_id: string | null;
  photos: CoffeePhoto[];
}

export interface Farm {
  id: string;
  seller_id: string;
  farm_name: string;
  town_location: string | null;
  region: string | null;
  country: string;
  total_size_hectares: number | null;
  coffee_area_hectares: number | null;
  longitude: number | null;
  latitude: number | null;
  altitude_meters: number | null;
  crop_type: string | null;
  crop_source: string | null;
  origin: string | null;
  capacity_kg: number | null;
  tree_type: string | null;
  tree_variety: string | null;
  soil_type: string | null;
  avg_annual_temp: number | null;
  annual_rainfall_mm: number | null;
  verification_status: string;
  created_at: string;
  updated_at: string | null;
  created_by_agent_id: string | null;
  photos: FarmPhoto[];
  seller: Seller;
  listings: CoffeeListing[];
}

const ListingsSection = ({ listings }: { listings: CoffeeListing[] }) => {
  const navigate = useNavigate();

  if (!listings || listings.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800">Active Listings</h3>
        <p className="text-gray-600">
          No active listings available for this farm.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Active Listings
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => {
          // Select the primary photo or the first photo if no primary exists
          const primaryPhoto =
            listing.photos.find((photo) => photo.is_primary) ||
            listing.photos[0];

          return (
            <div
              key={listing.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/listing/${listing.id}`)}
            >
              {primaryPhoto ? (
                <img
                  src={primaryPhoto.photo_url}
                  alt={listing.coffee_variety}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <div className="p-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  {listing.coffee_variety}
                </h4>
                <p className="text-gray-600">
                  Price: ${listing.price_per_kg.toFixed(2)}/kg
                </p>
                <p className="text-gray-600">
                  Quantity: {listing.quantity_kg} kg
                </p>
                {listing.is_organic && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-2">
                    Organic
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function FarmProfilePage() {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showNotFound, setShowNotFound] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [fetched, setFetched] = useState<boolean>(false);
  const { errorMessage } = useNotification();
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const fetchFarmDetails = useCallback(
    async (farmId: string, isRetry: boolean = false) => {
      if (!farmId || loading) return;
      console.log(
        `[FarmProfilePage] Fetching farm ${farmId}, isRetry: ${isRetry}`,
      );
      setLoading(true);
      try {
        const response: any = await apiService().getWithoutAuth(
          `/sellers/farms/get-farm-profile?farmId=${farmId}`,
        );

        if (response.success && response.data.farm) {
          setFarm(response.data.farm);
          setShowNotFound(false);
          setFetched(true);
          console.log(`[FarmProfilePage] Successfully fetched farm ${farmId}`);
        } else {
          throw new Error("Failed to fetch farm details");
        }
      } catch (error: any) {
        console.error(
          `[FarmProfilePage] Error fetching farm ${farmId}:`,
          error,
        );
        setFarm(null);
        if (!isRetry && retryCount < 1) {
          console.log(`[FarmProfilePage] Retrying farm ${farmId}`);
          setRetryCount(1);
          setTimeout(() => fetchFarmDetails(farmId, true), 1000);
        } else {
          setShowNotFound(true);
          setFetched(true);
          errorMessage(error as APIErrorResponse);
          console.log(
            `[FarmProfilePage] Showing NotFoundUI for farm ${farmId}`,
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [loading, retryCount, errorMessage],
  );

  useEffect(() => {
    if (farmId && !fetched) {
      fetchFarmDetails(farmId);
    } else if (!farmId) {
      setShowNotFound(true);
      setFetched(true);
      console.log("[FarmProfilePage] No farmId, showing NotFoundUI");
    }
  }, [farmId, fetchFarmDetails, fetched]);

  const onRequireAuth = () => {
    setIsSignUpModalOpen(true);
  };

  const SkeletonLoader = () => (
    <div className="bg-primary/5 p-8 min-h-screen animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white my-12">
        <div className="h-12 bg-gray-200 rounded w-3/4 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="lg:col-span-1">
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const NotFoundUI = () => (
    <div
      className="bg-primary/5 p-8 min-h-screen flex items-center justify-center"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Farm Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The farm you’re looking for doesn’t exist or is no longer available.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate("/marketplace")}>
            Back to Marketplace
          </Button>
          <Button
            onClick={() => {
              if (farmId && retryCount < 1) {
                setRetryCount(1);
                setFetched(false);
                fetchFarmDetails(farmId, true);
              }
            }}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
            disabled={retryCount >= 1}
          >
            Retry
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading) return <SkeletonLoader />;
  if (showNotFound || (!farm && fetched)) return <NotFoundUI />;

  return (
    <div className="bg-primary/5 p-8 min-h-screen">
      {farm && (
        <>
          <Header />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white my-12 rounded-md mt-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <FarmDetails farm={farm} onRequireAuth={onRequireAuth} />
                <ListingsSection listings={farm.listings} />
              </div>

              <div className="lg:col-span-1">
                <FarmSidebar farm={farm} onRequireAuth={onRequireAuth} />
              </div>
            </div>
          </main>

          <SignUpPromptModal
            open={isSignUpModalOpen}
            onClose={() => setIsSignUpModalOpen(false)}
            message="To interact with this farm, you need to sign up or log in to your AfroValley account."
          />
        </>
      )}
    </div>
  );
}

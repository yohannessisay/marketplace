"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Map,
  Coffee,
  Droplet,
  Star,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { apiService } from "@/services/apiService";
import ListingDetailModal from "./view-listing-modal";
import { getFromLocalStorage } from "@/lib/utils";

interface Farm {
  id: string;
  seller_id: string;
  farm_name: string;
  town_location: string;
  region: string;
  country: string;
  total_size_hectares: number;
  coffee_area_hectares: number;
  longitude: number;
  latitude: number;
  altitude_meters: number;
  crop_type: string;
  crop_source: string;
  origin: string;
  capacity_kg: number;
  tree_type: string;
  tree_variety: string;
  soil_type: string;
  avg_annual_temp: number;
  annual_rainfall_mm: number;
  verification_status: string;
  created_at: string;
  updated_at: string | null;
  created_by_agent_id: string | null;
}

interface Seller {
  id: string;
  auth_id: string;
  created_by_agent_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  telegram: string;
  address: string;
  trading_since: string;
  rating: number;
  total_reviews: number;
  about_me: string;
  deals_completed: number;
  avatar_url_csv: string;
  verification_status: string;
  onboarding_stage: string;
  blocked_access: boolean;
  identity_verified: boolean;
  last_login_at: string;
}

interface CoffeePhoto {
  id: string;
  listing_id: string;
  photo_url: string;
  is_primary: boolean;
  created_at: string;
}

interface CoffeeListing {
  id: string;
  seller_id: string;
  farm_id: string;
  coffee_variety: string;
  bean_type: string;
  crop_year: string;
  is_organic: boolean;
  processing_method: string;
  moisture_percentage: number;
  screen_size: string;
  drying_method: string;
  wet_mill: string;
  cup_taste_acidity: string;
  cup_taste_body: string;
  cup_taste_sweetness: string;
  cup_taste_aftertaste: string;
  cup_taste_balance: string;
  grade: string;
  quantity_kg: number;
  price_per_kg: number;
  readiness_date: string;
  lot_length: string;
  delivery_type: string;
  shipping_port: string;
  listing_status: string;
  created_at: string;
  updated_at: string | null;
  expires_at: string | null;
  created_by_agent_id: string | null;
  farm: Farm;
  seller: Seller;
  coffee_photo: CoffeePhoto[];
  listing_discount: any[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    listings: CoffeeListing[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
    searchTerm: string | null;
    authenticationRequiredForActions: string;
  };
}

interface FilterState {
  region: string;
  variety: string;
  processing_method: string;
  is_organic: string;
  min_price: string;
  max_price: string;
}

// Filter options based on schema
const regions = [
  "Yirgacheffe",
  "Sidamo",
  "Kafa",
  "Limu",
  "Gedeo",
  "Kilimanjaro",
];
const varieties = [
  "Arabica",
  "Robusta",
  "Ethiopian Heirloom",
  "Bourbon",
  "SL-28",
  "Typica",
  "Gesha",
];
const processingMethods = ["Washed", "Natural", "Honey", "Sun-dried"];

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 text-center mt-8">
          <CardContent className="pt-6 flex flex-col items-center">
            <Coffee className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Something went wrong
            </h3>
            <p className="text-slate-500 mb-4">
              {this.state.errorMessage || "An unexpected error occurred."}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

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

export default function CoffeeMarketplace() {
  const [listings, setListings] = React.useState<CoffeeListing[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>({
    region: "",
    variety: "",
    processing_method: "",
    is_organic: "",
    min_price: "",
    max_price: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedListingId, setSelectedListingId] = React.useState<
    string | null
  >(null);
  const [favoriteLoading, setFavoriteLoading] = React.useState<{
    [listingId: string]: boolean;
  }>({});
  const [favoriteState, setFavoriteState] = React.useState<{
    [listingId: string]: boolean;
  }>({});
// Define the type for the user profile
interface UserProfile {
  userType?: string;
  [key: string]: any; // Allow other properties if needed
}

const loggedInUser: UserProfile = getFromLocalStorage("userProfile", {});
  const fetchListings = async () => {
    setIsLoading(true);
    setError(null); // Reset error state
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
        ...(filters.region &&
          filters.region !== "all" && { region: filters.region }),
        ...(filters.variety &&
          filters.variety !== "all" && { variety: filters.variety }),
        ...(filters.processing_method &&
          filters.processing_method !== "all" && {
            processing_method: filters.processing_method,
          }),
        ...(filters.is_organic &&
          filters.is_organic !== "all" && {
            is_organic: filters.is_organic,
          }),
        ...(filters.min_price && { min_price: filters.min_price }),
        ...(filters.max_price && { max_price: filters.max_price }),
      });

      const response = await apiService().get<ApiResponse>(
        `/marketplace/listings/get-all-listings?${queryParams.toString()}`,
      );

      if (response.success && response.data.listings) {
        setListings(response.data.listings);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.page);
      } else {
        const errorMessage = response.message || "Failed to fetch listings";
        setError(errorMessage);
        console.error("Error fetching listings:", errorMessage);
        setListings([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching listings:", error);
      setListings([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchListings();
  }, [currentPage, searchQuery, filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (name: keyof FilterState, value: string) => {
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      region: "",
      variety: "",
      processing_method: "",
      is_organic: "",
      min_price: "",
      max_price: "",
    });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  const getPrimaryPhotoUrl = (listing: CoffeeListing): string => {
    const primaryPhoto = listing.coffee_photo.find((photo) => photo.is_primary);
    return primaryPhoto ? primaryPhoto.photo_url : "/placeholder.svg";
  };

  const addFavorite = async (listingId: string) => {
    if (!listingId) return;
    setFavoriteLoading((prev) => ({ ...prev, [listingId]: true }));
    try {
      const response: any = await apiService().post(
        `/buyers/listings/favorites/add-favorite?listingId=${listingId}`,
        {},
      );
      if (response && response.data) {
        setFavoriteState((prev) => ({ ...prev, [listingId]: true }));
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
    } finally {
      setFavoriteLoading((prev) => ({ ...prev, [listingId]: false }));
    }
  };

  const removeFavorite = async (listingId: string) => {
    if (!listingId) return;
    setFavoriteLoading((prev) => ({ ...prev, [listingId]: true }));
    try {
      const response: any = await apiService().post(
        `/buyers/listings/favorites/remove-favorite-listing?listingId=${listingId}`,
        {},
      );
      if (response && response.data) {
        setFavoriteState((prev) => ({ ...prev, [listingId]: false }));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    } finally {
      setFavoriteLoading((prev) => ({ ...prev, [listingId]: false }));
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-primary/5 p-8">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-800">
              Coffee Marketplace
            </h2>
            <p className="text-slate-600 mt-2">
              Discover premium coffee directly from African farmers
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex-grow relative"
                >
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search for coffee variety, farm name or region..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </form>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant={hasActiveFilters ? "secondary" : "outline"}
                  className={
                    hasActiveFilters
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : ""
                  }
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-emerald-100 text-emerald-700"
                    >
                      {Object.values(filters).filter((v) => v !== "").length}
                    </Badge>
                  )}
                </Button>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select
                        value={filters.region}
                        onValueChange={(value) =>
                          handleFilterChange("region", value)
                        }
                      >
                        <SelectTrigger id="region" className="w-full">
                          <SelectValue placeholder="All Regions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Regions</SelectItem>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="variety">Coffee Variety</Label>
                      <Select
                        value={filters.variety}
                        onValueChange={(value) =>
                          handleFilterChange("variety", value)
                        }
                      >
                        <SelectTrigger id="variety" className="w-full">
                          <SelectValue placeholder="All Varieties" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Varieties</SelectItem>
                          {varieties.map((variety) => (
                            <SelectItem key={variety} value={variety}>
                              {variety}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="processing">Processing Method</Label>
                      <Select
                        value={filters.processing_method}
                        onValueChange={(value) =>
                          handleFilterChange("processing_method", value)
                        }
                      >
                        <SelectTrigger id="processing" className="w-full">
                          <SelectValue placeholder="All Methods" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Methods</SelectItem>
                          {processingMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organic">Organic</Label>
                      <Select
                        value={filters.is_organic}
                        onValueChange={(value) =>
                          handleFilterChange("is_organic", value)
                        }
                      >
                        <SelectTrigger id="organic" className="w-full">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="true">Organic</SelectItem>
                          <SelectItem value="false">Non-Organic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min-price">Min Price ($/kg)</Label>
                      <Input
                        id="min-price"
                        type="number"
                        placeholder="Min"
                        value={filters.min_price}
                        onChange={(e) =>
                          handleFilterChange("min_price", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-price">Max Price ($/kg)</Label>
                      <Input
                        id="max-price"
                        type="number"
                        placeholder="Max"
                        value={filters.max_price}
                        onChange={(e) =>
                          handleFilterChange("max_price", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={resetFilters}
                        variant="outline"
                        className="w-full"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <Card className="mb-6 bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <p className="text-red-700">
                  Error: {error}. Please try again or refresh the page.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="mb-4">
            <p className="text-slate-600">
              {listings.length} {listings.length === 1 ? "listing" : "listings"}{" "}
              found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
              ))
            ) : listings.length > 0 ? (
              listings.map((listing) => {
                const isFavorited = favoriteState[listing?.id] ?? false;
                return (
                  <Card
                    key={listing.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => setSelectedListingId(listing?.id)}
                  >
                    <div className="relative h-50 bg-slate-200 px-3">
                      <CoffeeImage
                        src={getPrimaryPhotoUrl(listing)}
                        alt={listing?.coffee_variety}
                        className="w-full h-full rounded-lg"
                      />
                      {listing.is_organic && (
                        <Badge className="absolute top-2 right-2 bg-emerald-500 mr-5">
                          Organic
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {listing?.coffee_variety}
                        </h3>
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded">
                          <Star className="h-4 w-4 text-amber-500 mr-1" />
                          <span className="text-sm font-medium text-amber-700">
                            {listing?.grade}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm mb-2">
                        {listing?.farm?.farm_name}
                      </p>
                      <div className="flex items-center text-slate-500 text-sm mb-4">
                        <Map className="h-4 w-4 mr-1" />
                        <span>
                          {listing?.farm?.region}, {listing?.farm?.country}
                        </span>
                      </div>
                      <div className="flex items-center text-slate-500 text-sm mb-2">
                        <Droplet className="h-4 w-4 mr-1" />
                        <span>{listing?.processing_method}</span>
                      </div>
                      <div className="flex items-center text-slate-500 text-sm mb-2">
                        <Coffee className="h-4 w-4 mr-1" />
                        <span>{listing.bean_type}</span>
                      </div>
                      {loggedInUser?.userType!='seller'?
                      <div className="flex justify-end items-end mb-2 mt-4">
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label={isFavorited ? "Unfavorite" : "Favorite"}
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (favoriteLoading[listing.id]) return;
                            if (isFavorited) {
                              removeFavorite(listing.id);
                            } else {
                              addFavorite(listing.id);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              if (favoriteLoading[listing.id]) return;
                              if (isFavorited) {
                                removeFavorite(listing.id);
                              } else {
                                addFavorite(listing.id);
                              }
                            }
                          }}
                        >
                          <Heart
                            className={`h-5 w-5 transition-colors duration-150 ${
                              isFavorited
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-400"
                            }`}
                            fill={isFavorited ? "currentColor" : "none"}
                          />
                          {favoriteLoading[listing.id] && (
                            <span className="ml-2 animate-spin h-4 w-4 border-2 border-t-transparent border-slate-400 rounded-full inline-block align-middle"></span>
                          )}
                        </span>
                      </div>
              :<></>}
                    </CardContent>
                    <CardFooter className="px-4 py-3 border-t bg-slate-50 flex items-center justify-between">
                      <div className="text-emerald-700 font-bold">
                        ${listing?.price_per_kg.toFixed(2)}/kg
                      </div>
                      <div className="text-slate-500 text-sm">
                        {listing?.quantity_kg.toLocaleString()} kg available
                      </div>
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <p className="text-center text-slate-500 col-span-3">
                No listings found.
              </p>
            )}
          </div>

          {listings.length > 0 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => handlePageChange(index + 1)}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {listings.length === 0 && !isLoading && !error && (
            <Card className="p-8 text-center mt-8">
              <CardContent className="pt-6 flex flex-col items-center">
                <Coffee className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  No coffee listings found
                </h3>
                <p className="text-slate-500 mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button
                  onClick={resetFilters}
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedListingId && (
            <ListingDetailModal
              listingId={selectedListingId}
              onClose={() => setSelectedListingId(null)}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

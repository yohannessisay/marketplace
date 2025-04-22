"use client";

import * as React from "react";
import { Search, Filter, Coffee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { SignUpPromptModal } from "@/components/modals/SignUpPromptModal";
import { useAuth } from "@/hooks/useAuth";
import { CoffeeListing, FilterState } from "@/types/types";
import { LoadingCard } from "./marketplace-skeleton";
import { ListingCard } from "./ListingCard";

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
  const [isLoading, setIsLoading] = React.useState(true);
  const [authMessage, setAuthMessage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedListing, setSelectedListing] =
    React.useState<CoffeeListing | null>(null);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = React.useState(false);
  const [favoriteLoading, setFavoriteLoading] = React.useState<{
    [listingId: string]: boolean;
  }>({});
  const [favoriteState, setFavoriteState] = React.useState<{
    [listingId: string]: { isFavorited: boolean; favoriteId?: string };
  }>({});

  const { user: loggedInUser, loading: authLoading } = useAuth();

  const checkFavoriteStatus = async (listingIds: string[]) => {
    if (!loggedInUser || loggedInUser.userType === "seller") return;
    const favoriteStatus: {
      [listingId: string]: { isFavorited: boolean; favoriteId?: string };
    } = {};
    try {
      await Promise.all(
        listingIds.map(async (listingId) => {
          try {
            const response: any = await apiService().get(
              `/marketplace/listings/user-has-favorited?listingId=${listingId}`,
            );

            favoriteStatus[listingId] = {
              isFavorited: response.success
                ? response.data.userHasFavorited
                : false,
              favoriteId: response.success
                ? response.data.favoriteId
                : undefined,
            };
          } catch (error) {
            console.error(
              `Error checking favorite status for ${listingId}:`,
              error,
            );
            favoriteStatus[listingId] = { isFavorited: false };
          }
        }),
      );
      setFavoriteState(favoriteStatus);
    } catch (error) {
      console.error("Error checking favorite statuses:", error);
      listingIds.forEach((listingId) => {
        favoriteStatus[listingId] = { isFavorited: false };
      });
      setFavoriteState(favoriteStatus);
    }
  };

  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);
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

      const response: any = await apiService().getWithoutAuth(
        `/marketplace/listings/get-all-listings?${queryParams.toString()}`,
      );

      if (response.success) {
        const listings = response.data.listings || [];
        setListings(listings);
        setTotalPages(response.data.pagination.totalPages || 1);
        setCurrentPage(response.data.pagination.page || 1);
        if (listings.length === 0) {
          setTotalPages(1);
          setCurrentPage(1);
          setFavoriteState({});
        } else {
          const listingIds = listings.map((listing: any) => listing.id);
          await checkFavoriteStatus(listingIds);
        }
      } else {
        const errorMessage = response.message || "Failed to fetch listings";
        setError(errorMessage);
        console.error("Error fetching listings:", errorMessage);
        setListings([]);
        setTotalPages(1);
        setCurrentPage(1);
        setFavoriteState({});
      }
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching listings:", error);
      setListings([]);
      setTotalPages(1);
      setCurrentPage(1);
      setFavoriteState({});
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!authLoading) {
      fetchListings();
    }
  }, [currentPage, searchQuery, filters, authLoading]);

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
  const hasSearchOrFilters = searchQuery || hasActiveFilters;

  const addFavorite = async (listingId: string) => {
    if (!listingId || !loggedInUser || loggedInUser.userType === "seller")
      return;

    setFavoriteState((prev) => ({
      ...prev,
      [listingId]: {
        isFavorited: true,
        favoriteId: prev[listingId]?.favoriteId,
      },
    }));
    setFavoriteLoading((prev) => ({ ...prev, [listingId]: true }));

    try {
      const response = await apiService().post<{
        success: boolean;
        data: { favoriteId?: string };
      }>(`/buyers/listings/favorites/add-favorite?listingId=${listingId}`, {});
      if (response.success && response.data.favoriteId) {
        setFavoriteState((prev) => ({
          ...prev,
          [listingId]: {
            isFavorited: true,
            favoriteId: response.data.favoriteId,
          },
        }));
      } else {
        throw new Error("Failed to add favorite");
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
      setFavoriteState((prev) => ({
        ...prev,
        [listingId]: {
          isFavorited: false,
          favoriteId: prev[listingId]?.favoriteId,
        },
      }));
    } finally {
      setFavoriteLoading((prev) => ({ ...prev, [listingId]: false }));
    }
  };

  const removeFavorite = async (listingId: string) => {
    if (!listingId || !loggedInUser || loggedInUser.userType === "seller")
      return;
    const favoriteId = favoriteState[listingId]?.favoriteId;
    if (!favoriteId) return;

    setFavoriteState((prev) => ({
      ...prev,
      [listingId]: { isFavorited: false, favoriteId },
    }));
    setFavoriteLoading((prev) => ({ ...prev, [listingId]: true }));

    try {
      const response: any = await apiService().post(
        `/buyers/listings/favorites/remove-favorite-listing?favoritesId=${favoriteId}`,
        {},
      );
      if (!response.success) {
        throw new Error("Failed to remove favorite");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      setFavoriteState((prev) => ({
        ...prev,
        [listingId]: { isFavorited: true, favoriteId },
      }));
    } finally {
      setFavoriteLoading((prev) => ({ ...prev, [listingId]: false }));
    }
  };

  const onRequireAuth = (message: string) => {
    setIsSignUpModalOpen(true);
    setAuthMessage(message);
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-primary/5 p-8">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-primary/5 p-8 pt-20">
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
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                <p className="text-slate-600">Loading listings...</p>
              </div>
            ) : (
              <p className="text-slate-600">
                {listings.length}{" "}
                {listings.length === 1 ? "listing" : "listings"} found
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <LoadingCard key={index} />
                ))
              : listings.length > 0
                ? listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isFavorited={
                        favoriteState[listing.id]?.isFavorited ?? false
                      }
                      isFavoriteLoading={favoriteLoading[listing.id] ?? false}
                      onCardClick={() => setSelectedListing(listing)}
                      onFavoriteToggle={() => {
                        if (favoriteLoading[listing.id]) return;
                        if (favoriteState[listing.id]?.isFavorited) {
                          removeFavorite(listing.id);
                        } else {
                          addFavorite(listing.id);
                        }
                      }}
                      onRequireAuth={() =>
                        onRequireAuth(
                          "To mark this listing as favorite you have to login or signup for an AfroValley account",
                        )
                      }
                    />
                  ))
                : null}
          </div>
          {listings.length > 0 && totalPages > 1 && (
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
                  {hasSearchOrFilters
                    ? "No listings match your criteria"
                    : "No coffee listings available"}
                </h3>
                <p className="text-slate-500 mb-4">
                  {hasSearchOrFilters
                    ? "Try adjusting your search or filters to find more listings."
                    : "Check back later for new coffee listings."}
                </p>
                {hasSearchOrFilters ? (
                  <Button
                    onClick={resetFilters}
                    variant="default"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Clear All Filters
                  </Button>
                ) : (
                  <Button
                    onClick={() => fetchListings()}
                    variant="default"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Refresh
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          {selectedListing && (
            <ListingDetailModal
              listing={selectedListing}
              onClose={() => setSelectedListing(null)}
              onRequireAuth={() =>
                onRequireAuth(
                  "To request a sample for this listing you have to login or signup for an AfroValley account",
                )
              }
            />
          )}
          <SignUpPromptModal
            open={isSignUpModalOpen}
            onClose={() => setIsSignUpModalOpen(false)}
            message={authMessage}
          />
        </main>
      </div>
    </ErrorBoundary>
  );
}

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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
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

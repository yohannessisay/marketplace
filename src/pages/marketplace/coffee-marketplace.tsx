"use client";

import * as React from "react";
import { debounce } from "lodash";
import { Search, Coffee, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { FilterState } from "@/types/types";
import { LoadingCard } from "./marketplace-skeleton";
import { ListingCard } from "./ListingCard";
import { CoffeeListing } from "@/types/coffee";
import { ErrorBoundary } from "./ErrorBoundary";

const coffeeOrigins = [
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

const coffeeRegions = ["Oromia", "SNNPR"];
const gradeOptions = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "UG",
];
const processingMethods = ["Washed", "Natural", "Honey", "Sun-dried"];

export default function CoffeeMarketplace() {
  const [listings, setListings] = React.useState<CoffeeListing[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterState>({
    variety: "",
    processing_method: "",
    is_organic: "",
    min_price: "",
    max_price: "",
    origin: "",
    region: "",
    grade: "",
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [authMessage, setAuthMessage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [priceError, setPriceError] = React.useState<string | null>(null);
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

  // In-memory cache for API responses
  const cache = React.useRef<
    Map<string, { listings: CoffeeListing[]; totalPages: number }>
  >(new Map());

  const checkFavoriteStatus = async (listingIds: string[]) => {
    if (
      !loggedInUser ||
      loggedInUser.userType === "seller" ||
      loggedInUser.userType === "agent"
    )
      return;
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

  const fetchListings = React.useCallback(async () => {
    const cacheKey = `${currentPage}-${JSON.stringify(filters)}-${searchQuery}`;
    if (cache.current.has(cacheKey)) {
      const cached = cache.current.get(cacheKey)!;
      setListings(cached.listings);
      setTotalPages(cached.totalPages);
      setCurrentPage(
        cached.listings.length === 0
          ? 1
          : Math.min(currentPage, cached.totalPages),
      );
      setIsLoading(false);
      if (cached.listings.length > 0) {
        const listingIds = cached.listings.map((listing: any) => listing.id);
        await checkFavoriteStatus(listingIds);
      } else {
        setFavoriteState({});
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
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
        ...(filters.origin && { origin: filters.origin }),
        ...(filters.region && { region: filters.region }),
        ...(filters.grade && { grade: filters.grade }),
      });

      const response: any = await apiService().getWithoutAuth(
        `/marketplace/listings/get-all-listings?${queryParams.toString()}`,
      );

      if (response.success) {
        const listings = response.data.listings || [];
        const totalPages = Math.max(
          1,
          response.data.pagination.totalPages || 1,
        );

        // Warn if page number is invalid
        if (response.data.pagination.page > totalPages) {
          console.warn(
            `API returned invalid page number: ${response.data.pagination.page} > ${totalPages}`,
          );
        }

        cache.current.set(cacheKey, { listings, totalPages });
        setListings(listings);
        setTotalPages(totalPages);
        setCurrentPage(
          listings.length === 0
            ? 1
            : Math.min(
                Math.max(1, response.data.pagination.page || 1),
                totalPages,
              ),
        );
        if (listings.length === 0) {
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
  }, [currentPage, searchQuery, filters]);

  // Debounced fetchListings
  const debouncedFetchListings = React.useCallback(
    debounce(fetchListings, 300),
    [fetchListings],
  );

  React.useEffect(() => {
    if (!authLoading) {
      debouncedFetchListings();
    }
    // Cleanup debounce on unmount
    return () => {
      debouncedFetchListings.cancel();
    };
  }, [debouncedFetchListings, authLoading]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (name: keyof FilterState, value: string) => {
    setPriceError(null);

    if (name === "min_price" || name === "max_price") {
      const newFilters = { ...filters, [name]: value };
      const minPrice = parseFloat(newFilters.min_price);
      const maxPrice = parseFloat(newFilters.max_price);

      if (!isNaN(minPrice) && !isNaN(maxPrice) && maxPrice < minPrice) {
        setPriceError("Maximum price cannot be lower than minimum price");
        return;
      }
    }

    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      variety: "",
      processing_method: "",
      is_organic: "",
      min_price: "",
      max_price: "",
      origin: "",
      region: "",
      grade: "",
    });
    setSearchQuery("");
    setPriceError(null);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPaginationRange = () => {
    const maxPagesToShow = 5;
    const halfRange = Math.floor(maxPagesToShow / 2);
    let start = Math.max(1, currentPage - halfRange);
    let end = Math.min(totalPages, start + maxPagesToShow - 1);

    // Adjust start if end is less than maxPagesToShow
    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, totalPages - maxPagesToShow + 1);
      end = totalPages;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");
  const hasSearchOrFilters = searchQuery || hasActiveFilters;

  const addFavorite = async (listingId: string) => {
    if (
      !listingId ||
      !loggedInUser ||
      loggedInUser.userType === "seller" ||
      loggedInUser.userType === "agent"
    )
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
    if (
      !listingId ||
      !loggedInUser ||
      loggedInUser.userType === "seller" ||
      loggedInUser.userType === "agent"
    )
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

  const onRequireAuth = () => {
    setIsSignUpModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-primary/5 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Header />
        <main className="flex-grow container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
      <div className="flex flex-col min-h-screen bg-primary/5 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Header />
        <main className="flex-grow container mx-auto pt-28 sm:pt-20">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Coffee Marketplace
            </h2>
            <p className="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Discover premium coffee directly from African farmers
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            {/* Filters Sidebar */}
            <div className="w-full md:w-64 lg:w-72 md:sticky md:top-20 self-start">
              <Card className="w-full">
                <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin" className="text-sm sm:text-base">
                      Coffee Origins
                    </Label>
                    <Select
                      value={filters.origin}
                      onValueChange={(value) =>
                        handleFilterChange("origin", value)
                      }
                    >
                      <SelectTrigger
                        id="origin"
                        className="w-full text-sm sm:text-base py-2 sm:py-2.5"
                      >
                        <SelectValue placeholder="All Origins" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Origins</SelectItem>
                        {coffeeOrigins.map((origin) => (
                          <SelectItem key={origin} value={origin}>
                            {origin}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-sm sm:text-base">
                      Region
                    </Label>
                    <Select
                      value={filters.region}
                      onValueChange={(value) =>
                        handleFilterChange("region", value)
                      }
                    >
                      <SelectTrigger
                        id="region"
                        className="w-full text-sm sm:text-base py-2 sm:py-2.5"
                      >
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {coffeeRegions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="processing"
                      className="text-sm sm:text-base"
                    >
                      Processing Method
                    </Label>
                    <Select
                      value={filters.processing_method}
                      onValueChange={(value) =>
                        handleFilterChange("processing_method", value)
                      }
                    >
                      <SelectTrigger
                        id="processing"
                        className="w-full text-sm sm:text-base py-2 sm:py-2.5"
                      >
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
                    <Label htmlFor="organic" className="text-sm sm:text-base">
                      Organic
                    </Label>
                    <Select
                      value={filters.is_organic}
                      onValueChange={(value) =>
                        handleFilterChange("is_organic", value)
                      }
                    >
                      <SelectTrigger
                        id="organic"
                        className="w-full text-sm sm:text-base py-2 sm:py-2.5"
                      >
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
                    <Label htmlFor="grade" className="text-sm sm:text-base">
                      Grade
                    </Label>
                    <Select
                      value={filters.grade}
                      onValueChange={(value) =>
                        handleFilterChange("grade", value)
                      }
                    >
                      <SelectTrigger
                        id="grade"
                        className="w-full text-sm sm:text-base py-2 sm:py-2.5"
                      >
                        <SelectValue placeholder="All grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {gradeOptions.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-price" className="text-sm sm:text-base">
                      Min Price ($/kg)
                    </Label>
                    <Input
                      id="min-price"
                      type="number"
                      placeholder="Min"
                      value={filters.min_price}
                      onChange={(e) =>
                        handleFilterChange("min_price", e.target.value)
                      }
                      min={0}
                      className="text-sm sm:text-base py-2 sm:py-2.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-price" className="text-sm sm:text-base">
                      Max Price ($/kg)
                    </Label>
                    <Input
                      id="max-price"
                      type="number"
                      placeholder="Max"
                      value={filters.max_price}
                      onChange={(e) =>
                        handleFilterChange("max_price", e.target.value)
                      }
                      min={0}
                      className="text-sm sm:text-base py-2 sm:py-2.5"
                    />
                  </div>

                  {priceError && (
                    <Alert
                      variant="destructive"
                      className="bg-red-50 border-red-200 rounded-lg mt-3 sm:mt-4"
                    >
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <AlertTitle className="text-red-800 font-semibold text-sm sm:text-base">
                        Invalid Price Range
                      </AlertTitle>
                      <AlertDescription className="text-red-700 text-xs sm:text-sm">
                        {priceError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="w-full text-sm sm:text-base py-2 sm:py-2.5"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Listings & Search */}
            <div className="flex-1 space-y-4 sm:space-y-6">
              <form onSubmit={handleSearchSubmit} className="relative bg-white">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for coffee variety, farm name ..."
                  className="pl-9 text-sm sm:text-base py-2 sm:py-2.5"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </form>

              {error && (
                <div className="flex justify-center">
                  <Alert
                    variant="destructive"
                    className="bg-red-50 border-red-200 rounded-lg max-w-md w-full"
                  >
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    <AlertTitle className="text-red-800 font-semibold text-sm sm:text-base">
                      Error
                    </AlertTitle>
                    <AlertDescription className="text-red-700 text-xs sm:text-sm">
                      {error}. Please try again or refresh the page.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    <p className="text-slate-600 text-sm sm:text-base">
                      Loading listings...
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm sm:text-base">
                    {listings.length}{" "}
                    {listings.length === 1 ? "listing" : "listings"} found
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <LoadingCard key={index} />
                    ))
                  : listings.map((listing) => (
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
                        onRequireAuth={onRequireAuth}
                        setAuthMessage={setAuthMessage}
                      />
                    ))}
              </div>

              {listings.length > 0 && totalPages > 1 && (
                <Pagination className="mt-4 sm:mt-6">
                  <PaginationContent>
                    {isLoading && (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    )}
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50 text-sm sm:text-base"
                            : "text-sm sm:text-base"
                        }
                        aria-label="Go to previous page"
                      />
                    </PaginationItem>
                    {getPaginationRange().map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="text-sm sm:text-base"
                          aria-label={`Go to page ${page}`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1),
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50 text-sm sm:text-base"
                            : "text-sm sm:text-base"
                        }
                        aria-label="Go to next page"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}

              {listings.length === 0 && !isLoading && !error && (
                <div className="flex justify-center">
                  <Alert className="mt-6 sm:mt-8 bg-white border-slate-200 rounded-lg max-w-md w-full">
                    <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
                    <AlertTitle className="text-lg sm:text-xl font-semibold text-slate-700">
                      {hasSearchOrFilters
                        ? "No listings match your criteria"
                        : "No coffee listings available"}
                    </AlertTitle>
                    <AlertDescription className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base">
                      {hasSearchOrFilters
                        ? "Try adjusting your search or filters to find more listings."
                        : "Check back later for new coffee listings."}
                    </AlertDescription>
                    <div className="mt-3 sm:mt-4">
                      {hasSearchOrFilters ? (
                        <Button
                          onClick={resetFilters}
                          variant="default"
                          className="text-sm sm:text-base"
                        >
                          Clear All Filters
                        </Button>
                      ) : (
                        <Button
                          onClick={() => fetchListings()}
                          variant="default"
                          className="bg-emerald-600 hover:bg-emerald-700 text-sm sm:text-base"
                        >
                          Refresh
                        </Button>
                      )}
                    </div>
                  </Alert>
                </div>
              )}
            </div>
          </div>

          {/* Modals */}
          {selectedListing && (
            <ListingDetailModal
              listing={selectedListing}
              onClose={() => setSelectedListing(null)}
              onRequireAuth={onRequireAuth}
              setAuthMessage={setAuthMessage}
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

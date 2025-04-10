"use client";

import * as React from "react";
import { Search, Filter, Map, Coffee, Droplet, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

// Define TypeScript interfaces for our data types
interface CoffeeListing {
  id: string;
  coffee_variety: string;
  bean_type: string;
  farm_name: string;
  region: string;
  country: string;
  processing_method: string;
  quantity_kg: number;
  price_per_kg: number;
  cup_score: string;
  is_organic: boolean;
  photo_url: string;
}

interface FilterState {
  region: string;
  variety: string;
  processing_method: string;
  is_organic: string;
  min_price: string;
  max_price: string;
  min_cup_score: string;
}

// Mock filter options based on the schema
const regions = ["Yirgacheffe", "Sidamo", "Kafa", "Limu", "Gedeo"];
const varieties = ["Ethiopian Heirloom", "Bourbon", "SL-28", "Typica", "Gesha"];
const processingMethods = ["Washed", "Natural", "Honey"];

// Image component with loading state
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
    min_cup_score: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedListing, setSelectedListing] =
    React.useState<CoffeeListing | null>(null);

  // Fetch listings from API
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: searchQuery,
        page: currentPage.toString(),
        limit: "6",
        region: filters.region,
        variety: filters.variety,
        processing_method: filters.processing_method,
        is_organic: filters.is_organic,
        min_price: filters.min_price,
        max_price: filters.max_price,
        min_cup_score: filters.min_cup_score,
      }).toString();

      const response = await apiService().get<{
        data: { listings: CoffeeListing[]; pagination: { totalPages: number } };
      }>(`/marketplace/listings/get-all-listings?${queryParams}`);

      setListings(response.data.listings || []);
      setTotalPages(response.data.pagination.totalPages || 1);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch listings whenever filters, search query, or page changes
  React.useEffect(() => {
    fetchListings();
  }, [searchQuery, filters, currentPage]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle filter changes
  const handleFilterChange = (name: keyof FilterState, value: string) => {
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      region: "",
      variety: "",
      processing_method: "",
      is_organic: "",
      min_price: "",
      max_price: "",
      min_cup_score: "",
    });
    setSearchQuery("");
    setCurrentPage(1); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <Header></Header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-800">
            Coffee Marketplace
          </h2>
          <p className="text-slate-600 mt-2">
            Discover premium coffee directly from Ethiopian farmers
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-grow relative">
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
              </div>

              {/* Filter Toggle */}
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

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Region Filter */}
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

                  {/* Variety Filter */}
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

                  {/* Processing Method */}
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

                  {/* Organic Filter */}
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

                  {/* Price Range */}
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

                  {/* Cup Score */}
                  <div className="space-y-2">
                    <Label htmlFor="cup-score">Min Cup Score</Label>
                    <Input
                      id="cup-score"
                      type="number"
                      placeholder="Min Score"
                      value={filters.min_cup_score}
                      onChange={(e) =>
                        handleFilterChange("min_cup_score", e.target.value)
                      }
                    />
                  </div>

                  {/* Clear Filters */}
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

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-slate-600">
            {listings.length} {listings.length === 1 ? "listing" : "listings"}{" "}
            found
          </p>
        </div>

        {/* Coffee Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full" />
            ))
          ) : listings.length > 0 ? (
            listings.map((listing) => (
              <Card
                key={listing.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => setSelectedListing(listing)}
              >
                <div className="relative h-48 bg-slate-200">
                  <CoffeeImage
                    src={listing.photo_url || "/placeholder.svg"}
                    alt={listing.coffee_variety}
                    className="w-full h-full"
                  />
                  {listing.is_organic && (
                    <Badge className="absolute top-2 right-2 bg-emerald-500">
                      Organic
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {listing.coffee_variety}
                    </h3>
                    <div className="flex items-center bg-amber-50 px-2 py-1 rounded">
                      <Star className="h-4 w-4 text-amber-500 mr-1" />
                      <span className="text-sm font-medium text-amber-700">
                        {listing.cup_score}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-2">
                    {listing.farm_name}
                  </p>
                  <div className="flex items-center text-slate-500 text-sm mb-4">
                    <Map className="h-4 w-4 mr-1" />
                    <span>
                      {listing.region}, {listing.country}
                    </span>
                  </div>

                  <div className="flex items-center text-slate-500 text-sm mb-2">
                    <Droplet className="h-4 w-4 mr-1" />
                    <span>{listing.processing_method}</span>
                  </div>
                  <div className="flex items-center text-slate-500 text-sm mb-2">
                    <Coffee className="h-4 w-4 mr-1" />
                    <span>{listing.bean_type}</span>
                  </div>
                </CardContent>
                <CardFooter className="px-4 py-3 border-t bg-slate-50 flex items-center justify-between">
                  <div className="text-emerald-700 font-bold">
                    ${listing.price_per_kg.toFixed(2)}/kg
                  </div>
                  <div className="text-slate-500 text-sm">
                    {listing.quantity_kg.toLocaleString()} kg available
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-center text-slate-500">No listings found.</p>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
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
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* Empty State */}
        {listings.length === 0 && !isLoading && (
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
      </main>

      {/* Detailed View Dialog */}
      <Dialog
        open={!!selectedListing}
        onOpenChange={(open) => !open && setSelectedListing(null)}
      >
        <DialogContent className="min-w-4xl p-0 overflow-scroll max-h-[90vh] my-4">
          {selectedListing && (
            <>
              <div className="relative h-64 bg-slate-200">
                <CoffeeImage
                  src={selectedListing.photo_url || "/placeholder.svg"}
                  alt={selectedListing.coffee_variety}
                  className="w-full h-full"
                />
                {selectedListing.is_organic && (
                  <Badge className="absolute top-4 left-4 bg-emerald-500">
                    Organic
                  </Badge>
                )}
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {selectedListing.coffee_variety}
                    </h2>
                    <p className="text-slate-600">
                      {selectedListing.farm_name}
                    </p>
                    <div className="flex items-center mt-2">
                      <Map className="h-5 w-5 text-slate-500 mr-1" />
                      <span className="text-slate-600">
                        {selectedListing.region}, {selectedListing.country}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start">
                    <div className="bg-amber-50 px-3 py-2 rounded-lg flex items-center mb-2">
                      <Star className="h-5 w-5 text-amber-500 mr-2" />
                      <div>
                        <span className="text-lg font-semibold text-amber-700">
                          {selectedListing.cup_score}
                        </span>
                        <span className="text-slate-500 text-sm ml-1">
                          cup score
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">
                      ${selectedListing.price_per_kg.toFixed(2)}/kg
                    </div>
                    <div className="text-slate-600 text-sm">
                      {selectedListing.quantity_kg.toLocaleString()} kg
                      available
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
                          <p className="font-medium">
                            {selectedListing.bean_type}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Processing</p>
                          <p className="font-medium">
                            {selectedListing.processing_method}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Organic</p>
                          <p className="font-medium">
                            {selectedListing.is_organic ? "Yes" : "No"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Region</p>
                          <p className="font-medium">
                            {selectedListing.region}
                          </p>
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
                            Bright, Clean
                          </span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-500">Body</span>
                          <span className="text-sm font-medium">Medium</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-500">
                            Sweetness
                          </span>
                          <span className="text-sm font-medium">
                            Honey, Fruity
                          </span>
                        </div>
                        <Progress value={85} className="h-2" />
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
                      {selectedListing.farm_name} is located in the{" "}
                      {selectedListing.region} region of{" "}
                      {selectedListing.country}
                      at high altitude, creating ideal growing conditions for
                      specialty coffee. The farm is dedicated to sustainable
                      farming practices and producing high-quality coffee.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Altitude</p>
                        <p className="font-medium">1,800 - 2,100 masl</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Harvest Period</p>
                        <p className="font-medium">October - December</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Soil Type</p>
                        <p className="font-medium">Volcanic Loam</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button className="flex-1 ">Contact Seller</Button>
                  <Button variant="outline" className="flex-1 ">
                    Request Samples
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

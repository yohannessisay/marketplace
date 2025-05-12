"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Plus,
  MapPin,
  Scale,
  Clock,
  ChevronRight,
  Leaf,
  Coffee,
  Search,
  Banknote,
  FileSearch,
  CheckCircle2,
  PauseCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Header from "@/components/layout/header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiService } from "@/services/apiService";
import { getFromLocalStorage } from "@/lib/utils";
import EditProfile from "../profile/edit-profile";
import { Skeleton } from "@/components/ui/skeleton";

interface Farm {
  id: string;
  farm_name: string;
  town_location: string;
  total_size_hectares?: string;
  capacity_kg?: string;
  verification_status: "pending" | "approved" | "rejected";
  created_at?: string;
}

interface CoffeeListing {
  id: string;
  farm_id: string;
  coffee_variety: string;
  quantity_kg: number;
  price_per_kg: number;
  listing_status: string;
  created_at: string;
  is_organic: boolean;
  grade?: string | null;
  readiness_date?: string | null;
  kyc_status: "pending" | "approved" | "rejected";
}

interface Bank {
  id: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  branch_name: string;
  swift_code?: string;
  is_primary: boolean;
  created_at?: string;
}

const SkeletonCard: React.FC = () => {
  return (
    <Card className="overflow-hidden border border-slate-200">
      <CardHeader className="bg-white pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Skeleton className="w-10 h-10 rounded-full mr-3" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-6">
        <div className="space-y-3">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-3 w-3 mr-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
};
const FarmManagement: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [listings, setListings] = useState<CoffeeListing[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [farmSearch, setFarmSearch] = useState("");
  const [listingSearch, setListingSearch] = useState("");
  const [page] = useState(1);
  const [limit] = useState(10);

  const user: any = getFromLocalStorage("userProfile", {});
  let fmrId = null;
  if (user && user.userType === "agent") {
    const farmer: any = getFromLocalStorage("farmerProfile", {});
    fmrId = farmer ? farmer.id : null;
  }

  const fetchFarms = async (searchValue = farmSearch) => {
    try {
      setLoadingFarms(true);
      const response: any = await apiService().get(
        `/sellers/farms/get-farms?search=${searchValue}&page=${page}&limit=${limit}`,
        fmrId ? fmrId : "",
      );
      setFarms(response.data.farms);
    } catch (error) {
      console.error("Failed to fetch farms:", error);
    } finally {
      setLoadingFarms(false);
    }
  };

  const fetchListings = async (searchValue = listingSearch) => {
    try {
      setLoadingListings(true);
      const response: any = await apiService().get(
        `/sellers/listings/get-listings?search=${searchValue}&page=${page}&limit=${limit}`,
        fmrId ? fmrId : "",
      );
      setListings(response.data.listings);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchBanks = async () => {
    try {
      setLoadingBanks(true);
      const response: any = await apiService().get(
        `/sellers/banks/get-banks?page=${page}&limit=${limit}`,
        fmrId ? fmrId : "",
      );
      setBanks(response.data.bank_accounts);
    } catch (error) {
      console.error("Failed to fetch banks:", error);
    } finally {
      setLoadingBanks(false);
    }
  };

  useEffect(() => {
    fetchFarms();
    fetchListings();
    fetchBanks();
  }, []);

  // Debounced fetch for farm search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchFarms(farmSearch);
    }, 500);

    return () => clearTimeout(timeout);
  }, [farmSearch]);

  // Debounced fetch for listing search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchListings(listingSearch);
    }, 500);

    return () => clearTimeout(timeout);
  }, [listingSearch]);
  return (
    <div className="bg-primary/5 min-h-screen py-8 px-8">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 pt-20">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800 mb-2">
              Farm Management
            </h1>
            <p className="text-slate-500">
              Manage your coffee farms, listings, and banks
            </p>
          </div>
        </div>

        <Separator className="mb-8" />

        <Tabs defaultValue="farms" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger
              value="farms"
              className="border border-green-300 p-3 mr-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-500"
            >
              Farms
            </TabsTrigger>
            <TabsTrigger
              value="listings"
              className="border border-green-300 p-3 ml-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-500"
            >
              Listings
            </TabsTrigger>
            <TabsTrigger
              value="banks"
              className="border border-green-300 p-3 ml-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-500"
            >
              Banks
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="border border-green-300 p-3 ml-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-500"
            >
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Farms Tab */}
          <TabsContent value="farms">
            <div className="mb-6 max-w-md bg-white my-4 p-4 rounded-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search farms by name or location..."
                  value={farmSearch}
                  onChange={(e) => setFarmSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loadingFarms ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Display 4 skeleton cards to mimic loading state */}
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : farms.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                  <Home className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">
                  No farms found
                </h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  {farmSearch
                    ? "No farms match your search criteria."
                    : "You haven't added any farms to your account. Start by adding your first coffee farm."}
                </p>
                <Button asChild>
                  <Link to="/add-farm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Farm
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add New Farm Card */}
                <Card className="border-2 border-dashed border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 group">
                  <Link to="/add-farm" className="block h-full">
                    <CardContent className="flex flex-col items-center justify-center p-8 h-full text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors flex items-center justify-center mb-4">
                        <Plus className="h-8 w-8 text-slate-500 group-hover:text-slate-700 transition-colors" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-700 mb-2">
                        Add New Farm
                      </h3>
                      <p className="text-sm text-slate-500">
                        Register a new coffee farm to your portfolio
                      </p>
                    </CardContent>
                  </Link>
                </Card>

                {/* Farm Cards */}
                {farms.map((farm, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border border-slate-200 hover:shadow-md transition-all duration-200"
                  >
                    <CardHeader className="bg-white pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                            <Leaf className="h-5 w-5 text-emerald-600" />
                          </div>
                          <CardTitle className="text-lg font-semibold text-slate-800">
                            {farm.farm_name}
                          </CardTitle>
                        </div>
                        <StatusBadge status={farm.verification_status} />
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 pb-6">
                      <div className="space-y-3">
                        <div className="flex items-center text-slate-600">
                          <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                          <span>{farm.town_location}</span>
                        </div>

                        {farm.verification_status === "approved" && (
                          <>
                            <div className="flex items-center text-slate-600">
                              <Home className="h-4 w-4 mr-2 text-slate-400" />
                              <span>{farm.total_size_hectares} hectares</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                              <Scale className="h-4 w-4 mr-2 text-slate-400" />
                              <span>
                                {Number.parseInt(
                                  farm.capacity_kg || "0",
                                )?.toLocaleString()}{" "}
                                kg capacity
                              </span>
                            </div>
                          </>
                        )}

                        {farm.created_at && (
                          <div className="flex items-center text-slate-500 text-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              Added on{" "}
                              {new Date(farm.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {farm.verification_status === "pending" && (
                        <Alert
                          variant="default"
                          className="mt-4 bg-amber-50 border-amber-200 text-amber-800"
                        >
                          <AlertDescription className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2 text-amber-500" />
                            Your farm is being verified. We'll update you when
                            the process is complete.
                          </AlertDescription>
                        </Alert>
                      )}

                      {farm.verification_status === "rejected" && (
                        <Alert
                          variant="default"
                          className="mt-4 bg-red-200 border-amber-200 text-black"
                        >
                          <AlertDescription className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2 text-amber-500" />
                            Sorry, this farm is rejected. Contact support for
                            further details.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>

                    <CardFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center group"
                        disabled={farm.verification_status === "rejected"}
                      >
                        <Link
                          to={`/manage-farm/${farm.id}`}
                          className="w-full flex items-center justify-center group"
                        >
                          <span>Manage Farm</span>
                          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </Button>

                      <Button
                        className="w-full flex items-center justify-center group mt-4"
                        disabled={farm.verification_status === "rejected"}
                      >
                        <Link
                          to={`/add-crop?farmId=${farm.id}`}
                          className="w-full flex items-center justify-center group"
                        >
                          <span>Add Crop</span>
                          <Plus className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings">
            <div className="mb-6 max-w-md bg-white my-4 p-4 rounded-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search listings by coffee variety..."
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loadingListings ? (
              <p className="text-slate-500 text-center">Loading listings...</p>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                  <Coffee className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">
                  No listings found
                </h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  {listingSearch
                    ? "No listings match your search criteria."
                    : "You haven't added any coffee listings. Start by adding your first coffee listing."}
                </p>
                <Button asChild>
                  <Link to="/add-listing">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Listing
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add New Listing Card */}
                <Card className="border-2 border-dashed border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 group">
                  <Link to="/add-crop" className="block h-full">
                    <CardContent className="flex flex-col items-center justify-center p-8 h-full text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors flex items-center justify-center mb-4">
                        <Plus className="h-8 w-8 text-slate-500 group-hover:text-slate-700 transition-colors" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-700 mb-2">
                        Add New Listing
                      </h3>
                      <p className="text-sm text-slate-500">
                        Create a new coffee listing for your farm
                      </p>
                    </CardContent>
                  </Link>
                </Card>

                {/* Listing Cards */}
                {listings.map((listing, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border border-slate-200 hover:shadow-md transition-all duration-200"
                  >
                    <CardHeader className="bg-white pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                            <Coffee className="h-5 w-5 text-emerald-600" />
                          </div>
                          <CardTitle className="text-lg font-semibold text-slate-800">
                            {listing.coffee_variety}
                          </CardTitle>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {/* Listing Status Badge */}
                          <Badge
                            variant={
                              listing.listing_status === "active"
                                ? "default"
                                : "warning"
                            }
                            className="text-xs"
                          >
                            {listing.listing_status === "active" ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <PauseCircle className="h-3 w-3 mr-1" />
                            )}
                            {listing.listing_status.charAt(0).toUpperCase() +
                              listing.listing_status.slice(1)}
                          </Badge>

                          {/* KYC Status Badge */}
                          <Badge
                            variant={
                              listing.kyc_status === "approved"
                                ? "default"
                                : listing.kyc_status === "rejected"
                                  ? "destructive"
                                  : "warning"
                            }
                            className="text-xs"
                          >
                            {listing.kyc_status === "approved" ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : listing.kyc_status === "rejected" ? (
                              <XCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            KYC:{" "}
                            {listing.kyc_status.charAt(0).toUpperCase() +
                              listing.kyc_status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 pb-6">
                      <div className="space-y-3">
                        <div className="flex items-center text-slate-600">
                          <Scale className="h-4 w-4 mr-2 text-slate-400" />
                          <span>
                            {listing.quantity_kg?.toLocaleString()} kg
                          </span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <span className="mr-2 text-slate-400">$</span>
                          <span>${listing.price_per_kg?.toFixed(2)}/kg</span>
                        </div>
                        {listing.is_organic && (
                          <div className="flex items-center text-slate-600">
                            <Leaf className="h-4 w-4 mr-2 text-slate-400" />
                            <span>Organic</span>
                          </div>
                        )}
                        {listing.grade && (
                          <div className="flex items-center text-slate-600">
                            <span className="mr-2 text-slate-400">★</span>
                            <span>Grade: {listing.grade}</span>
                          </div>
                        )}
                        {listing.created_at && (
                          <div className="flex items-center text-slate-500 text-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              Created on{" "}
                              {new Date(
                                listing.created_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status-specific alerts */}
                      {listing.listing_status === "inactive" && (
                        <Alert
                          variant="default"
                          className="mt-4 bg-slate-50 border-slate-200 text-slate-800"
                        >
                          <AlertDescription className="flex items-center text-sm">
                            <PauseCircle className="h-4 w-4 mr-2 text-slate-500" />
                            This listing is currently inactive and not visible
                            to buyers.
                          </AlertDescription>
                        </Alert>
                      )}

                      {listing.kyc_status === "pending" && (
                        <Alert
                          variant="default"
                          className="mt-4 bg-blue-50 border-blue-200 text-blue-800"
                        >
                          <AlertDescription className="flex items-center text-sm">
                            <FileSearch className="h-4 w-4 mr-2 text-blue-500" />
                            KYC verification is in progress for this listing.
                          </AlertDescription>
                        </Alert>
                      )}

                      {listing.kyc_status === "rejected" && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertDescription className="flex items-center text-sm">
                            <XCircle className="h-4 w-4 mr-2" />
                            KYC verification failed. Please update your
                            documents.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>

                    <CardFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center group"
                        asChild
                      >
                        <Link to={`/manage-listing/${listing.id}`}>
                          <span>Manage Listing</span>
                          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Banks Tab */}
          <TabsContent value="banks">
            {loadingBanks ? (
              <p className="text-slate-500 text-center">Loading banks...</p>
            ) : banks?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
                  <Banknote className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">
                  No banks found
                </h3>
                {/* <p className="text-slate-500 max-w-md mx-auto mb-6">
                  {bankSearch
                    ? "No banks match your search criteria."
                    : "You haven't added any banks to your account. Start by adding your first bank account."}
                </p> */}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banks.map((bank, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border border-slate-200 hover:shadow-md transition-all duration-200"
                  >
                    <CardHeader className="bg-white pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-slate-700">
                            {bank.account_holder_name}
                          </h3>
                        </div>
                        {bank.is_primary && (
                          <Badge className="bg-green-500 text-white">
                            Primary
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4 pb-6">
                      <div className="space-y-3">
                        <div className="flex items-center text-slate-600">
                          <span className="font-medium">Bank:</span>
                          <span className="ml-2">{bank.bank_name}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <span className="font-medium">Account Number:</span>
                          <span className="ml-2">{bank.account_number}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <span className="font-medium">Branch:</span>
                          <span className="ml-2">{bank.branch_name}</span>
                        </div>
                        {bank.swift_code && (
                          <div className="flex items-center text-slate-600">
                            <span className="font-medium">SWIFT Code:</span>
                            <span className="ml-2">{bank.swift_code}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center group"
                        asChild
                      >
                        <Link to={`/edit-bank/${bank.id}`}>
                          <span>Manage Bank Info</span>
                          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <EditProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Approval Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge
          variant="outline"
          className="bg-green-300 text-gray-800 border-emerald-200"
        >
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="bg-red-200 text-slate-600 border-slate-200"
        >
          Rejected
        </Badge>
      );
    default:
      return null;
  }
};

export default FarmManagement;

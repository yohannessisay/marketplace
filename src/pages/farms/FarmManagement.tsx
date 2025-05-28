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
  AlertCircle,
  PencilLine,
  CalendarX,
  Star,
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
import { RequestEditModal } from "@/components/modals/RequestEditModal";

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
  kyc_status: "pending" | "approved" | "rejected";
  admin_edit_request_approval_status:
    | "not_requested"
    | "requested"
    | "allowed"
    | "expired"
    | "rejected";
  edit_requested_at?: string;
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

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
}) => (
  <div className="mb-6 max-w-md bg-white my-4 p-4 rounded-md">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  </div>
);

interface NoResultsProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  hasSearch: boolean;
}
const NoResults: React.FC<NoResultsProps> = ({
  icon,
  title,
  description,
  buttonText,
  buttonLink,
  hasSearch,
}) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-slate-700 mb-2">{title}</h3>
    <p className="text-slate-500 max-w-md mx-auto mb-6">
      {hasSearch ? "No results match your search criteria." : description}
    </p>
    <Button asChild>
      <Link to={buttonLink}>
        <Plus className="mr-2 h-4 w-4" />
        {buttonText}
      </Link>
    </Button>
  </div>
);

interface AddNewCardProps {
  title: string;
  description: string;
  link: string;
  icon?: React.ReactNode;
}
const AddNewCard: React.FC<AddNewCardProps> = ({
  title,
  description,
  link,
  icon = (
    <Plus className="h-8 w-8 text-slate-500 group-hover:text-slate-700 transition-colors" />
  ),
}) => (
  <Card className="border-2 border-dashed border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 group">
    <Link to={link} className="block h-full">
      <CardContent className="flex flex-col items-center justify-center p-8 h-full text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-2">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </CardContent>
    </Link>
  </Card>
);

interface FarmCardProps {
  farm: Farm;
}
const FarmCard: React.FC<FarmCardProps> = ({ farm }) => (
  <Card className="overflow-hidden border border-slate-200 hover:shadow-md transition-all duration-200">
    <CardHeader className="bg-white pb-2 xs:p-4">
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
    <CardContent className="pt-4 pb-6 xs:p-4">
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
                {Number.parseInt(farm.capacity_kg || "0")?.toLocaleString()} kg
                capacity
              </span>
            </div>
          </>
        )}
        {farm.created_at && (
          <div className="flex items-center text-slate-500 text-sm">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              Added on {new Date(farm.created_at).toLocaleDateString()}
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
            Your farm is being verified. We'll update you when the process is
            complete.
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
            Sorry, this farm is rejected. Contact support for further details.
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
);

interface ListingCardProps {
  listing: CoffeeListing;
}
const ListingCard: React.FC<ListingCardProps> = ({ listing }) => (
  <Card className="overflow-hidden border border-slate-200 hover:shadow-md transition-all duration-200">
    <CardHeader className="bg-white pb-2 xs:p-4">
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
          <Badge
            variant={
              listing.listing_status === "active" ? "default" : "warning"
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
    <CardContent className="pt-4 pb-6 xs:p-4">
      <div className="space-y-3">
        <div className="flex items-center text-slate-600">
          <Scale className="h-4 w-4 mr-2 text-slate-400" />
          <span>{listing.quantity_kg?.toLocaleString()} kg</span>
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
          <div className="flex gap-1 items-center text-slate-600">
            <Star className="text-yellow-300 h-4 w-4" fill="yellow" />
            <span>{listing.grade}</span>
          </div>
        )}
        {listing.created_at && (
          <div className="flex items-center text-slate-500 text-sm">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              Created on {new Date(listing.created_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
      {listing.listing_status === "inactive" && (
        <Alert
          variant="default"
          className="mt-4 bg-slate-50 border-slate-200 text-slate-800"
        >
          <AlertDescription className="flex items-center text-sm">
            <PauseCircle className="h-4 w-4 mr-2 text-slate-500" />
            This listing is currently inactive and not visible to buyers.
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
            KYC verification failed. Please update your documents.
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
);

interface BankCardProps {
  bank: Bank;
  onRequestEdit: (bankId: string) => void;
}
const BankCard: React.FC<BankCardProps> = ({ bank, onRequestEdit }) => (
  <Card className="overflow-hidden border border-slate-200 hover:shadow-md transition-all duration-200">
    <CardHeader className="bg-white pb-2 xs:p-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Banknote className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-700">
              {bank.account_holder_name}
            </h3>
            <p className="text-sm text-slate-500">{bank.bank_name}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {bank.is_primary && (
            <Badge className="bg-green-500 text-white">Primary</Badge>
          )}
          <Badge
            variant={
              bank.kyc_status === "approved"
                ? "default"
                : bank.kyc_status === "rejected"
                  ? "destructive"
                  : "warning"
            }
            className="text-xs"
          >
            {bank.kyc_status === "approved" ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : bank.kyc_status === "rejected" ? (
              <XCircle className="h-3 w-3 mr-1" />
            ) : (
              <Clock className="h-3 w-3 mr-1" />
            )}
            KYC: {bank.kyc_status}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-4 pb-6 xs:p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Account Number
            </h4>
            <p className="text-gray-900">{bank.account_number}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Branch</h4>
            <p className="text-gray-900">{bank.branch_name || "N/A"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Created On</h4>
            <p className="text-gray-900">
              {bank.created_at
                ? new Date(bank.created_at).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">SWIFT Code</h4>
            <p className="text-gray-900">{bank.swift_code || "N/A"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Edit Status</h4>
            <div className="mt-1">
              {bank.admin_edit_request_approval_status === "allowed" && (
                <Badge className="gap-1 text-[14px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Allowed
                </Badge>
              )}
              {bank.admin_edit_request_approval_status === "requested" && (
                <Badge variant="warning" className="gap-1 text-[14px]">
                  <Clock className="h-3.5 w-3.5" />
                  Requested
                </Badge>
              )}
              {bank.admin_edit_request_approval_status === "rejected" && (
                <Badge variant="destructive" className="gap-1 text-[14px]">
                  <XCircle className="h-3.5 w-3.5" />
                  Rejected
                </Badge>
              )}
              {bank.admin_edit_request_approval_status === "expired" && (
                <Badge variant="outline" className="gap-1 text-[14px]">
                  <CalendarX className="h-3.5 w-3.5" />
                  Expired
                </Badge>
              )}
              {bank.admin_edit_request_approval_status === "not_requested" && (
                <Badge variant="outline" className="gap-1 text-[14px]">
                  <PencilLine className="h-3.5 w-3.5" />
                  Not Requested
                </Badge>
              )}
            </div>
          </div>
          {bank.edit_requested_at && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">
                Last Edit Request
              </h4>
              <p className="text-gray-900">
                {new Date(bank.edit_requested_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
      {bank.kyc_status === "pending" && (
        <Alert
          variant="default"
          className="mt-4 bg-blue-50 border-blue-200 text-blue-800"
        >
          <AlertDescription className="flex items-center text-sm">
            <FileSearch className="h-4 w-4 mr-2 text-blue-500" />
            KYC verification is in progress for this bank account.
          </AlertDescription>
        </Alert>
      )}
      {bank.kyc_status === "rejected" && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription className="flex items-center text-sm">
            <XCircle className="h-4 w-4 mr-2" />
            KYC verification failed. Please update your bank details.
          </AlertDescription>
        </Alert>
      )}
    </CardContent>
    <CardFooter className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col gap-3">
      {bank.admin_edit_request_approval_status === "allowed" ? (
        <Link to={`/edit-bank/${bank.id}`}>
          <Button className="w-full">Edit Bank Info</Button>
        </Link>
      ) : bank.admin_edit_request_approval_status === "requested" ||
        bank.admin_edit_request_approval_status === "expired" ? (
        <Button className="w-full" disabled>
          {bank.admin_edit_request_approval_status === "requested"
            ? "Edit Requested"
            : "Request Expired"}
        </Button>
      ) : bank.kyc_status === "pending" ? (
        <div className="space-y-4 rounded-lg bg-amber-100 p-4 w-full">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-900 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">
                KYC is Pending
              </h4>
              <p className="mt-1 text-sm text-amber-800">
                Request edit access to modify this bank account.
              </p>
            </div>
          </div>
          <Button className="w-full" onClick={() => onRequestEdit(bank.id)}>
            Request Edit Access
          </Button>
        </div>
      ) : (
        <div className="space-y-4 rounded-lg bg-green-100 p-4 w-full">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800">
                KYC Verified
              </h4>
              <p className="mt-1 text-sm text-green-700">
                Request edit access to modify this verified bank account.
              </p>
            </div>
          </div>
          <Button className="w-full" onClick={() => onRequestEdit(bank.id)}>
            Request Edit Access
          </Button>
        </div>
      )}
    </CardFooter>
  </Card>
);

interface FarmsTabProps {
  farms: Farm[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
}
const FarmsTab: React.FC<FarmsTabProps> = ({
  farms,
  loading,
  search,
  onSearchChange,
}) => (
  <TabsContent value="farms">
    <SearchBar
      value={search}
      onChange={onSearchChange}
      placeholder="Search farms by name or location..."
    />
    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xs:gap-4 xs:px-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    ) : farms.length === 0 ? (
      <NoResults
        icon={<Home className="h-8 w-8 text-slate-400" />}
        title="No farms found"
        description="You haven't added any farms to your account. Start by adding your first coffee farm."
        buttonText="Add Your First Farm"
        buttonLink="/add-farm"
        hasSearch={!!search}
      />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xs:gap-4 xs:px-2">
        <AddNewCard
          title="Add New Farm"
          description="Register a new coffee farm to your portfolio"
          link="/add-farm"
        />
        {farms.map((farm) => (
          <FarmCard key={farm.id} farm={farm} />
        ))}
      </div>
    )}
  </TabsContent>
);

interface ListingsTabProps {
  listings: CoffeeListing[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
}
const ListingsTab: React.FC<ListingsTabProps> = ({
  listings,
  loading,
  search,
  onSearchChange,
}) => (
  <TabsContent value="listings">
    <SearchBar
      value={search}
      onChange={onSearchChange}
      placeholder="Search listings by coffee variety..."
    />
    {loading ? (
      <p className="text-slate-500 text-center">Loading listings...</p>
    ) : listings.length === 0 ? (
      <NoResults
        icon={<Coffee className="h-8 w-8 text-slate-400" />}
        title="No listings found"
        description="You haven't added any coffee listings. Start by adding your first coffee listing."
        buttonText="Add Your First Listing"
        buttonLink="/add-listing"
        hasSearch={!!search}
      />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xs:gap-4 xs:px-2">
        <AddNewCard
          title="Add New Listing"
          description="Create a new coffee listing for your farm"
          link="/add-crop"
        />
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    )}
  </TabsContent>
);

interface BanksTabProps {
  banks: Bank[];
  loading: boolean;
  onRequestEdit: (bankId: string) => void;
}
const BanksTab: React.FC<BanksTabProps> = ({
  banks,
  loading,
  onRequestEdit,
}) => (
  <TabsContent value="banks">
    {loading ? (
      <p className="text-slate-500 text-center">Loading banks...</p>
    ) : banks.length === 0 ? (
      <NoResults
        icon={<Banknote className="h-8 w-8 text-slate-400" />}
        title="No banks found"
        description="You haven't added any bank accounts."
        buttonText="Add Your First Bank"
        buttonLink="/add-bank"
        hasSearch={false}
      />
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xs:gap-4 xs:px-2">
        {banks.map((bank) => (
          <BankCard key={bank.id} bank={bank} onRequestEdit={onRequestEdit} />
        ))}
      </div>
    )}
  </TabsContent>
);

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
  const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);
  const [currentBankId, setCurrentBankId] = useState<string | null>(null);
  const [_editRequestStatus, setEditRequestStatus] = useState<
    "not_requested" | "requested" | "allowed" | "expired" | "rejected"
  >("not_requested");

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
      setCurrentBankId(response.data.bank_accounts[0]?.id || null);
      setBanks(response.data.bank_accounts);
    } catch (error) {
      console.error("Failed to fetch banks:", error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleEditRequestSuccess = (status: any) => {
    setEditRequestStatus(status);
    fetchBanks();
  };

  useEffect(() => {
    fetchFarms();
    fetchListings();
    fetchBanks();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchFarms(farmSearch);
    }, 500);
    return () => clearTimeout(timeout);
  }, [farmSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchListings(listingSearch);
    }, 500);
    return () => clearTimeout(timeout);
  }, [listingSearch]);

  const handleRequestEdit = (bankId: string) => {
    setCurrentBankId(bankId);
    setIsEditRequestModalOpen(true);
  };

  return (
    <div className="bg-primary/5 min-h-screen py-8 px-8">
      <Header />
      <div className="max-w-6xl mx-auto px-1 py-8 pt-20">
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
          <TabsList className="grid w-full grid-cols-4 gap-2 mb-8 sm:gap-0">
            <TabsTrigger
              value="farms"
              className="border border-green-300 px-4 py-3 sm:mr-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-500"
            >
              Farms
            </TabsTrigger>
            <TabsTrigger
              value="listings"
              className="border border-green-300 px-4 py-3 sm:ml-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-500"
            >
              Listings
            </TabsTrigger>
            <TabsTrigger
              value="banks"
              className="border border-green-300 px-4 py-3 sm:ml-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-500"
            >
              Banks
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="border border-green-300 px-4 py-3 sm:ml-2 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-500"
            >
              Profile
            </TabsTrigger>
          </TabsList>
          <FarmsTab
            farms={farms}
            loading={loadingFarms}
            search={farmSearch}
            onSearchChange={setFarmSearch}
          />
          <ListingsTab
            listings={listings}
            loading={loadingListings}
            search={listingSearch}
            onSearchChange={setListingSearch}
          />
          <BanksTab
            banks={banks}
            loading={loadingBanks}
            onRequestEdit={handleRequestEdit}
          />
          <TabsContent value="profile">
            <EditProfile />
          </TabsContent>
        </Tabs>
      </div>
      <RequestEditModal
        isOpen={isEditRequestModalOpen}
        onClose={() => setIsEditRequestModalOpen(false)}
        entityId={currentBankId || ""}
        entityType="bank"
        onSubmitSuccess={handleEditRequestSuccess}
        xfmrId={fmrId || undefined}
      />
    </div>
  );
};

export default FarmManagement;

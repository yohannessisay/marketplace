"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Star,
  Search,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarX,
  PencilLine,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiService } from "@/services/apiService";
import { useMobile } from "@/hooks/useMobile";
import { MessageThreadList } from "./message-thread-list";
import { MessageThread } from "./message-thread";
import Header from "@/components/layout/header";
import { APIErrorResponse } from "@/types/api";
import { getFromLocalStorage, getUserId } from "@/lib/utils";
import { useNotification } from "@/hooks/useNotification";
import {
  Message,
  MessageThread as MessageThreadType,
} from "@/types/coffee-listing";
import { useAuth } from "@/hooks/useAuth";
import {
  Skeleton,
  SkeletonBids,
  SkeletonCardContent,
  SkeletonMessages,
  SkeletonPhotoGallery,
  SkeletonStats,
} from "./skeletons";
import { RequestEditModal } from "@/components/modals/RequestEditModal";
import { FARMER_PROFILE_KEY } from "@/types/constants";

interface Listing {
  id: string;
  coffee_variety: string;
  bean_type: string | null;
  crop_year: string | null;
  is_organic: boolean;
  processing_method: string | null;
  moisture_percentage: number | null;
  screen_size: string | null;
  drying_method: string | null;
  wet_mill: string | null;
  cup_taste: string[] | null;
  cup_aroma: string[] | null;
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
  admin_edit_request_approval_status:
    | "not_requested"
    | "requested"
    | "allowed"
    | "expired"
    | "rejected";
  edit_requested_at: string | null;
  kyc_status: "pending" | "approved" | "rejected";
  farm: {
    farm_id: string;
    farm_name: string;
    town_location: string | null;
    region: string | null;
    country: string;
    total_size_hectares: number | null;
    coffee_area_hectares: number | null;
    longitude: number | null;
    latitude: number | null;
    altitude_meters: string | null;
    crop_type: string | null;
    crop_source: string | null;
    origin: string | null;
    capacity_kg: number | null;
    tree_type: string | null;
    tree_variety: string | null;
    soil_type: string | null;
    avg_annual_temp: number | null;
    annual_rainfall_mm: number | null;
    polygon_coords: { lat: number; lng: number }[][] | null;
  } | null;
  photos: Array<{
    id: string;
    photo_url: string;
    is_primary: boolean;
    created_at: string;
  }>;
  documents: Array<{
    id: string;
    doc_url: string;
    doc_type: string;
    note: string | null;
    verified: boolean;
    created_at: string;
    updated_at: string | null;
  }>;
  discounts: Array<{
    id: string;
    minimum_quantity_kg: number;
    discount_percentage: number;
    created_at: string;
  }>;
}

interface Buyer {
  first_name: string;
  last_name: string;
}

interface Bid {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  quantity_kg: number;
  unit_price: number;
  total_amount: number;
  status: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  listing: Listing;
  buyer: Buyer;
}

// Define interface for listingStats
interface ListingStats {
  views: number;
  inquiries: number;
  totalBids: number;
  totalRevenue: number;
}

export default function CoffeeListingSellerView() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeMessageThread, setActiveMessageThread] = useState<string | null>(
    null,
  );
  const [messageFilter, setMessageFilter] = useState("all");
  const [listing, setListing] = useState<Listing | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [messageThreads, setMessageThreads] = useState<MessageThreadType[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [generalLoading, setGeneralLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { errorMessage, successMessage } = useNotification();

  const isMobile = useMobile();
  const params = useParams();
  const id = params.id as string | undefined;
  const { user } = useAuth();
  const senderId = getUserId();
  const farmerProfile: any = getFromLocalStorage(FARMER_PROFILE_KEY, {});
  const fmrId = farmerProfile ? farmerProfile.id : undefined;

  const fetchData = useCallback(async () => {
    if (!id || !senderId || hasFetched) return;

    if (!user) {
      return;
    }
    if (user && user.userType === "agent" && fmrId === null) {
      return;
    }
    try {
      setIsFetching(true);

      const listingResponse: any = await apiService().get(
        `/sellers/listings/get-listing?listingId=${id}`,
        fmrId,
      );
      setListing(listingResponse.data.listing);

      const bidsResponse: any = await apiService().get(
        `/sellers/listings/bids/get-bids?listingId=${id}`,
        fmrId,
      );
      setBids(bidsResponse.data.bids || []);

      const messagesResponse: any = await apiService().get(
        id
          ? `/chats/listing-messages?listingId=${id}`
          : `/chats/listing-messages`,
        fmrId,
      );
      const groupedThreads: { [key: string]: MessageThreadType } = {};
      messagesResponse.data.messages.forEach((msg: Message) => {
        const otherPartyId =
          msg.sender.id === senderId ? msg.recipient.id : msg.sender.id;
        const threadId = `${otherPartyId}-${msg.listingId || "no-listing"}`;

        if (!groupedThreads[threadId]) {
          const otherParty =
            msg.sender.id === senderId ? msg.recipient : msg.sender;
          const isOtherPartyBuyer = otherParty.userType === "buyer";

          groupedThreads[threadId] = {
            id: threadId,
            buyerName: otherParty.name,
            buyerCompany: isOtherPartyBuyer ? otherParty.company_name : null,
            buyerAvatar: otherParty.avatar_url_csv,
            unread: 0,
            lastMessageTime: msg.createdAt,
            messages: [],
          };
        }

        groupedThreads[threadId].messages.push({
          id: msg.id,
          sender: msg.sender,
          recipient: msg.recipient,
          recipientType: msg.recipientType,
          message: msg.message,
          listingId: msg.listingId,
          createdAt: msg.createdAt,
        });

        if (
          new Date(msg.createdAt) >
          new Date(groupedThreads[threadId].lastMessageTime)
        ) {
          groupedThreads[threadId].lastMessageTime = msg.createdAt;
        }
      });

      const threadsArray = Object.values(groupedThreads)
        .map((thread) => ({
          ...thread,
          messages: thread.messages.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
        }))
        .sort(
          (a, b) =>
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime(),
        );

      setMessageThreads(threadsArray);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsFetching(false);
      setHasFetched(true);
    }
  }, [id, senderId, fmrId, errorMessage, user, farmerProfile, hasFetched]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const acceptBid = async (bidId: string) => {
    try {
      setGeneralLoading(true);
      await apiService().post(
        `/sellers/listings/bids/accept-bid?bidId=${bidId}`,
        fmrId ? fmrId : "",
      );
      successMessage("Bid accepted successfully, and order is placed");
      setHasFetched(false);
    } catch (error: any) {
      console.error("Error accepting bid:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setGeneralLoading(false);
    }
  };

  const rejectBid = async (bidId: string) => {
    try {
      setGeneralLoading(true);
      await apiService().post(
        `/sellers/listings/bids/reject-bid?bidId=${bidId}`,
        fmrId ? fmrId : "",
      );
      successMessage("Bid rejected successfully");
      setHasFetched(false);
    } catch (error: any) {
      console.error("Error rejecting bid:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setGeneralLoading(false);
    }
  };

  const filteredThreads = messageThreads.filter((thread) => {
    if (messageFilter === "unread") {
      return thread.unread > 0;
    }
    return true;
  });

  const totalUnreadMessages = messageThreads.reduce(
    (sum, thread) => sum + thread.unread,
    0,
  );

  const listingStats: ListingStats = {
    views: 150,
    inquiries: messageThreads.length,
    totalBids: bids.length,
    totalRevenue: bids.reduce((sum, bid) => sum + bid.total_amount, 0),
  };
  function PhotoGallery({
    listingId,
    photos: initialPhotos,
    isOrganic,
    xfmrId,
  }: {
    photos: Listing["photos"] | null;
    isOrganic: boolean;
    listingId: string;
    xfmrId?: string;
  }) {
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [photos, setPhotos] = useState(initialPhotos);
    const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
    const { errorMessage, successMessage } = useNotification();

    useEffect(() => {
      if (initialPhotos !== photos) {
        setPhotos(initialPhotos);
      }
    }, [initialPhotos]);

    const handleDeletePhoto = async (photoId: string) => {
      if (photos && photos.length <= 1) {
        errorMessage({
          error: { message: "At least one photo is required for the listing." },
        });
        return;
      }
      try {
        setDeletingPhotoId(photoId);
        await apiService().post(
          `/sellers/listings/delete-listing-image`,
          {
            listingId,
            photoId,
          },
          xfmrId,
        );

        setPhotos(
          (prev) => prev?.filter((photo) => photo.id !== photoId) || null,
        );

        if (photos && activePhotoIndex >= photos.length - 1) {
          setActivePhotoIndex(Math.max(0, activePhotoIndex - 1));
        }

        successMessage("Listing photo deleted successfully");
      } catch (error) {
        console.error("Failed to delete photo:", error);
        errorMessage(error as APIErrorResponse);
      } finally {
        setDeletingPhotoId(null);
      }
    };

    return (
      <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-4 sm:mb-6">
        <div className="flex flex-col gap-4 p-3 sm:p-4">
          {photos && photos.length > 0 ? (
            <div className="relative">
              <img
                src={photos[activePhotoIndex].photo_url || "/placeholder.svg"}
                alt={`Coffee ${activePhotoIndex + 1}`}
                className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg"
              />
              {isOrganic && (
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                  <Badge
                    variant="outline"
                    className="bg-green-500 text-white border-0 text-xs sm:text-sm"
                  >
                    Organic
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <img
              src="/placeholder.svg"
              alt="No photo"
              className="w-full h-48 sm:h-64 object-cover rounded-lg"
            />
          )}
        </div>
        <div className="flex p-2 space-x-2 overflow-x-auto ml-2 sm:ml-3">
          {photos &&
            photos.map((photo, index) => (
              <div key={photo.id} className="relative flex-shrink-0">
                <button
                  className={`bg-card w-16 h-16 sm:w-20 sm:h-20 rounded border-2 ${
                    index === activePhotoIndex
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => setActivePhotoIndex(index)}
                >
                  <img
                    src={photo.photo_url || "/placeholder.svg"}
                    alt=""
                    className="w-full h-full object-cover rounded cursor-pointer"
                  />
                </button>
                <button
                  className="absolute -top-1 -right-1 sm:top-0 sm:right-0 bg-red-500 text-white rounded-full p-1 cursor-pointer"
                  onClick={() => handleDeletePhoto(photo.id)}
                  disabled={deletingPhotoId === photo.id}
                >
                  {deletingPhotoId === photo.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <X size={12} />
                  )}
                </button>
              </div>
            ))}
        </div>
      </div>
    );
  }

  function ListingDetails({ listing }: { listing: Listing }) {
    return (
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {listing.coffee_variety}
          </h2>
          <div className="flex items-center bg-amber-100 px-2 py-1 rounded">
            <Star size={14} className="text-amber-500 fill-current" />
            <span className="ml-1 text-xs sm:text-sm font-medium text-amber-800">
              {listing.grade}
            </span>
          </div>
        </div>
        <div className="flex items-baseline mb-4 sm:mb-6">
          <span className="text-xl sm:text-2xl font-bold text-emerald-600">
            ${listing.price_per_kg?.toFixed(2)}
          </span>
          <span className="ml-1 text-sm sm:text-base text-gray-500">/kg</span>
        </div>
        <div className="space-y-4 mb-4 sm:mb-6">
          <p className="text-gray-700 text-sm sm:text-base">
            Premium {listing.coffee_variety} coffee from{" "}
            {listing.farm?.farm_name || "Unknown Farm"} in{" "}
            {listing.farm?.town_location || "Unknown Location"},{" "}
            {listing.farm?.region || "Unknown Region"},{" "}
            {listing.farm?.country || "Unknown Country"}. This coffee features{" "}
            {listing.cup_taste && listing.cup_taste.length > 0
              ? listing.cup_taste.join(", ").toLowerCase()
              : "balanced flavors"}
            .
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Variety
              </h4>
              <p className="text-gray-900 text-sm sm:text-base">
                {listing.coffee_variety}
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Processing
              </h4>
              <p className="text-gray-900 text-sm sm:text-base">
                {listing.processing_method || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Bean Type
              </h4>
              <p className="text-gray-900 text-sm sm:text-base">
                {listing.bean_type || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Crop Year
              </h4>
              <p className="text-gray-900 text-sm sm:text-base">
                {listing.crop_year || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Quantity Available
              </h4>
              <p className="text-gray-900 text-sm sm:text-base">
                {listing.quantity_kg} kg
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Ready By
              </h4>
              <p className="text-gray-900 text-sm sm:text-base">
                {listing.readiness_date || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Moisture
              </h4>
              <p className="text-gray-900 text-sm sm:text-base">
                {listing.moisture_percentage
                  ? `${listing.moisture_percentage}%`
                  : "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Screen Size
              </h4>
              <p className="text-gray-900 text-sm sm:text-base">
                {listing.screen_size || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Drying Method
              </h4>
              <p className="text-gray-900 text-sm sm:text-base">
                {listing.drying_method || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                Wet Mill
              </h4>
              <p className="text-gray-900 text-sm sm:text-base">
                {listing.wet_mill || "N/A"}
              </p>
            </div>
            {listing.cup_taste && listing.cup_taste.length > 0 && (
              <div className="col-span-1 sm:col-span-2">
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                  Cup Taste Profile
                </h4>
                <div className="flex flex-wrap gap-2">
                  {listing.cup_taste.map((taste, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-amber-100 text-amber-800"
                    >
                      {taste}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {listing.cup_aroma && listing.cup_aroma.length > 0 && (
              <div className="col-span-1 sm:col-span-2">
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                  Cup Aroma Profile
                </h4>
                <div className="flex flex-wrap gap-2">
                  {listing.cup_aroma.map((aroma, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {aroma}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {listing.discounts.length > 0 && (
          <>
            <Separator className="my-3 sm:my-4" />
            <div>
              <h3 className="text-sm sm:text-md font-medium text-gray-900 mb-2">
                Volume Discounts
              </h3>
              <div className="space-y-2">
                {listing.discounts.map((discount) => (
                  <div
                    key={discount.id}
                    className="flex justify-between items-center p-2 bg-emerald-50 rounded-md text-xs sm:text-sm"
                  >
                    <span className="text-gray-700">
                      Order {discount.minimum_quantity_kg}+ kg
                    </span>
                    <span className="font-medium text-emerald-700">
                      {discount.discount_percentage}% off
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    );
  }

  function RecentBids({ bids }: { bids: Bid[] }) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base sm:text-lg">Recent Bids</CardTitle>
          <Button
            variant="link"
            className="text-emerald-600 p-0 h-auto text-xs sm:text-sm"
            onClick={() => setActiveTab("bids")}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {bids.length === 0 && (
            <div className="text-center text-gray-600 text-sm sm:text-base">
              No Bids found for this listing
            </div>
          )}
          <div className="divide-y divide-gray-200">
            {bids.slice(0, 3).map((bid) => (
              <div key={bid.id} className="py-3 sm:py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900">
                        <span className="font-bold"> Bid ID:</span>{" "}
                        {bid.id.slice(0, 15)}...
                      </h4>
                      <Badge
                        variant={
                          bid.status === "accepted"
                            ? "default"
                            : bid.status === "rejected"
                              ? "destructive"
                              : "default"
                        }
                        className="ml-3 sm:ml-5 text-xs sm:text-sm"
                      >
                        {bid.status}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(bid.created_at).toLocaleDateString()} •{" "}
                      {bid.quantity_kg} kg
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      ${bid.total_amount?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  function RecentMessages({
    messageThreads,
  }: {
    messageThreads: MessageThreadType[];
  }) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base sm:text-lg">
            Recent Messages
          </CardTitle>
          <Button
            variant="link"
            className="text-emerald-600 p-0 h-auto text-xs sm:text-sm"
            onClick={() => setActiveTab("messages")}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {messageThreads.length === 0 && (
            <div className="text-center text-gray-600 text-sm sm:text-base">
              No message threads found for this listing
            </div>
          )}
          <div className="divide-y divide-gray-200">
            {messageThreads.slice(0, 3).map((thread) => (
              <div key={thread.id} className="py-3 sm:py-4">
                <div className="flex justify-between items-start">
                  <div className="flex">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xs sm:text-sm">
                        {thread.buyerName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-2 sm:ml-3">
                      <div className="flex items-center">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900">
                          {thread.buyerName || "Unknown User"}
                        </h4>
                        {thread.unread > 0 && (
                          <Badge
                            variant="default"
                            className="ml-2 text-xs sm:text-sm"
                          >
                            {thread.unread} new
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {thread.buyerCompany}
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-gray-600 truncate max-w-[200px] sm:max-w-[300px]">
                        {thread.messages[thread.messages.length - 1]?.message}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(thread.lastMessageTime).toLocaleTimeString()}
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-emerald-600 mt-1 text-xs sm:text-sm"
                      onClick={() => {
                        setActiveTab("messages");
                        setActiveMessageThread(thread.id);
                      }}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  function ListingInfo({
    listing,
    listingStats,
  }: {
    listing: Listing;
    listingStats: ListingStats;
  }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Listing Info</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                  Status
                </h4>
                <div className="mt-1">
                  <Badge
                    variant={
                      listing.listing_status === "active"
                        ? "default"
                        : "warning"
                    }
                    className="text-xs sm:text-sm"
                  >
                    {listing.listing_status}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                  KYC Verification Status
                </h4>
                <div className="mt-1">
                  {listing.kyc_status === "approved" && (
                    <Badge
                      variant="default"
                      className="gap-1 text-xs sm:text-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approved
                    </Badge>
                  )}
                  {listing.kyc_status === "pending" && (
                    <Badge
                      variant="warning"
                      className="gap-1 text-xs sm:text-sm"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Pending
                    </Badge>
                  )}
                  {listing.kyc_status === "rejected" && (
                    <Badge
                      variant="destructive"
                      className="gap-1 text-xs sm:text-sm"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Rejected
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                  Created On
                </h4>
                <p className="text-gray-900 text-sm sm:text-base">
                  {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                  Farm
                </h4>
                <p className="text-gray-900 text-sm sm:text-base">
                  {listing.farm?.farm_name || "N/A"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                  Edit Request
                </h4>
                <div className="mt-1">
                  {listing.admin_edit_request_approval_status === "allowed" && (
                    <Badge className="gap-1 text-xs sm:text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Allowed
                    </Badge>
                  )}
                  {listing.admin_edit_request_approval_status ===
                    "requested" && (
                    <Badge
                      variant="warning"
                      className="gap-1 text-xs sm:text-sm"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Requested
                    </Badge>
                  )}
                  {listing.admin_edit_request_approval_status ===
                    "rejected" && (
                    <Badge
                      variant="destructive"
                      className="gap-1 text-xs sm:text-sm"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Rejected
                    </Badge>
                  )}
                  {listing.admin_edit_request_approval_status === "expired" && (
                    <Badge
                      variant="outline"
                      className="gap-1 text-xs sm:text-sm"
                    >
                      <CalendarX className="h-3.5 w-3.5" />
                      Expired
                    </Badge>
                  )}
                  {listing.admin_edit_request_approval_status ===
                    "not_requested" && (
                    <Badge
                      variant="outline"
                      className="gap-1 text-xs sm:text-sm"
                    >
                      <PencilLine className="h-3.5 w-3.5" />
                      Not Requested
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                  Ready By
                </h4>
                <p className="text-gray-900 text-sm sm:text-base">
                  {listing.readiness_date || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                  Quantity
                </h4>
                <p className="text-gray-900 text-sm sm:text-base">
                  {listing.quantity_kg} kg
                </p>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                  Views
                </h4>
                <p className="text-gray-900 text-sm sm:text-base">
                  {listingStats.views}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-6">
            {listing.admin_edit_request_approval_status === "allowed" ? (
              <Link to={`/edit-crop/${listing.id}`}>
                <Button className="w-full text-sm sm:text-base">
                  Edit Listing
                </Button>
              </Link>
            ) : listing.admin_edit_request_approval_status === "requested" ||
              listing.admin_edit_request_approval_status === "expired" ? (
              <Button className="w-full text-sm sm:text-base" disabled>
                {listing.admin_edit_request_approval_status === "requested"
                  ? "Edit Requested"
                  : "Request Expired"}
              </Button>
            ) : listing.kyc_status === "pending" ? (
              <div className="space-y-3 sm:space-y-4 rounded-lg bg-amber-100 p-3 sm:p-4 mt-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-900 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-amber-800">
                      KYC is Pending
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-amber-800">
                      Request edit access to modify this listing.
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full text-sm sm:text-base"
                  onClick={() => setIsModalOpen(true)}
                >
                  Request Edit Access
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 rounded-lg bg-green-100 p-3 sm:p-4 mt-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-green-800">
                      KYC Verified
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-green-700">
                      Request edit access to modify this verified listing.
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full text-sm sm:text-base"
                  onClick={() => setIsModalOpen(true)}
                >
                  Request Edit Access
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  function BidsTable({ bids }: { bids: Bid[] }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">All Bids</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search bids..."
                className="pl-8 w-full sm:w-[200px] md:w-[250px] text-xs sm:text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] text-xs sm:text-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="latest">
                <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] text-xs sm:text-sm">
                  <SelectValue placeholder="Sort by Latest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Sort by Latest</SelectItem>
                  <SelectItem value="oldest">Sort by Oldest</SelectItem>
                  <SelectItem value="high-low">Amount (High to Low)</SelectItem>
                  <SelectItem value="low-high">Amount (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">
                    Buyer Details
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">
                    Expires at
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">
                    Unit Price
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Quantity</TableHead>
                  <TableHead className="text-xs sm:text-sm">Total</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-600 py-5 text-sm sm:text-base"
                    >
                      No Bids found for this listing
                    </TableCell>
                  </TableRow>
                )}
                {bids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1 sm:gap-2">
                        <div className="font-semibold text-xs sm:text-sm">
                          <span className="font-bold">Name:</span>{" "}
                          {bid.buyer.first_name} {bid.buyer.last_name}
                        </div>
                        <div className="text-xs sm:text-sm">
                          <span className="font-bold">ID:</span>{" "}
                          {bid.buyer_id.slice(0, 18)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(bid.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                      {new Date(bid.expires_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                      ${bid.unit_price}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {bid.quantity_kg} kg
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      ${bid.total_amount?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                      <Badge
                        variant={
                          bid.status === "accepted"
                            ? "default"
                            : bid.status === "rejected"
                              ? "destructive"
                              : "default"
                        }
                        className="text-xs sm:text-sm"
                      >
                        {bid.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {bid.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600 h-7 sm:h-8 bg-green-200 hover:bg-green-100 text-xs sm:text-sm"
                            onClick={() => acceptBid(bid.id)}
                            disabled={generalLoading}
                          >
                            Accept
                          </Button>
                        )}
                        {(bid.status === "pending" ||
                          bid.status === "confirmed") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 h-7 sm:h-8 bg-red-100 text-xs sm:text-sm"
                            onClick={() => rejectBid(bid.id)}
                            disabled={generalLoading}
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{bids.length}</span> of{" "}
              <span className="font-medium">{bids.length}</span> bids
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-xs sm:text-sm"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-emerald-50 text-xs sm:text-sm"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-xs sm:text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  function MessagesTab() {
    return (
      <Card>
        <div className="flex flex-col md:flex-row h-[600px] sm:h-[700px]">
          <div
            className={`${
              activeMessageThread && isMobile ? "hidden" : ""
            } w-full md:w-1/3 border-r`}
          >
            <div className="h-full p-3 sm:p-4">
              <MessageThreadList
                messageThreads={filteredThreads}
                activeMessageThread={activeMessageThread}
                setActiveMessageThread={setActiveMessageThread}
                messageFilter={messageFilter}
                setMessageFilter={setMessageFilter}
                senderId={user?.id as string}
                loading={isFetching}
              />
            </div>
          </div>
          <div
            className={`${
              !activeMessageThread && isMobile ? "hidden" : ""
            } w-full md:w-2/3`}
          >
            <div className="h-full">
              <MessageThread
                messageThreads={messageThreads}
                activeMessageThread={activeMessageThread}
                setActiveMessageThread={setActiveMessageThread}
                senderId={senderId!}
                updateThreads={setMessageThreads}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!listing && !isFetching) {
    return (
      <div className="text-center py-12 text-sm sm:text-base">
        Listing not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary/5 px-4 sm:px-6 lg:px-8 py-8">
      <Header />
      <main className="mx-auto max-w-7xl py-6 sm:py-8 pt-16 sm:pt-20">
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4 sm:mb-20 flex sm:flex-row gap-1.5 sm:gap-4">
            <TabsTrigger
              value="overview"
              className="h-10 sm:h-12 flex-grow min-w-[100px] max-w-[160px] sm:max-w-none border border-green-300 rounded-md text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-white hover:bg-white hover:text-black"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="h-10 sm:h-12 flex-grow min-w-[100px] max-w-[160px] sm:max-w-none border border-green-300 rounded-md text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-white hover:bg-white hover:text-black flex items-center justify-center gap-2"
            >
              Messages
              {totalUnreadMessages > 0 && (
                <Badge
                  variant="default"
                  className="h-4 sm:h-5 min-w-4 sm:min-w-5 px-1 rounded-full text-xs"
                >
                  {totalUnreadMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="bids"
              className="h-10 sm:h-12 flex-grow min-w-[100px] max-w-[160px] sm:max-w-none border border-green-300 rounded-md text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-white hover:bg-white hover:text-black"
            >
              Bids
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {isFetching ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  <Card>
                    <SkeletonPhotoGallery />
                    <SkeletonCardContent />
                  </Card>
                  <SkeletonBids />
                  <SkeletonMessages />
                </div>
                <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                  <SkeletonStats />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  <Card>
                    <PhotoGallery
                      listingId={id!}
                      photos={listing!.photos}
                      isOrganic={listing!.is_organic}
                      xfmrId={fmrId}
                    />
                    <ListingDetails listing={listing!} />
                  </Card>
                  <RecentBids bids={bids} />
                  <RecentMessages messageThreads={messageThreads} />
                </div>
                <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                  <ListingInfo listing={listing!} listingStats={listingStats} />
                </div>
              </div>
            )}
            <RequestEditModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              entityId={id!}
              entityType="listing"
              onSubmitSuccess={(status) =>
                setListing((prev) =>
                  prev
                    ? { ...prev, admin_edit_request_approval_status: status }
                    : null,
                )
              }
              xfmrId={fmrId}
            />
          </TabsContent>
          <TabsContent value="messages">
            <MessagesTab />
          </TabsContent>
          <TabsContent value="bids">
            {isFetching ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <Skeleton className="h-9 sm:h-10 w-full sm:w-[200px] md:w-[250px]" />
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                      <Skeleton className="h-9 sm:h-10 w-full sm:w-[160px] md:w-[180px]" />
                      <Skeleton className="h-9 sm:h-10 w-full sm:w-[160px] md:w-[180px]" />
                    </div>
                  </div>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Array(6)
                            .fill(0)
                            .map((_, index) => (
                              <TableHead key={index}>
                                <Skeleton className="h-4 w-20" />
                              </TableHead>
                            ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array(3)
                          .fill(0)
                          .map((_, index) => (
                            <TableRow key={index}>
                              {Array(6)
                                .fill(0)
                                .map((_, cellIndex) => (
                                  <TableCell key={cellIndex}>
                                    <Skeleton className="h-4 w-24" />
                                  </TableCell>
                                ))}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <Skeleton className="h-4 w-32 sm:w-40" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-7 sm:h-8 w-16 sm:w-20" />
                      <Skeleton className="h-7 sm:h-8 w-7 sm:w-8" />
                      <Skeleton className="h-7 sm:h-8 w-16 sm:w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <BidsTable bids={bids} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

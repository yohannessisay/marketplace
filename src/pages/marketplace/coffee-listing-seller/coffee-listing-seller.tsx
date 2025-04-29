import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Star,
  MessageCircle,
  DollarSign,
  BarChart2,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Skeleton Component
function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

function SkeletonPhotoGallery() {
  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="w-full h-64 rounded-lg" />
      </div>
      <div className="flex p-2 space-x-2 overflow-x-auto ml-3">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="w-20 h-20 rounded" />
          ))}
      </div>
    </div>
  );
}

function SkeletonCardContent() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex items-baseline mb-6">
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="grid grid-cols-2 gap-4">
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <div key={index}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonBids() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-200">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="py-4 flex justify-between">
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonMessages() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-200">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="py-4 flex justify-between">
                <div className="flex">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonStats() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-lg shadow-sm border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// Interfaces remain unchanged
interface Listing {
  id: string;
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
  farm: {
    farm_id: string;
    farm_name: string;
    town_location: string;
    region: string;
    country: string;
  };
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
    minimumQuantity: number;
    percentage: number;
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

function PhotoGallery({
  listingId,
  photos: initialPhotos,
  isOrganic,
}: {
  photos: Listing["photos"] | null;
  isOrganic: boolean;
  listingId: string;
}) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [photos, setPhotos] = useState(initialPhotos);
  const [isDeleting, setIsDeleting] = useState(false);
  const { successMessage, errorMessage } = useNotification();

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
      setIsDeleting(true);
      await apiService().post(`/sellers/listings/delete-listing-image`, {
        listingId,
        photoId,
      });

      setPhotos(
        (prev) => prev?.filter((photo) => photo.id !== photoId) || null
      );

      if (
        activePhotoIndex > 0 &&
        photos &&
        activePhotoIndex >= photos.length - 1
      ) {
        setActivePhotoIndex(activePhotoIndex - 1);
      }
      successMessage("Listing photo deleted successfully");
    } catch (error) {
      console.error("Failed to delete photo:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="flex flex-col gap-4 p-4">
        {photos && photos.length > 0 ? (
          <div className="relative">
            <img
              src={photos[activePhotoIndex].photo_url || "/placeholder.svg"}
              alt={`Coffee ${activePhotoIndex + 1}`}
              className="w-full h-64 object-cover rounded-lg"
            />
            {isOrganic && (
              <div className="absolute top-4 right-4">
                <Badge
                  variant="outline"
                  className="bg-green-500 text-white border-0"
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
            className="w-full h-64 object-cover rounded-lg"
          />
        )}
      </div>
      <div className="flex p-2 space-x-2 overflow-x-auto ml-3">
        {photos &&
          photos.map((photo, index) => (
            <div key={photo.id} className="relative">
              <button
                className={`flex-shrink-0 bg-card w-20 h-20 rounded border-2 ${
                  index === activePhotoIndex
                    ? "border-primary"
                    : "border-transparent"
                }`}
                onClick={() => setActivePhotoIndex(index)}
              >
                <img
                  src={photo.photo_url || "/placeholder.svg"}
                  alt=""
                  className="w-full h-full object-cover rounded"
                />
              </button>
              <button
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 cursor-pointer"
                onClick={() => handleDeletePhoto(photo.id)}
                disabled={isDeleting}
              >
                <X size={13} />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function CoffeeListingSellerView() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeMessageThread, setActiveMessageThread] = useState<string | null>(
    null
  );
  const [messageFilter, setMessageFilter] = useState("all");
  const [listing, setListing] = useState<Listing | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [messageThreads, setMessageThreads] = useState<MessageThreadType[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [generalLoading, setGeneralLoading] = useState(false);
  const { errorMessage, successMessage } = useNotification();

  const isMobile = useMobile();
  const params = useParams();
  const id = params.id as string | undefined;
  const { user } = useAuth();
  const senderId = getUserId();

  let fmrId = null;
  if (user && user.userType === "agent") {
    const farmer: any = getFromLocalStorage("farmer-profile", {});
    fmrId = farmer ? farmer.id : undefined;
  }

  const fetchData = useCallback(async () => {
    if (!id || !senderId || !isFetching) return;
  
    if (!user) {
      return;
    }
    if (user && user.userType === "agent" && fmrId===null) {
     
      
      return;
    }else{
      try {
        setIsFetching(true);
     
        const listingResponse: any = await apiService().get(
          `/sellers/listings/get-listing?listingId=${id}`,
          fmrId
        );
        setListing(listingResponse.data.listing);
  
        const bidsResponse: any = await apiService().get(
          `/sellers/listings/bids/get-bids?listingId=${id}`,
          fmrId
        );
        setBids(bidsResponse.data.bids || []);
  
        const messagesResponse: any = await apiService().get(
          id
            ? `/chats/listing-messages?listingId=${id}`
            : `/chats/listing-messages`,
          fmrId
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
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            ),
          }))
          .sort(
            (a, b) =>
              new Date(b.lastMessageTime).getTime() -
              new Date(a.lastMessageTime).getTime()
          );
  
        setMessageThreads(threadsArray);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        errorMessage(error as APIErrorResponse);
      } finally {
        setIsFetching(false);
      }
    }

  }, [id, senderId, isFetching, fmrId, errorMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const acceptBid = async (bidId: string) => {
    try {
      setGeneralLoading(true);
      await apiService().post(
        `/sellers/listings/bids/accept-bid?bidId=${bidId}`,
        fmrId ? fmrId : ""
      );
      successMessage("Bid accepted successfully, and order is placed");
      fetchData();
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
        fmrId ? fmrId : ""
      );
      successMessage("Bid rejected successfully");
      fetchData();
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
    0
  );

  const listingStats = {
    views: 150,
    inquiries: messageThreads.length,
    totalBids: bids.length,
    totalRevenue: bids.reduce((sum, bid) => sum + bid.total_amount, 0),
  };

  if (!listing && !isFetching) {
    return <div className="text-center py-12">Listing not found</div>;
  }

  return (
    <div className="min-h-screen bg-primary/5 p-8">
      <Header />
      <main className="container px-4 md:px-24 py-8 pt-20">
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 flex gap-4">
            <TabsTrigger
              value="overview"
              className="h-12 flex-1 min-w-[160px] border border-green-300 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white hover:bg-white hover:text-black"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="h-12 flex-1 min-w-[160px] border border-green-300 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white hover:bg-white hover:text-black flex items-center justify-center gap-2"
            >
              Messages
              {totalUnreadMessages > 0 && (
                <Badge
                  variant="default"
                  className="h-5 min-w-5 px-1 rounded-full"
                >
                  {totalUnreadMessages}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="bids"
              className="h-12 flex-1 min-w-[160px] border border-green-300 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white hover:bg-white hover:text-black"
            >
              Bids
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {isFetching ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-15">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <SkeletonPhotoGallery />
                    <SkeletonCardContent />
                  </Card>
                  <SkeletonBids />
                  <SkeletonMessages />
                </div>
                <div className="lg:col-span-1">
                  <SkeletonStats />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <PhotoGallery
                      listingId={id!}
                      photos={listing!.photos}
                      isOrganic={listing!.is_organic}
                    />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                          {listing!.coffee_variety}
                        </h2>
                        <div className="flex items-center bg-amber-100 px-2 py-1 rounded">
                          <Star
                            size={16}
                            className="text-amber-500 fill-current"
                          />
                          <span className="ml-1 text-sm font-medium text-amber-800">
                            {listing!.grade}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-baseline mb-6">
                        <span className="text-2xl font-bold text-emerald-600">
                          ${listing!.price_per_kg?.toFixed(2)}
                        </span>
                        <span className="ml-1 text-gray-500">/kg</span>
                      </div>
                      <div className="space-y-4 mb-6">
                        <p className="text-gray-700">
                          Premium {listing!.coffee_variety} coffee from{" "}
                          {listing!.farm.farm_name} in{" "}
                          {listing!.farm.town_location}, {listing!.farm.region},{" "}
                          {listing!.farm.country}. This coffee features{" "}
                          {listing!.cup_taste_acidity.toLowerCase()} acidity,{" "}
                          {listing!.cup_taste_body.toLowerCase()} body, and{" "}
                          {listing!.cup_taste_sweetness.toLowerCase()} sweetness
                          with a {listing!.cup_taste_aftertaste.toLowerCase()}{" "}
                          aftertaste.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Variety
                            </h4>
                            <p className="text-gray-900">
                              {listing!.coffee_variety}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Processing
                            </h4>
                            <p className="text-gray-900">
                              {listing!.processing_method}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Bean Type
                            </h4>
                            <p className="text-gray-900">
                              {listing!.bean_type}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Crop Year
                            </h4>
                            <p className="text-gray-900">
                              {listing!.crop_year}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Quantity Available
                            </h4>
                            <p className="text-gray-900">
                              {listing!.quantity_kg} kg
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Ready By
                            </h4>
                            <p className="text-gray-900">
                              {listing!.readiness_date}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Moisture
                            </h4>
                            <p className="text-gray-900">
                              {listing!.moisture_percentage}%
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Screen Size
                            </h4>
                            <p className="text-gray-900">
                              {listing!.screen_size}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Drying Method
                            </h4>
                            <p className="text-gray-900">
                              {listing!.drying_method}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Wet Mill
                            </h4>
                            <p className="text-gray-900">{listing!.wet_mill}</p>
                          </div>
                        </div>
                      </div>
                      {listing!.discounts.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <h3 className="text-md font-medium text-gray-900 mb-2">
                              Volume Discounts
                            </h3>
                            <div className="space-y-2">
                              {listing!.discounts.map((discount, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center p-2 bg-emerald-50 rounded-md"
                                >
                                  <span className="text-sm text-gray-700">
                                    Order {discount.minimumQuantity}+ kg
                                  </span>
                                  <span className="text-sm font-medium text-emerald-700">
                                    {discount.percentage}% off
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">Recent Bids</CardTitle>
                      <Button
                        variant="link"
                        className="text-emerald-600 p-0 h-auto"
                        onClick={() => setActiveTab("bids")}
                      >
                        View All
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {bids.length === 0 && (
                        <div className="text-center text-gray-600">
                          No Bids found for this listing
                        </div>
                      )}
                      <div className="divide-y divide-gray-200">
                        {bids.slice(0, 3).map((bid) => (
                          <div key={bid.id} className="py-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <h4 className="text-sm font-medium text-gray-900">
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
                                    className="ml-5"
                                  >
                                    {bid.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {new Date(
                                    bid.created_at
                                  ).toLocaleDateString()}{" "}
                                  • {bid.quantity_kg} kg Okta
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  ${bid.total_amount?.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">Recent Messages</CardTitle>
                      <Button
                        variant="link"
                        className="text-emerald-600 p-0 h-auto"
                        onClick={() => setActiveTab("messages")}
                      >
                        View All
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {messageThreads.length === 0 && (
                        <div className="text-center text-gray-600">
                          No message threads found for this listing
                        </div>
                      )}
                      <div className="divide-y divide-gray-200">
                        {messageThreads.slice(0, 3).map((thread) => (
                          <div key={thread.id} className="py-4">
                            <div className="flex justify-between items-start">
                              <div className="flex">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-gray-200 text-gray-600">
                                    {thread.buyerName?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="ml-3">
                                  <div className="flex items-center">
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {thread.buyerName || "Unknown User"}
                                    </h4>
                                    {thread.unread > 0 && (
                                      <Badge variant="default" className="ml-2">
                                        {thread.unread} new
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {thread.buyerCompany}
                                  </p>
                                  <p className="mt-1 text-sm text-gray-600 truncate max-w-[300px]">
                                    {
                                      thread.messages[
                                        thread.messages.length - 1
                                      ]?.message
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    thread.lastMessageTime
                                  ).toLocaleTimeString()}
                                </p>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-emerald-600 mt-1"
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
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Listing Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Status
                        </h4>
                        <div className="mt-1 flex items-center">
                          <Badge
                            variant={
                              listing!.listing_status === "pending"
                                ? "outline"
                                : "default"
                            }
                          >
                            {listing!.listing_status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Created On
                        </h4>
                        <p className="text-gray-900">
                          {new Date(listing!.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Ready By
                        </h4>
                        <p className="text-gray-900">
                          {listing!.readiness_date}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Quantity Available
                        </h4>
                        <p className="text-gray-900">
                          {listing!.quantity_kg} kg
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Farm
                        </h4>
                        <p className="text-gray-900">
                          {listing!.farm.farm_name}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Views
                        </h4>
                        <p className="text-gray-900">{listingStats.views}</p>
                      </div>
                      <Link to={`/edit-crop/${listing!.id}`}>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 hover:text-white">
                          Edit Listing
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                  {/* <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-white rounded-lg shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BarChart2 size={18} className="text-emerald-600" />
                          <div>
                            <p className="text-sm text-gray-500">Total Views</p>
                            <p className="text-lg font-medium text-gray-900">
                              {listingStats.views}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-emerald-600">+12%</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageCircle
                            size={18}
                            className="text-emerald-600"
                          />
                          <div>
                            <p className="text-sm text-gray-500">Inquiries</p>
                            <p className="text-lg font-medium text-gray-900">
                              {listingStats.inquiries}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-emerald-600">+8%</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DollarSign size={18} className="text-emerald-600" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Total Revenue
                            </p>
                            <p className="text-lg font-medium text-gray-900">
                              ${listingStats.totalRevenue?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-red-600">-5%</p>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="messages">
            <Card>
              <div className="flex h-[700px]">
                <div
                  className={`${
                    activeMessageThread && isMobile ? "hidden" : ""
                  } w-full md:w-1/3 border-r`}
                >
                  <div className="h-full p-4">
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
                  } md:w-2/3 w-full`}
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
          </TabsContent>
          <TabsContent value="bids">
            {isFetching ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <Skeleton className="h-10 w-full md:w-[250px]" />
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                      <Skeleton className="h-10 w-full md:w-[180px]" />
                      <Skeleton className="h-10 w-full md:w-[180px]" />
                    </div>
                  </div>
                  <div className="rounded-md border">
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
                  <div className="mt-4 flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Bids</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="relative w-full md:w-auto">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search bids..."
                        className="pl-8 w-full md:w-[250px]"
                      />
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-full md:w-[180px]">
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
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Sort by Latest" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="latest">Sort by Latest</SelectItem>
                          <SelectItem value="oldest">Sort by Oldest</SelectItem>
                          <SelectItem value="high-low">
                            Amount (High to Low)
                          </SelectItem>
                          <SelectItem value="low-high">
                            Amount (Low to High)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Buyer Details</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Expires at</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bids.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center text-gray-600 py-5"
                            >
                              No Bids found for this listing
                            </TableCell>
                          </TableRow>
                        )}
                        {bids.map((bid) => (
                          <TableRow key={bid.id}>
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                <div className="font-semibold">
                                  <span className="font-bold">Name:</span>{" "}
                                  {bid.buyer.first_name} {bid.buyer.last_name}
                                </div>
                                <div>
                                  <span className="font-bold">ID:</span>{" "}
                                  {bid.buyer_id.slice(0, 18)}.....
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(bid.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(bid.expires_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>${bid.unit_price}</TableCell>
                            <TableCell>{bid.quantity_kg} kg</TableCell>
                            <TableCell>
                              ${bid.total_amount?.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  bid.status === "accepted"
                                    ? "default"
                                    : bid.status === "rejected"
                                    ? "destructive"
                                    : "default"
                                }
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
                                    className="text-emerald-600 h-8 bg-green-200 hover:bg-green-100"
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
                                    className="text-red-600 h-8 bg-red-100"
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
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to{" "}
                      <span className="font-medium">{bids.length}</span> of{" "}
                      <span className="font-medium">{bids.length}</span> bids
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-emerald-50"
                      >
                        1
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Star, MapPin, Coffee, MessageCircle, Send } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { chatService } from "@/services/chatService";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/hooks/useAuth";
import { APIErrorResponse, SocketChatMessage } from "@/types/api";
import { getUserId } from "@/lib/utils";
import { SignUpPromptModal } from "@/components/modals/SignUpPromptModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Header from "@/components/layout/header";

interface Seller {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  telegram: string | null;
  avatar_url_csv: string | null;
  rating: number;
  total_reviews: number;
}

interface Farm {
  id: string;
  farm_name: string;
  region: string | null;
  country: string;
  altitude_meters: number;
}

interface CoffeeListing {
  id: string;
  coffee_variety: string;
  bean_type: string;
  price_per_kg: number;
  quantity_kg: number;
  is_organic: boolean;
  grade: string;
  coffee_photo: Array<{ photo_url: string; is_primary: boolean }>;
  listing_status: string;
}

interface Review {
  id: string;
  order_id: string;
  reviewer_buyer_id: string | null;
  reviewed_seller_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    id: string;
    name: string;
    email: string;
    company_name: string | null;
    country: string | null;
    rating: number;
    total_reviews: number;
    deals_completed: number;
    avatar_url_csv: string | null;
  } | null;
  order: {
    id: string;
    listing_id: string;
    listing: {
      id: string;
      coffee_variety: string;
      farm: {
        farm_name: string;
        country: string;
      } | null;
    } | null;
  } | null;
}

export default function SellerProfilePage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [listings, setListings] = useState<CoffeeListing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("farms");
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      sender: string;
      message: string;
      timestamp: string;
    }>
  >([]);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const { user } = useAuth();
  const { errorMessage } = useNotification();
  const hasFetchedData = useRef(false);
  const hasFetchedMessages = useRef(false);

  const fetchSellerData = useCallback(async () => {
    if (!sellerId || hasFetchedData.current) return;
    hasFetchedData.current = true;
    setLoading(true);
    setError(null);

    try {
      const [sellerResponse, farmsResponse, listingsResponse, reviewsResponse]: any =
        await Promise.all([
          apiService().getWithoutAuth(
            `/sellers/profile/get-profile-details?sellerId=${sellerId}`,
          ),
          apiService().getWithoutAuth(
            `/sellers/profile/get-farms?sellerId=${sellerId}`,
          ),
          apiService().getWithoutAuth(
            `/sellers/profile/get-listings?sellerId=${sellerId}`,
          ),
          apiService().getWithoutAuth(
            `/sellers/profile/get-reviews?sellerId=${sellerId}&page=1&limit=10`,
          ),
        ]);

      if (sellerResponse.success && sellerResponse.data.seller) {
        setSeller(sellerResponse.data.seller);
      } else {
        throw new Error("Failed to fetch seller details");
      }

      if (farmsResponse.success && farmsResponse.data.farms) {
        setFarms(farmsResponse.data.farms);
      } else {
        setFarms([]);
      }

      if (listingsResponse.success && listingsResponse.data.listings) {
        setListings(listingsResponse.data.listings);
      } else {
        setListings([]);
      }

      if (reviewsResponse.success && reviewsResponse.data.reviews) {
        setReviews(reviewsResponse.data.reviews);
      } else {
        setReviews([]);
      }
    } catch (err: unknown) {
      const errorResponse = err as APIErrorResponse;
      setError(errorResponse.error?.message || "An error occurred");
      errorMessage(errorResponse);
    } finally {
      setLoading(false);
    }
  }, [sellerId, errorMessage]);

  const handleFetchMessages = useCallback(async () => {
    if (!user || !sellerId || hasFetchedMessages.current) return;

    try {
      hasFetchedMessages.current = true;
      const senderId = user?.id;
      if (!senderId) throw new Error("No authenticated user found");

      const response = await apiService().get<{
        data: { messages: Array<any> };
      }>(`/chats/messages?senderId=${senderId}&receiverId=${sellerId}`);

      const messages = response.data.messages.map((msg: any) => ({
        id: msg.id,
        sender: msg.senderId === senderId ? "buyer" : "seller",
        message: msg.message,
        timestamp: new Date(msg.createdAt).toLocaleDateString(),
      }));

      setChatMessages(messages.reverse());
    } catch (error: unknown) {
      console.error("[SellerProfilePage] Fetch messages error:", error);
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);
    }
  }, [user, sellerId, errorMessage]);

  useEffect(() => {
    fetchSellerData();
  }, [fetchSellerData]);

  useEffect(() => {
    if (!user || !sellerId) return;

    handleFetchMessages();

    if (!chatService().isConnected()) {
      chatService().connect();
    }

    const unsubscribe = chatService().onMessage(
      (message: SocketChatMessage) => {
        setChatMessages((prev) => {
          if (prev.some((msg) => msg.id === message.id)) {
            return prev;
          }
          return [
            ...prev,
            {
              id: message.id,
              sender: message.senderId === user?.id ? "buyer" : "seller",
              message: message.message,
              timestamp: new Date(message.created_at).toLocaleDateString(),
            },
          ];
        });
      },
    );

    return () => {
      unsubscribe();
    };
  }, [user, sellerId, handleFetchMessages]);

  const handleSendMessage = async () => {
    if (!user) {
      setIsSignUpModalOpen(true);
      return;
    }

    if (!chatMessage.trim() || !sellerId) return;

    try {
      const senderId = getUserId();
      if (!senderId) throw new Error("No authenticated user found");

      const tempId = Math.random().toString(36).substring(2);
      const timestamp = new Date().toLocaleDateString();

      setChatMessages((prev) => [
        ...prev,
        {
          id: tempId,
          sender: "buyer",
          message: chatMessage,
          timestamp,
        },
      ]);

      await chatService().sendMessage({
        recipientId: sellerId,
        message: chatMessage,
        listingId: null,
      });

      setChatMessage("");
    } catch (error: unknown) {
      console.error("[SellerProfilePage] Send message error:", error);
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      chatMessage.trim() &&
      user?.onboarding_stage === "completed"
    ) {
      handleSendMessage();
    }
  };

  const SkeletonLoader = () => (
    <div className="bg-primary/5 px-4 sm:px-6 lg:px-8 py-8 min-h-screen animate-pulse">
      <div className="max-w-7xl mx-auto bg-white rounded-md">
        <div className="h-12 bg-gray-200 rounded w-3/4 mb-8"></div>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <SkeletonLoader />;
  if (error || !seller)
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center text-red-500">
        {error || "No seller found."}
      </div>
    );

  return (
    <div className="bg-primary/5 px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto bg-white rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center mb-4">
                  <img
                    src={seller.avatar_url_csv || "/placeholder.svg"}
                    alt={`${seller.first_name} ${seller.last_name}`}
                    className="w-16 h-16 rounded-full object-cover mb-4 sm:mb-0 sm:mr-4"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold">{`${seller.first_name} ${seller.last_name}`}</h2>
                    <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                      {seller.rating} ({seller.total_reviews} reviews)
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-2 text-center sm:text-left">
                  <p>
                    <b>Email:</b> {seller.email}
                  </p>
                  {seller.telegram && (
                    <p>
                      <b>Telegram:</b> {seller.telegram}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="farms">Farms</TabsTrigger>
                <TabsTrigger value="listings">Coffee Listings</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="farms" className="border rounded-md mt-2">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    {farms.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No farms listed for this seller.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {farms.map((farm) => (
                          <Card key={farm.id} className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start">
                              <div className="mb-4 sm:mb-0">
                                <h3 className="font-bold text-lg">
                                  {farm.farm_name}
                                </h3>
                                <div className="text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 inline mr-1" />
                                  {farm.region ? `${farm.region}, ` : ""}
                                  {farm.country}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <b>Altitude:</b> {farm.altitude_meters} meters
                                </div>
                              </div>
                              <Link to={`/farms/${farm.id}`}>
                                <Button variant="outline">View Details</Button>
                              </Link>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="listings" className="border rounded-md mt-2">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    {listings.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No active listings available.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {listings
                          .filter(
                            (listing) => listing.listing_status === "active",
                          )
                          .map((listing) => {
                            const primaryPhoto =
                              listing.coffee_photo?.find((p) => p.is_primary)
                                ?.photo_url ||
                              listing.coffee_photo?.[0]?.photo_url ||
                              "/placeholder.svg";
                            return (
                              <Card key={listing.id} className="p-4">
                                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                                  <img
                                    src={primaryPhoto}
                                    alt={listing.coffee_variety}
                                    className="w-24 h-24 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row justify-between items-start">
                                      <div className="mb-4 sm:mb-0">
                                        <h3 className="font-bold text-lg">
                                          {listing.coffee_variety}
                                        </h3>
                                        <div className="text-sm text-muted-foreground">
                                          <Coffee className="h-4 w-4 inline mr-1" />
                                          {listing.bean_type}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          <b>Available:</b>{" "}
                                          {listing.quantity_kg.toLocaleString()}{" "}
                                          kg
                                        </div>
                                      </div>
                                      <div className="text-center sm:text-right">
                                        <div className="font-bold text-lg text-primary">
                                          ${listing.price_per_kg.toFixed(2)}/kg
                                        </div>
                                        {listing.is_organic && (
                                          <Badge className="mt-1 bg-green-500 text-white border-0">
                                            Organic
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <Link to={`/listing/${listing.id}`}>
                                      <Button
                                        variant="outline"
                                        className="mt-2 w-full sm:w-auto"
                                      >
                                        View Listing
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="border rounded-md mt-2">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    {reviews.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No reviews available for this seller.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <Card key={review.id} className="p-4">
                            <div className="flex flex-col space-y-2">
                              <div className="flex flex-col sm:flex-row items-center justify-between">
                                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-2 sm:mb-0">
                                  <img
                                    src={
                                      review.reviewer?.avatar_url_csv ||
                                      "/placeholder.svg"
                                    }
                                    alt={review.reviewer?.name || "Reviewer"}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                  <div className="text-center sm:text-left">
                                    <span className="font-semibold text-slate-800">
                                      {review.reviewer?.name || "Anonymous"}
                                    </span>
                                    <div className="flex justify-center sm:justify-start mt-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i < review.rating
                                              ? "text-yellow-500 fill-current"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-sm text-slate-600">
                                  {new Date(
                                    review.created_at,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {review.comment || "No comment provided."}
                              </p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {user?.userType === "seller" || user?.userType === "agent" ? null : (
            <div className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <MessageCircle size={20} className="mr-2 text-primary" />
                    Chat with Seller
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="h-60 overflow-y-auto mb-4 flex flex-col-reverse">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground h-full flex items-center justify-center">
                        {user
                          ? "No messages yet. Start a conversation with the seller."
                          : "Sign in to message the seller."}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender === "buyer"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] sm:max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                                message.sender === "buyer"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.sender === "buyer"
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {!user ? (
                    <div className="space-y-3">
                      <Input
                        placeholder="Sign in to send a message"
                        disabled
                        className="cursor-not-allowed"
                      />
                      <Button
                        className="w-full"
                        onClick={() => setIsSignUpModalOpen(true)}
                      >
                        Sign In to Chat
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={chatMessage === ""}
                        className="w-full sm:w-auto"
                      >
                        <Send size={16} />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <SignUpPromptModal
        open={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        message="To message the seller, you need to sign up or log in to your AfroValley account."
      />
    </div>
  );
}

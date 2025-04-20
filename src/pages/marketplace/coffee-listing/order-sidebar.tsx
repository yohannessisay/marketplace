"use client";

import { Star, Award, Download, MapPin, Coffee, Droplet } from "lucide-react";
import { OrderStatus } from "@/types/order";
import { CoffeeListing } from "@/types/coffee";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { ActionTooltip } from "@/components/common/action-tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useBuyerOrderData } from "@/hooks/useListingBid";
import { useEffect, useCallback, useState } from "react";
import { BidModal } from "./Bid-modal";
import { apiService } from "@/services/apiService";
import { Link } from "react-router-dom";

interface OrderSidebarProps {
  listing: CoffeeListing | null;
  demoOrderStatus?: OrderStatus;
  setShowOrderModal?: (show: boolean) => void;
  setShowReviewModal?: (show: boolean) => void;
  onRequireAuth: () => void;
}

export function OrderSidebar({
  listing,
  demoOrderStatus,
  onRequireAuth,
}: OrderSidebarProps) {
  const orderStatus = useOrderStatus(demoOrderStatus);
  const { user } = useAuth();
  const { hasBid, loading, checkBid } = useBuyerOrderData();
  const [showBidModal, setShowBidModal] = useState(false);
  const [quantity, setQuantity] = useState<number>();
  const [bidPrice, setBidPrice] = useState(0);

  useEffect(() => {
    if (listing?.id && user) {
      checkBid(listing.id);
    }
  }, [listing?.id, checkBid, user]);

  const handleBidSubmitted = useCallback(() => {
    if (listing?.id) {
      checkBid(listing.id);
    }
  }, [listing?.id, checkBid]);

  const handleModalClose = useCallback(() => {
    setShowBidModal(false);
    if (listing?.id) {
      checkBid(listing.id);
    }
  }, [listing?.id, checkBid]);

  const handleSubmitBid = async () => {
    if (!listing?.id) return;
    try {
      await apiService().post("/buyers/bids/place-bid", {
        listingId: listing.id,
        quantity_kg: quantity,
        unit_price: bidPrice,
      });
    } catch (error) {
      console.error("[OrderSidebar] Error submitting bid:", error);
      throw error;
    }
  };

  const openBidModal = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setShowBidModal(true);
    setQuantity(listing?.quantity_kg as number);
    setBidPrice(listing?.price_per_kg || 0);
  };

  const primaryPhoto =
    listing?.coffee_photo?.find((p: any) => p.is_primary)?.photo_url ||
    listing?.coffee_photo?.[0]?.photo_url ||
    "/placeholder.svg";

  return (
    <div className="space-y-6">
      <Card className="top-6">
        <CardContent className="p-6">
          <div className="mb-4">
            <img
              src={primaryPhoto}
              alt={listing?.coffee_variety}
              className="w-full h-40 object-cover rounded-lg"
            />
          </div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-xl font-bold">{listing?.coffee_variety}</h2>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Coffee className="h-4 w-4 mr-1" />
                {listing?.bean_type}
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-yellow-100 text-yellow-800 border-0"
            >
              <Star size={16} className="mr-1 text-yellow-500 fill-current" />
              {listing?.grade}
            </Badge>
          </div>
          <div className="flex items-baseline mb-4">
            <span className="text-2xl font-bold text-primary">
              ${listing?.price_per_kg}
            </span>
            <span className="ml-1 text-muted-foreground">/kg</span>
            {listing?.is_organic && (
              <Badge className="ml-2 bg-green-500 text-white border-0">
                Organic
              </Badge>
            )}
          </div>
          <div className="mb-2 flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {listing?.farm?.farm_name} — {listing?.farm?.region},{" "}
            {listing?.farm?.country}
          </div>
          <div className="mb-2 flex items-center text-sm text-muted-foreground">
            <Droplet className="h-4 w-4 mr-1" />
            {listing?.processing_method}
          </div>
          <div className="mb-2 text-sm text-muted-foreground">
            <span className="mr-2">
              <b>Crop Year:</b> {listing?.crop_year}
            </span>
            <span className="mr-2">
              <b>Moisture:</b> {listing?.moisture_percentage}%
            </span>
            <span>
              <b>Screen Size:</b> {listing?.screen_size}
            </span>
          </div>
          <div className="mb-2 text-sm text-muted-foreground">
            <b>Available:</b> {listing?.quantity_kg} kg
          </div>
          <div className="mb-2 text-sm text-muted-foreground">
            <b>Delivery:</b> {listing?.delivery_type}
          </div>
          {(!user || user?.userType !== "seller") &&
            listing?.listing_status === "active" && (
              <div className="flex flex-col gap-3 pt-4">
                <ActionTooltip
                  onClick={openBidModal}
                  className="w-full"
                  disabled={
                    user
                      ? user.onboarding_stage !== "completed" ||
                        hasBid === true ||
                        loading
                      : false
                  }
                  disabledMessage={
                    user
                      ? hasBid
                        ? "You have already placed a bid on this order, wait for the seller's response"
                        : loading
                          ? "Checking bid status..."
                          : "Complete your onboarding to place a bid"
                      : "Sign up to place a bid"
                  }
                >
                  {loading
                    ? "Checking bid status..."
                    : hasBid
                      ? "Bid Placed"
                      : "Place Bid"}
                </ActionTooltip>
              </div>
            )}
        </CardContent>
      </Card>

      {!orderStatus &&
        listing?.listing_discount &&
        listing?.listing_discount.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-md font-medium mb-3">Volume Discounts</h3>
              <div className="space-y-2">
                {listing?.listing_discount.map((discount: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-primary/5 rounded-md"
                  >
                    <span className="text-sm">
                      Order {discount.minimum_quantity_kg}+ kg
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {discount.discount_percentage}% off
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Volume discounts are automatically applied at checkout.
              </div>
            </CardContent>
          </Card>
        )}
      {(!user || user?.userType !== "seller") && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">About the Seller</h3>
            <div className="flex items-center mb-2">
              <img
                src={listing?.seller?.avatar_url_csv || "/placeholder.svg"}
                alt="Seller Avatar"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <div className="font-semibold">
                  {listing?.seller?.first_name} {listing?.seller?.last_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {listing?.seller?.email}
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-2 pt-2">
              <b className="font-bold mr-1">Rating:</b>{" "}
              {listing?.seller?.rating ?? 0}
              <span className="ml-1 mr-1">⭐</span>(
              {listing?.seller?.total_reviews ?? 0} review
              {listing?.seller?.total_reviews !== 1 ? "s" : ""})
            </div>
            <Link to={`/sellers/${listing?.seller?.id}`}>
              <Button variant="outline" className="w-full mt-2">
                View Seller Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {user?.userType === "seller" && listing?.seller.id === user?.id && (
        <Card>
          <CardContent className="p-6">
            <Link to={`/manage-listing/${listing.id}`}>
              <Button variant="outline" className="w-full mt-2">
                Manage Listing
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {orderStatus &&
        (orderStatus.status === "completed" ||
          orderStatus.status === "delivered") && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <Award size={20} className="text-primary mr-2" />
                <h3 className="text-md font-medium">Purchase Certificate</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Download your certificate of purchase for this premium coffee
                lot.
              </p>
              <Button variant="outline" className="w-full">
                <Download size={16} className="mr-2" />
                Download Certificate
              </Button>
            </CardContent>
          </Card>
        )}

      {showBidModal && (
        <BidModal
          listing={listing}
          quantity={listing?.quantity_kg as number}
          setQuantity={setQuantity}
          bidPrice={bidPrice}
          setBidPrice={setBidPrice}
          onClose={handleModalClose}
          onSubmit={handleSubmitBid}
          onBidSubmitted={handleBidSubmitted}
        />
      )}
    </div>
  );
}

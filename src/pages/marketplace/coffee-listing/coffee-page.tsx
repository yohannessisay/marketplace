"use client";

import { useEffect, useState } from "react";
import { OrderStatus } from "@/types/order";
import { Header } from "./header";
import { CoffeeDetails } from "./coffee-details";
import { OrderSidebar } from "./order-sidebar";
import { ReviewModal } from "./review-modal";
import { OrderModal } from "./order-modal";
import { useParams } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { CoffeeListing } from "@/types/coffee";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import { BidModal } from "./Bid-modal";
 

export default function CoffeeListingPage() {
  const { id } = useParams();
  const [demoOrderStatus, setDemoOrderStatus] = useState<OrderStatus>("none");
  const [listing, setListing] = useState<CoffeeListing | null>(null);
  const { successMessage, errorMessage } = useNotification();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [quantity, setQuantity] = useState(100);
  const [bidPrice, setBidPrice] = useState(0);

  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        const response: any = await apiService().get(
          `/marketplace/listings/get-listing?listingId=${id}`,
        );

        if (
          response.success &&
          response.data.listings &&
          response.data.listings.length > 0
        ) {
          setListing(response.data.listings[0]);
          setBidPrice(response.data.listings[0].price_per_kg || 0);
        } else {
          errorMessage({ message: "Failed to fetch listing details" });
        }
      } catch {
        errorMessage({
          message: "An error occurred while fetching the listing",
        });
      }
    };

    if (id) {
      fetchListingDetails();
    }
  }, [id]);

  const handleOrderSubmit = async () => {
    try {
      await apiService().post("/orders/place-order", {
        listingId: listing?.id,
        unit_price: listing?.price_per_kg,
        quantity_kg: quantity,
      });

      successMessage("Order placed successfully");
      setDemoOrderStatus("pending");
    } catch (err: any) {
      setShowOrderModal(false);
      errorMessage(err as APIErrorResponse);
    }
  };

  const handlePlaceBid = async (price_per_kg: number, quantity_kg: number) => {
    try {
      await apiService().post("/buyers/bids/place-bid", {
        listingId: listing?.id,
        unit_price: price_per_kg,
        quantity_kg: quantity_kg,
      });

      successMessage("Bid placed successfully");
      setDemoOrderStatus("pending");
      setShowBidModal(false);
    } catch (err: any) {
      setShowBidModal(false);
      errorMessage(err as APIErrorResponse);
    }
  };

  const handleSubmitReview = () => {
    console.log("Submitting review");
    setDemoOrderStatus("completed");
    setShowReviewModal(false);
  };

  return (
    <div className="bg-primary/5 p-8 min-h-screen">
      <Header
        demoOrderStatus={demoOrderStatus}
        setDemoOrderStatus={setDemoOrderStatus}
        sellerName={listing?.seller.first_name ?? ""}
        sellerRating={listing?.seller.rating ?? 0}
        sellerReviews={listing?.seller.total_reviews ?? 0}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white my-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CoffeeDetails
              listing={listing}
              demoOrderStatus={demoOrderStatus}
            />
          </div>

          <div className="lg:col-span-1">
            <OrderSidebar
              listing={listing}
              demoOrderStatus={demoOrderStatus}
              setShowOrderModal={setShowOrderModal}
              setShowReviewModal={setShowReviewModal}
              setShowBidModal={setShowBidModal}
            />
          </div>
        </div>
      </main>

      {showOrderModal && (
        <OrderModal
          listing={listing}
          quantity={quantity}
          setQuantity={setQuantity}
          onClose={() => setShowOrderModal(false)}
          onSubmit={handleOrderSubmit}
        />
      )}

      {showBidModal && (
        <BidModal
          listing={listing}
          quantity={quantity}
          setQuantity={setQuantity}
          bidPrice={bidPrice}
          setBidPrice={setBidPrice}
          onClose={() => setShowBidModal(false)}
          onSubmit={() => handlePlaceBid(bidPrice, quantity)}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
}

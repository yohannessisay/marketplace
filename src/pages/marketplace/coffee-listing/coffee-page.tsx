"use client";

import { useEffect, useState, useCallback } from "react";
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

export default function CoffeeListingPage() {
  const { id } = useParams<{ id: string }>();
  const [demoOrderStatus, setDemoOrderStatus] = useState<OrderStatus>("none");
  const [listing, setListing] = useState<CoffeeListing | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { successMessage, errorMessage } = useNotification();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [quantity, setQuantity] = useState(100);

  const fetchListingDetails = useCallback(
    async (listingId: string) => {
      if (!listingId) return;
      setLoading(true);
      try {
        const response: any = await apiService().get(
          `/marketplace/listings/get-listing?listingId=${listingId}`,
        );

        if (
          response.success &&
          response.data.listings &&
          response.data.listings.length > 0
        ) {
          setListing(response.data.listings[0]);
        } else {
          setListing(null);
          errorMessage({ message: "Failed to fetch listing details" });
        }
      } catch (error: any) {
        setListing(null);
        errorMessage(error as APIErrorResponse);
      } finally {
        setLoading(false);
      }
    },
    [errorMessage],
  );

  useEffect(() => {
    if (id) {
      fetchListingDetails(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleOrderSubmit = useCallback(async () => {
    if (!listing) return;
    try {
      await apiService().post("/orders/place-order", {
        listingId: listing.id,
        unit_price: listing.price_per_kg,
        quantity_kg: quantity,
      });

      successMessage("Order placed successfully");
      setDemoOrderStatus("pending");
      setShowOrderModal(false);
    } catch (err: any) {
      setShowOrderModal(false);
      errorMessage(err as APIErrorResponse);
    }
  }, [listing, quantity, successMessage, errorMessage]);

  const SkeletonLoader = () => (
    <div className="bg-primary/5 p-8 min-h-screen animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white my-12">
        <div className="h-12 bg-gray-200 rounded w-3/4 mb-8"></div>{" "}
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-64 bg-gray-200 rounded mb-4"></div> {/* Image */}
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>{" "}
            {/* Title */}
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>{" "}
            {/* Text */}
            <div className="h-4 bg-gray-200 rounded w-3/4"></div> {/* Text */}
          </div>
          <div className="lg:col-span-1">
            <div className="h-96 bg-gray-200 rounded"></div> {/* Sidebar */}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <SkeletonLoader />;
  if (!listing && !loading) return <div>No listing found.</div>;

  return (
    <div className="bg-primary/5 p-8 min-h-screen">
      {listing && (
        <>
          <Header
            demoOrderStatus={demoOrderStatus}
            setDemoOrderStatus={setDemoOrderStatus}
            sellerName={listing.seller.first_name ?? ""}
            sellerRating={listing.seller.rating ?? 0}
            sellerReviews={listing.seller.total_reviews ?? 0}
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

          {showReviewModal && (
            <ReviewModal
              onClose={() => setShowReviewModal(false)}
              orderId=""
              sellerId={listing.seller_id}
            />
          )}
        </>
      )}
    </div>
  );
}

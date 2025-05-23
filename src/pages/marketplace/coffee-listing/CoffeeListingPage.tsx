"use client";

import { useEffect, useState, useCallback } from "react";
import { OrderStatus } from "@/types/order";
import { Header } from "./header";
import { CoffeeDetails } from "./coffee-details";
import { OrderSidebar } from "./order-sidebar";
import { ReviewModal } from "./review-modal";
import { OrderModal } from "./order-modal";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { CoffeeListing } from "@/types/coffee";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import { SignUpPromptModal } from "@/components/modals/SignUpPromptModal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function CoffeeListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [demoOrderStatus, setDemoOrderStatus] = useState<OrderStatus>("none");
  const [listing, setListing] = useState<CoffeeListing | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [showNotFound, setShowNotFound] = useState<boolean>(false);
  const [fetched, setFetched] = useState<boolean>(false);
  const { successMessage, errorMessage } = useNotification();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(100);

  const fetchListingDetails = useCallback(
    async (listingId: string, isRetry: boolean = false) => {
      if (!listingId || loading) return;
      console.log(
        `[CoffeeListingPage] Fetching listing ${listingId}, isRetry: ${isRetry}`,
      );
      setLoading(true);
      try {
        const response: any = await apiService().getWithoutAuth(
          `/marketplace/listings/get-listing?listingId=${listingId}`,
        );

        if (
          response.success &&
          response.data.listings &&
          response.data.listings.length > 0
        ) {
          setListing(response.data.listings[0]);
          setShowNotFound(false);
          setFetched(true);
          console.log(
            `[CoffeeListingPage] Successfully fetched listing ${listingId}`,
          );
        } else {
          throw new Error("Failed to fetch listing details");
        }
      } catch (error: any) {
        console.error(
          `[CoffeeListingPage] Error fetching listing ${listingId}:`,
          error,
        );
        setListing(null);
        if (!isRetry && retryCount < 1) {
          console.log(`[CoffeeListingPage] Retrying listing ${listingId}`);
          setRetryCount(1);
          setTimeout(() => fetchListingDetails(listingId, true), 1000);
        } else {
          setShowNotFound(true);
          setFetched(true);
          errorMessage(error as APIErrorResponse);
          console.log(
            `[CoffeeListingPage] Showing NotFoundUI for listing ${listingId}`,
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [loading, retryCount, errorMessage],
  );

  useEffect(() => {
    if (id && !fetched) {
      fetchListingDetails(id);
    } else if (!id) {
      setShowNotFound(true);
      setFetched(true);
      console.log("[CoffeeListingPage] No listingId, showing NotFoundUI");
    }
  }, [id, fetchListingDetails, fetched]);

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

  const onRequireAuth = () => {
    setIsSignUpModalOpen(true);
  };

  const SkeletonLoader = () => (
    <div className="bg-primary/5 p-4 sm:p-6 lg:p-8 min-h-screen animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white my-8 sm:my-12 rounded-lg">
        <div className="h-12 bg-gray-200 rounded w-3/4 mb-6 sm:mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <div className="h-64 sm:h-80 md:h-96 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="lg:col-span-1 min-h-[600px]">
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const NotFoundUI = () => (
    <div
      className="bg-primary/5 p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
        <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Listing Not Found
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          The coffee listing you’re looking for doesn’t exist or is no longer
          available.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Button
            onClick={() => navigate("/marketplace")}
            className="w-full sm:w-auto"
          >
            Back to Marketplace
          </Button>
          <Button
            onClick={() => {
              if (id && retryCount < 1) {
                setRetryCount(1);
                setFetched(false);
                fetchListingDetails(id, true);
              }
            }}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
            disabled={retryCount >= 1}
          >
            Retry
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading) return <SkeletonLoader />;
  if (showNotFound || (!listing && fetched)) return <NotFoundUI />;

  return (
    <div className="bg-primary/5 p-4 sm:p-6 lg:p-8 min-h-screen">
      {listing && (
        <>
          <Header
            demoOrderStatus={demoOrderStatus}
            setDemoOrderStatus={setDemoOrderStatus}
            sellerName={listing.seller.first_name ?? ""}
            sellerRating={listing.seller.rating ?? 0}
            sellerReviews={listing.seller.total_reviews ?? 0}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white my-8 sm:my-12 rounded-lg relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2">
                <CoffeeDetails
                  listing={listing}
                  demoOrderStatus={demoOrderStatus}
                  onRequireAuth={onRequireAuth}
                />
              </div>

              <div className="lg:col-span-1 min-h-[600px]">
                <OrderSidebar
                  listing={listing}
                  demoOrderStatus={demoOrderStatus}
                  setShowOrderModal={setShowOrderModal}
                  setShowReviewModal={setShowReviewModal}
                  onRequireAuth={onRequireAuth}
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

          <SignUpPromptModal
            open={isSignUpModalOpen}
            onClose={() => setIsSignUpModalOpen(false)}
            message="To place a bid you have to sign up or login to your AfroValley account"
          />
        </>
      )}
    </div>
  );
}

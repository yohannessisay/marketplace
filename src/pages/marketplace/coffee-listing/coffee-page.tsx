"use client";

import { useState } from "react";
import { OrderStatus } from "@/types/order";
import { Header } from "./header";
import { CoffeeDetails } from "./coffee-details";
import { OrderSidebar } from "./order-sidebar";
import { ReviewModal } from "./review-modal";
import { useCoffeeListing } from "@/hooks/useCoffeeListing";
import { OrderModal } from "./order-modal";

export default function CoffeeListingPage() {
  const { listing } = useCoffeeListing();
  const [demoOrderStatus, setDemoOrderStatus] = useState<OrderStatus>("none");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [quantity, setQuantity] = useState(100);

  const handleOrderSubmit = () => {
    console.log("Placing order for", quantity, "kg");
    setShowOrderModal(false);
    setDemoOrderStatus("pending");
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
        sellerName={listing.sellerName}
        sellerRating={listing.sellerRating}
        sellerReviews={listing.sellerReviews}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
}

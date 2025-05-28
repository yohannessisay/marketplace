"use client";

import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import { Review } from "@/types/types";

interface ReviewModalProps {
  orderId: string;
  type: "add" | "view";
  viewData: Review | null;
  sellerId: string | undefined;
  buyerId: string | undefined;
  userType: "seller" | "buyer";
  onClose: (submitted: boolean) => void;
}

export function ReviewModal({
  orderId,
  sellerId,
  buyerId,
  onClose,
  type,
  viewData,
  userType,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { successMessage, errorMessage } = useNotification();

  const validateForm = (): boolean => {
    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5 stars.");
      return false;
    }
    if (reviewComment.trim().length < 10) {
      setError("Review comment must be at least 10 characters long.");
      return false;
    }
    if (reviewComment.trim().length > 500) {
      setError("Review comment cannot exceed 500 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let endpoint = "";
      let payload = {};

      if (userType === "seller") {
        if (!buyerId) {
          throw new Error("Buyer ID is required for seller reviews.");
        }
        endpoint = "/sellers/ratings/rate-buyer";
        payload = {
          orderId,
          buyerId,
          rating,
          comment: reviewComment.trim(),
        };
      } else {
        if (!sellerId) {
          throw new Error("Seller ID is required for buyer reviews.");
        }
        endpoint = "/buyers/ratings/rate-farmer";
        payload = {
          orderId,
          sellerId,
          rating,
          comment: reviewComment.trim(),
        };
      }

      await apiService().post(endpoint, payload);

      successMessage("Review submitted successfully!");
      setSubmitted(true);
      onClose(true);
    } catch (err) {
      const errorResponse = err as APIErrorResponse;
      errorMessage(errorResponse);
      setError(
        errorResponse.error?.message ||
          "Failed to submit review. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose(submitted)}>
      {" "}
      {/* Pass submitted status */}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {type === "view"
              ? userType === "seller" && viewData?.reviewer_seller_id
                ? "Your Review of Buyer"
                : userType === "seller" && viewData?.reviewer_buyer_id
                  ? "Buyer's Review of You"
                  : "Review Details"
              : userType === "seller"
                ? "Rate the Buyer"
                : "Rate Your Experience"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {type === "view" && viewData ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    className={`${
                      viewData.rating >= star
                        ? "text-yellow-400 fill-current"
                        : "text-muted"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {viewData.rating} / 5
                </span>
              </div>
              <div>
                <Label className="block mb-1">Review</Label>
                <div className="bg-gray-50 border rounded-md p-3 text-gray-800">
                  {viewData.comment || "No comment provided."}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  Reviewed on:{" "}
                  {new Date(viewData.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => onClose(submitted)}>
                  {" "}
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}
              <div>
                <Label className="block mb-2">
                  {userType === "seller"
                    ? "How would you rate this buyer?"
                    : "How would you rate this seller and their coffee?"}
                </Label>
                <div className="flex space-x-2 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none cursor-pointer"
                      disabled={isSubmitting}
                    >
                      <Star
                        size={32}
                        className={`${
                          rating >= star
                            ? "text-yellow-400 fill-current"
                            : "text-muted"
                        } transition-colors duration-200`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Selected: {rating} star{rating !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <Label htmlFor="review">Your Review</Label>
                <Textarea
                  id="review"
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="mt-1"
                  placeholder={
                    userType === "seller"
                      ? "Share your experience with this buyer..."
                      : "Share your experience with this coffee and seller..."
                  }
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {reviewComment.length}/500 characters
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => onClose(submitted)}
                  disabled={isSubmitting}
                  className="sm:flex-1 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="sm:flex-1 w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Star } from "lucide-react";
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

interface ReviewModalProps {
  orderId: string;
  sellerId: string | undefined;
  onClose: () => void;
}

export function ReviewModal({ orderId, sellerId, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
      await apiService().post("/buyers/ratings/rate-farmer", {
        orderId,
        sellerId,
        rating,
        comment: reviewComment.trim(),
      });

      successMessage("Review submitted successfully!");
      onClose();
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          <div>
            <Label className="block mb-2">
              How would you rate this seller and their coffee?
            </Label>
            <div className="flex space-x-2 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
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
              placeholder="Share your experience with this coffee and seller..."
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reviewComment.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

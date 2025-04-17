"use client";

import { getUserProfile } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export interface CancelModalData {
  orderId: string;
}

export interface CancelFormData {
  reason: string;
  contactEmail: string;
}

export const CancelOrderModal: React.FC<{
  orderId: string;
  onClose: () => void;
  onSubmit: (orderId: string, formData: CancelFormData) => Promise<void>;
}> = ({ orderId, onClose, onSubmit }) => {
  const userProfile = getUserProfile();
  const [formData, setFormData] = useState<CancelFormData>({
    reason: "",
    contactEmail: userProfile?.email || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      setError("Please provide a reason for cancellation.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(orderId, formData);
      onClose();
    } catch (err: any) {
      setError("Failed to submit cancellation request. Please try again.");
      console.log("error while sumitting cancel order form, ", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className=" text-center">
            Request Order Cancellation
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Order ID</label>
              <Input value={orderId} disabled className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Please explain why you want to cancel this order..."
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Contact Email (Optional)
              </label>
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                placeholder="Enter your contact email..."
                className="mt-1"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

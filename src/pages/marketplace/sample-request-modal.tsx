"use client";

import * as React from "react";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { getFromLocalStorage } from "@/lib/utils";
import { APIErrorResponse } from "@/types/api";

interface SampleRequestModalProps {
  open: boolean;
  onClose: () => void;
  listingId: string;
  coffeeName: string;
  farmName: string;
}

interface UserProfile {
  address?: string;
  phone?: string;
  [key: string]: any;
}

export default function SampleRequestModal({
  open,
  onClose,
  listingId,
  coffeeName,
  farmName,
}: SampleRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    listingId: "",
    deliveryAddress: "",
    phone: "",
    weight: "",
    notes: "",
  });
  const { successMessage, errorMessage } = useNotification();
  React.useEffect(() => {
    try {
      const storedUserProfile = getFromLocalStorage("userProfile", {});
      if (storedUserProfile) {
        const userProfile: UserProfile = storedUserProfile;
        setFormData((prev) => ({
          ...prev,
          deliveryAddress: userProfile.address || "",
          phone: userProfile.phone || "",
        }));
      }
    } catch (error) {
      console.error("Error loading user profile from localStorage:", error);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.deliveryAddress || !formData.phone || !formData.weight) {
        errorMessage("Please fill in all required fields.");
        return;
      }

      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight <= 0) {
        errorMessage("Please enter a valid weight.");
        return;
      }

      await apiService().post("/marketplace/listings/request-sample", {
        listingId: listingId,
        delivery_address: formData.deliveryAddress,
        phone: formData.phone,
        weight: parseFloat(formData.weight),
        note: formData.notes,
      });

      successMessage("Your sample request has been sent to the seller.");
      onClose();
    } catch (error: any) {
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-emerald-600" />
            Request Coffee Sample
          </DialogTitle>
          <DialogDescription>
            Request a sample of {coffeeName} from {farmName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryAddress" className="required">
              Delivery Address
            </Label>
            <Textarea
              id="deliveryAddress"
              name="deliveryAddress"
              placeholder="Enter your full delivery address"
              value={formData.deliveryAddress}
              onChange={handleChange}
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="required">
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight" className="required">
              Sample Weight (kg)
            </Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Enter desired sample weight"
              value={formData.weight}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-slate-500">
              Standard sample size is 0.5kg
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any specific requirements or questions for the seller"
              value={formData.notes}
              onChange={handleChange}
              className="min-h-[80px]"
            />
          </div>

          <DialogFooter className="pt-4">
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
}

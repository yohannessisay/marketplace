"use client";

import type { CoffeeListing } from "@/types/coffee";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";

interface BidModalProps {
  listing: CoffeeListing | null;
  quantity: number;
  setQuantity: (quantity: number) => void;
  bidPrice: number;
  setBidPrice: (price: number) => void;
  onClose: () => void;
  onBidSubmitted?: () => void;
}

export function BidModal({
  listing,
  quantity,
  bidPrice,
  setBidPrice,
  onBidSubmitted,
  onClose,
}: BidModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shipZipcode, setShipZipcode] = useState("");
  const [shipAddress, setShipAddress] = useState("");
  const [shipInstructions, setShipInstructions] = useState("");
  const { successMessage, errorMessage } = useNotification();
  const discount = 0;
  const totalPrice = bidPrice * quantity;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!listing) {
        throw new Error("No listing provided");
      }

      await apiService().post("/buyers/bids/place-bid", {
        listingId: listing.id,
        quantity_kg: quantity,
        unit_price: bidPrice,
        ship_zipcode: shipZipcode,
        ship_adrs: shipAddress,
        ship_instructions: shipInstructions || "None",
      });
      successMessage("Bid placed successfully!");
      onBidSubmitted?.();
      onClose();
    } catch (error) {
      console.error("[BidModal] Error submitting bid:", error);
      errorMessage(error as APIErrorResponse);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">Place Your Bid</DialogTitle>
          <DialogDescription className="text-center">
            You can place a bid to this listing and if the seller accepts your
            offer order will be created
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="quantity">Quantity (kg)</Label>
            <Input
              id="quantity"
              type="number"
              min="10"
              max={listing?.quantity_kg}
              value={quantity}
              className="mt-2"
              disabled
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Available: {quantity} kg
            </p>
          </div>

          <div>
            <Label htmlFor="price_per_kg">Bid Price per kg ($)</Label>
            <Input
              id="price_per_kg"
              type="number"
              min="0.01"
              step="0.01"
              value={bidPrice}
              onChange={(e) => setBidPrice(Number(e.target.value) || 0)}
              className="mt-2"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Suggested: ${listing?.price_per_kg}
            </p>
          </div>

          <div>
            <Label htmlFor="ship_zipcode">Shipping Zip/Postal Code</Label>
            <Input
              id="ship_zipcode"
              type="text"
              value={shipZipcode}
              onChange={(e) => setShipZipcode(e.target.value)}
              className="mt-2"
              placeholder="Enter zip/postal code"
            />
          </div>

          <div>
            <Label htmlFor="ship_adrs">Shipping Address</Label>
            <Input
              id="ship_adrs"
              type="text"
              value={shipAddress}
              onChange={(e) => setShipAddress(e.target.value)}
              className="mt-2"
              placeholder="Enter full shipping address"
            />
          </div>

          <div>
            <Label htmlFor="ship_instructions">Shipping Instructions</Label>
            <Textarea
              id="ship_instructions"
              value={shipInstructions}
              onChange={(e) => setShipInstructions(e.target.value)}
              className="mt-2"
              placeholder="Enter any special instructions (or 'None')"
            />
          </div>

          <div className="bg-muted p-4 rounded-md">
            <h4 className="text-sm font-medium mb-2">Bid Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Bid Price per kg
                </span>
                <span className="text-sm font-medium">
                  ${bidPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <span className="text-sm font-medium">{quantity} kg</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span className="text-sm">
                    Volume discount ({discount * 100}%)
                  </span>
                  <span className="text-sm font-medium">
                    -${(bidPrice * quantity * discount).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-sm font-medium text-primary">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
          <Button
            disabled={
              isLoading ||
              bidPrice <= 0 ||
              quantity < 10 ||
              !shipZipcode.trim() ||
              !shipAddress.trim() ||
              !shipInstructions.trim()
            }
            onClick={handleSubmit}
            className="w-full"
          >
            {isLoading ? "Placing Bid..." : "Place Bid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

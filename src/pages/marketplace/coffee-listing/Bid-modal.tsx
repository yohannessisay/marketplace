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
import { Loader2 } from "lucide-react";

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
      <DialogContent className="w-[95vw] max-w-[600px] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-center">
            Place Your Bid
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm sm:text-base">
            Submit your bid for this coffee listing. If the seller accepts, an
            order will be created.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-4">
            {/* Quantity Field */}
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity (kg)
              </Label>
              <Input
                id="quantity"
                type="number"
                min="10"
                max={listing?.quantity_kg}
                value={quantity}
                className="mt-1.5 h-9 sm:h-10 w-full"
                disabled
              />
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Available: {quantity} kg
              </p>
            </div>

            {/* Bid Price Field */}
            <div>
              <Label htmlFor="price_per_kg" className="text-sm font-medium">
                Bid Price per kg ($)
              </Label>
              <Input
                id="price_per_kg"
                type="number"
                min="0.01"
                step="0.01"
                value={bidPrice}
                onChange={(e) => setBidPrice(Number(e.target.value) || 0)}
                className="mt-1.5 h-9 sm:h-10 w-full"
              />
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Suggested: ${listing?.price_per_kg}
              </p>
            </div>

            {/* Shipping Zipcode */}
            <div>
              <Label htmlFor="ship_zipcode" className="text-sm font-medium">
                Shipping Zip/Postal Code
              </Label>
              <Input
                id="ship_zipcode"
                type="text"
                value={shipZipcode}
                onChange={(e) => setShipZipcode(e.target.value)}
                className="mt-1.5 h-9 sm:h-10 w-full"
                placeholder="Enter zip/postal code"
              />
            </div>

            {/* Shipping Address */}
            <div>
              <Label htmlFor="ship_adrs" className="text-sm font-medium">
                Shipping Address
              </Label>
              <Input
                id="ship_adrs"
                type="text"
                value={shipAddress}
                onChange={(e) => setShipAddress(e.target.value)}
                className="mt-1.5 h-9 sm:h-10 w-full"
                placeholder="Enter full shipping address"
              />
            </div>

            {/* Shipping Instructions (Spans both columns on larger screens) */}
            <div className="sm:col-span-2">
              <Label
                htmlFor="ship_instructions"
                className="text-sm font-medium"
              >
                Shipping Instructions
              </Label>
              <Textarea
                id="ship_instructions"
                value={shipInstructions}
                onChange={(e) => setShipInstructions(e.target.value)}
                className="mt-1.5 min-h-[80px] sm:min-h-[100px] w-full"
                placeholder="Enter any special instructions (or 'None')"
              />
            </div>
          </div>

          {/* Bid Summary */}
          <div className="mt-4 sm:mt-6 bg-muted p-4 sm:p-5 rounded-lg">
            <h4 className="text-base font-semibold mb-3">Bid Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Bid Price per kg
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  ${bidPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Quantity
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  {quantity} kg
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span className="text-xs sm:text-sm">
                    Volume discount ({discount * 100}%)
                  </span>
                  <span className="text-xs sm:text-sm font-medium">
                    -${(bidPrice * quantity * discount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-sm font-semibold text-primary">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-28 h-9 sm:h-10"
          >
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
            className="w-full sm:w-28 h-9 sm:h-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Placing Bid...</span>
              </>
            ) : (
              "Place Bid"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

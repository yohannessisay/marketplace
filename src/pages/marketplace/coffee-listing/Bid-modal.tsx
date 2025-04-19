"use client";

import type { CoffeeListing } from "@/types/coffee";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface BidModalProps {
  listing: CoffeeListing | null;
  quantity: number;
  setQuantity: (quantity: number) => void;
  bidPrice: number;
  setBidPrice: (price: number) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onBidSubmitted?: () => void;
}

export function BidModal({
  listing,
  quantity,
  bidPrice,
  setBidPrice,
  onClose,
  onSubmit,
  onBidSubmitted,
}: BidModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const discount = 0;
  const totalPrice = bidPrice * quantity;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit();
      onBidSubmitted?.();
      onClose();
    } catch (error) {
      console.error("[BidModal] Error submitting bid:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
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
              className="mt-1"
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
              className="mt-1"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Suggested: ${listing?.price_per_kg}
            </p>
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

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={isLoading || bidPrice <= 0 || quantity < 10}
              onClick={handleSubmit}
            >
              {isLoading ? "Placing Bid..." : "Place Bid"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

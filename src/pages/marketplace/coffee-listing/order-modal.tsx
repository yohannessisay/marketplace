"use client"
import type { CoffeeListing } from "@/types/coffee"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface OrderModalProps {
  listing: CoffeeListing
  quantity: number
  setQuantity: (quantity: number) => void
  onClose: () => void
  onSubmit: () => void
}

export function OrderModal({ listing, quantity, setQuantity, onClose, onSubmit }: OrderModalProps) {
  // Calculate discount
  const getDiscount = () => {
    if (quantity >= 1000) return 0.1
    if (quantity >= 500) return 0.05
    return 0
  }

  const discount = getDiscount()
  const totalPrice = listing.price * quantity * (1 - discount)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Place Your Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="quantity">Quantity (kg)</Label>
            <Input
              id="quantity"
              type="number"
              min="10"
              max={listing.availableQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1"
            />
            <p className="mt-1 text-sm text-muted-foreground">Available: {listing.availableQuantity} kg</p>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <h4 className="text-sm font-medium mb-2">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Price per kg</span>
                <span className="text-sm font-medium">${listing.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <span className="text-sm font-medium">{quantity} kg</span>
              </div>

              {/* Display volume discount if applicable */}
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span className="text-sm">Volume discount ({discount * 100}%)</span>
                  <span className="text-sm font-medium">-${(listing.price * quantity * discount).toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-sm font-medium text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="shipping">Shipping Address</Label>
            <Textarea
              id="shipping"
              rows={3}
              className="mt-1"
              placeholder="Enter your shipping address and any special instructions"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>Confirm Order</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

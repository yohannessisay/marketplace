"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Calendar, MapPin, Package, Truck } from "lucide-react"
import { Order } from "@/types/orders"

export function OrderDetailsModal({ 
  order, 
  open, 
  onClose 
}: { 
  order: Order;
  open: boolean;
  onClose: () => void;
}) {
  // Format status for display
  const formatStatus = (status:string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusMap = {
      contract_signed: "bg-blue-100 text-blue-800",
      coffee_processing_completed: "bg-purple-100 text-purple-800",
      coffee_ready_for_shipment: "bg-indigo-100 text-indigo-800",
      pre_shipment_sample_approved: "bg-green-100 text-green-800",
      pre_shipment_sample_ready: "bg-yellow-100 text-yellow-800",
      container_loaded: "bg-orange-100 text-orange-800",
      container_on_board: "bg-emerald-100 text-emerald-800",
    }
    return (statusMap as Record<string, string>)[status] || "bg-gray-100 text-gray-800"
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Order Details</DialogTitle>
          <DialogDescription>Complete information about order {order.order_id}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <Badge className={cn("font-normal", getStatusColor(order.status))}>{formatStatus(order.status)}</Badge>
          </div>

          <Separator />

          {/* Order Information */}
          <div>
            <h3 className="font-medium mb-3">Order Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="font-medium">{order.order_id}</p>
              </div>
              <div>
                <p className="text-gray-500">Internal ID</p>
                <p className="font-medium">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Listing ID</p>
                <p className="font-medium">{order.listing_id}</p>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Created At</p>
                  <p className="font-medium">{formatDate(order.created_at)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium">{order.updated_at ? formatDate(order.updated_at) : 'Not updated'}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Parties */}
          <div>
            <h3 className="font-medium mb-3">Parties</h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-500">Buyer</p>
                <p className="font-medium">{order.buyer_name}</p>
                <p className="text-gray-500 text-xs">ID: {order.buyer_id}</p>
              </div>
              <div>
                <p className="text-gray-500">Seller</p>
                <p className="font-medium">{order.seller_name}</p>
                <p className="text-gray-500 text-xs">ID: {order.seller_id}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Details */}
          <div>
            <h3 className="font-medium mb-3">Order Details</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Quantity</p>
                <p className="font-medium">{order.quantity_kg.toLocaleString()} kg</p>
              </div>
              <div>
                <p className="text-gray-500">Unit Price</p>
                <p className="font-medium">${order.unit_price.toFixed(2)}/kg</p>
              </div>
              <div>
                <p className="text-gray-500">Total Amount</p>
                <p className="font-medium text-emerald-600">${order.total_amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipping Information */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Shipping Information
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Shipping Address</p>
                  <p className="font-medium">{order.ship_adrs}</p>
                  <p className="text-gray-500">ZIP: {order.ship_zipcode}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500">Special Instructions</p>
                  <p className="font-medium">{order.ship_instructions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">Print Details</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

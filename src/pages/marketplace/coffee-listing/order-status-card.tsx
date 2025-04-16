import { Check, Truck, AlertTriangle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusData } from "@/types/order";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";

interface OrderStatusCardProps {
  orderStatus: OrderStatusData;
  setShowReviewModal: (show: boolean) => void;
}

export function OrderStatusCard({
  orderStatus,
  setShowReviewModal,
}: OrderStatusCardProps) {
  const { successMessage, errorMessage } = useNotification();
  const deleteOrder = async (id: string) => {
    console.log(orderStatus);
    
    if (!id) return;

    try {
      const response = await apiService().delete<{
        data: { messages: Array<any> };
      }>(`buyers/bids/delete-bid?bidId=${id}`);

      if (response && response.data) {
        successMessage("Order cancelled successfully");
      }
    } catch (error: unknown) {
      console.error("[CoffeeDetails] Fetch messages error:", error);
      const errorResponse = error as APIErrorResponse;
      errorMessage(errorResponse);
    }
  };
  return (
    <div>
      {/* Order details section */}
      <div className="border-t border-border pt-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Your Order</h3>

          {/* Order status badge */}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
              orderStatus.status === "cancelled"
                ? "bg-red-100 text-red-800"
                : orderStatus.status === "completed" ||
                  orderStatus.status === "delivered"
                ? "bg-green-100 text-green-800"
                : orderStatus.status === "shipping"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {orderStatus.status}
          </span>
        </div>

        {/* Issue warning (for cancelled orders) */}
        {orderStatus.hasIssue && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Order Cancelled
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{orderStatus.issueDescription}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Quantity</span>
            <span className="text-sm font-medium">
              {orderStatus.quantity} kg
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Price</span>
            <span className="text-sm font-medium">
              ${orderStatus.totalPrice}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Order Date</span>
            <span className="text-sm font-medium">
              {orderStatus.orderedDate}
            </span>
          </div>
          {orderStatus.estimatedDelivery && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Est. Delivery
              </span>
              <span className="text-sm font-medium">
                {orderStatus.estimatedDelivery}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Call to action for delivered orders needing review */}
      {orderStatus.needsReview && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Star className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Coffee Received?
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>Please leave a review for the seller.</p>
              </div>
              <div className="mt-2">
                <Button
                  onClick={() => setShowReviewModal(true)}
                  variant="outline"
                  size="sm"
                  className="text-blue-700 bg-blue-100 hover:bg-blue-200 border-blue-200"
                >
                  Leave Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Progress */}
      {!orderStatus.hasIssue && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Order Progress</h4>
          {orderStatus.steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                  step.completed ? "bg-primary" : "bg-muted"
                }`}
              >
                {step.completed ? (
                  <Check size={12} className="text-primary-foreground" />
                ) : (
                  <span className="h-2 w-2 bg-background rounded-full"></span>
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm ${
                    step.completed ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tracking information for shipping orders */}
      {orderStatus.status === "shipping" && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <div className="flex items-center mb-2">
            <Truck size={18} className="text-blue-600 mr-2" />
            <h4 className="text-sm font-medium text-blue-900">
              Shipping Information
            </h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Tracking Number</span>
              <span className="font-mono text-blue-900">CLD783940127</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Carrier</span>
              <span className="text-blue-900">Express Freight</span>
            </div>
            <Button
              variant="outline"
              className="mt-2 w-full text-blue-700 bg-blue-100 hover:bg-blue-200 border-blue-200"
            >
              <Truck size={16} className="mr-2" />
              Track Shipment
            </Button>
          </div>
        </div>
      )}

      {/* Buttons for various order actions */}
      {(orderStatus.status === "pending" ||
        orderStatus.status === "confirmed" ||
        orderStatus.status === "processing") && (
        <Button
          onClick={() => deleteOrder(orderStatus.id)}
          variant="outline"
          className="mt-4 w-full bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
        >
          Cancel Order
        </Button>
      )}

      {orderStatus.status === "delivered" && !orderStatus.needsReview && (
        <Button
          onClick={() => setShowReviewModal(true)}
          className="mt-4 w-full"
        >
          Leave Review
        </Button>
      )}
    </div>
  );
}

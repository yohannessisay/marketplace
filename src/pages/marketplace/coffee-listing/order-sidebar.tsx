import { Star, Award, Download } from "lucide-react";
import { OrderStatus } from "@/types/order";
import { CoffeeListing } from "@/types/coffee";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderStatusCard } from "./order-status-card";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { getUserProfile } from "@/lib/utils";
import { ActionTooltip } from "@/components/common/action-tooltip";

interface OrderSidebarProps {
  listing: CoffeeListing | null;
  demoOrderStatus: OrderStatus;
  setShowBidModal: (show: boolean) => void;
  setShowOrderModal: (show: boolean) => void;
  setShowReviewModal: (show: boolean) => void;
}

export function OrderSidebar({
  listing,
  demoOrderStatus,
  setShowOrderModal,
  setShowReviewModal,
  setShowBidModal,
}: OrderSidebarProps) {
  const orderStatus = useOrderStatus(demoOrderStatus);

  const user = getUserProfile();

  return (
    <div className="space-y-6">
      {/* Purchase Card */}
      <Card className="top-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">{listing?.farm.farm_name}</h2>
            <Badge
              variant="outline"
              className="bg-yellow-100 text-yellow-800 border-0"
            >
              <Star size={16} className="mr-1 text-yellow-500 fill-current" />
              {listing?.grade}
            </Badge>
          </div>

          <div className="flex items-baseline mb-6">
            <span className="text-2xl font-bold text-primary">
              ${listing?.price_per_kg}
            </span>
            <span className="ml-1 text-muted-foreground">/kg</span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Available Quantity
              </span>
              <span className="text-sm font-medium">
                {listing?.quantity_kg} kg
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Processing Method
              </span>
              <span className="text-sm font-medium">
                {listing?.processing_method}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Region</span>
              <span className="text-sm font-medium">
                {listing?.farm.region}, {listing?.farm.country}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {orderStatus ? (
              <OrderStatusCard
                orderStatus={orderStatus}
                setShowReviewModal={setShowReviewModal}
              />
            ) : (
              <ActionTooltip
                onClick={() => setShowOrderModal(true)}
                className="w-full"
                disabled={user?.onboarding_stage !== "completed"}
                disabledMessage="complete your onboarding to place order"
              >
                Place Order
              </ActionTooltip>
            )}

            {orderStatus ? (
              <OrderStatusCard
                orderStatus={orderStatus}
                setShowReviewModal={setShowReviewModal}
              />
            ) : (
              <ActionTooltip
                onClick={() => setShowBidModal(true)}
                variant="outline"
                className="w-full bg-white text-green-700 "
                disabled={user?.onboarding_stage !== "completed"}
                disabledMessage="complete your onboarding to place bid"
              >
                Place Bid
              </ActionTooltip>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Discount info card - only shown when no order exists */}
      {!orderStatus && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-md font-medium mb-3">Volume Discounts</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-primary/5 rounded-md">
                <span className="text-sm">Order 500+ kg</span>
                <span className="text-sm font-medium text-primary">5% off</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-primary/5 rounded-md">
                <span className="text-sm">Order 1000+ kg</span>
                <span className="text-sm font-medium text-primary">
                  10% off
                </span>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Volume discounts are automatically applied at checkout.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seller Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">About the Seller</h3>

          <Button variant="outline" className="w-full">
            View Seller Profile
          </Button>
        </CardContent>
      </Card>

      {/* Coffee Certificate Card - Optional for completed orders */}
      {orderStatus &&
        (orderStatus.status === "completed" ||
          orderStatus.status === "delivered") && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <Award size={20} className="text-primary mr-2" />
                <h3 className="text-md font-medium">Purchase Certificate</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Download your certificate of purchase for this premium coffee
                lot.
              </p>
              <Button variant="outline" className="w-full">
                <Download size={16} className="mr-2" />
                Download Certificate
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, ChevronDown, Clock, Coffee, User } from "lucide-react";
import { Link } from "react-router-dom";
import { renderOrderProgress } from "./render-order-progress";
import { Bid, Listing, Order } from "../my-orders";

interface OrderItemProps {
  item: Order | Bid;
  tabType: string;
  expandedOrderId: string;
  toggleOrderExpansion: (id: string) => void;
  openReviewModal: (order: Order, type: string) => void;
  setModalMode: (mode: "contract" | "documents" | "payment_slip") => void;
  setCurrentOrderId: (orderId: string) => void;
  setUploadModalOpen: (open: boolean) => void;
  setPreviewModalOpen: (open: boolean) => void;
  handlePreviewDocs: (order: Order) => void;
  setUpdateModalOpen: (open: boolean) => void;
}

export const OrderItem = ({
  item,
  tabType,
  expandedOrderId,
  toggleOrderExpansion,
  openReviewModal,
  setModalMode,
  setCurrentOrderId,
  setUploadModalOpen,
  setPreviewModalOpen,
  handlePreviewDocs,
  setUpdateModalOpen,
}: OrderItemProps) => {
  const isOrderTab = tabType === "current" || tabType === "historical";
  const isBid = tabType === "bids";
  const isExpanded = expandedOrderId === item.id;

  const listing: Listing | undefined = isBid
    ? (item as Bid).listing
    : (item as Order).listing;

  return (
    <Card className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center mb-2 gap-2">
              {(listing?.is_organic || (item as Order).listing?.is_organic) && (
                <Badge
                  variant="outline"
                  className="sm:ml-2 bg-green-500 text-white border-0 w-fit"
                >
                  Organic
                </Badge>
              )}
              {isBid && listing?.listing_status === "active" && (
                <Badge
                  variant="outline"
                  className="sm:ml-2 bg-green-500 text-white border-0 w-fit"
                >
                  Active Listing
                </Badge>
              )}
              <h3 className="font-bold text-lg">
                {isBid
                  ? listing?.coffee_variety || "Unknown Coffee"
                  : (item as Order).order_id || "Unknown Order"}
              </h3>
            </div>
            {isBid && (
              <div className="text-sm text-muted-foreground">
                {listing?.farm?.farm_name || "Unknown Farm"}
                {listing?.farm?.region ? `, ${listing.farm.region}` : ""}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="font-bold text-lg text-green-600">
              $
              {isOrderTab
                ? (item as Order).unit_price?.toFixed(2)
                : (item as Bid).unit_price?.toFixed(2)}
              /kg
            </div>
            <div className="text-sm text-muted-foreground">
              {isOrderTab
                ? `${(item as Order).quantity_kg.toLocaleString()} kg`
                : `${(item as Bid).quantity_kg.toLocaleString()} kg`}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {isBid ? "Bid" : "Ordered"}:{" "}
              {new Date(
                isBid ? (item as Bid).created_at : (item as Order).created_at,
              ).toLocaleDateString()}
            </span>
          </div>
          {isBid && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                Expires:{" "}
                {new Date((item as Bid).expires_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm font-medium">
              {(isBid
                ? (item as Bid).seller?.first_name
                : (item as Order).seller?.first_name) || "Unknown"}{" "}
              <span className="hidden sm:inline">
                {(isBid
                  ? (item as Bid).seller?.last_name
                  : (item as Order).seller?.last_name) || ""}
              </span>
            </span>
            {(isBid ? (item as Bid).seller : (item as Order)) && (
              <Link
                to={`/sellers/${
                  isBid ? (item as Bid).seller_id : (item as Order).seller_id
                }`}
                className="ml-2 text-xs text-green-600 hover:text-green-700 font-medium"
              >
                View Seller
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                (isBid ? (item as Bid).status : (item as Order).status) ===
                "completed"
                  ? "default"
                  : (isBid ? (item as Bid).status : (item as Order).status) ===
                      "confirmed"
                    ? "default"
                    : (isBid
                          ? (item as Bid).status
                          : (item as Order).status) === "pending"
                      ? "warning"
                      : "outline"
              }
            >
              {(isBid ? (item as Bid).status : (item as Order).status)
                .charAt(0)
                .toUpperCase() +
                (isBid ? (item as Bid).status : (item as Order).status).slice(
                  1,
                )}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleOrderExpansion(item.id)}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t animate-in fade-in-50 duration-300">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  {isBid ? "Bid Details" : "Order Details"}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {isBid ? "Bid ID" : "Order ID"}:
                    </span>
                    <span className="font-medium">
                      {isBid ? item.id : (item as Order).order_id}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unit Price:</span>
                    <span className="font-medium">
                      $
                      {(isBid
                        ? (item as Bid).unit_price
                        : (item as Order).unit_price
                      ).toFixed(2)}
                      /kg
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">
                      {(isBid
                        ? (item as Bid).quantity_kg
                        : (item as Order).quantity_kg
                      ).toLocaleString()}{" "}
                      kg
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-bold text-green-600">
                      $
                      {(isBid
                        ? (item as Bid).total_amount
                        : (item as Order).total_amount
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {isOrderTab && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Shipping Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-medium">
                        {(item as Order).ship_adrs || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Zip Code:</span>
                      <span className="font-medium">
                        {(item as Order).ship_zipcode || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Instructions:
                      </span>
                      <span className="font-medium">
                        {(item as Order).ship_instructions || "None"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isOrderTab &&
              tabType !== "historical" &&
              renderOrderProgress(
                item as Order,
                setModalMode,
                setCurrentOrderId,
                setUploadModalOpen,
                setPreviewModalOpen,
                setUpdateModalOpen,
              )}

            <div className="mt-4 flex justify-end space-x-3">
              {tabType === "historical" && (
                <>
                  {(item as Order).reviews.length === 0 ? (
                    <>
                      <Button
                        variant="default"
                        onClick={() => openReviewModal(item as Order, "")}
                      >
                        Review Seller
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handlePreviewDocs(item as Order)}
                      >
                        View Documents
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => handlePreviewDocs(item as Order)}
                      >
                        View Documents
                      </Button>
                      <Button
                        onClick={() => openReviewModal(item as Order, "view")}
                      >
                        View Review
                      </Button>
                    </>
                  )}
                </>
              )}
              {isBid && (
                <Link to={`/listing/${item.listing_id}`}>
                  <Button variant="outline">View Listing</Button>
                </Link>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center text-slate-500 text-sm mb-2">
          <Coffee className="h-4 w-4 mr-1" />
          <span>{listing?.bean_type || "Unknown"}</span>
        </div>
      </CardContent>
    </Card>
  );
};

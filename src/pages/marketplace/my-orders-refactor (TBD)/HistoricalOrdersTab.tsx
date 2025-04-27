import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { apiService } from "@/services/apiService";
import { useNotification } from "@/hooks/useNotification";
import { APIErrorResponse } from "@/types/api";
import { Calendar, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Listing {
  id: string;
  coffee_variety?: string;
  farm_name?: string;
  region?: string;
  processing_method?: string;
  bean_type?: string;
  price_per_kg?: number;
  seller: any;
  cup_score?: string;
  is_organic?: boolean;
  quantity_kg?: number;
  farm?: {
    farm_id: string;
    farm_name: string;
    region: string | null;
    country: string;
  };
}

interface Order {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  quantity_kg: number;
  unit_price: number;
  total_amount: number;
  contract_signed: boolean;
  coffee_processing_completed: boolean;
  coffee_ready_for_shipment: boolean;
  pre_shipment_sample_approved: boolean;
  pre_shipment_sample_ready: boolean;
  container_loaded: boolean;
  container_on_board: boolean;
  cancelled_reason: string | null;
  cancelled_by: string | null;
  ship_zipcode: string;
  ship_adrs: string;
  ship_instructions: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  created_by_agent_id: string | null;
  listing?: Listing;
  seller_name?: string;
  buyer_name?: string;
  review: any;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const HistoricalOrdersTab: React.FC = () => {
  const [historicalOrders, setHistoricalOrders] = useState<Order[]>([]);
  const [historyPagination, setHistoryPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyCurrentPage, setHistoryCurrentPage] = useState<number>(1);
  const [historySearchTerm, setHistorySearchTerm] = useState<string>("");
  const { errorMessage } = useNotification();

  useEffect(() => {
    const fetchHistoricalOrders = async () => {
      setHistoryLoading(true);
      try {
        const response: any = await apiService().get(
          `/orders/order-history?page=${historyCurrentPage}&limit=${
            historyPagination.limit
          }&search=${encodeURIComponent(historySearchTerm)}`
        );
        if (response.success) {
          setHistoricalOrders(response.data.orders || []);
          setHistoryPagination(
            response.data.pagination || {
              page: 1,
              limit: 10,
              total: 0,
              total_pages: 0,
            }
          );
        } else {
          setHistoryError("Failed to fetch historical orders");
        }
      } catch (err: unknown) {
        const errorResponse = err as APIErrorResponse;
        setHistoryError(errorResponse.error?.message || "An error occurred");
        errorMessage(errorResponse);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistoricalOrders();
  }, [historyCurrentPage, historySearchTerm]);

  // Dummy handlers for review modal (replace with actual logic as needed)
  const openReviewModal = (order: Order, type?: string) => {
    // Implement modal logic or pass as prop from parent
    alert(
      type === "review"
        ? "View Review for order " + order.id
        : "Review Seller for order " + order.id
    );
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <Input
          placeholder="Search order history..."
          value={historySearchTerm}
          onChange={(e) => setHistorySearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {historyLoading ? (
        <div>Loading...</div>
      ) : historyError ? (
        <div className="text-red-500">{historyError}</div>
      ) : (
        <div>
          {historicalOrders.length === 0 ? (
            <div>No historical orders found.</div>
          ) : (
            historicalOrders.map((order) => (
              <Card key={order.id} className="mb-4">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg">
                        {order.listing?.coffee_variety || "Unknown Coffee"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.listing?.farm_name || "Unknown Farm"}
                        {order.listing?.region ? `, ${order.listing.region}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {order.quantity_kg} kg
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quantity
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center mt-2 text-sm text-muted-foreground gap-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Ordered: {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      <span>Status: {order.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {!order.review ? (
                      <Button
                        variant="default"
                        onClick={() => openReviewModal(order)}
                      >
                        Review Seller
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => openReviewModal(order, "review")}
                      >
                        View Review
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setHistoryCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  aria-disabled={historyCurrentPage === 1}
                />
              </PaginationItem>
              {[...Array(historyPagination.total_pages)].map((_, idx) => (
                <PaginationItem key={idx}>
                  <PaginationLink
                    isActive={historyCurrentPage === idx + 1}
                    onClick={() => setHistoryCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setHistoryCurrentPage((prev) =>
                      Math.min(prev + 1, historyPagination.total_pages)
                    )
                  }
                  aria-disabled={historyCurrentPage === historyPagination.total_pages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default HistoricalOrdersTab;